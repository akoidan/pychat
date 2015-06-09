var sound = true;
var userRegex = /^[a-zA-Z-_0-9]{1,16}$/;

function mute() {
	sound = !sound;
	var btn = document.getElementById("muteBtn");
	if (sound) {
		btn.innerHTML = '<span class="glyphicon glyphicon-volume-up"></span>';
	} else {
		btn.innerHTML = '<span class="glyphicon glyphicon-volume-off"></span>';
	}
}

document.addEventListener("DOMContentLoaded", function () {
	mute();
	if (typeof InstallTrigger !== 'undefined') {
		console.log("Ops there's no scrollbar for firefox, so it looks a bit ugly")
	}
	// xhr.setRequestHeader("X-CSRFToken", $.cookie("csrftoken")); // TODO
});

(function () {
	var cookies;
	function readCookie(name, c, C, i) {
		if (cookies) {
			return cookies[name];
		}
		c = document.cookie.split('; ');
		cookies = {};
		for (i = c.length - 1; i >= 0; i--) {
			C = c[i].split('=');
			cookies[C[0]] = C[1];
		}
		return cookies[name];
	}
	window.readCookie = readCookie; // or expose it however you want
})();
