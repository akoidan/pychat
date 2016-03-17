window.browserVersion = getBrowserVersion();
navigator.getUserMedia =  navigator.getUserMedia|| navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var USER_REGEX = /^[a-zA-Z-_0-9]{1,16}$/;
var HISTORY_STORAGE_NAME = 'history';
var MAX_STORAGE_LENGTH = 3000;
var blankRegex = /^\s*$/;
var fileTypeRegex = /\.(\w+)(\?.*)?$/;
window.sound = 0;
window.loggingEnabled = true;
var growlHolder;
var ajaxLoader;
var linksRegex = /(https?:&#x2F;&#x2F;.+?(?=\s+|<br>|$))/g; /*http://anycharacter except end of text, <br> or space*/
var replaceLinkPattern = '<a href="$1" target="_blank">$1</a>';
const escapeMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"\n": '<br>',
	"/": '&#x2F;'
};
var replaceHtmlRegex = new RegExp("["+Object.keys(escapeMap).join("")+"]",  "g");

var infoMessages = [
	"Did you know that you could paste multiple lines content by simply pressing shift+Enter?",
	"You can add smileys by clicking on bottom right icon. To close the smile container click outside of it or press escape",
	"You can send direct message to user just by clicking on username in user list or in messages. After his username appears in the left bottom " +
			"corner and your messages become green. To send messages to all you should click on X right by username",
	"You can also comment somebody's message. This will be shown to all users in current channel. Just click on message" +
			"and it's content appears in message text",
	"You have a feature to suggest or you lack some functionality? Click on purple pencil icon on top menu and write your " +
			"suggestion there",
	"Chat uses your browser cache to store messages. If you want to clear history and all cached messages just click " +
	"on red Floppy drive icon on the top menu",
	"You can view userprofile by clicking on icon left by username in user list. To edit your profile you need to register" +
	"and click on light green wrench icon on the top right corner",
	"You can change your randomly generated username by clicking on it on top menu"
];

var $ = function (id) {
	return document.getElementById(id);
};


function onDocLoad(onload) {
	return document.addEventListener("DOMContentLoaded", onload);
}


function encodeHTML(html) {
	return html.replace(replaceHtmlRegex, function (s) {
		return escapeMap[s];
	});
}


function encodeAnchorsHTML(html) {
	//&#x2F;&#x2F; = // (already encoded by encodeHTML above)
    return encodeHTML(html).replace(linksRegex, replaceLinkPattern);
}


window.onerror = function (msg, url, linenumber) {
	var message = getText('Error occured in {}:{}\n{}', url, linenumber, msg);
	console.error(getDebugMessage(message));
	growlError(message);
	return true;
};


var CssUtils = {
	visibilityClass: 'hidden',
	addClass: function (element, className) {
		if (element.className == null) {
			element.className = '';
		}
		if (element.className.indexOf(className) < 0) {
			element.className += " " + className;
		}
	},
	removeClass: function (element, className) {
		if (element.className == null) {
			return;
		}
		element.className = element.className.replace(className, '');
	},
	showElement: function (element) {
		this.removeClass(element, this.visibilityClass)
	},
	hideElement: function (element) {
		this.addClass(element, this.visibilityClass);
	},
	toggleVisibility: function (element) {
		this.toggleClass(element,this.visibilityClass);
	},
	toggleClass: function (element, className) {
		if (element.className == null) {
			element.className = '';
		}
		if (element.className.indexOf(className) > -1) {
			this.removeClass(element, className);
		} else {
			this.addClass(element, className);
		}
	}
};


var Growl = function (message) {
	var self = this;
	self.growlHolder = growlHolder;
	self.message = message;
	self.error = function () {
		self.show(4000, 'col-error')
	};
	self.success = function () {
		self.show(1000, 'col-success')
	};
	self.info = function () {
		self.show(500, 'col-info');
	};
	self.hide = function () {
		self.growl.style.opacity = 0;
		setTimeout(self.remove, 500); // 500 = $(.growl):transition 0.5s
	};
	self.remove = function () {
		if (self.growl.parentNode === self.growlHolder) {
			self.growlHolder.removeChild(self.growl)
		}
	};
	self.show = function (baseTime, growlClass) {
		var timeout = baseTime + self.message.length * 60;
		self.growl = document.createElement('div');
		self.growl.innerHTML = encodeAnchorsHTML(self.message);
		self.growl.className = 'growl ' + growlClass;
		self.growlHolder.appendChild(self.growl);
		self.growl.clientHeight; // request to paint now!
		self.growl.style.opacity += 1;
		self.growl.onclick = self.hide;
		setTimeout(self.hide, timeout);
	};

};


function growlSuccess(message) {
	new Growl(message).success();
}

function growlError(message) {
	new Growl(message).error();
}

function growlInfo(message) {
	new Growl(message).info();
}


// TODO replace with HTML5 if possible
function Draggable(container, header) {
	var self = this;
	self.container = container;
	self.header = header;
	self.attached = true;
	self.eleMouseDown = function (ev) {
		self.leftCorrection =  container.offsetLeft - ev.pageX;
		self.rightCorrection = container.offsetTop - ev.pageY;
		self.maxTop = document.body.clientHeight - container.clientHeight;
		self.maxLeft =  document.body.clientWidth - container.clientWidth;
		document.addEventListener ("mousemove", self.eleMouseMove, false);
	};
	self.eleMouseMove = function (ev) {
		var left = ev.pageX + self.leftCorrection;
		if (left > 0 && left < self.maxLeft) self.container.style.left = left + "px";
		var top = ev.pageY + self.rightCorrection;
		if (top > 0 && top < self.maxTop) self.container.style.top = top + "px";
		if (self.attached) {
			document.addEventListener ("mouseup", self.eleMouseUp, false);
			self.attached = false;
		}
	};
	self.eleMouseUp = function () {
		document.removeEventListener ("mousemove", self.eleMouseMove, false);
		document.removeEventListener ("mouseup", self.eleMouseUp, false);
		self.attached = true;
	};
	self.header.addEventListener ("mousedown", self.eleMouseDown, false);
}


onDocLoad(function () {
	mute();
	ajaxLoader = $("ajaxStatus");
	if (typeof InstallTrigger !== 'undefined') { // browser = firefox
		console.warn(getDebugMessage("Ops, there's no scrollbar for firefox"));
	}
	growlHolder = $('growlHolder');
});


function mute() {

	window.sound = (window.sound + 1) % 4;

	var btn = $("muteBtn");
	switch (window.sound) {
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
	if (element.readyState && window.sound) {
		element.pause();
		element.currentTime = 0;
		switch (window.sound) {
			case 1:
				element.volume = 0.15;
				break;
			case 2:
				element.volume = 0.4;
				break;
			case 3:
				element.volume = 1;
		}
		setTimeout(function () {
			element.play();
		});
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
		if (tem != null) {
			return 'Opera ' + tem[1];
		}
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
	if ((tem = ua.match(/version\/(\d+)/i)) != null) {
		M.splice(1, 1, tem[1]);
	}
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

function ajaxShow() {
	ajaxLoader.className = 'show';
}

function ajaxHide() {
	ajaxLoader.className = '';
}

/**
 * @param params : object dict of params or DOM form
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
	var regexRes = fileTypeRegex.exec(fileUrl);
	var fileType = regexRes != null && regexRes.length === 3 ? regexRes[1] : null;
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
}


function saveLogToStorage(result) {
	if (!window.loggingEnabled) {
		return;
	}
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