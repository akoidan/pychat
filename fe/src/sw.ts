import {Logger, LoggerFactory, LogStrict} from 'lines-logger';

declare var clients: any;

let loggerFactory: LoggerFactory = new LoggerFactory(LogStrict.LOG_WITH_WARNINGS);
let logger: Logger = loggerFactory.getLoggerColor('SW_S', 'color: #ffb500; font-weight: bold');

//
let SW_VERSION = '1.5';
logger.log('startup, version {}', SW_VERSION)();

let subScr = null;

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
  if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0
      && pushSubscription.subscriptionId
      && pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
      mergedEndpoint = pushSubscription.endpoint + '/' +
          pushSubscription.subscriptionId;
    }

  let GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
  if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
    return null;
  } else {
    return mergedEndpoint.split('/').pop();
  }
}


async function getPlayBack(event) {
  logger.log('Received a push message {}', event)();
  if (!subScr) {
    let r = await (<any>self).registration.pushManager.getSubscription();
    subScr = getSubscriptionId(r);
  }
  if (!subScr) {
    throw 'Unable to get subscription';
  }
  let response = await fetch('/get_firebase_playback', {
    credentials: 'omit',
    headers: {auth: subScr}
  });
  logger.log('Fetching finished {}', response)();
  let m = await response.json();

  logger.log('Parsed response {}', m)();
  let notifications = await (<any>self).registration.getNotifications();
  let count = 1;
  if (m.options && m.options.data) {
    let room = m.options.data.room;
    let sender = m.options.data.sender;
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
  }
  (<any>self).registration.showNotification(m.title, m.options);
  logger.log('Spawned notification {}', m)();
}

self.addEventListener('push', (e) => getPlayBack(e));

self.addEventListener('notificationclick', function (event: any) {
  logger.log('On notification click: {}', event.notification.tag)();
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function (clientList) {
    let roomId = event.notification.data && event.notification.data.roomId;
    if (clientList && clientList[0] && roomId) {
      clientList[0].navigate('/#/chat/' + roomId);
    } else if (clientList && clientList[0]) {
      clientList[0].focus();
    } else if (roomId) {
      clients.openWindow('/#/chat/' + roomId);
    } else {
      clients.openWindow('/');
    }
  }));
});