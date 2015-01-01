var headerId;
var selfHeader = '<font class="message_header_self">';
var privateHeader = '<font class="message_header_private">';
var othersHeader = '<font class="message_header_others">';
var endHeader = '</font>';
var contentStyle = '<font class="message_text_style">';
var chatBoxDiv;
var chatIncoming;
var chatOutgoing;
var loggedUser;
var chatRoomsDiv;


$(document).ready(function () {
	//use .on() to add a listener. you can add as many listeners as you want.
	ishout.on('notifications', appendMessage);
	ishout.on('refresh_users', loadUsers);
	// .init() will authenticate against the ishout.js server, and open the
	// WebSocket connection.
	ishout.init();
	ishout.joinRoom('main');
	chatBoxDiv = $('#chatbox');
	userMessage = $("#usermsg");
	chatRoomsDiv = $('#chatrooms');
	chatIncoming = document.getElementById("chatIncoming");
	chatOutgoing = document.getElementById("chatOutgoing");
	loggedUser = $("input#username").val();
	userMessage.keypress(function (event) {
		if (event.keyCode == 13) {
			$("#sendButton").click();
		}
	});
	loadMessages(10, false);
});


function encodeHTML(html) {
	return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}


function loadUsers(data) {
	console.log(new Date() + "Load user content:" + data);
	chatRoomsDiv.empty();
	for (member in data.members) {
		chatRoomsDiv.append('<p>' + data.members[member] + '</p>');
	}
}


function printMessage(data, div, isTopDirection) {
	var headerStyle;
	if (data.user == username.value) {
		headerStyle = selfHeader;
	} else {
		headerStyle = othersHeader;
	}
	messageHeader = headerStyle + ' (' + data.time + ') <b>' + data.user + '</b>: ' + endHeader;
	messageContent = contentStyle + encodeHTML(data.content) + endHeader;
	message = '<p>' + messageHeader + messageContent + "</p>";
	if (isTopDirection) {
		div.prepend(message);
	} else {
		var oldscrollHeight = chatBoxDiv[0].scrollHeight;
		chatBoxDiv.append(message);
		var newscrollHeight = chatBoxDiv[0].scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			div.animate({
				scrollTop: newscrollHeight
			}, 'normal'); // Autoscroll to bottom of div
		}

	}
}


function appendMessage(data) {
	printMessage(data, chatBoxDiv, false);
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
			console.log(new Date() + "Response: " + data);
			userMessage.val("");
		},
		failure: function (data) {
			console.log(new Date() + "can't send message, response: " + data);
		}
	});
}


$(function () {
	chatBoxDiv.bind('mousewheel DOMMouseScroll', function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { // Scroll top
			loadUpHistory(5);
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
	if (chatBoxDiv.scrollTop() == 0) {
		loadMessages(elements, true);
	}
}


function loadMessages(count, isTop) {
	console.log(new Date() + ': Requesting ' + count + ' messages from server');
	$.ajax({
		type: 'POST',
		data: {
			headerId: headerId,
			count: count
		},
		url: "/get_messages",
		success: function (data) {
			console.log(new Date() + ': Response ' + data);
			var result = eval(data);
			firstMessage = result[0];
			if (firstMessage != null) {
				headerId = eval(firstMessage).id;
			}
			if (!isTop) {
				// appending to top last message first, so it goes down with every iteraction
				result = result.reverse();
			}
			result.forEach(function (message) {
				realMessage = eval(message);
				printMessage(realMessage, chatBoxDiv, isTop);
			});

			if (!isTop) {
				//scroll to bottom if new messages have been already sent
				chatBoxDiv.scrollTop(chatBoxDiv[0].scrollHeight);
			}
		},
		failure: function (data) {
			console.log(new Date() + 'can not load messages, response:', data);
		}
	});
}


function toggleRoom() {
	chatRoomsDiv.toggle()
}