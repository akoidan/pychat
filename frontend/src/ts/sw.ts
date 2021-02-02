import {Logger} from 'lines-logger';
import loggerFactory from '@/ts/instances/loggerFactory';
import {
  BACKEND_ADDRESS,
  IS_SSL,
  PUBLIC_PATH
} from '@/ts/utils/consts';

declare var clients: any;
declare var serviceWorkerOption: {assets: string[]};
const logger: Logger = loggerFactory.getLogger('SW_S');

//
const SW_VERSION = '1.5';
logger.debug('startup, version {}', SW_VERSION)();

let subScr: null | string = null;

// Install Service Worker
self.addEventListener('install', (event: any) => {
  logger.log(' installed!')();
  event.waitUntil(
      caches.open('smileys').then(function(cache) {
        return cache.addAll([
            ...serviceWorkerOption.assets
                .filter(a => a.startsWith('/smileys/'))
                .map(url => {
                  if (PUBLIC_PATH) {
                    return new URL(url, PUBLIC_PATH).href; // https://pychat.org/ + /asdf/ = invalid url, so use new URL
                  } else {
                    return url;
                  }
                }),
            ]
        );
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', async (event: any) => {
  event.respondWith((async function() {
    let response: any = await caches.match(event.request);

    // cache only static files + photos, exclude api backend calls
    let matchesExistingCache = ['/smileys/', '/photo/thumbnail/', '/flags/'].find(e => event.request.url.indexOf(e) >=0);
    if (response && matchesExistingCache ) {
      return response;
    }

    let fetchedResponse: Response|null = null;
    let error = null;
    try {
      fetchedResponse = await fetch(event.request);
    } catch (e) {
      error = e;
    }

    if (fetchedResponse?.ok ) {
      if (event.request.url.indexOf('/photo/thumbnail/') >= 0) {
        let cache = await caches.open('thumbnails')
        await cache.put(event.request, fetchedResponse.clone());
      } else if (event.request.url.indexOf('/flags/') >= 0) {
        let cache = await caches.open('flags')
        await cache.put(event.request, fetchedResponse.clone());
      } else if ( // cache index.html, main.js , main.css and other trash only if response is not ok
          (serviceWorkerOption.assets.find(e => event.request.url.indexOf(e) >=0)
          && !matchesExistingCache) || event.request.mode == 'navigate') {
        if (fetchedResponse.status !== 206) { // do not put partial response. E.g. preload audio
          let cache = await caches.open('static')
          await cache.put(event.request, fetchedResponse.clone())
        }
      }
      return fetchedResponse;
    }
    if (response && error) {
      logger.warn("Site is offline returning {} from cache", event.request)();
      return response;
    }
    if (error) {
      throw error
    }
    return fetchedResponse
  })())
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
  let address;
  // it's always https, since SW doesn't work in http.
  if (BACKEND_ADDRESS.indexOf('{}') >= 0) {
    // self.registration returns "https://pychat.org/"
    address = `https://${BACKEND_ADDRESS.replace('{}', new URL((self as any).registration.scope).hostname)}`;
  } else {
    address = `https://${BACKEND_ADDRESS}`;
  }
  const response = await fetch(`${address}/api/get_firebase_playback?registration_id=${subScr}`, {
    credentials: 'omit',
  });
  logger.log('Fetching finished {}', response)();
  const t = await response.text();
  logger.debug('response is {}', t)();
  const m = JSON.parse(t);
  logger.log('Parsed response {}', m)();
  const notifications = await (<any>self).registration.getNotifications();
  let count = 1;
  if (m.options && m.options.data) {
    if (m.options.icon) {
      if (m.options.icon.startsWith('/photo')) {
        let url = PUBLIC_PATH ? PUBLIC_PATH : address;
        m.options.icon =  `${url}${m.options.icon}`;
      }
    }
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
