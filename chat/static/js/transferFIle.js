/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';


var isFirefox = false;
var RTCPeerConnection = isFirefox ? mozRTCPeerConnection : webkitRTCPeerConnection;

function FileTransfer() {
	var self = this;
	self.localConnection = null;
	self.remoteConnection = null;
	self.receiveChannel = null;
	self.pcConstraint= null;
	self.receiveBuffer = [];
	self.receivedSize = 0;
	self.bytesPrev = 0;
	self.timestampPrev = 0;
	self.timestampStart = null;
	self.statsInterval = null;
	self.bitrateMax = 0;
	self.CHUNK_SIZE = 16384;
	self.dom =  {
		bitrateDiv: $('bitrate'),
		fileInput: $('fileInput'),
		downloadAnchor: $('download'),
		sendProgress: $('sendProgress'),
		receiveProgress: $('receiveProgress'),
		statusMessage: $('status')
	};
	self.createConnection = function() {
		self.file = self.dom.fileInput[0];
		var servers = null;
		self.pcConstraint= null;

		// Add self.localConnection to global scope to make it visible
		// from the browser console.
		self.localConnection = new RTCPeerConnection(servers, self.pcConstraint);
		console.log(getDebugMessage('Created local peer connection object self.localConnection'));

		self.remoteConnection = self.localConnection.createDataChannel('sendDataChannel');
		self.remoteConnection.binaryType = 'arraybuffer';
		console.log(getDebugMessage('Created send data channel'));

		self.remoteConnection.onopen = self.remoteConnectionStateChange;
		self.remoteConnection.onclose = self.remoteConnectionStateChange;
		self.localConnection.onicecandidate = self.iceCallback1;

		self.localConnection.createOffer().then(
				self.gotDescription1,
				self.onCreateSessionDescriptionError
		);
		// Add self.remoteConnection to global scope to make it visible
		// from the browser console.
		self.remoteConnection = new RTCPeerConnection(servers, self.pcConstraint);
		console.log(getDebugMessage('Created remote peer connection object self.remoteConnection'));

		self.remoteConnection.onicecandidate = self.iceCallback2;
		self.remoteConnection.ondatachannel = self.receiveChannelCallback;

		self.dom.fileInputdisabled = true;
	};
	self.dom.fileInput.addEventListener('change', self.createConnection, false);

	self.onCreateSessionDescriptionError = function(error) {
		console.log(getDebugMessage('Failed to create session description: ' + error.toString()));
	};

	self.sendData = function() {
		console.log(getDebugMessage('file is ' + [self.file.name, self.file.size, self.file.type,
					self.file.lastModifiedDate].join(' ')));

		// Handle 0 size files.
		self.dom.statusMessage.textContent = '';
		self.dom.downloadAnchor.textContent = '';
		if (self.file.size === 0) {
			self.dom.bitrateDivinnerHTML = '';
			self.dom.statusMessage.textContent = 'File is empty, please select a non-empty file';
			self.closeDataChannels();
			return;
		}
		self.dom.sendProgress.max = self.file.size;
		self.dom.receiveProgress.max = self.file.size;
		self.sliceFile(0);
	};
	self.sliceFile = function (offset) {
		var reader = new window.FileReader();
		reader.onload = (function () {
			return function (e) {
				self.remoteConnection.send(e.target.result);
				if (self.file.size > offset + e.target.result.byteLength) {
					window.setTimeout(self.sliceFile, 0, offset + self.CHUNK_SIZE);
				}
				self.dom.sendProgress.value = offset + e.target.result.byteLength;
			};
		})(self.file);
		var slice = self.file.slice(offset, offset + self.CHUNK_SIZE);
		reader.readAsArrayBuffer(slice);
	};

	self.closeDataChannels = function() {
		console.log(getDebugMessage('Closing data channels'));
		self.remoteConnection.close();
		console.log(getDebugMessage('Closed data channel with label: ' + self.remoteConnection.label));
		if (self.receiveChannel)  {
			self.receiveChannel.close();
			console.log(getDebugMessage('Closed data channel with label: ' + self.receiveChannel.label));
		}
		self.localConnection.close();
		self.remoteConnection.close();
		self.localConnection = null;
		self.remoteConnection = null;
		console.log(getDebugMessage('Closed peer connections'));

		// re-enable the file select
		self.dom.fileInputdisabled = false;
	};

	self.gotDescription1 = function(desc) {
		self.localConnection.setLocalDescription(desc);
		console.log(getDebugMessage('Offer from self.localConnection \n' + desc.sdp));
		self.remoteConnection.setRemoteDescription(desc);
		self.remoteConnection.createAnswer().then(
				self.gotDescription2,
				self.onCreateSessionDescriptionError
		);
	};

	self.gotDescription2 = function(desc) {
		self.remoteConnection.setLocalDescription(desc);
		console.log(getDebugMessage('Answer from self.remoteConnection \n' + desc.sdp));
		self.localConnection.setRemoteDescription(desc);
	};

	self.iceCallback1 = function(event) {
		console.log(getDebugMessage('local ice callback'));
		if (event.candidate) {
			self.remoteConnection.addIceCandidate(
					event.candidate
			).then(
					self.onAddIceCandidateSuccess,
					self.onAddIceCandidateError
			);
			console.log(getDebugMessage('Local ICE candidate: \n' + event.candidate.candidate));
		}
	};

	self.iceCallback2 = function(event) {
		console.log(getDebugMessage('remote ice callback'));
		if (event.candidate) {
			self.localConnection.addIceCandidate(
					event.candidate
			).then(
					self.onAddIceCandidateSuccess,
					self.onAddIceCandidateError
			);
			console.log(getDebugMessage('Remote ICE candidate: \n ' + event.candidate.candidate));
		}
	};

	self.onAddIceCandidateSuccess = function() {
		console.log(getDebugMessage('AddIceCandidate success.'));
	};

	self.onAddIceCandidateError = function(error) {
		console.log(getDebugMessage('Failed to add Ice Candidate: ' + error.toString()));
	};

	self.receiveChannelCallback = function(event) {
		console.log(getDebugMessage('Receive Channel Callback'));
		self.receiveChannel = event.channel;
		self.receiveChannel.binaryType = 'arraybuffer';
		self.receiveChannel.onmessage = self.onReceiveMessageCallback;
		self.receiveChannel.onopen = self.onReceiveChannelStateChange;
		self.receiveChannel.onclose = self.onReceiveChannelStateChange;

		self.receivedSize = 0;
		self.bitrateMax = 0;
		self.dom.downloadAnchor.textContent = '';
		self.dom.downloadAnchor.removeAttribute('download');
		if (self.dom.downloadAnchor.href) {
			URL.revokeObjectURL(self.dom.downloadAnchor.href);
			self.dom.downloadAnchor.removeAttribute('href');
		}
	};

	self.onReceiveMessageCallback = function(event) {
		// console.log(getDebugMessage('Received Message ' + event.data.byteLength));
		self.receiveBuffer.push(event.data);
		self.receivedSize += event.data.byteLength;

		self.dom.receiveProgress.value = self.receivedSize;

		// we are assuming that our signaling protocol told
		// about the expected file size (and name, hash, etc).
		if (self.receivedSize === self.file.size) {
			var received = new window.Blob(self.receiveBuffer);
			self.receiveBuffer = [];

			self.dom.downloadAnchor.href = URL.createObjectURL(received);
			self.dom.downloadAnchor.download = self.file.name;
			self.dom.downloadAnchor.textContent =
					'Click to download \'' + self.file.name + '\' (' + self.file.size + ' bytes)';
			self.dom.downloadAnchor.style.display = 'block';

			var bitrate = Math.round(self.receivedSize * 8 /
					((new Date()).getTime() - self.timestampStart));
			self.dom.bitrateDivinnerHTML = '<strong>Average Bitrate:</strong> ' +
					bitrate + ' kbits/sec (max: ' + self.bitrateMax + ' kbits/sec)';

			if (self.statsInterval) {
				window.clearInterval(self.statsInterval);
				self.statsInterval = null;
			}

			self.closeDataChannels();
		}
	};

	self.remoteConnectionStateChange = function() {
		var readyState = self.remoteConnection.readyState;
		console.log(getDebugMessage('Send channel state is: ' + readyState));
		if (readyState === 'open') {
			self.sendData();
		} else {
			console.error(getDebugMessage('Not opened yet'));
		}
	};

	self.onReceiveChannelStateChange = function() {
		var readyState = self.receiveChannel.readyState;
		console.log(getDebugMessage(('Receive channel state is: ' + readyState)));
		if (readyState === 'open') {
			self.timestampStart = (new Date()).getTime();
			self.timestampPrev = self.timestampStart;
			self.statsInterval = window.setInterval(self.displayStats, 500);
			window.setTimeout(self.displayStats, 100);
			window.setTimeout(self.displayStats, 300);
		} else {
			console.error(getDebugMessage('Not opened yet'));
		}
	};
	self.getChromeStats = function (stats) {
		for (var key in stats) {
			var res = stats[key];
			if (self.timestampPrev === res.timestamp) {
				return;
			}
			if (res.type === 'googCandidatePair' &&
					res.googActiveConnection === 'true') {
				// calculate current bitrate
				var bytesNow = res.bytesReceived;
				var bitrate = Math.round((bytesNow - self.bytesPrev) * 8 /
						(res.timestamp - self.timestampPrev));
				self.display(bitrate);
				self.timestampPrev = res.timestamp;
				self.bytesPrev = bytesNow;
				if (bitrate > self.bitrateMax) {
					self.bitrateMax = bitrate;
				}
			}
		}
	};
	self.getFirefoxStats = function() {
		// Firefox currently does not have data channel stats. See
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1136832
		// Instead, the bitrate is calculated based on the number of
		// bytes received.
		var bytesNow = self.receivedSize;
		var now = (new Date()).getTime();
		var bitrate = Math.round((bytesNow - self.bytesPrev) * 8 /
				(now - self.timestampPrev));
		self.display(bitrate);
		self.timestampPrev = now;
		self.bytesPrev = bytesNow;
		if (bitrate > self.bitrateMax) {
			self.bitrateMax = bitrate;
		}
	};
	self.display = function (bitrate) {
			self.dom.bitrateDivinnerHTML = '<strong>Current Bitrate:</strong> ' +
					bitrate + ' kbits/sec';
		};
	self.displayStats = function() {
		if (self.remoteConnection &&
				self.remoteConnection.iceConnectionState === 'connected') {
			if (!isFirefox) {
				self.remoteConnection.getStats(self.getChromeStats);
			} else {
				self.getFirefoxStats();
			}
		}
	}

}
var fileTransfer;
onDocLoad(function() {
	fileTransfer = new FileTransfer();
});

