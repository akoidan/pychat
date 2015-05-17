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

$(function () {
	$.ajaxSetup({
		beforeSend: function (xhr, settings) {
			xhr.setRequestHeader("X-CSRFToken", $.cookie("csrftoken"));
		}
	});
});

$(document).ready(function () {
	mute();
});
