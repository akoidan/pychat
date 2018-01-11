var SW_VERSION = '1.0';
console.log("%cSW_S startup, version is " + SW_VERSION, 'color: #ffb500; font-weight: bold');
var loggerFactory = (function (logsEnabled) {
	var self = this;
	self.logsEnabled = logsEnabled;
	self.dummy = function () {
	};
	self.getLogger = function (initiator, dest, style) {
		return function () {
			if (!self.logsEnabled) {
				return self.dummy;
			}
			var args = Array.prototype.slice.call(arguments);
			var parts = args.shift().split('{}');
			var params = [console, '%c' + initiator, style];
			for (var i = 0; i < parts.length; i++) {
				params.push(parts[i]);
				if (args[i]) {
					params.push(args[i])
				}
			}
			return Function.prototype.bind.apply(dest, params);
		};
	};
	return self;
})(true);

var logger = {
	warn: loggerFactory.getLogger("SW_S", console.warn, 'color: #ffb500; font-weight: bold'),
	log: loggerFactory.getLogger("SW_S", console.log, 'color: #ffb500; font-weight: bold'),
	error: loggerFactory.getLogger("SW_S", console.error, 'color: #ffb500; font-weight: bold')
};

var subScr = null;

// Install Service Worker
self.addEventListener('install', function (event) {
	logger.log(' installed!')();
});

// Service Worker Active
self.addEventListener('activate', function (event) {
	logger.log(' activated!')();
});


function getSubscriptionId(pushSubscription) {
	var mergedEndpoint = pushSubscription.endpoint;
	if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0) {
		if (pushSubscription.subscriptionId &&
				pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
			mergedEndpoint = pushSubscription.endpoint + '/' +
					pushSubscription.subscriptionId;
		}
	}
	var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
	if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
		return null;
	} else {
		return mergedEndpoint.split('/').pop();
	}
}

function getAuth(cb) {
	if (subScr) {
		cb(subScr);
	} else {
		self.registration.pushManager.getSubscription().then(function (r) {
			subScr = getSubscriptionId(r);
			cb(subScr)
		});
	}
}

self.addEventListener('push', function (event) {
	logger.log('Received a push message {}', event)();

	getAuth(function (auth) {
		if (auth) {
			fetch('/get_firebase_playback', {
				credentials: 'omit',
				headers: {auth: auth}
			}).then(function (response) {
				logger.log("Fetching finished", response)();
				response.json().then(function (m) {
					logger.log("Parsed response", m)();
					var  a = self.registration.showNotification(m.title, m.options);
					logger.log("{}", a);
				})
			}).catch(function (response) {
				logger.error(response)();
			})
		} else {
			logger.error("Auth header is null")();
		}

	})
});

self.addEventListener('notificationclick', function (event) {
	logger.log('On notification click: {}', event.notification.tag);
	// Android doesn’t close the notification when you click on it
	// See: http://crbug.com/463146
	event.notification.close();

	// This looks to see if the current is already open and
	// focuses if it is
	event.waitUntil(clients.matchAll({
		type: 'window'
	}).then(function (clientList) {
		for (var i = 0; i < clientList.length; i++) {
			var client = clientList[i];
			if (client.url === '/' && 'focus' in client) {
				return client.focus();
			}
		}
		if (clients.openWindow && event.notification.data) {
			return clients.openWindow(event.notification.data.url);
		}
	}));
});

