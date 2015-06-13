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
var STORAGE_USER = 'user';
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
var sendButton;
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

//console.(\w+)\(new Date\(\)\s\+\s(".*")\);
//console.$1(getDebugMessage($2);

document.addEventListener("DOMContentLoaded", function() {
	chatBoxDiv = document.getElementById("chatbox");
	userMessage = document.getElementById("usermsg");
	chatRoomsDiv = document.getElementById("chatrooms");
	userNameLabel = document.getElementById("userNameLabel");
	userSendMessageTo = document.getElementById("userSendMessageTo");
	chatIncoming = document.getElementById("chatIncoming");
	chatOutgoing = document.getElementById("chatOutgoing");
	chatLogin = document.getElementById("chatLogin");
	chatLogout = document.getElementById("chatLogout");
	sendButton = document.getElementById("sendButton");
	userSendMessageTo.style.display = "none";
	receiverId = document.getElementById("receiverId");
	if (!"WebSocket" in window) {
		chatBoxDiv.html("<h1>Your browser doesn't support Web socket, chat options will be unavalible<h1>");
		return;
	}
	userMessage.onkeypress = (function (event) {
		if (event.keyCode === 13) {
			sendButton.click();
		}
	});

	// Those events are removed when loadUpHistory() reaches top
	mouseWheelLoadUpFunction = function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { // Scroll top
			loadUpHistory(5);
		}
	};
	chatBoxDiv.addEventListener('mousewheel DOMMouseScroll', mouseWheelLoadUpFunction);

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

	document.onkeypress = keyDownLoadUpFunction;
	window.addEventListener("blur focus", function (e) {
		var prevType = $(this).data("prevType");
		// TODO not enought event type, when user switch tab and doesn't focus the window event won't fire
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


function loadMessagesFromLocalStorage() {
	loggedUser = localStorage.getItem(STORAGE_USER);
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
	ws = new WebSocket(window.readCookie('api').replace('"', ''));
	ws.onmessage = webSocketMessage;
	ws.onclose = function () {
		console.error(getDebugMessage("Connection to WebSocket is lost, trying to reconnect"));
		// Try to reconnect in 5 seconds
		setTimeout(function () {
			start_chat_ws()
		}, 5000);
	};
	ws.onopen = function () {
		console.log(getDebugMessage("Connection to WebSocket established"));
	}
}


function encodeHTML(html) {
	return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}


function loadUsers(usernames) {
	console.log(getDebugMessage("Load user names: {}", Object.keys(usernames)));
	chatRoomsDiv.innerHTML = "";
	var allUsers = '<ul >';
	var icon;
	for (var username in usernames) {
		if (usernames.hasOwnProperty(username)) {
			switch (usernames[username]) {
				case "Male":
					icon = '<i class="icon-man"></i>';
					break;
				case "Female":
					icon = '<i class="icon-girl"></i>';
					break;
				case "Alien":
					icon = '<i class="icon-anonymous"></i>';
					break;
				default :
					icon = '<i class="icon-user-secret"></i>';
					break;
			}
			allUsers += '<li onclick="showUserSendMess(this.innerHTML);">'
			+ icon + username + '</li>';
		}
	}
	allUsers += ('</ul>');
	chatRoomsDiv.insertAdjacentHTML('beforeend', allUsers);
}

// Used by {@link loadUsers}
function showUserSendMess(username) {

	// Empty sets display to none
	userSendMessageTo.style.display = "table-cell";
	receiverId.innerHTML = username;
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
		chatBoxDiv.insertAdjacentHTML('beforebegin', message);
	} else {
		var oldscrollHeight = chatBoxDiv.scrollHeight;
		chatBoxDiv.insertAdjacentHTML('beforeend', message);
		var newscrollHeight = chatBoxDiv.scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			chatBoxDiv.scrollTop = newscrollHeight;
		}
	}
}


function printMessage(data, isTopDirection) {
	var headerStyle;
	var receiver = data['receiver'];
	var displayedUsername = data['user'];
	//private message
	if (receiver != null) {
		headerStyle = privateHeader;
		if (receiver !== loggedUser) {
			displayedUsername = data['receiver'];
			headerStyle += '>>'
		}
		// public message
	} else if (data['user'] === loggedUser) {
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
			message = 'Anonymous <b>' + data['oldName'] + '</b> has changed nickname to <b>' + data['user'] + '  </b> ';
		}
	} else if (action !== 'online_users') {
		if (data['user'] == loggedUser) {
			message = 'You have ' + action + ' the chat';
		} else if (data['sex'] == 'alien') {
			message = 'Anonymous <b>' + data['user'] + '</b> has ' + action + ' the chat.';
		} else {
			message = 'User <b>' + data['user'] + '</b> has ' + action + ' the chat.';
		}
		if (action === 'joined') {
			checkAndPlay(chatLogin);
		} else if (action === 'left') {
			checkAndPlay(chatLogout);
		}
	} else {
		return;
	}
	displayPreparedMessage(systemHeader, data['time'], message, 'System', false);
}


function setUsername(data) {
	console.log(getDebugMessage("UserName has been set to {}", data['content']));
	loggedUser = data['content'];
	userNameLabel.innerHTML = loggedUser;
}


function handleGetMessages(message) {
	console.log(getDebugMessage('appending messages to top'));

	// This check should fire only once, because requests aren't being sent when there are no event for them, thus no responses
	if (message.length === 0) {
		console.log(getDebugMessage('Requesting messages has reached the top, removing loadUpHistoryEvent handlers'));
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
	var loggedMessageTypes = ['system', 'joined', 'messages', 'changed', 'left', 'send'];
	if (loggedMessageTypes.indexOf(newItem['action']) > 0) {

		var jsonMessages = localStorage.getItem(STORAGE_NAME);
		var messages;
		if (jsonMessages != null) {
			messages = JSON.parse(jsonMessages);
		} else {
			messages = [];
		}
		messages.push(newItem);
		var newArray = JSON.stringify(messages);

		localStorage.setItem(STORAGE_NAME, newArray);
	} else if ( newItem['action'] == 'me') {
		localStorage.setItem(STORAGE_USER,  newItem['content']);
	}
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
		case 'send':
			appendMessage(data);
			break;
		default:
			console.error('<< Unknown message type');
	}
}
function webSocketMessage(message) {
	var jsonData = message.data;
	console.log(getDebugMessage(jsonData));
	var data = JSON.parse(jsonData);

	//cache some messages to localStorage
	saveMessageToStorage(data);

	handlePreparedWSMessage(data);
}


function appendMessage(data) {
	printMessage(data, false);
	if (loggedUser === data['user']) {
		checkAndPlay(chatOutgoing);
	} else {
		checkAndPlay(chatIncoming);
	}
}


function sendToServer(messageRequest) {
	var jsonRequest = JSON.stringify(messageRequest);
	if (ws.readyState != WebSocket.OPEN) {
		console.log(getDebugMessage("Web socket is closed. Can't send message: " + jsonRequest));
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
		userMessage.value = "";
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

function clearLocalHistory() {
	localStorage.removeItem(STORAGE_NAME);
	localStorage.removeItem(STORAGE_USER);
	chatBoxDiv.innerHTML = '';
}

function hideUserSendToName() {
	receiverId.innerHTML = '';
	userSendMessageTo.style.display = 'none';
}