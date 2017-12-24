var desktopMediaRequestId = '';

chrome.runtime.onConnect.addListener(function(port) {
  console.log("Connected from new port ", port);
  port.onMessage.addListener(function(msg) {
    console.log("Got new message ", msg);
    if (msg.type === 'PYCHAT_SCREEN_SHARE_REQUEST') {
      requestScreenSharing(port, msg);
    }
    if (msg.type === 'PYCHAT_SCREEN_SHARE_CANCEL') {
      cancelScreenSharing(msg);
    }
  });
});

function requestScreenSharing(port, msg) {
  // https://developer.chrome.com/extensions/desktopCapture
  // params:
  //  - 'data_sources' Set of sources that should be shown to the user.
  //  - 'targetTab' Tab for which the stream is created.
  //  - 'streamId' String that can be passed to getUserMedia() API
  // Also available:
  //  ['screen', 'window', 'tab', 'audio']
  const sources = ['screen', 'window', 'tab', 'audio'];
  const tab = port.sender.tab;

  desktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia(sources, port.sender.tab,
    function(streamId) {
      if (streamId) {
        msg.type = 'PYCHAT_SCREEN_SHARE_DIALOG_SUCCESS';
        msg.streamId = streamId;
      } else {
        msg.type = 'PYCHAT_SCREEN_SHARE_DIALOG_CANCEL';
      }
      port.postMessage(msg);
    });
}

function cancelScreenSharing(msg) {
  if (desktopMediaRequestId) {
     chrome.desktopCapture.cancelChooseDesktopMedia(desktopMediaRequestId);
  }
}