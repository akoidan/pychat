// html for messages
if (!("WebSocket" in window)) {
	alert("Your browser doesn't support Web socket, chat options will be unavailable. " +
	"Please use Chrome, Firefox, Safari, Internet Explorer 10+ or any modern browser.");
	throw "Browser doesn't support Web socket";
}
var CONNECTION_RETRY_TIME = 5000;

var selfHeader = '<span class="message-header-self">';
var privateHeader = '<span class="message-header-private">';
var othersHeader = '<span class="message-header-others">';
var systemHeader = '<span class="message-header-system">';
var endHeader = '</span>';
var timeDiv = '<span class="timeMess">(';
var timeDivEnd = ') </span>';
var contentStyle = '<span class="message-text-style">';
var genderIcons = {
		'Male': 'icon-man',
		'Female': 'icon-girl',
		'Alien': 'icon-anonymous',
		'Secret' : 'icon-user-secret'
	};

var destinationUserName = null;
var destinationUserId = null;

var mouseWheelEventName = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
// browser tab notification
var newMessagesCount = 0;
var isCurrentTabActive = true;
//localStorage  key
var STORAGE_NAME = 'main';
var STORAGE_USER = 'user';
var DISABLE_NAV_HEIGHT = 240;
//current top message id for detecting from what
var headerId;
//  div that contains messages
var chatBoxDiv;
var navbarList;
var chatBoxWrapper;
//sound
var chatIncoming;
var chatOutgoing;
var chatLogin;
var chatLogout;
// current username
var loggedUser;
// div for user list appending
var chatUsersTable;
// input type that contains text for sending message
var userMessage;
var sendButton;
// div that contains receiver id, icons, etc
var userSendMessageTo;
//user to send message input type text
var receiverId;
// navbar label with current user name
var userNameLabel;
var charRooms;
//main single socket for handling realtime messages
var ws;
var isWsConnected; // used for debugging info only
var chatUserRoomWrapper; // for hiddding users

window.onerror = function (msg, url, linenumber) {
	alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
	return true;
};

onDocLoad(function () {
	//	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	//		alert('you can download app');
	//}
	chatBoxDiv = $("chatbox");
	userMessage = $("usermsg");
	chatUsersTable = $("chat-user-table");
	chatUserRoomWrapper = $("chat-room-users-wrapper");
	userNameLabel = $("userNameLabel");
	userSendMessageTo = $("userSendMessageTo");
	chatIncoming = $("chatIncoming");
	chatOutgoing = $("chatOutgoing");
	chatLogin = $("chatLogin");
	chatLogout = $("chatLogout");
	sendButton = $("sendButton");
	userSendMessageTo.style.display = "none";
	receiverId = $("receiverId");
	charRooms = $("rooms");
	navbarList = $('navbarList');
	chatBoxWrapper = $('wrapper');

	chatUsersTable.addEventListener("click", userClick);
	chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp);
	// some browser don't fire keypress event for num keys so keydown instead of keypress
	chatBoxDiv.addEventListener("keydown", keyDownLoadUp);  //TODO doesn't work in chromium for div
	window.addEventListener("blur", changeTittleFunction);
	window.addEventListener("focus", changeTittleFunction);
	loadMessagesFromLocalStorage();
	console.log(getDebugMessage("Trying to resolve WebSocket Server"));
	isWsConnected = true;
	start_chat_ws();
	addTextAreaEvents();
});


function addTextAreaEvents() {
	userMessage.addEventListener('keypress', sendMessage);
	userMessage.addEventListener('input', function () {
		adjustUserMessageWidth(); // pass 1st argument as null instead of Event
	});
	var mql = window.matchMedia(
		"(min-height: " + DISABLE_NAV_HEIGHT + "px)" +
		" and (max-height: " + (DISABLE_NAV_HEIGHT * 2) + "px)"
	);
	mql.addListener(adjustUserMessageWidth);
	adjustUserMessageWidth(true);
}


function extractHeight(element) {
	var rawHeight = window.getComputedStyle(element)['height'];
	var height = parseInt(rawHeight.substr(0, rawHeight.length - 2)) ; // remove px suffix , 1 for round up
	return height;
}


