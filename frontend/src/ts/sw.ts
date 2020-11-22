import { Logger } from 'lines-logger';
import { XHR_API_URL } from '@/ts/utils/consts';
import loggerFactory from '@/ts/instances/loggerFactory';

declare var clients: any;

const logger: Logger = loggerFactory.getLogger('SW_S');

//
const SW_VERSION = '1.5';
logger.debug('startup, version {}', SW_VERSION)();

let subScr: null | string = null;

// Install Service Worker
self.addEventListener('install', () => {
  logger.log(' installed!')();
});

// Service Worker Active
self.addEventListener('activate', () => {
  logger.log(' activated!')();
});

function getSubscriptionId(pushSubscription: any) {
  let mergedEndpoint = pushSubscription.endpoint;
  if (pushSubscription.endpoint.indexOf('https://fcm.googleapis.com/fcm/send') === 0
      && pushSubscription.subscriptionId
      && pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
      mergedEndpoint = pushSubscription.endpoint + '/' +
          pushSubscription.subscriptionId;
    }

  const GCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';
  if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
    return null;
  } else {
    return mergedEndpoint.split('/').pop();
  }
}

async function getPlayBack(event: unknown) {
  logger.log('Received a push message {}', event)();
  if (!subScr) {
    const r = await (<any>self).registration.pushManager.getSubscription();
    subScr = getSubscriptionId(r);
  }
  if (!subScr) {
    throw Error('Unable to get subscription');
  }
  const response = await fetch(`${XHR_API_URL}/get_firebase_playback`, {
    credentials: 'omit',
    headers: {auth: subScr}
  });
  logger.log('Fetching finished {}', response)();
  const t = await response.text();
  logger.debug('response is {}', t)();
  const m = JSON.parse(t);
  logger.log('Parsed response {}', m)();
  const notifications = await (<any>self).registration.getNotifications();
  let count = 1;
  if (m.options && m.options.data) {
    const room = m.options.data.room;
    const sender = m.options.data.sender;
    for (let i = 0; i < notifications.length; i++) {
      if (room && notifications[i].data.room === room
          || (sender && notifications[i].data.sender === sender)) {
        notifications[i].close();
        count += notifications[i].data.replaced || 1;
      }
    }
    if (count > 1) {
      m.options.data.replaced = count;
      if (room) {
        m.title = 'Room: ' + room + '(+' + count + ')';
        m.options.body = sender + ':' + m.options.body;
      } else if (sender) {
        m.title = sender + '(+' + count + ')';
      }
    }
  }  logger.log('Spawned notification {}', m)();
  await (<any>self).registration.showNotification(m.title, m.options);
}

self.addEventListener('push', (e: any) => e.waitUntil(getPlayBack(e)));

self.addEventListener('notificationclick', function (event: any) {
  logger.log('On notification click: {}', event.notification.tag)();
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function (clientList: ReadonlyArray<Response>) {
    const roomId = event.notification.data && event.notification.data.roomId;
    if (clientList && clientList[0] && roomId) {
      (<{navigate: Function}>(<unknown>clientList[0])).navigate('/#/chat/' + roomId); // TODO
    } else if (clientList && clientList[0]) {
      (<{focus: Function}>(<unknown>clientList[0])).focus(); // TODO
    } else if (roomId) {
      clients.openWindow('/#/chat/' + roomId);
    } else {
      clients.openWindow('/');
    }
  }));
});

export default function asf() {
  console.log('sw');
}
