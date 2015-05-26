var selfHeader = '<font class="message-header-self">';
var privateHeader = '<font class="message-header-private">';
var othersHeader = '<font class="message-header-others">';
var systemHeader = '<font class="message-header-system">';
var endHeader = '</font>';
var contentStyle = '<font class="message-text-style">';
var lockPostGetMessage = false;
var newMessagesCount = 0;
var isCurrentTabActive = true;
var headerId;
var chatBoxDiv;
var chatIncoming;
var chatOutgoing;
var loggedUser;
var chatRoomsDiv;
var userMessage;
var userSendMessageTo;
var receiverId;
var chatLogin;
var chatLogout;
var userNameLabel;
var ws;


$(document).ready(function () {
	chatBoxDiv = $('#chatbox');
	userMessage = $("#usermsg");
	chatRoomsDiv = $('#chatrooms');
	userNameLabel = $("#userNameLabel");
	userSendMessageTo = $('#userSendMessageTo');
	chatIncoming = document.getElementById("chatIncoming");
	chatOutgoing = document.getElementById("chatOutgoing");
	chatLogin = document.getElementById("chatLogin");
	chatLogout = document.getElementById("chatLogout");
	userSendMessageTo.hide();
	receiverId = $('#receiverId');
	if (!"WebSocket" in window) {
		chatBoxDiv.html("<h1>Your browser doesn't support Web socket, chat options will be unavalible<h1>");
		return;
	}
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
	start_chat_ws();
});


$(window).on("blur focus", function (e) {
	var prevType = $(this).data("prevType");

	if (prevType != e.type) {   //  reduce double fire issues
		switch (e.type) {
			case "focus":
				// do work
				isCurrentTabActive = true;
				newMessagesCount = 0;
				document.title = 'Chat';
				break;
			case "blur":
				isCurrentTabActive = false;

		}
	}

	$(this).data("prevType", e.type);
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
	ws.onopen = function () {
		console.log(new Date() + "Connection to WebSocket established");
	}
}


function encodeHTML(html) {
	return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}


function loadUsers(usernames) {
	console.log(new Date() + "Load user names: " + Object.keys(usernames));
	chatRoomsDiv.empty();
	var allUsers = '<ul >';
	var icon;
	for (var username in usernames) {
		if (usernames.hasOwnProperty(username)) {
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
	}
	allUsers += ('</ul>');
	chatRoomsDiv.append(allUsers);
}


function showUserSendMess(username) {
	userSendMessageTo.show();
	// Empty sets display to none
	userSendMessageTo.css("display", "table-cell");
	receiverId.empty();
	receiverId.append(username);
}


function displayPreparedMessage(headerStyle, time, htmlEncodedContent, displayedUsername, isTopDirection) {
	var messageHeader = headerStyle + ' (' + time + ') <b>' + displayedUsername + '</b>: ' + endHeader;
	var messageContent = contentStyle + htmlEncodedContent + endHeader;
	var message = '<p>' + messageHeader + messageContent + "</p>";
	if (!isCurrentTabActive) {
		newMessagesCount++;
		document.title = newMessagesCount + " new message";
	}
	if (isTopDirection) {
		chatBoxDiv.prepend(message);
	} else {
		var oldscrollHeight = chatBoxDiv[0].scrollHeight;
		chatBoxDiv.append(message);
		var newscrollHeight = chatBoxDiv[0].scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			chatBoxDiv.scrollTop(newscrollHeight);
		}
	}
}


function printMessage(data, isTopDirection) {
	var headerStyle;
	var receiver = data.receiver;
	var displayedUsername = data.sender;
	//private message
	if (receiver != null) {
		headerStyle = privateHeader;
		if (receiver !== loggedUser) {
			displayedUsername = data.receiver;
			headerStyle += '>>'
		}
		// public message
	} else if (data.sender === loggedUser) {
		headerStyle = selfHeader;
	} else {
		headerStyle = othersHeader;
	}
	displayPreparedMessage(headerStyle, data.time, encodeHTML(data.content), displayedUsername, isTopDirection);
}


function checkAndPlay(element) {
	if (element.readyState && sound) {
		element.pause();
		// TODO currentType is not set sometimes
		element.currentTime = 0;
		element.play();
	}
}


function refreshOnlineUsers(data) {
	loadUsers(data.content);
	var action = data.action;
	if (action === 'changed') {
		displayPreparedMessage(systemHeader, data.time, ' Anonymous <b> ' + data.oldName +
		'</b> has changed nickname to <b>' + data.user + '  </b> ', 'System', false);
	} else if (action !== 'online_users') {
		if (action === 'joined') {
			checkAndPlay(chatLogin);
		} else if (action === 'left') {
			checkAndPlay(chatLogout);
		} // else ifdo nothing
		var userType = "";
		if (data.sex === 'alien') {
			userType = ' Anonymous ';
		}
		displayPreparedMessage(systemHeader, data.time, userType+'<b> '+ data.user + '</b> has ' + action + ' the chat ', 'System', false);
	}
}


function setUsername(data) {
	console.log(new Date() + "UserName has been set to " + data.content);
	loggedUser = data.content;
	userNameLabel.text(loggedUser);
}


function handleGetMessages(message) {
	console.log(new Date() + ': appending messages to top');
	if (message.length === 0) {
		// TODO remove keydown event
		console.log(new Date() + ': Requesting messages has reached the top, lock acquired');
		lockPostGetMessage = true;
		return;
	}
	var firstMessage = message[message.length - 1];
	if (firstMessage != null) {
		headerId = firstMessage.id;
	}

	message.forEach(function (message) {
		printMessage(message, true);
	});
}


function webSocketMessage(message) {
	console.log(new Date() + message.data);
	var data = JSON.parse(message.data);
	var action = data.action;
	if (action === 'messages') {
		handleGetMessages(data.content);
	} else  if (action === 'joined' || action === 'left' || action === 'online_users' || action === 'changed') {
		refreshOnlineUsers(data);
	} else if (action === 'me') {
		setUsername(data);
	} else if (action === 'system') {
		displayPreparedMessage(systemHeader, data.time, data.content, 'System', false);
	} else {
		appendMessage(data);
	}
}


function appendMessage(data) {
	printMessage(data, false);
	if (loggedUser === data.sender) {
		// TODO not always plays
		checkAndPlay(chatOutgoing);
	} else {
		checkAndPlay(chatIncoming);
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
	messageRequest.action = 'send';

	var jsonRequest = JSON.stringify(messageRequest);

	ws.send(jsonRequest);
	userMessage.val("");
}


function loadUpHistory(elements) {
	if (chatBoxDiv.scrollTop() === 0) {
		loadMessages(elements, true);
	}
}


function loadMessages(count) {
	if (lockPostGetMessage) {
		console.log(new Date() + ': Post get messages Locked, no request sent');
		return;
	}
	var getMessageRequest = {};
	getMessageRequest.headerId = headerId;
	getMessageRequest.count = count;
	getMessageRequest.action = 'messages';
	var jsonRequest = JSON.stringify(getMessageRequest);
	ws.send(jsonRequest);
}


function toggleRoom() {
	chatRoomsDiv.toggle();
}

function hideUserSendToName() {
	receiverId.empty();
	userSendMessageTo.hide();
}