function adjustUserMessageWidth(mql) {
	var bodyHeight = extractHeight(document.body);
	if (mql) { // if not an event instance
		console.log(getDebugMessage('MediaQuery with height {}px, has been triggered', bodyHeight));
		if (bodyHeight < DISABLE_NAV_HEIGHT) {
			document.querySelector('nav').style.display = 'none';
		} else {
			document.querySelector('nav').style.display = 'block';
		}
	}
	// http://stackoverflow.com/a/5346855/3872976
	userMessage.style.overflow = 'hidden'; // fix Firefox big 1 row textarea
	userMessage.style.height = 'auto';
	var textAreaHeight = userMessage.scrollHeight;
	userMessage.style.overflow = 'auto';

	var maxHeight = bodyHeight / 3;
	if (textAreaHeight > maxHeight) {
		textAreaHeight = maxHeight;
	}
	userMessage.style.height = textAreaHeight + 1 + 'px'; // 1 in case of wrong calculations

	var navH = navbarList.clientHeight;

	// 5 is some kind of magical browser paddings
	// 6 are padding + borders, 1 is top added height
	var allButChatSpaceHeight = textAreaHeight + navH + 5 + 6 +1 ;

	//console.log(getDebugMessage('bodyH {}; newH {}; textAr {}; navH {} ', bodyHeight, allButChatSpaceHeight, textAreaHeight, navH));
	chatBoxWrapper.style.height = 'calc(100% - ' + allButChatSpaceHeight + 'px)';
}


/*==================== DOM EVENTS LISTENERS ============================*/
// keyboard and mouse handlers for loadUpHistory
// Those events are removed when loadUpHistory() reaches top
function mouseWheelLoadUp(e) {
	// IE has inverted scroll,
	var isTopDirection = e.detail < 0 || e.wheelDelta > 0; // TODO check all browser event name deltaY?
	if (isTopDirection) {
		loadUpHistory(5);
	}
}


