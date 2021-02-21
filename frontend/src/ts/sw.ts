import {Logger} from 'lines-logger';
import loggerFactory from '@/ts/instances/loggerFactory';
import {
  BACKEND_ADDRESS,
  GIT_HASH,
  PUBLIC_PATH
} from '@/ts/utils/consts';

declare var clients: any;
declare var serviceWorkerOption: {assets: string[]};
const logger: Logger = loggerFactory.getLogger(`SW_${GIT_HASH}`);

logger.debug('Evaluating...')();

let subScr: null | string = null;

// exclude audio from being cached, since
// 1: 206 partial response is uncacheable
// audio request generate header range, which creates option request, which fails
// https://stackoverflow.com/a/37614302/3872976
serviceWorkerOption.assets = serviceWorkerOption.assets.filter(url => !url.includes('/sounds/'));

const allAssetsSet: Record<string, boolean> = {}
const allAssets = serviceWorkerOption.assets.map(url => {
  let value;
  // https://pychat.org/ + /asdf/ = invalid url, so use new URL
  if (PUBLIC_PATH) {
    value = new URL(url, PUBLIC_PATH).href; // https://pychat.org/ + /asdf/ = invalid url, so use new URL
  } else {
    value = new URL(url, (self as any).registration.scope).href;
  }
  allAssetsSet[value] = true;
  return value;
})

allAssets.push((self as any).registration.scope);
allAssetsSet[(self as any).registration.scope] = true;
// this event fires when service worker registers the first time
self.addEventListener('install', (event: any) => {
  logger.log(' Delaying install event to put static resources')();
  event.waitUntil((async () => {
    const staticCache = await caches.open('static');
    const assets = allAssets.filter(url =>
        url.includes('/smileys/') ||
        url.includes('.js?') ||
        url.includes('.css?') ||
        url.includes('/img/') ||
        url === (self as any).registration.scope
    );
    logger.log('Putting to static cache {}', assets)();
    await staticCache.addAll(assets);
    let allFiles = await staticCache.keys();
    const oldFiles = allFiles.filter(r => !allAssetsSet[r.url]);
    logger.log('Putting to static cache finished, removing old files {}', oldFiles)();
    await Promise.all(oldFiles.map(oldFile => staticCache.delete(oldFile)));
    logger.log('Removed old files finished. Can proceed to activate now..')();
  })());
});

// Cache and return requests
self.addEventListener('fetch', async (event: any) => {

  // Cache only files, do not cache XHR API, so exist on POST immediately
  if (event.request.method !== "GET") {
    return
  }

  // do not cache sounds as they preload with 206
  let isSound = event.request.url.indexOf('/sounds/') >= 0;

  // cache user mini avatars
  let belongsToThumbnailCache = event.request.url.indexOf('/photo/thumbnail/') >= 0;

  // cache photos in Chat, like images with messages
  let belongsToPhotoCache = event.request.url.indexOf('/photo/') >= 0;

  // cache .js files, .css files and etc, with index.html (navigate) if they didn't hit install event
  let belongsToStaticCache = allAssetsSet[event.request.url];

  // if this request is not in cache mod, exit
  if (!belongsToThumbnailCache && !belongsToPhotoCache && !belongsToStaticCache || isSound) {
    return
  }
  event.respondWith((async () => {
    let request = event.request;
    let cachedResponse: any = await caches.match(request);

    if (cachedResponse && request.mode !== 'navigate') {
      logger.debug(`Returning ${request.url} from cache`)()
      return cachedResponse;
    }

    let fetchedResponse: Response|null = null;
    let error = null;
    try {
      fetchedResponse = await fetch(request);
    } catch (e) {
      error = e;
    }

    if (fetchedResponse?.status === 206) {
      return fetchedResponse;
    }
    if (fetchedResponse?.ok) {
      // do not put partial response. E.g. preload audio
      if (belongsToThumbnailCache) {
        logger.debug(`Adding ${request.url} to thumbnail cache`)()
        let cache = await caches.open('thumbnails') // users icon
        await cache.put(request, fetchedResponse.clone());
      } else if (belongsToPhotoCache) {
        let cache = await caches.open('photos') // user sends image with a message
        logger.debug(`Adding ${request.url} to photos cache`)()
        await cache.put(request, fetchedResponse.clone());
      } else if (belongsToStaticCache) {
        logger.log(`Putting ${request.url} to static cache`)()
        let cache = await caches.open('static') // all static assets
        await cache.put(request, fetchedResponse.clone())
      }
      return fetchedResponse;
    }
    if (cachedResponse) {
      logger.warn(`Server returned {} for ${request.url}. Returning data from cache`, fetchedResponse || error)();
      return cachedResponse;
    }

    if (error) {
      throw error
    }
    return fetchedResponse
  })());
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
