const browserVersion = getBrowserVersion();

var sound = 0;
var USER_REGEX = /^[a-zA-Z-_0-9]{1,16}$/;
var HISTORY_STORAGE_NAME = 'history';
var MAX_STORAGE_LENGTH = 3000;
var blankRegex = /^\s*$/;
var loggingEnabled = true;

var growlHolder;

var infoMessages = [
	"Did you know that you could paste multiple lines content by simply pressing shift+Enter?",
	"You can add smileys by clicking on bottom right icon. To close the smile container click outside of it or press escape",
	"You can send direct message to user just by clicking on username in user list or in messages. After his username appears in the left bottom " +
			"corner and your messages become green. To send messages to all you should click on X right by username",
	"You can also comment somebody's message. This will be shown to all users in current channel. Just click on message" +
			"and it's content appears in message text",
	"You have a feature to suggest or you lack some functionality? Click on purple pencil icon on top menu and write your " +
			"suggestion there",
	"If snowing bothers you or it eats your cpu, you can disable it by pressing on white cloud icon on top menu.",
	"Chat uses your browser cache to store messages. If you want to clear history and all cached messages just click " +
	"on red Floppy drive icon on the top menu",
	"You can view userprofile by clicking on icon left by username in user list. To edit your profile you need to register" +
	"and click on light green wrench icon on the top right corner",
	"You can change your randomly generated username by clicking on it on top menu"
];

var $ = function(id) {
	return document.getElementById(id);
};


function onDocLoad(onload) {
	return document.addEventListener("DOMContentLoaded", onload);
}


onDocLoad(function () {
	growlHolder = $('growlHolder');
	mute();
	if (typeof InstallTrigger !== 'undefined') {
		console.warn(getDebugMessage("Ops, there's no scrollbar for firefox"));
	}
});


function growlError(message) {
	growlShow(message, 'col-error')
}

function growlSuccess(message) {
	growlShow(message, 'col-success')
}

function growlInfo(message) {
	growlShow(message, 'col-info');
}


function growlShow(message, growlClass) {
	var timeout = 3000 + message.length * 70;
	if (false) {
		var allGrowls = document.getElementsByClassName('growl');
		for (var i=0; i< allGrowls.length; i++) {
			growlHolder.removeChild(allGrowls[i]);
		}
	}
	var growl = document.createElement('div');
	growl.textContent = message;
	growl.className= 'growl '+ growlClass;
	growl.onclick = function(event) {
		growlHolder.removeChild(event.target);
	};
	growlHolder.appendChild(growl);
	growl.clientHeight; // request to paint now!
	growl.style.opacity += 1;
	setTimeout(function(){
		growl.style.opacity = 0;
		setTimeout(function () {
			if (growl.parentNode === growlHolder) {
				growlHolder.removeChild(growl)
			}
		}, 500); // 500 = $(.growl):transition 0.5s
	}, timeout);
}


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
		if (element.currentTime === element.duration ){
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
		if (cookie[0] === '"' && cookie[length] === '"') {
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
		if (r.readyState === 4) {
			if (r.status === 200) {
				console.log(getDebugMessage("POST {} in: {};", url, r.response));
			} else {
				console.error(getDebugMessage("POST {} in: {}, status:", url, r.response, r.status));
			}
			if (typeof(callback) === "function") {
				callback(r.response);
			} else {
				console.warn(getDebugMessage("Skipping {} callback for POST {}", callback, url));
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
	if (url === "") {
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
			default:
				var xobj = new XMLHttpRequest();
				// special for IE 
				if (xobj.overrideMimeType) {
					xobj.overrideMimeType("application/json");
				}
				xobj.open('GET', fileUrl, true); // Replace 'my_data' with the path to your file
				xobj.onreadystatechange = function () {
					if (xobj.readyState === 4 && xobj.status === 200) {
						if (callback) {
							callback(xobj.responseText);
						}
					}
				};
				xobj.send(null);
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
	if (!loggingEnabled) return;
	var storageInfo = localStorage.getItem(HISTORY_STORAGE_NAME);
	var newStorage;
	if (storageInfo == null) {
		newStorage = result;
	} else if (storageInfo.length > MAX_STORAGE_LENGTH) {
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


function getText() {
	for (var i = 1; i < arguments.length; i++) {
		arguments[0] = arguments[0].replace('{}', arguments[i]);
	}
	return arguments[0]
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
	var text = getText.apply(this, arguments);
	var time = [now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()].join(':');
	var result = time + ': ' + text;
	saveLogToStorage(result);
	return result;
}


/** in 23 - out 23
 *  */
function sliceZero(number) {
	return String("0" + number).slice(-2);
}