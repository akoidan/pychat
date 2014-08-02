//use .on() to add a listener. you can add as many listeners as you want.
ishout.on('notifications', appendMessage);

// .init() will authenticate against the ishout.js server, and open the
// WebSocket connection.
ishout.init();

var sound = true;

function printMessage(data, div) {
	message = '(' + data.hour + ':' + data.minute + ') <b>' + data.user
			+ '</b> : ' + data.content;
	div.append("<p>" + message + "</p>");
}

function mute() {
	sound = !sound;
	var btn = document.getElementById("muteBtn");
	if (sound) {
		btn.innerHTML = '<span class="glyphicon glyphicon-volume-up"></span>';
	} else {
		btn.innerHTML = '<span class="glyphicon glyphicon-volume-off"></span>' ;
	}
}



function appendMessage(data) {
	loggedUser = $("input#username").val();
	var chatIncoming = document.getElementById("chatIncoming");
	var chatOutgoing = document.getElementById("chatOutgoing");
	div = $("#chatbox");
	var oldscrollHeight = div[0].scrollHeight;
	printMessage(data, div);
	$("#usermsg").val("");
	var newscrollHeight = div[0].scrollHeight;
	if (newscrollHeight > oldscrollHeight) {
		div.animate({
			scrollTop : newscrollHeight
		}, 'normal'); // Autoscroll to bottom of div
	}
	if (sound) {
		if (loggedUser === data.user) {
			chatOutgoing.currentTime = 0;
			chatOutgoing.play();
		} else {
			chatIncoming.play();
		}
	}
}

function sendMessage(usermsg) {
	if (usermsg == null || usermsg == '') {
		return;
	}
	$.ajax({
		type : 'POST',
		url : document.URL,
		data : {
			message : usermsg
		},
		failure : function(data) {
			alert('Got an error dude');
		}
	});
}

$(document).ready(function() {
	$("#usermsg").keypress(function(event) {
		if (event.keyCode == 13) {
			$("#sendButton").click();
		}
	});
});







