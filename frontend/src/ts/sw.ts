declare const PYCHAT_CONSTS: Record<string, any>;
const {
  IS_DEBUG,
  BACKEND_ADDRESS,
  PUBLIC_PATH,
  GIT_HASH,
} = PYCHAT_CONSTS;

declare var clients: any;
declare var serviceWorkerOption: { assets: string[] };


// TODO remove logger
 interface DoLog {
  (format: string, ...args: unknown[]): () => void;
}
 interface Logger {
  warn: DoLog;
  log: DoLog;
  error: DoLog;
  debug: DoLog;
  trace: DoLog;
}

 const logLevels: Record<LogLevel, number> = {
  log_raise_error: 1,
  log_with_warnings: 2,
  trace: 3,
  debug: 4,
  info: 5,
  warn: 6,
  error: 7,
  disable: 8,
};

 interface MockConsole {
  trace(message?: unknown, ...optionalParams: unknown[]): void;
  debug(message?: unknown, ...optionalParams: unknown[]): void;
  log(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
  error(message?: unknown, ...optionalParams: unknown[]): void;
}

 type LogLevel = 'log_raise_error'|'log_with_warnings'|'trace'|'debug'|
    'info'|'warn'|'error'|'disable';

 class LoggerFactory {

  private logLevel: LogLevel;

  private mockConsole: MockConsole;

  constructor(
      logLevel: LogLevel = 'log_with_warnings',
      mockConsole: MockConsole|null = null) {
    this.logLevel = logLevel;
    if (!logLevels[logLevel]) {
      throw Error(`Invalid log level ${logLevel} allowed: ${
          JSON.stringify(logLevels)}`);
    }
    if (mockConsole) {
      this.mockConsole = mockConsole;
    } else {
      this.mockConsole = console;
    }
  }

  private dummy() {}

  setLogWarnings(logWarnings: LogLevel): void {
    this.logLevel = logWarnings;
  }

  getLogWarnings(): LogLevel {
    return this.logLevel;
  }

  /**
   * @return Single log function that can be called, e.g.
   * getSingleLogger(...)('hello wolrd')
   * @param name - badge string, that every log will be marked with
   * @param color - css color of badge, e.g. #FFFAAA
   * @param fn - binded function that will be called eventually, e.g.
   * console.log
   */
  getSingleLoggerColor(name: string, color: string, fn: Function): DoLog {
    return this.getSingleLoggerStyle(name, this.getColorStyle(color), fn);
  }

  /**
   * @return Single log function that can be called, e.g.
   * getSingleLogger(...)('hello wolrd')
   * @param name - badge string, that every log will be marked with
   * @param fn - binded function that will be called eventually, e.g.
   * console.log
   */
  getSingleLogger(name: string, fn: Function): DoLog {
    const color = this.getRandomColor(name);
    return this.getSingleLoggerStyle(name, this.getColorStyle(color), fn);
  }

  getSingleLoggerStyle(
      name: string, style: string, fn: Function,
      minLevel: LogLevel = 'log_with_warnings'): DoLog {
    return (...args1: unknown[]) => {
      if (logLevels[this.logLevel] > logLevels[minLevel]) {
        return this.dummy;
      }
      const args = Array.prototype.slice.call(args1);
      const parts = args.shift().split('{}');
      /* tslint:disable:no-any */
      // TODO
      const params: any[any] = [this.mockConsole, '%c' + name, style];
      /* tslint:enable:no-any */
      for (let i = 0; i < parts.length; i++) {
        params.push(parts[i]);
        if (typeof args[i] !== 'undefined') {  // args can be '0'
          params.push(args[i]);
        }
      }
      if (parts.length - 1 !== args.length) {
        if (this.logLevel === 'log_with_warnings') {
          this.mockConsole.error('MissMatch amount of arguments');
        } else if (this.logLevel === 'log_raise_error') {
          throw new Error('MissMatch amount of arguments');
        }
      }
      return Function.prototype.bind.apply(fn, params);
    };
  }
  getLoggerColor(name: string, color: string): Logger {
    return this.getLoggerStyle(name, this.getColorStyle(color));
  }
  getColorStyle(color: string): string {
    return `color: white; background-color: ${
        color}; padding: 2px 6px; border-radius: 2px; font-size: 10px`;
  }
  static getHash(str: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  getRandomColor(str: string = '') {
    const hash = LoggerFactory.getHash(str);
    let color = '#';
    for (let i = 0; i < 3; i ++) {
      // get 7 bits in range, and cast them to hex, so we have 0..127 of rgb in hex for each color
      color += ('00' + (((hash >> (i * 7)) & 0b1111111) + 8).toString(16)).substr(-2);
    }
    return color;
  }
  getLogger(name: string) {
    return this.getLoggerColor(name, this.getRandomColor(name));
  }
  getLoggerStyle(name: string, style: string): Logger {
    return {
      trace: this.getSingleLoggerStyle(name, style, this.mockConsole.trace, 'trace'),
      debug: this.getSingleLoggerStyle(name, style, this.mockConsole.debug, 'debug'),
      log: this.getSingleLoggerStyle(name, style, this.mockConsole.log, 'info'),
      warn: this.getSingleLoggerStyle(name, style, this.mockConsole.warn, 'warn'),
      error: this.getSingleLoggerStyle(name, style, this.mockConsole.error, 'error'),
    };
  }
 }

const loggerFactory =  new LoggerFactory(IS_DEBUG ? 'trace' : 'error');
const logger: Logger = loggerFactory.getLogger(`SW_${GIT_HASH}`);

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
        url.includes('.js') ||
        url.includes('.css') ||
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

  // cache .js files, .css files and etc if they didn't hit install event
  // if index.html request.url will be with `#`, but allAssetsSet doesn't contain a `#`
  let belongsToStaticCache = allAssetsSet[event.request.url] || event.request.mode === 'navigate';

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

    let fetchedResponse: Response | null = null;
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
        m.options.icon = `${url}${m.options.icon}`;
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
  }
  logger.log('Spawned notification {}', m)();
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
      (<{ navigate: Function }>(<unknown>clientList[0])).navigate('/#/chat/' + roomId); // TODO
    } else if (clientList && clientList[0]) {
      (<{ focus: Function }>(<unknown>clientList[0])).focus(); // TODO
    } else if (roomId) {
      clients.openWindow('/#/chat/' + roomId);
    } else {
      clients.openWindow('/');
    }
  }));
});
