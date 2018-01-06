var loggerFactory = (function (logsEnabled) {
	var self = this;
	self.logsEnabled = logsEnabled;
	self.dummy = function() {
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


logger.log("SW Startup!")();
var csrf;
var remoteAddress;
// Install Service Worker
self.addEventListener('install', function (event) {
	logger.log('1 installed!')();
});

// Service Worker Active
self.addEventListener('activate', function (event) {
	logger.log('1 activated!')();
});

self.addEventListener('message', function (event) {
	logger.log('Got message' + event)();
	if (event.data && event.data.action === 'setData') {
		csrf = event.data.csrf;
		loggerFactory.logsEnabled = event.data.logsEnabled;
		remoteAddress = event.data.remoteAddress;
	}
});

function showNot(title, body) {
	self.registration.showNotification(title, {body: body});
}
setInterval(function () {
	if (csrf && origin) {
		logger.log('fetching '+ remoteAddress+ '/get_extension_messages')();
		fetch(remoteAddress+ '/get_extension_messages', {
			credentials: 'include'
		}).then(function (response) {
			logger.log("Fetching finished", response)();
			response.json().then(function(e) {
				logger.log("Parsed response", e)();
				if (e.length > 3) {
					new Notification('Pychat', { body: "You have " + e.length + " unread messages"});
				} else if (e.length > 0) {
					e.forEach(function(m) {
						showNot('Pychat', { body: m.content});
					})
				} else {
					logger.log("No new messages found")();
				}
			})
		}).catch(function (response) {
			console.error(response)();
		})
	} else {
		logger.warn("Skipping fetch, csrf='{}' , origin='{}'", csrf, origin);
	}
}, 5000);

