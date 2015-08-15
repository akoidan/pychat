var video;
var canvas;
var localMediaStream = null;
var snapshot = false;
var isStopped = true;

document.addEventListener("DOMContentLoaded", function () {
	if (isDateMissing()) {
		console.warn(getDebugMessage("Browser doesn't support html5 input type date, trying to load javascript datepicker"));
		loadJsCssFile("/static/css/pikaday.css");
		loadJsCssFile("/static/js/moment.js", function () {
			// load pikaday only after moment.js
			loadJsCssFile("/static/js/pikaday.js", function () {
				var picker = new Pikaday({
					field: document.getElementById('id_birthday'),
					format: 'YYYY-MM-DD', // DATE_INPUT_FORMATS_JS
					firstDay: 1,
					maxDate: new Date(),
					yearRange: [1930, 2010]
				});
				console.log(getDebugMessage("pikaday date picker has been loaded"));
			});
		})
	}

	if (!hasGetUserMedia()) {
		console.warn(getDebugMessage('Browser doesnt support capturing video, skipping photo snapshot'));

	}
	video = document.querySelector('video');
	canvas = document.querySelector('canvas');
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
});

function hasGetUserMedia() {
	return !!(navigator.getUserMedia || navigator.getUserMedia ||
	navigator.mozGetUserMedia || navigator.msGetUserMedia);
}


function takeSnapshot() {
	if (localMediaStream) {
		var ctx = canvas.getContext('2d');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0);
		// "image/webp" works in Chrome.
		// Other browsers will fall back to image/png.
		document.querySelector('img').src = canvas.toDataURL('image/webp');
		snapshot = true;
	}
}
function startCapturingVideo(button) {

	if (isStopped) {
		// Not showing vendor prefixes or code that works cross-browser.
		navigator.getUserMedia({video: true}, function (stream) {
			video.src = window.URL.createObjectURL(stream);
			localMediaStream = stream;
			video.style.display = 'block';
			video.addEventListener('click', takeSnapshot, false);
			document.getElementById('userProfileData').style.display = 'none';
			button.value = 'Hide video';
			isStopped = false;
		}, function (e) {
			console.error(getDebugMessage('Error while trying to capture a picture {}', e));
		});
	}

	if (!isStopped) {
		localMediaStream.stop();
		button.value = 'Start streaming';
		video.style.display = 'none';
		document.getElementById('userProfileData').style.display = 'block';
		isStopped = true;
	}

}

function saveProfile() {
	var form = document.querySelector('form');
	image = null;
	if (snapshot) {
		var image = canvas.toDataURL("image/png");
	}
	doPost('/save_profile', form, alert, image);
}


/**
 * Loads file from server on runtime */
function loadJsCssFile(filename, callback) {
	// TODO load doesn't work in IE for pikaday

	var fileTypeRegex = /\w+$/;
	var typeRegRes = fileTypeRegex.exec(filename);
	var filetype = null;
	if (typeRegRes != null) {
		filetype = typeRegRes[0];
	} else {
		console.error(getDebugMessage('File type regex failed for filename "{}"', filename));
	}
	switch (filetype) {
		case 'js':
			fileref = document.createElement('script');
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("src", filename);
			break;
		case 'css':
			fileref = document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", filename);
			break;
		default:
			console.error(getDebugMessage('Unknown type of style {}', filetype))
	}
	if (typeof fileref != "undefined") {
		document.getElementsByTagName("head")[0].appendChild(fileref);
		fileref.onload = callback;
	}
}

/** Check whether browser supports html5 input type date */
function isDateMissing() {
	var input = document.createElement('input');
	input.setAttribute('type', 'date');
	var notADateValue = 'not-a-date';
	input.setAttribute('value', notADateValue);
	return input.value === notADateValue;
}