function changeTittleFunction(e) {
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


function userClick(event) {
	event = event || window.event;
	var target = event.target || event.srcElement;
	destinationUserName = target.innerHTML;
	destinationUserId = parseInt(target.attributes.name.value);
	showUserSendMess(destinationUserName);
}


function keyDownLoadUp(e) {
	if (e.which === 33) {    // page up
		loadUpHistory(15);
	} else if (e.which === 38) { // up
		loadUpHistory(3);
	} else if (e.ctrlKey && e.which === 36) {
		loadUpHistory(25);
	}
}


function sendMessage(event) {
	if (event.keyCode !== 13) {
		return;
	}
	if (!event.shiftKey) {
		// http://stackoverflow.com/questions/6014702/how-do-i-detect-shiftenter-and-generate-a-new-line-in-textarea
		// Since messages are sent by pressing enter, enter goes inside of textarea after sending
		event.preventDefault();
		var messageContent = userMessage.value;
		if (/^\s*$/.test(messageContent)) {
			return;
		}
		// anonymous is set by name, registered user is set by id.
		var messageRequest = {
			content: messageContent,
			action: 'send'
		};
		if (destinationUserId != null) {
			messageRequest['receiverId'] = destinationUserId;
		}
		if (destinationUserName != null) {
			messageRequest['receiverName'] = destinationUserName;
		}
		var sendSuccessful = sendToServer(messageRequest);
		if (sendSuccessful) {
			userMessage.value = "";
			adjustUserMessageWidth();
		}
	}
}

/* =============================================================== */

// todo delete this if no errors
//function getWidth() {
//	if (self.innerHeight) {
//		return self.innerWidth;
//	}
//
//	if (document.documentElement && document.documentElement.clientHeight) {
//		return document.documentElement.clientWidth;
//	}
//
//	if (document.body) {
//		return document.body.clientWidth;
//	}
//}

// TODO
//var timezone = getCookie('timezone');
//if (timezone == null) {
//	setCookie("timezone", jstz.determine().name());
//}

//// add var if doesnt work fixme
//function loadMessagesFromLocalStorage(jsonData) {
//	if (jsonData != null) {
//		var parsedData = JSON.parse(jsonData);
//		// don't make sound on loadHistory
//		var savedSoundStatus = sound;
//		sound = 0;
//		for (var i = 0; i < parsedData.length; i++) {
//			handlePreparedWSMessage(parsedData[i]);
//		}
//		sound = savedSoundStatus;
//	}
//}
//
//
//// duplicate this? fixme
//function loadMessagesFromLocalStorageWebWorker() {
//	onmessage = function(e) {
//    loadMessagesFromLocalStorage(e);
//	};
//}
//
//
//function loadLocalStorage() {
//	loggedUser = localStorage.getItem(STORAGE_USER);
//	var jsonData = localStorage.getItem(STORAGE_NAME);
//	if (true) { //len(jsonData) > 1000
//		// Build a worker from an anonymous function body
//		// JSON.load huge localStorage string in background for responsive interface
//		// http://stackoverflow.com/a/19201292/3872976
//		var blobURL = URL.createObjectURL(new Blob(['(',
//			loadMessagesFromLocalStorageWebWorker.toString(),
//			')()'], {type: 'application/javascript'}));
//
//		var worker = new Worker(blobURL);
//		worker.postMessage(jsonData);
//
//		// Won't be needing this anymore
//		URL.revokeObjectURL(blobURL);
//	}
//}


function loadMessagesFromLocalStorage() {
	loggedUser = localStorage.getItem(STORAGE_USER);
	var jsonData = localStorage.getItem(STORAGE_NAME);
	if (jsonData != null) {
		var parsedData = JSON.parse(jsonData);
		console.log(getDebugMessage('Loading {} messages from localstorage', parsedData.length));
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
	ws = new WebSocket(readCookie('api'));
	ws.onmessage = webSocketMessage;
	ws.onclose = function () {
		if (isWsConnected) {
			console.error(getDebugMessage(
				"Connection to WebSocket has failed, trying to reconnect every {}ms",
				 CONNECTION_RETRY_TIME));
			isWsConnected = false;
		}
		// Try to reconnect in 5 seconds
		setTimeout(function () {
			start_chat_ws()
		}, CONNECTION_RETRY_TIME);
	};
	ws.onopen = function () {
		isWsConnected = true;
		console.log(getDebugMessage("Connection to WebSocket established"));
	}
}


function encodeHTML(html) {
	var innerHTML = document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
	return innerHTML.replace(/\n/g, '<br>');
}


// TODO threadid
function loadUsers(usernames) {
	if (!usernames) {
		return;
	}
	console.log(getDebugMessage("Load user names: {}", Object.keys(usernames)));
	var allUsers = '';
	var icon;
	for (var username in usernames) {
		if (usernames.hasOwnProperty(username)) {
			var gender = usernames[username].sex;
			var userId = usernames[username].id;
			if (userId == 0) {
				icon = '<i class="'+ genderIcons[gender] +'"></i>';
			} else {
				icon = '<a class="' + genderIcons[gender] + '" href="/profile/' + userId + '"></a>';
			}
			if (icon == null) {
				console.log(getDebugMessage('Bug, gender: {}, icon: {}', gender, icon))
			}
			allUsers += '<tr><td>' + icon + '</td> <td name="' + userId + '">' + username + '</td><tr>';
		}
	}
	chatUsersTable.innerHTML = allUsers;
}


// Used by {@link loadUsers}
function showUserSendMess(username) {

	// Empty sets display to none
	userSendMessageTo.style.display = "inline-block";
	receiverId.innerHTML = username;
}


function displayPreparedMessage(headerStyle, time, htmlEncodedContent, displayedUsername, isTopDirection) {

	var messageHeader = headerStyle + timeDiv + time + timeDivEnd + displayedUsername + '</b>: ' + endHeader;
	var messageContent = contentStyle + htmlEncodedContent + endHeader;
	var message = '<p>' + messageHeader + messageContent + "</p>";
	if (!isCurrentTabActive) {
		newMessagesCount++;
		document.title = newMessagesCount + " new message";
	}
	if (isTopDirection) {
		chatBoxDiv.insertAdjacentHTML('afterbegin', message);
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
	var receiver = data['receiverName']; // TODO
	var displayedUsername = data['user'];
	//private message
	if (receiver != null) {
		headerStyle = privateHeader;
		if (receiver !== loggedUser) {
			displayedUsername = receiver;
			headerStyle += '>>'
		}
		// public message
	} else if (data['user'] === loggedUser) {
		headerStyle = selfHeader;
	} else {
		headerStyle = othersHeader;
	}
	var preparedHtml = encodeHTML(data['content']);
	displayPreparedMessage(headerStyle, data['time'], preparedHtml, displayedUsername, isTopDirection);
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
		} else if (data['anonymous']) {
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
		chatBoxDiv.removeEventListener(mouseWheelEventName, mouseWheelLoadUp);
		chatBoxDiv.removeEventListener("keydown", keyDownLoadUp);
		return;
	}
	var firstMessage = message[message.length - 1];
	headerId = firstMessage.id;

	message.forEach(function (message) {
		printMessage(message, true);
	});
}


function fastAddToStorage(text) {
	var storageData = localStorage.getItem(STORAGE_NAME);
	var newStorageData;
	if (storageData) {
		// insert new text before "]" symbol and add it manually
		var copyUntil = storageData.length-1;
		newStorageData = storageData.substr(0, copyUntil) +',' + text + ']';
	} else {
		newStorageData = '[' + text + ']';
	}
	localStorage.setItem(STORAGE_NAME, newStorageData);
}


// Use both json and object repr for less JSON actions
function saveMessageToStorage(objectItem, jsonItem) {
	switch (objectItem['action']) {
		case 'me':
			localStorage.setItem(STORAGE_USER, objectItem['content']);
			break;
		case 'joined':
		case 'changed':
		case 'left':
			delete objectItem['content']; // don't store usernames in db
			jsonItem = JSON.stringify(objectItem);
		case 'system': // continue from 3 top events:
		case 'messages':
		case 'send':
			fastAddToStorage(jsonItem);
			break;
		default:
			console.log(getDebugMessage("Skipping saving message {}", jsonItem)); // TODO stringtrify?)))
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
			printMessage(data, false);
			if (loggedUser === data['user']) {
				checkAndPlay(chatOutgoing);
			} else {
				checkAndPlay(chatIncoming);
			}
			break;
		case 'rooms':
			setupChannels(data['content']);
			break;
		default:
			console.error(getDebugMessage('Unknown message type  {}', JSON.stringify(data)));
	}
}

function setupChannels(channels) {
	var text = '<ul>';
	for (var key in channels) {
		if (channels.hasOwnProperty(key)) {
			text += '<li name="' + key + '">' + channels[key] + '</li>';
		}
	}
	text+='</ul>';
	charRooms.innerHTML = text;
}

function webSocketMessage(message) {
	var jsonData = message.data;
	console.log(getDebugMessage("WS in: {}", jsonData));
	var data = JSON.parse(jsonData);

	handlePreparedWSMessage(data);

	//cache some messages to localStorage save only after handle, in case of errors +  it changes the message,
	saveMessageToStorage(data, jsonData);
}


function sendToServer(messageRequest) {
	var jsonRequest = JSON.stringify(messageRequest);
	if (ws.readyState != WebSocket.OPEN) {
		console.warn(getDebugMessage("Web socket is closed. Can't send {}", jsonRequest));
		return false;
	} else {
		console.log(getDebugMessage("WS out: {} ", jsonRequest));
		ws.send(jsonRequest);
		return true;
	}
}


function loadUpHistory(count) {
	if (chatBoxDiv.scrollTop === 0) {
		var getMessageRequest = {
			headerId: headerId,
			count: count,
			action: 'messages'
		};
		sendToServer(getMessageRequest);
	}
}


function toggleRoom() {
	if (chatUserRoomWrapper.style.display == 'none' ) {
		chatUserRoomWrapper.style.display = 'block';
	} else {
		chatUserRoomWrapper.style.display = 'none';
	}
}


// OH man be carefull with this method, it should reinit history
function clearLocalHistory() {
	headerId = null;
	localStorage.removeItem(STORAGE_NAME);
	localStorage.removeItem(STORAGE_USER);
	chatBoxDiv.innerHTML = '';
	chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp); //
	chatBoxDiv.addEventListener("keydown", keyDownLoadUp);
	console.log(getDebugMessage('History has been cleared'));
}


function hideUserSendToName() {
	destinationUserId = null;
	destinationUserName = null;
	userSendMessageTo.style.display = 'none';
}