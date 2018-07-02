import loggerFactory from './loggerFactory';
import {Logger} from 'lines-logger';
import {extractError} from './utils';
import {Store} from 'vuex';
import {RootState} from '../types/model';
import Api from './api';
import {WsHandler} from './WsHandler';
import store from '../store';
import {IS_DEBUG, MANIFEST} from './consts';

const LAST_TAB_ID_VARNAME = 'lastTabId';

export default class NotifierHandler {
  private logger: Logger;
  private currentTabId: string;
  private popedNotifQueue: any[] = [];
  /*This is required to know if this tab is the only one and don't spam with same notification for each tab*/
  private serviceWorkedTried = false;
  private serviceWorkerRegistration: any = null;
  private subscriptionId: string;
  private isCurrentTabActive: boolean = false;
  private newMessagesCount: number = 0;
  private unloaded: boolean = false;
  private store: Store<RootState>;
  private readonly api: Api;
  private readonly browserVersion: string;
  private readonly isChrome: boolean;
  private readonly isMobile: boolean;
  private readonly ws: WsHandler;

  constructor(api: Api, browserVersion: string, isChrome: boolean, isMobile: boolean, ws: WsHandler, store: Store<RootState>) {
    this.api = api;
    this.browserVersion = browserVersion;
    this.isChrome = isChrome;
    this.isMobile = isMobile;
    this.ws = ws;
    this.store = store;
    this.logger = loggerFactory.getLoggerColor('NOTIFY', '#ffb500');
    this.currentTabId = Date.now().toString();
    window.addEventListener('blur', this.onFocusOut.bind(this));
    window.addEventListener('focus', this.onFocus.bind(this));
    window.addEventListener('beforeunload', this.onUnload.bind(this));
    window.addEventListener('unload', this.onUnload.bind(this));
    this.onFocus();
    if (!(<any>window).Notification) {
      this.logger.warn('Notifications are not supported')();
    } else {
      this.tryAgainRegisterServiceWorker();
    }
  }


  replaceIfMultiple(data) {
    let count = 1;
    let newMessData = data.options.data;
    if (newMessData && newMessData.replaced) {
      for (let i = 0; i < this.popedNotifQueue.length; i++) {
        if (this.popedNotifQueue[i].data.title === newMessData.title) {
          count += this.popedNotifQueue[i].data.replaced;
          this.popedNotifQueue[i].close();
        }
      }
      if (count > 1) {
        newMessData.replaced = count;
        data.title = newMessData.title + '(+' + count + ')';
      }
    }
  }

// Permissions are granted here!
  showNot(title, options) {
    try {
      if (this.serviceWorkerRegistration && this.isMobile && this.isChrome) {
        // TODO  options should contain page id here but it's not
        // so we open unfefined url
        this.serviceWorkerRegistration.showNotification(title, options).then( (r) => {
          this.logger.debug('res {}', r)(); // TODO https://stackoverflow.com/questions/39717947/service-worker-notification-promise-broken#comment83407282_39717947
        });
      } else {
        let data = {title: title, options: options};
        this.replaceIfMultiple(data);
        let not = new Notification(data.title, data.options);
        this.popedNotifQueue.push(not);
        not.onclick = () => {
          window.focus();
          if (not.data && not.data.roomId) {
            this.store.commit('setActiveRoomId', parseInt(not.data.roomId));
          }
          not.close();
        };
        not.onclose = () => {
          this.popedNotifQueue.splice(this.popedNotifQueue.indexOf(not), 1);
        };
        this.logger.debug('Notification {} {} has been spawned, current queue {}', title, options, this.popedNotifQueue)();
      }
    } catch (e) {
      this.logger.error('Failed to show notification {}', e)();
    }
  }

  checkPermissions(cb) {
    if ((<any>Notification).permission !== 'granted') { // TODO
      Notification.requestPermission((result) => {
        if (result === 'granted') {
          cb(true);
        } else {
          this.logger.warn('User blocked notification permission. Notifications won\'t be available')();
        }
      });
    } else {
      cb(false);
    }
  }

