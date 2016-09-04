String.prototype.format = function() {
	var res = this;
	for (var i = 0; i < arguments.length; i++) {
		res = res.replace('{}', arguments[i]);
	}
	return res;
};

window.onerror = function (msg, url, linenumber) {
	var message = 'Error occurred in {}:{}\n{}'.format(url, linenumber, msg);
	if (growlHolder) {
		growlError(message);
	} else {
		alert(message);
	}
	return false;
};


String.prototype.formatPos = function () {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function (match, number) {
		return typeof args[number] != 'undefined' ? args[number] : match;
	});
};

navigator.getUserMedia =  navigator.getUserMedia|| navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
var USER_REGEX = /^[a-zA-Z-_0-9]{1,16}$/;
var historyStorage;
var MAX_STORAGE_LENGTH = 3000;
var blankRegex = /^\s*$/;
var fileTypeRegex = /\.(\w+)(\?.*)?$/;
window.sound = 0;
window.loggingEnabled = true;
var growlHolder;
var ajaxLoader;
var linksRegex = /(https?:&#x2F;&#x2F;.+?(?=\s+|<br>|&quot;|&#39;|$))/g;/*http://anycharacter except end of text, <br> or space*/
var replaceLinkPattern = '<a href="$1" target="_blank">$1</a>';
var muteBtn;
var inputRangeStyles = {};

function dummyFun() {}

consoleReal = console;
consoleDummy = {
	log: dummyFun,
	error: dummyFun,
	warn: dummyFun
};

function enableLogs() {
	if (!window.LOGS) {
		console = consoleDummy;
	} else {
		console = consoleReal;
	}
}

enableLogs();

const escapeMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"\n": '<br>',
	"/": '&#x2F;'
};
var volumeProportion = {
	0: 0,
	1: 0.15,
	2: 0.4,
	3: 1
};
var volumeIcons = {
	0: 'icon-volume-off',
	1: 'icon-volume-1',
	2: 'icon-volume-2',
	3: 'icon-volume-3'
};
var replaceHtmlRegex = new RegExp("["+Object.keys(escapeMap).join("")+"]",  "g");

var $ = function (id) {
	return document.getElementById(id);
};


window.browserVersion = (function () {
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
})();

var isFirefox = window.browserVersion.indexOf('Firefox') >= 0;
var isChrome = window.browserVersion.indexOf('Chrome') >= 0;
var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
if (isFirefox) {
	RTCSessionDescription = mozRTCSessionDescription;
	RTCIceCandidate = mozRTCIceCandidate;
}

