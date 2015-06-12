var sound = 0;
var userRegex = /^[a-zA-Z-_0-9]{1,16}$/;

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
			btn.className = 'icon-volume-3	';
			break;
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


function doPost(url, params, callback ) {
	var r = new XMLHttpRequest();
	r.setRequestHeader("X-CSRFToken", window.readCookie("csrftoken"));
	r.open("POST", url, true);
	r.onreadystatechange = callback;
	r.send(params);
}
