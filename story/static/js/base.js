var sound = 0;
var userRegex = /^[a-zA-Z-_0-9]{1,16}$/;

document.addEventListener("DOMContentLoaded", function () {
	mute();
	if (typeof InstallTrigger !== 'undefined') {
		console.warn(getDebugMessage("Ops, there's no scrollbar for firefox"));
	}
});


function mute() {
	if (sound < 3) {
		sound ++;
	} else {
		sound = 0
	}
	var btn = document.getElementById("muteBtn");
	switch (sound) {
		case 0:
			btn.className = 'icon-volume-off';
			break;
		case 1:
			btn.className = 'icon-volume-1';
			break;
		case 2:
			btn.className = 'icon-volume-2';
			break;
		case 3:
			btn.className = 'icon-volume-3';
			break;
	}
}

function checkAndPlay(element) {
	if (element.readyState && sound) {
		element.pause();
		element.currentTime = 0;
		if (element.currentTime === element.duration ){
			// TODO currentType is not set sometimes
			console.warn("Can't set current time for audio. Reloading it");
			//element.src = element.src;
		}
		switch (sound) {
			case 1:
				element.volume = 0.15;
				break;
			case 2:
				element.volume = 0.4;
				break;
			case 3:
				element.volume = 1;
		}
		element.play();
	}
}


function readCookie(name, c, C, i) {
	c = document.cookie.split('; ');
	var cookies = {};
	for (i = c.length - 1; i >= 0; i--) {
		C = c[i].split('=');
		cookies[C[0]] = C[1];
	}
	var cookie = cookies[name];
	var length = cookie.length -1;
	// if cookie is wrapped with quotes (for ex api)
	if (cookie[0] == '"' && cookie[length] == '"') {
		cookie = cookie.substring(1, length);
	}
	return cookie;
}


function doPost(url, params, callback) {
	var r = new XMLHttpRequest();
	r.onreadystatechange = function () {
		if (r.readyState == 4) {
			if (r.status == 200) {
				console.log(getDebugMessage("POST {} in: {};", url, r.response));
				if (typeof(callback) == "function") {
					callback(r.response);
				} else {
					console.warn(getDebugMessage("Skipping {} callback for POST {}", callback, url));
				}
			} else {
				console.error(getDebugMessage("POST {} in: {}, status:", url, r.response, r.status));
			}
		}
	};
	var data = new FormData();
	for (var key in params) {
		if (params.hasOwnProperty(key)) {
			data.append(key, params[key]);
		}
	}
	r.open("POST", url, true);
	r.setRequestHeader("X-CSRFToken", readCookie("csrftoken"));
	console.log(getDebugMessage("POST {} out: {}", url, JSON.stringify(params)));
	r.send(data);
}


/** Formats message for debug,
 * Usage getDebugMessage("{} is {}", 'war', 'bad');
 * out: war is bad
 *  */
function getDebugMessage() {
	var now = new Date();
	// first argument is format, others are params
	for (var i = 1; i < arguments.length; i++) {
		arguments[0] = arguments[0].replace('{}', arguments[i]);
	}
	var time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()].join(':');
	return time + ': ' + arguments[0];
}


// PROFILE.JS

function loadjscssfile(filename, filetype, callback) {
	// TODO load doesn't work in IE for pikaday
	var fileref = null;
	if (filetype == "js") { //if filename is a external JavaScript file
		fileref = document.createElement('script');
		fileref.setAttribute("type", "text/javascript");
		fileref.setAttribute("src", filename)
	}
	else if (filetype == "css") { //if filename is an external CSS file
		fileref = document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", filename)
	}
	if (typeof fileref != "undefined") {
		document.getElementsByTagName("head")[0].appendChild(fileref)
		fileref.onload = callback;
	}
}

function isDateMissing() {
	var input = document.createElement('input');
	input.setAttribute('type', 'date');

	var notADateValue = 'not-a-date';
	input.setAttribute('value', notADateValue);

	return input.value === notADateValue;
}
