String.prototype.format = function() {
	var args = arguments,  replacement = 0;
 	return this.replace(/\{\}/g, function() {
		return args[replacement++];
	});
};

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function (searchString, position) {
		position = position || 0;
		return this.substr(position, searchString.length) === searchString;
	};
}

/** in 23 - out 23
 *  */
function sliceZero(number, count) {
	return String("00" + number).slice(count || -2);
}

var growlHolder;

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
var MAX_STORAGE_LENGTH = 3000;
var blankRegex = /^\s*$/;
var fileTypeRegex = /\.(\w+)(\?.*)?$/;
window.sound = 0;
window.loggingEnabled = true;
var ajaxLoader;

///var linksRegex = /(https?:&#x2F;&#x2F;.+?(?=\s+|<br>|&quot;|&#39;|$))/g;/*http://anycharacter except end of text, <br> or space*/ TODO is ' ( &#39; ) allowed symbol? if not this breaks https://raw.githubusercontent.com/NeverSinkDev/NeverSink-Filter/master/NeverSink's%20filter%20-%201-REGULAR.filter
var linksRegex = /(https?:&#x2F;&#x2F;.+?(?=\s+|<br>|&quot;|$))/g;/*http://anycharacter except end of text, <br> or space*/
var replaceLinkPattern = '<a href="$1" target="_blank">$1</a>';
var muteBtn;
var inputRangeStyles = {};


window.logger = (function (logsEnabled) {
	var self = this;
	self.historyStorage = null;
	self.styles = {
		time: "color: blue",
		msg: "color: black",
		ws: "color: green; font-weight: bold",
		http: "color: green; font-weight: bold",
		webrtc: "color: #960055; font-weight: bold"
	};
	self.dummyFun = function () {
		return function () { }
	};
	self.disableLogs = function () {
		self.info = dummyFun;
		self.error = dummyFun;
		self.ws = dummyFun;
		self.http = dummyFun;
		self.httpErr = dummyFun;
		self.warn = dummyFun;
		self.webrtc = dummyFun;
		self.webrtcErr = dummyFun;
	};
	self.enableLogs = function () {
		self.info = self._info;
		self.error = self._error;
		self.warn = self._warn;
		self.ws = self._http;
		self.http = self._http;
		self.httpErr = self._httpErr;
		self.webrtc = self._webrtc;
		self.webrtcErr = _webrtcErr;
	};
	self._info = function () {
		return self.doLog(arguments, console.log);
	};
	self._error = function () {
		return self.doLog(arguments, console.error);
	};
	self._warn = function () {
		return self.doLog(arguments, console.warn);
	};
	self._webrtc = function() {
		return self._debug(arguments, self.styles.webrtc, console.log);
	};
	self._webrtcErr = function() {
		return self._debug(arguments, self.styles.webrtc, console.error);
	};
	self._http = function() {
		return self._debug(arguments, self.styles.http, console.log);
	};
	self._ws = function() {
		return self._debug(arguments, self.styles.ws, console.log);
	};
	self._httpErr = function() {
		return self._debug(arguments, self.styles.http, console.error);
	};
	self._debug = function (inArg, style, dest) {
		var args = Array.prototype.slice.call(inArg);
		var initiator = args.shift();
		var now = new Date();
		// second argument is format, others are params
		var text = args.length > 1 ? String.prototype.format.apply(args.shift(), args) : args[0];
		var result = "%c{}:{}:{}.{}: %c{} %c{}".format(
				sliceZero(now.getHours()),
				sliceZero(now.getMinutes()),
				sliceZero(now.getSeconds()),
				sliceZero(now.getMilliseconds(), -3),
				initiator,
				text
		);
		saveLogToStorage(result);
		return Function.prototype.bind.apply(dest,
				[window.console, result, self.styles.time, style, self.styles.msg]);
	};
	self.saveLogToStorage = function (result) {
		if (!window.loggingEnabled) {
			return;
		}
		if (self.historyStorage == null) {
			self.historyStorage = result;
		} else if (self.historyStorage.length > MAX_STORAGE_LENGTH) {
			var notConcatInfo = self.historyStorage + ';;;' + result;
			self.historyStorage = notConcatInfo.substr(notConcatInfo.length - MAX_STORAGE_LENGTH, notConcatInfo.length);
		} else {
			self.historyStorage = self.historyStorage + ';;;' + result;
		}
	};

	self.doLog = function (arguments, fn) {
		return Function.prototype.bind.apply(fn, self.log.apply(self.log, arguments));
	};
	/**
	 *
	 * Formats message for debug,
	 * Usage log("{} is {}", 'war', 'bad');
	 * @returns:  Array "15:09:31:009: war is bad"
	 *  */
	self.log = function () {
		var now = new Date();
		// first argument is format, others are params
		var text;
		if (arguments.length > 1) {
			var args = Array.prototype.slice.call(arguments);
			text = String.prototype.format.apply(args.shift(), args);
		} else {
			text = arguments[0];
		}
		var result = "%c{}:{}:{}.{}%c: {}".format(
				sliceZero(now.getHours()),
				sliceZero(now.getMinutes()),
				sliceZero(now.getSeconds()),
				sliceZero(now.getMilliseconds(), -3),
				text
		);
		saveLogToStorage(result);
		return [window.console, result, self.styles.time, self.styles.msg];
	};
	if (logsEnabled)  {
		self.enableLogs();
	} else {
		self.disableLogs();
	}
	return self;
})(window.START_WITH_LOGS);


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
	self.message = message;
	self.id = Date.now();
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
			self.growlHolder.removeChild(self.growl);
			logger.info("Removing growl #{}", self.id)();
		} else {
			logger.info("Growl #{} is already removed", self.id)();
		}
	};
	self.showInfinity = function(growlClass) {
		self.growl = document.createElement('div');
		logger.info("Rendering growl #{}", self.id)();
		if (self.message) {
			self.message = self.message.trim();
			self.growl.innerHTML = self.message.indexOf("<") == 0? self.message : encodeAnchorsHTML(self.message);
		}
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
		self.dom.iconCancel = document.createElement('i');
		self.dom.header.appendChild(self.dom.iconCancel);
		self.dom.iconCancel.onclick = self.hide;
		self.dom.iconCancel.className = 'icon-cancel';
		self.dom.body = self.dom.container.children[0];
		if (!self.dom.body) {
			self.dom.body = document.createElement('DIV');
			self.dom.container.appendChild(self.dom.body);
		}
		CssUtils.addClass(self.dom.body, 'window-body');
		self.dom.container.insertBefore(self.dom.header, self.dom.body);
		self.dom.container.addEventListener('focus', self.onfocus);
		self.dom.container.addEventListener('blur', self.onfocusout);
		self.dom.container.setAttribute('tabindex', "-1");
		self.fixInputs();
	};
	self.fixInputs = function () {
		if (!container.id) {
			container.id = 'fileTr'+Date.now();
		}
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
		logger.warn("Ops, there's no scrollbar for firefox")();
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
				logger.http("POST in", "{} ::: {};", url, r.response)();
			} else {
				logger.httpErr("POST out: {} ::: {}, status:", url, r.response, r.status)();
			}
			if (typeof(callback) === "function") {
				callback(r.response);
			} else {
				logger.warn("Skipping {} callback for POST {}", callback, url)();
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
	if (data.entries) { //es6
		params = '';
		for (var pair of data.entries()) {
			params += pair[0] +'='+ pair[1] +'; ';
		}
	}
	logger.http("POST out", "{} ::: {}", url, params)();
	r.send(data);
}


/**
 * Loads file from server on runtime */
function doGet(fileUrl, callback) {
	logger.http("GET out", fileUrl)();
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
						logger.http('GET in','{} ::: "{}"...', fileUrl, xobj.responseText.substr(0, 100))();
						if (callback) {
							callback(xobj.responseText);
						}
					} else {
						logger._http("Unable to load {}, response code is '{}', response: {}", fileUrl, xobj.status, xobj.response )();
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