function getUrlParam(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	// TODO encode "#" ? like new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
	var regex = new RegExp("[?&]" + name + "(=([^&]*)|&|$)", "i"),
			results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function setUrlParam(name, value) {
	var prevValue = getUrlParam(name);
	var url = window.location.href;
	var text;
	if (prevValue == null) {
		var textToFormat = url.indexOf("?") >= 0 ? "{}&{}={}" : "{}?{}={}";
		text = textToFormat.format(url, name, value);
	} else {
		text = url.replace(name + "=" + prevValue, name + "=" + value);
	}
	window.history.pushState('page2', 'Title', text);
}

function onDocLoad(onload) {
	return document.addEventListener("DOMContentLoaded", onload);
}


function encodeHTML(html) {
	return html.replace(replaceHtmlRegex, function (s) {
		return escapeMap[s];
	});
}


function bytesToSize(bytes) {
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 Byte';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}


function encodeAnchorsHTML(html) {
	//&#x2F;&#x2F; = // (already encoded by encodeHTML above)
    return encodeHTML(html).replace(linksRegex, replaceLinkPattern);
}


var CssUtils = {
	visibilityClass: 'hidden',
	hasClass: function(element, className){
		return element.className != null && element.className.indexOf(className) >= 0;
	},
	addClass: function (element, className) {
		if (!CssUtils.hasClass(element, className)) {
			var oldClassName = element.className;
			element.className = "{} {}".format(oldClassName.trim(), className);
		}
	},
	deleteElement: function(target) {
		target.parentNode.removeChild(target)
	},
	setOnOf: function(element, desiredClass, removeClasses) {
		var className = element.className;
		if (className == null) {
			element.className = desiredClass;
		} else {
			var replaceReg = new RegExp("(" + removeClasses.join("|") + ")", "g");
			className = className.replace(replaceReg, '');
			element.className = className + " " + desiredClass;
		}
	},
	isHidden: function(element) {
		return CssUtils.hasClass(element, CssUtils.visibilityClass);
	},
	removeClass: function (element, className) {
		if (CssUtils.hasClass(element, className)) {
			element.className = element.className.replace(className, '');
		}
	},
	showElement: function (element) {
		CssUtils.removeClass(element, CssUtils.visibilityClass)
	},
	hideElement: function (element) {
		CssUtils.addClass(element, CssUtils.visibilityClass);
	},
	toggleVisibility: function (element) {
		return CssUtils.toggleClass(element,CssUtils.visibilityClass);
	},
	setVisibility: function(element, isVisible){
		if (isVisible) {
			CssUtils.removeClass(element, CssUtils.visibilityClass);
		} else {
			CssUtils.addClass(element, CssUtils.visibilityClass);
		}
	},
	toggleClass: function (element, className) {
		if (CssUtils.hasClass(element, className)) {
			CssUtils.removeClass(element, className);
			return false;
		} else {
			CssUtils.addClass(element, className);
			return true;
		}
	}
};


var Growl = function (message) {
	var self = this;
	self.growlHolder = growlHolder;
	self.message = message.trim();
	self.error = function () {
		self.show(4000, 'col-error')
	};
	self.success = function () {
		self.show(3000, 'col-success')
	};
	self.info = function () {
		self.show(3000, 'col-info');
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
	self.showInfinity = function(growlClass) {
		self.growl = document.createElement('div');
		self.growl.innerHTML = self.message.indexOf("<") == 0? self.message : encodeAnchorsHTML(self.message);
		self.growl.className = 'growl ' + growlClass;
		self.growlHolder.appendChild(self.growl);
		self.growl.clientHeight; // request to paint now!
		self.growl.style.opacity++;
	};
	self.show = function (baseTime, growlClass) {
		self.showInfinity(growlClass);
		if (baseTime) {
			var timeout = baseTime + self.message.length * 50;
			self.growl.onclick = self.hide;
			setTimeout(self.hide, timeout);
		}
	};

};
function getCallerTrace() {
	try {
		throw Error('')
	} catch (err) {
		var trace = err.stack.split("\n");
		var caller_line = trace[4];
		if (caller_line) {
			var index = caller_line.indexOf("at ");
			return caller_line.slice(index + 2, caller_line.length);
		}
	}
}

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
function Draggable(container, headerText) {
	var self = this;
	self.UNACTIVE_CLASS = 'blurred';
	self.MOVING_CLASS = 'moving';
	self.dom = {
		container:  container
	};
	self.headerText = headerText;
	self.init = function () {
		CssUtils.addClass(self.dom.container, "modal-body");
		CssUtils.addClass(self.dom.container, "modal-draggable");
		self.dom.header = document.createElement('DIV');
		self.dom.header.className = 'windowHeader noSelection';
		self.dom.header.addEventListener ("mousedown", self.eleMouseDown, false);
		self.dom.headerText = document.createElement('span');
		self.dom.header.appendChild(self.dom.headerText);
		self.dom.headerText.style = 'display: inline-block';
		self.setHeaderText(self.headerText);
		var iconCancel = document.createElement('i');
		self.dom.header.appendChild(iconCancel);
		iconCancel.onclick = self.hide;
		iconCancel.className = 'icon-cancel';
		self.dom.body = self.dom.container.children[0];
		CssUtils.addClass(self.dom.body, 'window-body');
		self.dom.container.insertBefore(self.dom.header, self.dom.body);
		self.dom.container.addEventListener('focus', self.onfocus);
		self.dom.container.addEventListener('blur', self.onfocusout);
		self.dom.container.setAttribute('tabindex', "-1");
		var inputs = document.querySelectorAll('#{} input'.format(container.id));
		// typeOf(inputs) = HTMLCollection, not an array. that doesn't have forEach
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].addEventListener('focus', function () {
				CssUtils.addClass(self.dom.container, self.UNACTIVE_CLASS);
			});
			inputs[i].addEventListener('blur', function () {
				CssUtils.removeClass(self.dom.container, self.UNACTIVE_CLASS);
			});
		}
	};
	self.hide = function () {
		CssUtils.hideElement(self.dom.container);
	};
	self.setHeaderText = function (text) {
		self.dom.headerText.innerHTML = text;
	};
	self.show = function () {
		CssUtils.showElement(self.dom.container);
	};
	self.eleMouseDown = function (ev) {
		if (ev.target.tagName == 'I') {
			return; // if close icon was clicked
		}
		CssUtils.addClass(self.dom.container, self.MOVING_CLASS);
		self.leftCorrection =  self.dom.container.offsetLeft - ev.pageX;
		self.topCorrection = self.dom.container.offsetTop - ev.pageY;
		self.maxTop = document.body.clientHeight - self.dom.container.clientHeight - 7;
		self.maxLeft =  document.body.clientWidth - self.dom.container.clientWidth - 3;
		document.addEventListener ("mousemove", self.eleMouseMove, false);
		document.addEventListener ("mouseup", self.eleMouseUp, false);
	};
	self.eleMouseMove = function (ev) {
		var left = ev.pageX + self.leftCorrection;
		if (left < 0) {
			left = 0;
		} else if (left > self.maxLeft) {
			left = self.maxLeft;
		}
		self.dom.container.style.left = left + "px";
		var top = ev.pageY + self.topCorrection;
		if (top < 0) {
			top = 0;
		} else if (top > self.maxTop) {
			top = self.maxTop;
		}
		self.dom.container.style.top = top + "px";
	};
	self.eleMouseUp = function () {
		CssUtils.removeClass(self.dom.container, self.MOVING_CLASS);
		document.removeEventListener ("mousemove", self.eleMouseMove, false);
		document.removeEventListener ("mouseup", self.eleMouseUp, false);
	};
	self.super = {
		show: self.show
	};
	self.init();
}


onDocLoad(function () {
	muteBtn = $("muteBtn");
	var sound = localStorage.getItem('sound');
	if (sound == null) {
		window.sound = 0;
	} else {
		window.sound = sound - 1;
	}
	mute();
	var theme = localStorage.getItem('theme');
	if (theme != null) {
		document.body.className = theme;
	}
	ajaxLoader = $("ajaxStatus");
	if (typeof InstallTrigger !== 'undefined') { // browser = firefox
		console.warn(getDebugMessage("Ops, there's no scrollbar for firefox"));
	}
	growlHolder = $('growlHolder');
	initInputRangeTrack();

});
function fixInputRangeStyle() {
	var id = this.getAttribute('id');
	var el = inputRangeStyles[id];
	el.style.textContent =
			'#{}::-webkit-slider-runnable-track {background-size: {}% 100%, 100% 100%; }'
					.format(id, Math.round((this.value - el.minValue) / (el.diff) * 100));
}

function initInputRangeTrack() {
	var inputRanges = document.querySelectorAll('input[type=range]');
	for (var i = 0; i < inputRanges.length; i++){
		var id = inputRanges[i].getAttribute('id');
		inputRanges[i].addEventListener('input', fixInputRangeStyle);
		var minValue = inputRanges[i].getAttribute('min') || 0;
		var maxValue = inputRanges[i].getAttribute('max') || 100;
		inputRangeStyles[id] = {
			style: document.createElement('style'),
			diff: maxValue - minValue,
			minValue: minValue
		};
		document.head.appendChild(inputRangeStyles[id].style);
	}
}

function mute() {
	window.sound = (window.sound + 1) % 4;
	localStorage.sound = window.sound;
	if (muteBtn) muteBtn.className = volumeIcons[window.sound];
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
				console.log(getDebugMessage("POST in: {} ::: {};", url, r.response));
			} else {
				console.error(getDebugMessage("POST in: {} ::: {}, status:", url, r.response, r.status));
			}
			if (typeof(callback) === "function") {
				callback(r.response);
			} else {
				console.warn(getDebugMessage("Skipping {} callback for POST {}", callback, url));
			}
		}
	};
	/*Firefox doesn't accept null*/
	var data = form == null ? new FormData() : new FormData(form);

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
	console.log(getDebugMessage("POST out: {} ::: {}", url, params));
	r.send(data);
}


