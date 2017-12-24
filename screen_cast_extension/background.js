var desktopMediaRequestId = '';

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
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

function flatten(arr) {
  return [].concat.apply([], arr);
}

// This avoids a reload after an installation
chrome.windows.getAll({ populate: true }, function(windows) {
  const details = { file: 'content-script.js', allFrames: true };

  flatten(windows.map(function(w) {
    return w.tabs})).forEach(function(tab)  {
    // Skip chrome:// pages
    if (tab.url.match(/(chrome):\/\//gi)) {
      return;
    }

    // https://developer.chrome.com/extensions/tabs#method-executeScript
    // Would be nice to skip non authorized pages too, to avoid errors.
    chrome.tabs.executeScript(tab.id, details, function() {
      console.log('After injection in tab: ', tab);
    });
  });
});
