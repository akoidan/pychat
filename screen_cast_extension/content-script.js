window.contentScriptHasRun = false;

(function () {
	// prevent the content script from running multiple times
	if (window.contentScriptHasRun) {
		return;
	}

	window.contentScriptHasRun = true;

	const port = chrome.runtime.connect(chrome.runtime.id);
	port.onMessage.addListener(function (msg) {
		window.postMessage(msg, '*');
	});

	window.addEventListener('message', function (event) {
		// Only accept messages from ourselves
		if (event.source !== window) {
			return;
		}
		// Only accept events with a data type
		if (!event.data.type) {
			return;
		}

		if (['PYCHAT_SCREEN_SHARE_REQUEST', 'PYCHAT_SCREEN_SHARE_CANCEL'].includes(event.data.type)) {
			port.postMessage(event.data);
		}
	}, false);

	window.postMessage({type: 'PYCHAT_SCREEN_SHARE_PING', text: 'start'}, '*');
})();