/**
 * Loads file from server on runtime */
function doGet(fileUrl, callback) {
	console.log(getDebugMessage("GET out: {}", fileUrl));
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
				if (xobj.readyState === 4) {
					if (xobj.status === 200) {
						console.log(getDebugMessage('GET in: {} ::: "{}"...', fileUrl, xobj.responseText.substr(0, 100)));
						if (callback) {
							callback(xobj.responseText);
						}
					} else {
						console.error(getDebugMessage("Unable to load {}, response code is '{}', response: {}", fileUrl, xobj.status, xobj.response ));
						growlError("<span>Unable to load {}, response code is <b>{}</b>, response: {} <span>".format(fileUrl, xobj.status, xobj.response));
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
	if (historyStorage == null) {
		historyStorage = result;
	} else if (historyStorage.length > MAX_STORAGE_LENGTH) {
		var notConcatInfo = historyStorage +';;;'+ result;
		historyStorage = notConcatInfo.substr(notConcatInfo.length - MAX_STORAGE_LENGTH, notConcatInfo.length);
	} else {
		historyStorage = historyStorage + ';;;' + result;
	}
}



/** in 23 - out 23
 *  */
function sliceZero(number, count) {
	return String("00" + number).slice(count || -2);
}


/**
 *
 * Formats message for debug,
 * Usage getDebugMessage("{} is {}", 'war', 'bad');
 * @returns: "15:09:31:009: war is bad"
 *  */
function getDebugMessage() {
	if (!window.LOGS) return;
	var now = new Date();
	// first argument is format, others are params
	var text;
	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		text = String.prototype.format.apply(arguments[0], args);
	} else {
		text = arguments[0];
	}
	var result = "{}:{}:{}.{}: {}".format(
			sliceZero(now.getHours()),
			sliceZero(now.getMinutes()),
			sliceZero(now.getSeconds()),
			sliceZero(now.getMilliseconds(), -3),
			text
	);
	saveLogToStorage(result);
	return result;
}
