var sound = 0;
var userRegex = /^[a-zA-Z-_0-9]{1,16}$/;


var $ = function(id) {
	return document.getElementById(id);
};


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
		if (element.currentTime === element.duration ){
			// TODO currentType is not set sometimes
			var params = {
				browser : getBrowserVersion(),
				issue : "html5 audio currentTime"
			};
			doPost('/report_issue', params, null);
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
 * @param image : string base64 text image
 * */
function doPost(url, params, callback, image) {
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
	var debugOutData;
	if ((params || {}).tagName == 'FORM') {
		data =  new FormData(params);
		debugOutData = 'FormData';
	} else {
		data = new FormData();
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				data.append(key, params[key]);
			}
		}
		debugOutData = JSON.stringify(params);
	}
	if (image) {
		data.append('base64_image', image);
	}
	r.open("POST", url, true);
	r.setRequestHeader("X-CSRFToken", readCookie("csrftoken"));
	console.log(getDebugMessage("POST {} out: {}", url, debugOutData));
	r.send(data);
}


/**
 *
 * Formats message for debug,
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

// TODO
_log = (function (undefined) {
	var Log = Error; // does this do anything?  proper inheritance...?
	Log.prototype.write = function (args) {
		/// <summary>
		/// Paulirish-like console.log wrapper.  Includes stack trace via @fredrik SO suggestion (see remarks for sources).
		/// </summary>
		/// <param name="args" type="Array">list of details to log, as provided by `arguments`</param>
		/// <remarks>Includes line numbers by calling Error object -- see
		/// * http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
		/// * http://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
		/// * http://stackoverflow.com/a/3806596/1037948
		/// </remarks>

		// via @fredrik SO trace suggestion; wrapping in special construct so it stands out
		var suffix = {
			"@": (this.lineNumber
				? this.fileName + ':' + this.lineNumber + ":1" // add arbitrary column value for chrome linking
				: extractLineNumberFromStack(this.stack)
			)
		};

		args = args.concat([suffix]);
		// via @paulirish console wrapper
		if (console && console.log) {
			if (console.log.apply) {
				console.log.apply(console, args);
			} else {
				console.log(args);
			} // nicer display in some browsers
		}
	};
	var extractLineNumberFromStack = function (stack) {
		/// <summary>
		/// Get the line/filename detail from a Webkit stack trace.  See http://stackoverflow.com/a/3806596/1037948
		/// </summary>
		/// <param name="stack" type="String">the stack string</param>

		// correct line number according to how Log().write implemented
		var line = stack.split('\n')[2];
		// fix for various display text
		line = (line.indexOf(' (') >= 0
			? line.split(' (')[1].substring(0, line.length - 1)
			: line.split('at ')[1]
		);
		return line;
	};

	return function (params) {
		/// <summary>
		/// Paulirish-like console.log wrapper
		/// </summary>
		/// <param name="params" type="[...]">list your logging parameters</param>

		// only if explicitly true somewhere
		if (typeof DEBUGMODE === typeof undefined || !DEBUGMODE) return;

		// call handler extension which provides stack trace
		Log().write(Array.prototype.slice.call(arguments, 0)); // turn into proper array
	};//--  fn  returned

})();//--- _log