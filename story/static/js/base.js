var sound = true;

function mute() {
	sound = !sound;
	var btn = document.getElementById("muteBtn");
	if (sound) {
		btn.innerHTML = '<span class="glyphicon glyphicon-volume-up"></span>';
	} else {
		btn.innerHTML = '<span class="glyphicon glyphicon-volume-off"></span>';
	}
}

// included in all html, because of base.html
function getCookie(name) {
	var cookieValue = null;
	if (document.cookie) {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

$(function () {
	$.ajaxSetup({
		beforeSend: function (xhr, settings) {
			xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		}
	});
});

$(document).ready(function () {
	mute();
});
