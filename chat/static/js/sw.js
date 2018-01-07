console.log("%cSW_S startup", 'color: #ffb500; font-weight: bold');
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


// Install Service Worker
self.addEventListener('install', function (event) {
	logger.log(' installed!')();
});

// Service Worker Active
self.addEventListener('activate', function (event) {
	logger.log(' activated!')();
});

self.addEventListener('push', function (event) {
	logger.log('Received a push message {}', event)();

	var title = 'Yay a message.';
	var body = 'We have received a push message.';
	var icon = '/images/icon-192x192.png';
	var tag = 'simple-push-demo-notification-tag';

	event.waitUntil(
			self.registration.showNotification(title, {
				body: body,
				icon: icon,
				tag: tag
			})
	);
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
		if (clients.openWindow) {
			return clients.openWindow('/');
		}
	}));
});

