var video;
var canvas;
var localMediaStream = null;
var snapshot = false;
var isStopped = true;

onDocLoad(function () {
	if (isDateMissing()) {
		console.warn(getDebugMessage("Browser doesn't support html5 input type date, trying to load javascript datepicker"));
		loadJsCssFile("/static/css/pikaday.css");
		loadJsCssFile("/static/js/moment.js", function () {
			// load pikaday only after moment.js
			loadJsCssFile("/static/js/pikaday.js", function () {
				var picker = new Pikaday({
					field: $('id_birthday'),
					format: 'YYYY-MM-DD', // DATE_INPUT_FORMATS_JS
					firstDay: 1,
					maxDate: new Date(),
					yearRange: [1930, 2010]
				});
				console.log(getDebugMessage("pikaday date picker has been loaded"));
			});
		})
	}

	navigator.getUserMedia =  navigator.getUserMedia|| navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	if (!navigator.getUserMedia) {
		console.warn(getDebugMessage('Browser doesnt support capturing video, skipping photo snapshot'));

	}
	video = document.querySelector('video');
	canvas = document.querySelector('canvas');

});



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
			$('userProfileData').style.display = 'none';
			button.value = 'Hide video';
			isStopped = false;
		}, function (e) {
			console.error(getDebugMessage('Error while trying to capture a picture {}', e));
		});
	}

	if (!isStopped) {
		localMediaStream.stop();
		button.value = 'Renew the photo';
		video.style.display = 'none';
		$('userProfileData').style.display = 'block';
		isStopped = true;
	}

}

function saveProfile() {
	var form = document.querySelector('form');
	var image = null;
	var params = null;
	if (snapshot) {
		image = canvas.toDataURL("image/png");
		params = {base64_image: image};
	}
	doPost('/save_profile', params, alert, form);
}


/**
 * Loads file from server on runtime */
function loadJsCssFile(filename, callback) {
	// TODO load doesn't work in IE for pikaday
	var fileTypeRegex = /\w+$/;
	var typeRegRes = fileTypeRegex.exec(filename);
	if (typeRegRes != null) {
		var fileType = typeRegRes[0];
		var fileRef = null;
		switch (fileType) {
			case 'js':
				fileRef = document.createElement('script');
				fileRef.setAttribute("type", "text/javascript");
				fileRef.setAttribute("src", filename);
				break;
			case 'css':
				fileRef = document.createElement("link");
				fileRef.setAttribute("rel", "stylesheet");
				fileRef.setAttribute("type", "text/css");
				fileRef.setAttribute("href", filename);
				break;
			default:
				console.error(getDebugMessage('Unknown type of style {}', fileType))
		}
		if (typeof fileRef != "undefined") {
			document.getElementsByTagName("head")[0].appendChild(fileRef);
			fileRef.onload = callback;
		}
	} else {
		console.error(getDebugMessage('File type regex failed for filename "{}"', filename));
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