  getSubscriptionId(pushSubscription) {
    let mergedEndpoint = pushSubscription.endpoint;
    if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0) {
      // Make sure we only mess with GCM
      // Chrome 42 + 43 will not have the subscriptionId attached
      // to the endpoint.
      if (pushSubscription.subscriptionId &&
          pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
        // Handle version 42 where you have separate subId and Endpoint
        mergedEndpoint = pushSubscription.endpoint + '/' +
            pushSubscription.subscriptionId;
      }
    }
    let GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
    if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
      return null;
    } else {
      return mergedEndpoint.split('/').pop();
    }
  }

  registerWorker(cb) { // todo async
    if (!navigator.serviceWorker) {
      return cb(false, 'Service worker is not supported', true);
    } else if (!MANIFEST) {
      return cb(false, 'FIREBASE_API_KEY is missing in settings.py or file chat/static/manifest.json is missing', false);
    }
    navigator.serviceWorker.register('/sw.js', {scope: '/'}).then( (r) => {
      this.logger.debug('Registered service worker {}', r)();
      return navigator.serviceWorker.ready;
    }).then( (serviceWorkerRegistration) => {
      this.logger.debug('Service worker is ready {}', serviceWorkerRegistration)();
      this.serviceWorkerRegistration = serviceWorkerRegistration;
      return serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true});
    }).then( (subscription) => {
      this.logger.debug('Got subscription {}', subscription)();
      this.subscriptionId = this.getSubscriptionId(subscription);
      if (!this.subscriptionId) {
        throw 'Current browser doesnt support offline notifications';
      } else {
        return new Promise( (resolve, reject) => {
          this.api.registerFCB(this.subscriptionId, this.browserVersion, this.isMobile, e => {
            if (e) {
              reject('Unable to save subscription to server because of' + e);
            } else {
              resolve();
            }
          });
        });
      }
    }).then( () => {
      this.logger.log('Saved subscription to server')();
      cb(true);
    }).catch(function (e) {
      cb(false, e, true);
    });
  }


  tryAgainRegisterServiceWorker() {
    this.checkPermissions( (result) => {
      if (!this.serviceWorkedTried) {
        this.serviceWorkedTried = true;
        this.registerWorker( (succ, error, growl) => {
          if (growl) {
            this.store.dispatch('growlError', `Offline notifications won\'t work, because ${extractError(error)}`);
          }
          if (!succ) {
            this.logger.error('Unable to load serviceWorker to show notification because {}', error)();
          }
          if (result) {
            this.showNot('Pychat notifications enabled', {
              body: 'You can disable them in room\'s settings',
            });
          }
        });
      }
    });
  }

  notify(title, options) {
    if (this.isCurrentTabActive) {
      return;
    }
    this.newMessagesCount++;
    document.title = this.newMessagesCount + ' new messages';
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    // last opened tab not this one, leave the oppotunity to show notification from last tab
    if (!(<any>window).Notification
        || !this.isTabMain()) {
      return;
    }
    this.checkPermissions( (withGranted) => {
      this.showNot(title, options);
    });
  }

  isTabMain() {
    let activeTab = localStorage.getItem(LAST_TAB_ID_VARNAME);
    if (activeTab === '0') {
      localStorage.setItem(LAST_TAB_ID_VARNAME, this.currentTabId);
      activeTab = this.currentTabId;
    }
    return activeTab === this.currentTabId;
  }

  onUnload() {
    if (this.unloaded) {
      return;
    }
    if (this.isTabMain) {
      localStorage.setItem(LAST_TAB_ID_VARNAME, '0');
    }
    this.unloaded = true;
  }

  onFocus(e: Event = undefined) {
    localStorage.setItem(LAST_TAB_ID_VARNAME, this.currentTabId);
    if (e) {
      this.logger.debug('Marking current tab as active, pinging server')();
      if (store.state.userInfo && this.ws.isWsOpen() && !IS_DEBUG) {
        this.ws.pingServer(); // if no event = call from init();
      }
    } else {
      this.logger.debug('Marking current tab as active')();
    }
    this.isCurrentTabActive = true;
    this.newMessagesCount = 0;
    document.title = 'PyChat';
    this.popedNotifQueue.forEach( (n) => {
      n.close();
    });
  }

  onFocusOut() {
    this.isCurrentTabActive = false;
    this.logger.debug('Deactivating current tab')();
  }
}