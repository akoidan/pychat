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
window.loggingEnabled = true;
var ajaxLoader;
var logger;
var muteBtn;
var inputRangeStyles = {};

window.loggerFactory = (function (logsEnabled) {
	var self = this;
	self.logsEnabled = logsEnabled;
	self.dummy = function() {

	};
	self.getLogger = function (initiator, dest, style) {
		return function () {
			if (!self.logsEnabled) {
				return self.dummy;
			}
			var args = Array.prototype.slice.call(arguments);
			var parts = args.shift().split('{}');
			var params = [window.console, '%c' + initiator, style];
			for (var i = 0; i < parts.length; i++) {
				params.push(parts[i]);
				if (typeof args[i] !== 'undefined' ) { // args can be '0'
					params.push(args[i])
				}
			}
			return Function.prototype.bind.apply(dest, params);
		};
	};
	return self;
})(window.START_WITH_LOGS);

function getDay(dateObj) {
	var month = dateObj.getUTCMonth() + 1; //months from 1-12
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();
	return year + "/" + month + "/" + day;
}

var escapeMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"\n": '<br>',
	"/": '&#x2F;'
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
var isMobile = (function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
})();
var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection;
var requestFileSystem  = window.webkitRequestFileSystem || window.mozRequestFileSystem || window.requestFileSystem;
if (isFirefox) {
	RTCSessionDescription = mozRTCSessionDescription;
	RTCIceCandidate = mozRTCIceCandidate;
}

function getUrlParam(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	// TODO encode "#" ? like new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|$)", "i"),
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
	/*		msg: "color: black",
		ws: "color: green; font-weight: bold",
		webrtc: "color: #960055; font-weight: bold",
		sw: "color: #ffb500; font-weight: bold"*/
	logger = {
		warn: loggerFactory.getLogger("GLOBAL", console.warn, 'color: #687000; font-weight: bold'),
		debug: loggerFactory.getLogger("GLOBAL", console.debug, 'color: #687000; font-weight: bold'),
		info: loggerFactory.getLogger("GLOBAL", console.log, 'color: #687000; font-weight: bold'),
		error: loggerFactory.getLogger("GLOBAL", console.error, 'color: #687000; font-weight: bold'),
		http: loggerFactory.getLogger("HTTP", console.log, 'color: green; font-weight: bold'),
		httpErr: loggerFactory.getLogger("HTTP", console.error, 'color: green; font-weight: bold')
	};
	return document.addEventListener("DOMContentLoaded", onload);
}


function encodeHTML(html) {
	return html.replace(replaceHtmlRegex, function (s) {
		return escapeMap[s];
	});
}


function bytesToSize(bytes) {
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes < 1) return '0 Byte';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function isDescendant(parent, child) {
	while (child != null) {
		if (child == parent) {
			return true;
		}
		child = child.parentNode;
	}
	return false;
}

var CssUtils = {
	visibilityClass: 'hidden',
	deleteElement: function(target) {
		target.parentNode.removeChild(target)
	},
	deleteChildren: function (el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
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
	showElement: function (element) {
		CssUtils.removeClass(element, CssUtils.visibilityClass)
	},
	hideElement: function (element) {
		CssUtils.addClass(element, CssUtils.visibilityClass);
	},
	toggleVisibility: function (element) {
		return CssUtils.toggleClass(element, CssUtils.visibilityClass);
	},
	setClassToState: function(element, isVisible, clazz){
		if (isVisible) {
			CssUtils.removeClass(element, clazz);
		} else {
			CssUtils.addClass(element, clazz);
		}
	},
	setVisibility: function(element, isVisible){
		CssUtils.setClassToState(element, isVisible, CssUtils.visibilityClass);
	}
};

(function () {
	var cl = document.documentElement.classList;
	if (cl && cl.add) {
		CssUtils.addClass = function (element, className) {
			element.classList.add(className)
		}
	} else {
		CssUtils.addClass = function (element, className) {
			if (!CssUtils.hasClass(element, className)) {
				var oldClassName = element.className;
				element.className += (' '+ className);
			}
		}
	}
	if (cl && cl.remove) {
		CssUtils.removeClass = function (element, className) {
			element.classList.remove(className)
		}
	} else {
		CssUtils.removeClass = function (element, className) {
			if (element.className) {
				element.className.replace(new RegExp('(?:^|\\s)'+ className + '(?:\\s|$)'), ' ');
			}
		}
	}
	if (cl && cl.toggle) {
		CssUtils.toggleClass = function (element, className) {
			return element.classList.toggle(className)
		}
	} else {
		CssUtils.toggleClass = function (element, className) {
			if (CssUtils.hasClass(element, className)) {
				CssUtils.removeClass(element, className);
				return false;
			} else {
				CssUtils.addClass(element, className);
				return true;
			}
		}
	}
	if (cl && cl.contains) {
		CssUtils.hasClass = function (element, className) {
			return element.classList.contains(className);
		}
	} else {
		CssUtils.hasClass = function (element, className) {
			return element.className && element.className.split(' ').indexOf(className) >= 0;
		}
	}
})();

var Growl = function (message, onclicklistener, messageDiv) {
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
			// logger.info("Removing growl #{}", self.id)();
		} else {
			// logger.info("Growl #{} is already removed", self.id)();
		}
	};
	self.showInfinity = function (growlClass) {
		self.growl = document.createElement('div');
		self.growlInner = document.createElement('div');
		self.growlClose = document.createElement('div');
		// logger.info("Rendering growl #{}", self.id)();
		if (messageDiv) {
			self.growlInner.appendChild(messageDiv)
		} else if (self.message) {
			self.message = self.message.trim();
			self.growlInner.innerHTML = self.message.indexOf("<") === 0 ? self.message : encodeHTML(self.message);
		}
		self.growl.appendChild(self.growlClose);
		self.growl.appendChild(self.growlInner);
		self.growlClose.className = 'icon-cancel';
		self.growl.className = 'growl ' + growlClass;
		self.growlHolder.appendChild(self.growl);
		self.growl.clientHeight; // request to paint now!
		self.growl.style.opacity++;
		self.growl.onclick = onclicklistener;
		self.growlClose.onclick = self.hide;

	};
	self.show = function (baseTime, growlClass) {
		self.showInfinity(growlClass);
		if (baseTime) {
			var timeout = baseTime + self.message.length * 100;
			setTimeout(self.hide, timeout);
		}
	};
};


