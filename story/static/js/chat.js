//use .on() to add a listener. you can add as many listeners as you want.
ishout.on('notifications', appendMessage);

// .init() will authenticate against the ishout.js server, and open the
// WebSocket connection.
ishout.init();

function printMessage(data, div) {
	messageHeader = '(' + data.hour + ':' + data.minute + ') <b>' + data.user + '</b> : ';
	if (data.user == username.value) {
		message = '<p> <font color="blue">' + messageHeader + '</font>' + he.encode(data.content) + "</p>";
	} else {
		message = '<p> <font color="brown">' + messageHeader + '</font>' + he.encode(data.content) + "</p>";
	}
	div.append(message);
}

function appendMessage(data) {
	loggedUser = $("input#username").val();
	var chatIncoming = document.getElementById("chatIncoming");
	var chatOutgoing = document.getElementById("chatOutgoing");
	div = $("#chatbox");
	var oldscrollHeight = div[0].scrollHeight;
	printMessage(data, div);
	var newscrollHeight = div[0].scrollHeight;
	if (newscrollHeight > oldscrollHeight) {
		div.animate({
			scrollTop: newscrollHeight
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
		type: 'POST',
		url: document.URL,
		data: {
			message: usermsg
		},
		success: function (data) {
			$("#usermsg").val("");
		},
		failure: function (data) {
			alert('Got an error dude');
		}
	});
}

$(document).ready(function () {
	$("#usermsg").keypress(function (event) {
		if (event.keyCode == 13) {
			$("#sendButton").click();
		}
	});
});

$(function () {
	var div = $('#chatbox');
	div.bind('mousewheel DOMMouseScroll', function (event, delta) {

		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { // Scroll top
			loadUpHistory(5);
		//} else { // Scroll bottom
		//	loadDownHistory();
		}
	});

	 $(document).keydown(function(e) {
        if(e.which == 33 ) {    // page up
			  loadUpHistory(15);
		  } else if (e.which == 38) { // up
			   loadUpHistory(3);
		  } else if (e.ctrlKey && e.which == 36) {
			loadUpHistory(25);
		  }
    });
});



function loadUpHistory(elements) {
	var div = $('#chatbox');
	if (div.scrollTop() == 0) {
		console.log("Reached the top!");
	}
}


//function loadDownHistory(elements) {
//	var div = $('#chatbox');
//	if (div[0].scrollHeight - div.scrollTop() < div.height() + 2) {
//		console.log("Reached the bottom!");
//	}
//}