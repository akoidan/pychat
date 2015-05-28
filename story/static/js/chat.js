// html for messages
var selfHeader = '<font class="message-header-self">';
var privateHeader = '<font class="message-header-private">';
var othersHeader = '<font class="message-header-others">';
var systemHeader = '<font class="message-header-system">';
var endHeader = '</font>';
var contentStyle = '<font class="message-text-style">';

// browser tab notification
var newMessagesCount = 0;
var isCurrentTabActive = true;

//localStorage  key
var STORAGE_NAME = 'main';

//current top message id for detecting from what
var headerId;

//  div that contains messages
var chatBoxDiv;

//sound
var chatIncoming;
var chatOutgoing;
var chatLogin;
var chatLogout;

// current username
var loggedUser;

// div for user list appending
var chatRoomsDiv;

// input type that contains text for sending message
var userMessage;

// div that contains receiver id, icons, etc
var userSendMessageTo;

//user to send message input type text
var receiverId;

// navbar label with current user name
var userNameLabel;

// keyboard and mouse handlers for loadUpHistory
var keyDownLoadUpFunction;
var mouseWheelLoadUpFunction;

//main single socket for handling realtime messages
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

	// Those events are removed when loadUpHistory() reaches top
	mouseWheelLoadUpFunction = function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { // Scroll top
			loadUpHistory(5);
		}
	};
	chatBoxDiv.bind('mousewheel DOMMouseScroll', mouseWheelLoadUpFunction);

	// Those events are removed when loadUpHistory() reaches top
	keyDownLoadUpFunction = function (e) {
		if (e.which === 33) {    // page up
			loadUpHistory(15);
		} else if (e.which === 38) { // up
			loadUpHistory(3);
		} else if (e.ctrlKey && e.which === 36) {
			loadUpHistory(25);
		}
	};

	$(document).keydown(keyDownLoadUpFunction);
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

	loadMessagesFromLocalStorage();
	start_chat_ws();

});

//var timezone = getCookie('timezone');

// TODO
//if (timezone == null) {
//	setCookie("timezone", jstz.determine().name());
//}


// TODO too many json parses
function loadMessagesFromLocalStorage() {
	var jsonData =  localStorage.getItem(STORAGE_NAME);
	if (jsonData != null) {
		var parsedData = JSON.parse(jsonData);
		// don't make sound on loadHistory
		var savedSoundStatus = sound;
		sound = false;
		for (var i = 0; i < parsedData.length; i++) {
			handlePreparedWSMessage(parsedData[i]);
		}
		sound = savedSoundStatus;
	}
}

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

// Used by {@link loadUsers}
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
	var receiver = data['receiver'];
	var displayedUsername = data['sender'];
	//private message
	if (receiver != null) {
		headerStyle = privateHeader;
		if (receiver !== loggedUser) {
			displayedUsername = data['receiver'];
			headerStyle += '>>'
		}
		// public message
	} else if (data['sender'] === loggedUser) {
		headerStyle = selfHeader;
	} else {
		headerStyle = othersHeader;
	}
	displayPreparedMessage(headerStyle, data['time'], encodeHTML(data['content']), displayedUsername, isTopDirection);
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
	loadUsers(data['content']);
	var message;
	var action = data['action'];
	if (action === 'changed') {
		// if userName label already changed or still
		if (data['oldName'] == loggedUser || data['user'] == loggedUser) {
			message = 'You have changed nickname to <b>' + data['user'] + '</b> ';
		} else {
			message = 'Anonymous <b>' +  data['oldName'] + '</b> has changed nickname to <b>' + data['user'] + '  </b> ';
		}
	} else if (action !== 'online_users') {
		if (data['user'] == loggedUser) {
			message = 'You have ' + action + ' the chat';
		} else if (data['sex'] == 'alien') {
			message = 'Anonymous <b>' +  data['user'] + '</b> has ' + action + ' the chat.';
		} else {
			message = 'User <b>' +  data['user'] + '</b> has ' + action + ' the chat.';
		}
		if (action === 'joined') {
			checkAndPlay(chatLogin);
		} else if (action === 'left') {
			checkAndPlay(chatLogout);
	}
	} // else ifdo nothing
	displayPreparedMessage(systemHeader, data['time'], message, 'System', false);
}


function setUsername(data) {
	console.log(new Date() + "UserName has been set to " + data['content']);
	loggedUser = data['content'];
	userNameLabel.text(loggedUser);
}


function handleGetMessages(message) {
	console.log(new Date() + ': appending messages to top');

	// This check should fire only once, because requests aren't being sent when there are no event for them, thus no responses
	if (message.length === 0) {
		console.log(new Date() + ': Requesting messages has reached the top, removing loadUpHistoryEvent handlers');
		$(document).off('keydown', keyDownLoadUpFunction);
		chatBoxDiv.off('mousewheel DOMMouseScroll', mouseWheelLoadUpFunction);
		return;
	}
	var firstMessage = message[message.length - 1];
	headerId = firstMessage.id;

	message.forEach(function (message) {
		printMessage(message, true);
	});
}

// TODO too many json parses
function saveMessageToStorage(newItem) {
	var jsonMessages = localStorage.getItem(STORAGE_NAME);
	if (jsonMessages == null) {
		jsonMessages = '[]';
	}
	var messages = JSON.parse(jsonMessages);
	messages.push(newItem);
	var newArray = JSON.stringify(messages);

	localStorage.setItem(STORAGE_NAME, newArray);
}

function handlePreparedWSMessage(data) {
	switch (data['action']) {
		case 'messages':
			handleGetMessages(data['content']);
			break;
		case 'joined':
		case 'left':
		case 'online_users':
		case 'changed':
			refreshOnlineUsers(data);
			break;
		case 'me':
			setUsername(data);
			break;
		case 'system':
			displayPreparedMessage(systemHeader, data['time'], data['content'], 'System', false);
			break;
		default:
			appendMessage(data);
	}
}
function webSocketMessage(message) {
	var jsonData = message.data;
	console.log(new Date() + jsonData);
	var data = JSON.parse(jsonData);
	saveMessageToStorage(data);
	handlePreparedWSMessage(data);
}


function appendMessage(data) {
	printMessage(data, false);
	if (loggedUser === data['sender']) {
		checkAndPlay(chatOutgoing);
	} else {
		checkAndPlay(chatIncoming);
	}
}


function sendToServer(messageRequest) {
	var jsonRequest = JSON.stringify(messageRequest);
	if (ws.readyState != WebSocket.OPEN) {
		console.log(new Date() + "Web socket is closed. Can't send message: " + jsonRequest);
		return false;
	} else {
		ws.send(jsonRequest);
		return true;
	}
}

function sendMessage(usermsg, username) {
	if (usermsg == null || usermsg === '') {
		return;
	}
	var messageRequest = {
		content: usermsg,
		receiver:  username,
		action:  'send'
	};

	if (sendToServer(messageRequest)) {
		userMessage.val("");
	}
}


function loadUpHistory(count) {
	if (chatBoxDiv.scrollTop() === 0) {
		var getMessageRequest = {
			headerId : headerId,
			count: count,
			action: 'messages'
		};
		sendToServer(getMessageRequest);
	}
}


function toggleRoom() {
	chatRoomsDiv.toggle();
}

function hideUserSendToName() {
	receiverId.empty();
	userSendMessageTo.hide();
}