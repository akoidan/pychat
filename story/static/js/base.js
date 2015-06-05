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

$(function () {
	$.ajaxSetup({
		beforeSend: function (xhr, settings) {
			xhr.setRequestHeader("X-CSRFToken", $.cookie("csrftoken"));
		}
	});
});

$(document).ready(function () {
	mute();

	if (typeof InstallTrigger !== 'undefined') {
		console.log("Ops there's no scrollbar for firefox, so it looks a bit ugly")
	}

});
