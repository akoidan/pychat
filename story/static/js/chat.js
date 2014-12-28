//use .on() to add a listener. you can add as many listeners as you want.
ishout.on('notifications', appendMessage);
// .init() will authenticate against the ishout.js server, and open the
// WebSocket connection.
ishout.init();
loadMessages(5, false);

var headerId;

var selfHeader = '<font class="message_header_self">';
var privateHeader = '<font class="message_header_private">';
var othersHeader = '<font class="message_header_others">';
var endHeader = '</font>';
var contentStyle = '<font class="message_text_style"/>';

function printMessage(data, div, isTopDirection) {
	var headerStyle;
	if (data.user == username.value) {
		headerStyle = selfHeader;
	} else {
		headerStyle = othersHeader;
	}
	messageHeader = headerStyle + ' (' + data.hour + ':' + data.minute + ':' + data.second +
	') <b>' + data.user + '</b> :' + endHeader;
	messageContent = contentStyle + he.encode(data.content) + endHeader;
	message = '<p>' + messageHeader + messageContent + "</p>";
	if (isTopDirection) {
		div.prepend(message);
	} else {
		var oldscrollHeight = div[0].scrollHeight;
		div.append(message);
		var newscrollHeight = div[0].scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			div.animate({
				scrollTop: newscrollHeight
			}, 'normal'); // Autoscroll to bottom of div
		}

	}
}

function appendMessage(data) {
	loggedUser = $("input#username").val();
	var chatIncoming = document.getElementById("chatIncoming");
	var chatOutgoing = document.getElementById("chatOutgoing");
	div = $("#chatbox");
	printMessage(data, div, false);
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
			var d = new Date();
			console.log(d + "can't send message, response: " + data);
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
	div.bind('mousewheel DOMMouseScroll', function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { // Scroll top
			loadUpHistory(5);
		//} else { // Scroll bottom
		//	loadDownHistory();
		}
	});

	$(document).keydown(function (e) {
		if (e.which == 33) {    // page up
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
		loadMessages(elements, true);
	}
}


//function loadDownHistory(elements) {
//	var div = $('#chatbox');
//	if (div[0].scrollHeight - div.scrollTop() < div.height() + 2) {
//		console.log("Reached the bottom!");
//	}
//}


function loadMessages(count, isTop) {
	var d = new Date();
	console.log(d + ': Requesting ' + count + ' messages from server');
	$.ajax({
		// TODO why beforesend is not called by other setup
		beforeSend: function (xhr, settings) {
			xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		},
		type: 'POST',
		data: {
			headerId: headerId,
			count: count
		},
		url: "/get_messages",
		success: function (data) {
			var result = eval(data);
			console.log(d + ': Fetched ' + result.length + ' messages from server');
			firstMessage = result[0];
			if (firstMessage != null) {
				headerId = eval('(' + firstMessage + ')').id;
			}
			if (!isTop) {
				// appending to top last message first, so it goes down with every iteraction
				result = result.reverse();
			}
			result.forEach(function (message) {
				realMessage = eval('(' + message + ')');
				printMessage(realMessage, $("#chatbox"), isTop);
			});

			if (!isTop) {
				//scroll to bottom if new messages have been already sent
				$("#chatbox").scrollTop($('#chatbox')[0].scrollHeight);
			}
		},
		failure: function (data) {
			var d = new Date();
			console.log(d+'can not load messages, response:', data);
		}
	});
}