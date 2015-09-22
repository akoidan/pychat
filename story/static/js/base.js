var sound = 0;
var USER_REGEX = /^[a-zA-Z-_0-9]{1,16}$/;
var HISTORY_STORAGE_NAME = 'history';
var MAX_STORAGE_LENGTH = 3000;

var $ = function(id) {
	return document.getElementById(id);
};

var demoApp = angular.module('chat', []);

function onDocLoad(onload) {
	return document.addEventListener("DOMContentLoaded", onload);
}


onDocLoad(function () {
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
	var btn = $("muteBtn");
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
	if (!element.readyState) {
		element.load();
	}
	if (element.readyState && sound) {
		element.pause();
		element.currentTime = 0;
		if (element.currentTime === element.duration ) {
			// TODO currentType is not set sometimes
			var params = {
				browser : getBrowserVersion(),
				issue : "html5 audio currentTime"
			};
			doPost('/report_issue', params, null, null);
			console.warn(getDebugMessage("Can't set current time for audio on browser {}. Reloading it"), getBrowserVersion());
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


function getBrowserVersion() {
	var ua = navigator.userAgent, tem,
		M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if (/trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		return 'IE ' + (tem[1] || '');
	}
	if (M[1] === 'Chrome') {
		tem = ua.match(/\bOPR\/(\d+)/);
		if (tem != null) return 'Opera ' + tem[1];
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
	if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
	return M.join(' ');
}


function readCookie(name, c, C, i) {
	c = document.cookie.split('; ');
	var cookies = {};
	for (i = c.length - 1; i >= 0; i--) {
		C = c[i].split('=');
		cookies[C[0]] = C[1];
	}
	var cookie = cookies[name];
	if (cookie != null) {
		var length = cookie.length - 1;
		// if cookie is wrapped with quotes (for ex api)
		if (cookie[0] == '"' && cookie[length] == '"') {
			cookie = cookie.substring(1, length);
		}
	}
	return cookie;
}

/**
 * @param params : map dict of params or DOM form
 * @param callback : function calls on response
 * @param url : string url to post
 * @param form : form in canse form is used
 * */
function doPost(url, params, callback, form) {
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
	var data;
	if (form != null) {
		data = new FormData(form);
	} else {
		data = new FormData();
	}
	if (params) {
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				data.append(key, params[key]);
			}
		}
	}
	if (url == "") { 
		url = window.location.href ; // f*cking IE
	}
	r.open("POST", url, true);
	r.setRequestHeader("X-CSRFToken", readCookie("csrftoken"));
	console.log(getDebugMessage("POST {} out: {}", url, params));
	r.send(data);
}


/**
 * Loads file from server on runtime */
function doGet(fileUrl, callback) {
	// TODO load doesn't work in IE for pikaday
	var fileTypeRegex = /\w+$/;
	var typeRegRes = fileTypeRegex.exec(fileUrl);
	if (typeRegRes != null) {
		var fileType = typeRegRes[0];
		var fileRef = null;
		switch (fileType) {
			case 'js':
				fileRef = document.createElement('script');
				fileRef.setAttribute("type", "text/javascript");
				fileRef.setAttribute("src", fileUrl);
				break;
			case 'css':
				fileRef = document.createElement("link");
				fileRef.setAttribute("rel", "stylesheet");
				fileRef.setAttribute("type", "text/css");
				fileRef.setAttribute("href", fileUrl);
				break;
			case 'json':
				var xobj = new XMLHttpRequest();
				// special for IE 
				if (xobj.overrideMimeType) {
					xobj.overrideMimeType("application/json");
				}
				xobj.open('GET', fileUrl, true); // Replace 'my_data' with the path to your file
				xobj.onreadystatechange = function () {
					if (xobj.readyState == 4 && xobj.status == "200") {
						if (callback) {
							callback(xobj.responseText);
						}
					}
				};
				xobj.send(null);
				break;
			default:
				console.error(getDebugMessage('Unknown type of style {}', fileType))
		}
		if (fileRef) {
			document.getElementsByTagName("head")[0].appendChild(fileRef);
			fileRef.onload = callback;
		}
	} else {
		console.error(getDebugMessage('File type regex failed for filename "{}"', fileUrl));
	}
}


function saveLogToStorage(result) {
	var storageInfo = localStorage.getItem(HISTORY_STORAGE_NAME);
	var newStorage;
	if (storageInfo == null) {
		newStorage = result;
	} else if (localStorage.length > MAX_STORAGE_LENGTH) {
		var notConcatInfo = storageInfo +';;;'+ result;
		newStorage = notConcatInfo.substr(notConcatInfo.length - MAX_STORAGE_LENGTH, notConcatInfo.length);
	} else {
		newStorage = storageInfo + ';;;' + result;
	}
	localStorage.setItem(HISTORY_STORAGE_NAME, newStorage);
}


function hideElement(element, className) {
	if (className == null) {
		className = 'hidden';
	}
	if (element.className == null) {
		element.className = '';
	}
	if (element.className.indexOf(className) < 0) {
		element.className += " " + className;
	}
}


function showElement(element, className) {
	if (className == null) {
		className = 'hidden';
	}
	if (element.className == null) {
		return;
	}
	element.className = element.className.replace(className, '');
}


function toogleVisibility(element) {
	if (element.className == null) {
		element.className = '';
	}
	if (element.className.indexOf('hidden') > -1) {
		showElement(element);
	} else {
		hideElement(element)
	}
}


/**
 *
 * Formats message for debug,
 * Usage getDebugMessage("{} is {}", 'war', 'bad');
 * @returns: "15:9:31:839: war is bad"
 *  */
function getDebugMessage() {
	var now = new Date();
	// first argument is format, others are params
	for (var i = 1; i < arguments.length; i++) {
		arguments[0] = arguments[0].replace('{}', arguments[i]);
	}
	var time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()].join(':');
	var result = time + ': ' + arguments[0];
	saveLogToStorage(result);
	return result;
}
