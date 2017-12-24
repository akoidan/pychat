var desktopMediaRequestId = '';


chrome.runtime.onMessageExternal.addListener(function (msg, sender, sendResponse) {
	console.log("Got new message ", msg);
	if (msg.type === 'PYCHAT_SCREEN_SHARE_REQUEST') {
		const sources = ['screen', 'window', 'tab', 'audio'];
		desktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia(sources, null, function (streamId) {
			if (streamId) {
				msg.type = 'PYCHAT_SCREEN_SHARE_DIALOG_SUCCESS';
				msg.streamId = streamId;
			} else {
				msg.type = 'PYCHAT_SCREEN_SHARE_DIALOG_CANCEL';
			}
			sendResponse(msg);
		});
		return true;
	}
	if (msg.type === 'PYCHAT_SCREEN_SHARE_CANCEL') {
		if (desktopMediaRequestId) {
			chrome.desktopCapture.cancelChooseDesktopMedia(desktopMediaRequestId);
		}
	}
});
