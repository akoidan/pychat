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
var chatRoomsTable;
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
	chatRoomsTable = document.getElementById("chatroomtables");
	userNameLabel = document.getElementById("userNameLabel");
	userSendMessageTo = document.getElementById("userSendMessageTo");
	chatIncoming = document.getElementById("chatIncoming");
	chatOutgoing = document.getElementById("chatOutgoing");
	chatLogin = document.getElementById("chatLogin");
	chatLogout = document.getElementById("chatLogout");
	sendButton = document.getElementById("sendButton");
	userSendMessageTo.style.display = "none";
	receiverId = document.getElementById("receiverId");
	chatRoomsTable.onclick = function (event) {
		event = event || window.event;
		var target = event.target || event.srcElement;

		while (target != chatRoomsTable) { // ( ** )
			if (target.nodeName == 'TD') { // ( * )
				if (target.cellIndex == 1) { // name is second
					showUserSendMess(target.innerHTML);
				}
			}
			target = target.parentNode
		}
	};
	if (!"WebSocket" in window) {
		chatBoxDiv.html("<h1>Your browser doesn't support Web socket, chat options will be unavalible<h1>");
		return;
	}
	userMessage.onkeypress = (function (event) {
		if (event.keyCode === 13) {
			sendMessage(userMessage.value, receiverId.innerHTML);
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
		sound = 0;
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
	if (!usernames) {
		return;
	}
	console.log(getDebugMessage("Load user names: {}", Object.keys(usernames)));
	var allUsers = '';
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
			allUsers += '<tr><td>' + icon + '</td> <td>' + username + '</td><tr>';
		}
	}
	chatRoomsTable.innerHTML = allUsers;
}

// Used by {@link loadUsers}
function showUserSendMess(username) {

	// Empty sets display to none
	userSendMessageTo.style.display = "inline-block";
	receiverId.innerHTML = username;
}


function displayPreparedMessage(headerStyle, time, htmlEncodedContent, displayedUsername, isTopDirection) {
	var messageHeader = headerStyle + '(' + time + ') <b>' + displayedUsername + '</b>: ' + endHeader;
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


function printRefreshUserNameToChat(data) {
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
		} else if (data['sex'] == 'Alien') {
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
	switch (newItem['action']){
		case 'me':
			localStorage.setItem(STORAGE_USER,  newItem['content']);
			break;
		case 'joined':
		case 'changed':
		case 'left':
			delete newItem['content']; // don't store usernames in db
		case 'system': // continue from 3 top events:
		case 'messages':
		case 'send':
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
			break;
		default:
			console.log(getDebugMessage("message won't be saved". newItem)); // TODO stringtrify?)))
		break;
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
			printRefreshUserNameToChat(data);
			loadUsers(data['content']);
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
	console.log(getDebugMessage("WS message: {}", jsonData));
	var data = JSON.parse(jsonData);

	handlePreparedWSMessage(data);

		//cache some messages to localStorage save only after handle, in case of errors +  it changes the message,
	saveMessageToStorage(data);
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

function sendMessage(usermsg, receiver) {
	if (usermsg == null || usermsg === '') {
		return;
	}
	var messageRequest = {
		content: usermsg,
		receiver:  receiver,
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
	if (chatRoomsTable.style.display == 'block' || chatRoomsTable.style.display == '') {
		chatRoomsTable.style.display = 'none';
	}
	else {
		chatRoomsTable.style.display = 'block';
	}
}

function clearLocalHistory() {
	localStorage.removeItem(STORAGE_NAME);
	localStorage.removeItem(STORAGE_USER);
	chatBoxDiv.innerHTML = '';
	console.log(getDebugMessage('History has been cleared'));
}


function hideUserSendToName() {
	receiverId.innerHTML = '';
	userSendMessageTo.style.display = 'none';
}