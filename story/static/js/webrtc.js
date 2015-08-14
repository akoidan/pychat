var video;
var canvas;
var localMediaStream = null;

document.addEventListener("DOMContentLoaded", function () {
	video = document.querySelector('video');
	canvas = document.querySelector('canvas');
});

function hasGetUserMedia() {
	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia || navigator.msGetUserMedia);
}


function takeSnapshot() {
	if (localMediaStream) {
		var ctx = canvas.getContext('2d');
		var w = video.videoWidth;
		var h = video.videoHeight;
		canvas.width = w;
		canvas.height = h;
		ctx.drawImage(video, 0, 0, w, h);
		// "image/webp" works in Chrome.
		// Other browsers will fall back to image/png.
		document.querySelector('img').src = canvas.toDataURL('image/webp');
	}
}
function startCapturingVideo(button) {

	if (!localMediaStream) {
		// Not showing vendor prefixes or code that works cross-browser.
		navigator.webkitGetUserMedia({video: true}, function (stream) {
			video.src = window.URL.createObjectURL(stream);
			localMediaStream = stream;
		}, function (e) {
			console.error(getDebugMessage('Error while trying to capture a picture {}', e));
		});
		video.style.display = 'block';
		video.addEventListener('click', takeSnapshot, false);
	}

	if (localMediaStream && !localMediaStream.ended) {
		localMediaStream.stop();
		button.value = 'Start streaming';
		video.style.display = 'none';
	} else {
		if (localMediaStream) {
			alert('cant start again TODO')
		}
		button.value = 'Stop streaming';
	}

}