var video;
var canvas;
var localMediaStream = null;
var isStopped = true;
var photoRegex = /^\S*\/photo\/\w{8}_.*$/;
var photoImg;
var photoInput;
var userProfileData;
var themeSelector;
var changeProfileForm;
var embeddedYoutubeInput;
var highlightCodeInput;
var logsInput;
var password;
var repeatPassword;
var oldPassword;
var photoSrc = null;

function initChangeProfile() {
	photoImg = $('photoImg');
	video = $('changeProfileVideo');
	canvas = $('canvasBuffer');
	photoInput = $('id_photo');
	userProfileData = $('userProfileData');
	themeSelector = $('id_theme');
	changeProfileForm = $('changeProfileForm');
	embeddedYoutubeInput = $('id_embedded_youtube');
	highlightCodeInput = $('id_highlight_code');
	onlineChangeSoundInput = $('id_online_change_sound');
	incomingFileCallSoundInput = $('id_incoming_file_call_sound');
	messageSoundInput = $('id_message_sound');
	password = $('id_password');
	repeatPassword = $('id_repeat_password');
	oldPassword = $('id_old_password');
	logsInput = $('id_logs');
	video.addEventListener('click', takeSnapshot, false);
	photoImg.addEventListener('drop', dropPhoto, false);
	var events = ["dragenter", "dragstart", "dragend", "dragleave", "dragover", "drag", "drop"];
	for (var i = 0, iLen = events.length; i < iLen; i++) {
		photoImg.addEventListener(events[i], preventDefault, false);
	}
	photoInput.onchange = photoInputChanged;
	if (isDateMissing()) {
		logger.warn("Browser doesn't support html5 input type date, trying to load javascript datepicker")();
		doGet(PICKADAY_CSS_URL);
		doGet(MOMENT_JS_URL, function () {
			// load pikaday only after moment.js
			doGet(PICKADAY_JS_URL, function () {
				var picker = new Pikaday({
					field: $('id_birthday'),
					format: 'YYYY-MM-DD', // DATE_INPUT_FORMATS_JS
					firstDay: 1,
					maxDate: new Date(),
					yearRange: [1930, 2010]
				});
				logger.info("pikaday date picker has been loaded")();
			});
		})
	}
	if (!navigator.getUserMedia) {
		logger.warn('Browser doesnt support capturing video, skipping photo snapshot')();
	}
	CssUtils.hideElement(video);
}

function dropPhoto(e) {
	e.preventDefault();
	var ok = setPhotoFromReader(e.dataTransfer.files[0], 'drop');
	if (ok) {
		photoInput.value = '';
	}
}

function photoInputChanged(e) {
	var ok = setPhotoFromReader(e.target.files[0], 'input');
	if (!ok) {
		photoInput.value = '';
	}
}

function setPhotoFromReader(file, type) {
	if (file && file.type && file.type.match(/image.*/)) {
		var reader = new window.FileReader();
		reader.onload = function (e) {
			photoImg.src = e.target.result;
			growlSuccess("Photo has been rendered, click save to apply it");
		};
		reader.readAsDataURL(file);
		photoSrc = type;
		return true;
	} else {
		growlError("Invalid file type " + file.type);
		return false;
	}
}

function startSharingVideo() {
	var constraints = {video: true};

	function successCallback(localMediaStream) {
		window.stream = localMediaStream; // stream available to console
		video.src = window.URL.createObjectURL(localMediaStream);
		video.play();
	}

	function errorCallback(error) {
		logger.info("navigator.getUserMedia error: {}", error)();
	}

	navigator.getUserMedia(constraints, successCallback, errorCallback);
}


function takeSnapshot() {
	if (localMediaStream) {
		var ctx = canvas.getContext('2d');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0);
		// "image/webp" works in Chrome.
		// Other browsers will fall back to image/png.
		photoImg.src = canvas.toDataURL('image/webp');
		photoSrc = 'canvas';
		photoInput.value = '';
		growlInfo('Image has been set. Click on "Finish" to hide video');
	}
}


function startCapturingVideo(button) {
	if (isStopped) {
		// Not showing vendor prefixes or code that works cross-browser.
		navigator.getUserMedia({video: true}, function (stream) {
			video.src = window.URL.createObjectURL(stream);
			localMediaStream = stream;
			CssUtils.showElement(video);
			photoImg.addEventListener('click', takeSnapshot, false);
			photoImg.style.cursor = 'pointer';
			button.value = 'Finish';
			isStopped = false;
			growlInfo("Click on your video to take a photo")
		}, function (e) {
			logger.error('Error while trying to capture a picture "{}"', e.message || e.name)();
			growlError('Unable to use your webcam because "{}"'.format(e.message || e.name ));
		});
	} else if (!isStopped) {
		if (localMediaStream.stop) {
			localMediaStream.stop();
		} else {
			 localMediaStream.getVideoTracks()[0].stop();
		}
		photoImg.removeEventListener('click', takeSnapshot);
		photoImg.style.cursor = '';
		button.value = 'Renew the photo';
		growlInfo("To apply photo click on save");
		CssUtils.hideElement(video);

		CssUtils.showElement(userProfileData);
		isStopped = true;
	}
}

function preventDefault(e) {
	 e.preventDefault();
}

function setJsState() {
	setTheme(themeSelector.value);
	window.onlineChangeSound = onlineChangeSoundInput.checked;
	window.incomingFileCallSound = incomingFileCallSoundInput.checked;
	window.messageSound = messageSoundInput.checked;
	window.embeddedYoutube = embeddedYoutubeInput.checked; // global var
	window.highlightCode = highlightCodeInput.checked; // global var
		if (window.highlightCode) {
		doGet(HIGHLIGHT_JS_URL, function() {
			Utils.highlightCode(document.body);
		});
	}
	window.loggerFactory.logsEnabled = logsInput.checked;
}

function saveProfile(event) {
	event.preventDefault();
	var image = null;
	var params = null;
	if (password.value.length > 0 && password.value !== repeatPassword.value) {
		growlError("Passwords don't match");
		return;
	}
	if (photoSrc == 'canvas' || photoSrc == 'drop') {
		if (photoSrc == 'canvas') {
			image = canvas.toDataURL("image/png");
		} else if (photoSrc == 'drop') {
			image = photoImg.src;
		}
		params = {base64_image: image};
	}
	ajaxShow();
	doPost('/profile', params, function (response) {
		if (response.match(photoRegex)) {
			photoImg.onload = ajaxHide;
			photoImg.onerror = ajaxHide;
			if (typeof photoImg.onload !== 'function' || typeof photoImg.onerror !== 'function' ) {
				ajaxHide();
			}
			photoImg.src = response;
			snapshot = false;
			response = RESPONSE_SUCCESS;
		} else {
			ajaxHide();
		}
		if (response === RESPONSE_SUCCESS) {
			oldPassword.value = "";
			password.value = "";
			repeatPassword.value = "";
			growlSuccess("Your profile has been successfully updated. Press home icon to return on main page");
			setJsState();
		} else {
			growlError(response);
		}
	}, new FormData(changeProfileForm));
}


/** Checks whether browser supports html5 input type date */
function isDateMissing() {
	var input = document.createElement('input');
	input.setAttribute('type', 'date');
	var notADateValue = 'not-a-date';
	input.setAttribute('value', notADateValue);
	return input.value === notADateValue;
}