/** TODO not used anymore*/
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

function setTheme(theme) {
	if (theme) {
		document.body.className = theme;
	}
	isMobile && CssUtils.addClass(document.body, 'mobile')
}
onDocLoad(function () {
	muteBtn = $("muteBtn");
	ajaxLoader = $("ajaxStatus");
	if (typeof InstallTrigger !== 'undefined') { // browser = firefox
		logger.warn("Ops, there's no scrollbar for firefox")();
	}
	growlHolder = $('growlHolder');
	[].forEach.call(document.querySelectorAll('input[type=range]'), styleInputRange);

});
function fixInputRangeStyle(e) {
	// since webkit-slider-runnable-track is a selector, it's impossible to inject it to style directly
	var id = e.getAttribute('id');
	var el = inputRangeStyles[id];
	el.style.textContent =
			'#{}::-webkit-slider-runnable-track {background-size: {}% 100%, 100% 100%; }'
					.format(id, Math.round((e.value - el.minValue) / (el.diff) * 100));
}

var getRandomId = (function getRandomId() {
	var randomId = 0;
	return function () {
		randomId++;
		return 'randomId' + randomId;
	}
})();

function styleInputRange(ir) {
	var id = ir.getAttribute('id');
	if (!id) {
		id = getRandomId();
		ir.setAttribute('id', id);
	}
	ir.addEventListener('input', function() {fixInputRangeStyle(this)});
	var minValue = ir.getAttribute('min') || 0;
	var maxValue = ir.getAttribute('max') || 100;
	inputRangeStyles[id] = {
		style: document.createElement('style'),
		diff: maxValue - minValue,
		minValue: minValue
	};
	fixInputRangeStyle(ir);
	document.head.appendChild(inputRangeStyles[id].style);
}

function readCookie() {
	var c, C, i;
	c = document.cookie.split('; ');
	var cookies = {};
	for (i = c.length - 1; i >= 0; i--) {
		C = c[i].split('=');
		if (C[1]) {
			var length = C[1].length - 1;
			// if cookie is wrapped with quotes (for ex api)
			if (C[1][0] === '"' && C[1][length] === '"') {
				C[1] = C[1].substring(1, length);
			}
		}
		cookies[C[0]] = C[1];
	}
	return cookies;
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
 * @param formData : form in canse form is used
 * */
function doPost(url, params, callback, formData, isJsonEncoded, process) {
	var r = new XMLHttpRequest();
	r.onreadystatechange = function () {
		if (r.readyState === 4) {
			if (r.status === 200) {
				logger.http("POST in {} ::: {};", url, r.response)();
			} else {
				logger.httpErr("POST out: {} ::: {}, status:", url, r.response, r.status)();
			}
			if (typeof(callback) === "function") {
				var error;
				if (r.status === 0) {
					error = "No internet connection";
				} else if (r.status === 200) {
					error = null;
				} else {
					error = "Server error";
				}
				callback(r.response, error);
			} else {
				logger.warn("Skipping {} callback for POST {}", callback, url)();
			}
		}
	};

	if (url === "") {
		url = window.location.href ; // f*cking IE
	}
	r.open("POST", url, true);
	var data;
	if (isJsonEncoded) {
		data = JSON.stringify(params);
		r.setRequestHeader("Content-Type", 'application/json');
	} else {
		/*Firefox doesn't accept null*/
		data = formData ? formData : new FormData();

		if (params) {
			for (var key in params) {
				if (params.hasOwnProperty(key)) {
					data.append(key, params[key]);
				}
			}
		}
		if (data.entries) {
			var entries = data.entries();
			if (entries && entries.next) {
				params = '';
				var d;
				while (d = entries.next()) {
					if (d.done) {
						break;
					}
					params += d.value[0] + '=' + d.value[1] + '; ';
				}
			}
		}
	}
	r.setRequestHeader("X-CSRFToken", readCookie()["csrftoken"]);

	logger.http("POST out {} ::: {}", url, params)();
	if (process) {
		process(r);
	}
	r.send(data);
	return r;
}


/**
 * Loads file from server on runtime */
function doGet(fileUrl, callback) {
	logger.http("GET out {}", fileUrl)();
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
						logger.http('GET in {} ::: "{}"...', fileUrl, xobj.responseText.substr(0, 100))();
						if (callback) {
							if (fileType === 'json') {
								callback(JSON.parse(xobj.responseText))
							} else {
								callback(xobj.responseText);
							}
						}
					} else {
						logger.httpErr("Unable to load {}, XMLHttpRequest: {}", fileUrl, xobj)();
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

