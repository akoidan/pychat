var headerId;
var selfHeader = '<font class="message-header-self">';
var privateHeader = '<font class="message-header-private">';
var othersHeader = '<font class="message-header-others">';
var endHeader = '</font>';
var contentStyle = '<font class="message-text-style">';
var chatBoxDiv;
var chatIncoming;
var chatOutgoing;
var loggedUser;
var chatRoomsDiv;
var userMessage;
var userSendMessageTo;
var receiverId;
var ws;


$(document).ready(function () {

	start_chat_ws();

	chatBoxDiv = $('#chatbox');
	userMessage = $("#usermsg");
	chatRoomsDiv = $('#chatrooms');
	userSendMessageTo = $('#userSendMessageTo');
	chatIncoming = document.getElementById("chatIncoming");
	chatOutgoing = document.getElementById("chatOutgoing");
	loggedUser = $.cookie("user");
	userSendMessageTo.hide();
	receiverId = $('#receiverId');
	userMessage.keypress(function (event) {
		if (event.keyCode === 13) {
			$("#sendButton").click();
		}
	});
	chatBoxDiv.bind('mousewheel DOMMouseScroll', function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { // Scroll top
			loadUpHistory(5);
		}
	});

	$(document).keydown(function (e) {
		if (e.which === 33) {    // page up
			loadUpHistory(15);
		} else if (e.which === 38) { // up
			loadUpHistory(3);
		} else if (e.ctrlKey && e.which === 36) {
			loadUpHistory(25);
		}
	});
	loadMessages(10, false);
});


//var timezone = getCookie('timezone');

// TODO
//if (timezone == null) {
//	setCookie("timezone", jstz.determine().name());
//}


function start_chat_ws() {
	ws = new WebSocket($.cookie('api'));
	ws.onmessage = webSocketMessage;
	ws.onclose = function () {
		console.log(new Date() + "Connection to WebSocket is lost, trying to reconnect");
		// Try to reconnect in 5 seconds
		setTimeout(function () {
			start_chat_ws()
		}, 5000);
	};
	ws.onopen = function() {
		console.log(new Date() + "Connection to WebSocket established");
	}
}


function encodeHTML(html) {
	return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}


function loadUsers(usernames) {
	console.log(new Date() + "Load usernames :" + usernames);
	chatRoomsDiv.empty();
	var allUsers = '<ul class="message_header_others">';
	var icon;
	for (var username in usernames) {
		if (usernames[username] === "Male") {
			icon = '<span class="glyphicon icon-user green"/>'
		} else if (usernames[username] === "Female") {
			icon = '<span class="glyphicon icon-girl green"/>'
		} else {
			icon = '<span class="glyphicon icon-dog green"/>';
		}
		allUsers += '<li onclick="showUserSendMess($(this).text());">'
		+ username + icon + '</li>';
	}
	allUsers += ('</ul>');
	chatRoomsDiv.append(allUsers);
}

function showUserSendMess(username) {
	userSendMessageTo.show();
	// Empty sets display to none
	userSendMessageTo.css("display", "flex");
	receiverId.empty();
	receiverId.append(username);
}


function printMessage(data, isTopDirection) {
	var headerStyle;
	var receiver = data.receiver;
	var displayedUsername = data.sender;
	//private message
	if (receiver != null) {
		headerStyle = privateHeader;
		if (receiver !== loggedUser) {
			displayedUsername = data.receiver
			headerStyle+= '>>'
		}
	// public message
	}	else if (data.sender === loggedUser) {
		headerStyle = selfHeader;
	} else {
		headerStyle = othersHeader;
	}
	var messageHeader = headerStyle + ' (' + data.time + ') <b>' + displayedUsername + '</b>: ' + endHeader;
	var messageContent = contentStyle + encodeHTML(data.content) + endHeader;
	var message = '<p>' + messageHeader + messageContent + "</p>";
	if (isTopDirection) {
		chatBoxDiv.prepend(message);
	} else {
		var oldscrollHeight = chatBoxDiv[0].scrollHeight;
		chatBoxDiv.append(message);
		var newscrollHeight = chatBoxDiv[0].scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			chatBoxDiv.animate({
				scrollTop: newscrollHeight
			}, 'normal'); // Autoscroll to bottom of div
		}

	}
}

function webSocketMessage(message) {
	var data = JSON.parse(message.data);
	if (data.onlineUsers) {
		loadUsers(data.onlineUsers)
	} else {
		appendMessage(data);
	}
}

function appendMessage(data) {
	printMessage(data, false);
	if (sound) {
		chatOutgoing.currentTime = 0;
		if (loggedUser === data.user) {
			chatOutgoing.play();
		} else {
			chatIncoming.play();
		}
	}
}


function sendMessage(usermsg, username) {
	if (usermsg == null || usermsg === '') {
		return;
	}
	if (ws.readyState != WebSocket.OPEN) {
		console.log(new Date() + "Web socket is closed. Can't send message: " + usermsg);
		return false;
	}
	var messageRequest = {};
	messageRequest.message = usermsg;
	messageRequest.receiver = username;

	var jsonRequest = JSON.stringify(messageRequest);

	ws.send(jsonRequest);
	userMessage.val("");
}


function loadUpHistory(elements) {
	if (chatBoxDiv.scrollTop() === 0) {
		loadMessages(elements, true);
	}
}


function loadMessages(count, isTop) {
	$.ajax({
		async: false,
		type: 'POST',
		data: {
			headerId: headerId,
			count: count
		},
		url: "/get_messages",
		success: function (data) {
			console.log(new Date() + ': Requesting messages response ' + data);
			var result = JSON.parse(data);
			var firstMessage = result[result.length - 1];
			if (firstMessage != null) {
				headerId = firstMessage.id;
			}
			if (!isTop) {
				// appending to top last message first, so it goes down with every iteraction
				result = result.reverse();
			}
			result.forEach(function (message) {
				printMessage(message, isTop);
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
	chatRoomsDiv.toggle();
}

function hideUserSendToName() {
	receiverId.empty();
	userSendMessageTo.hide();
}