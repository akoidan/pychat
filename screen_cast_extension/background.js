var desktopMediaRequestId = '';

chrome.runtime.onMessageExternal.addListener(function (msg, sender, sendResponse) {
	console.log("Got new message ", msg);
	if (!msg) {
		return;
	}
	if (msg.type === 'PYCHAT_SCREEN_SHARE_PING') {
		sendResponse({type: 'PYCHAT_SCREEN_SHARE_PING', data: 'success'});
	} else if (msg.type === 'PYCHAT_SCREEN_SHARE_REQUEST') {
		const sources = ['screen', 'window', 'tab', 'audio'];
		desktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia(sources, sender.tab, function (streamId) {
			msg.type = 'PYCHAT_SCREEN_SHARE_REQUEST';
			if (streamId) {
				msg.streamId = streamId;
				msg.data = 'success';
			} else {
				msg.data = 'fail';
			}
			sendResponse(msg);
		});
		return true;
	} else if (msg.type === 'PYCHAT_SCREEN_SHARE_CANCEL') {
		if (desktopMediaRequestId) {
			chrome.desktopCapture.cancelChooseDesktopMedia(desktopMediaRequestId);
		}
	}
});
