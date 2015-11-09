// html for messages
if (!("WebSocket" in window)) {
	alert("Your browser doesn't support Web socket, chat options will be unavailable. " +
	"Please use Chrome, Firefox, Safari, Internet Explorer 10+ or any modern browser.");
	throw "Browser doesn't support Web socket";
}
const CONNECTION_RETRY_TIME = 5000;

const SMILEY_URL = '/static/smileys/';

const selfHeaderClass = 'message-header-self';
const privateHeaderClass = 'message-header-private';
const systemHeaderClass = 'message-header-system';
const othersHeaderClass = 'message-header-others';
const timeSpanClass = 'timeMess';
const userNameClass = 'user';
const contentStyleClass = 'message-text-style';

const SYSTEM_USERNAME = 'System';

const genderIcons = {
	'Male': 'icon-man',
	'Female': 'icon-girl',
	'Alien': 'icon-anonymous',
	'Secret': 'icon-user-secret'
};
const escapeMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

var smileyPattern = /:\S+:/g;

var destinationUserName = null;
var destinationUserId = null;

var mouseWheelEventName = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
// browser tab notification
var newMessagesCount = 0;
var isCurrentTabActive = true;
//localStorage  key
const STORAGE_NAME = 'main';
const STORAGE_USER = 'user';
const DISABLE_NAV_HEIGHT = 240;
//current top message id for detecting from what
var headerId;
//  div that contains messages
var chatBoxDiv;
var navbarList;
var navbar;
var smileToogler;
var chatBoxWrapper;
var smileParentHolder;
var smileyDict = {};
var tabNames = [];
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

//All <p> ids (every id is UTC millis). this helps to prevent duplications, and detect position
var allMessages = [];

//
//window.onerror = function (msg, url, linenumber) {
//	alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
//	return true;
//};

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
	smileParentHolder =  $('smileParentHolder');
	navbar = document.querySelector('nav');
	receiverId = $("receiverId");
	charRooms = $("rooms");
	navbarList = $('navbarList');
	chatBoxWrapper = $('wrapper');
	smileToogler = $('smileToogler');
	hideElement(userSendMessageTo);
	hideElement(smileParentHolder);
	addSmileysEvents();
	chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp);
	// some browser don't fire keypress event for num keys so keydown instead of keypress
	chatBoxDiv.addEventListener("keydown", keyDownLoadUp);  //TODO doesn't work in chromium for div
	window.addEventListener("blur", changeTittleFunction);
	window.addEventListener("focus", changeTittleFunction);
	$('tabNames').addEventListener('click', showTabByName);
	console.log(getDebugMessage("Trying to resolve WebSocket Server"));
	isWsConnected = true;
	start_chat_ws();
	addTextAreaEvents();
	//bottom call loadMessagesFromLocalStorage(); s
	doGet(SMILEY_URL + 'info.json', loadSmileys);
});


function addSmileysEvents() {
	document.addEventListener("click", function (event) {
		event = event || window.event;
		var level = 0;
		for (var element = event.target; element; element = element.parentNode) {
			if (element.id === "bottomWrapper" || element.id === smileParentHolder.id) {
				userMessage.focus();
				return;
			}
			level++;
		}
		hideElement(smileParentHolder);
	});
	smileToogler.addEventListener('click', function (event) {
		event.stopPropagation(); // prevent top event
		toogleVisibility(smileParentHolder);
	});
}

function showTabByName(event) {
	if (event.target != null) {
		if (event.target.tagName !== 'LI') {
			// outer scope click
			return;
		}
	}
	var tagName = event.target == null ? event : event.target.innerHTML;
	for (var i = 0; i < tabNames.length; i++) {
		hideElement($("tab-"+tabNames[i])); // loadSmileys currentSmileyHolderId
		showElement($("tab-name-"+tabNames[i]), 'activeTab');
	}
	showElement($("tab-" + tagName));
	hideElement($("tab-name-" + tagName), 'activeTab');
}

// TODO refactor this, it's hard to read
function loadSmileys(jsonData) {
	var smileyData = JSON.parse(jsonData);
	var index = 0;
	for (var tab in smileyData) {
		if (smileyData.hasOwnProperty(tab)) {
			var tabRef = document.createElement('div');
			tabRef.setAttribute("name", tab);
			var tabName = document.createElement("LI");
			tabName.setAttribute("id", "tab-name-" + tab);
			var textNode = document.createTextNode(tab);
			tabName.appendChild(textNode);
			$("tabNames").appendChild(tabName);
			var currentSmileyHolderId = "tab-" + tab;
			tabRef.setAttribute("id", currentSmileyHolderId);
			tabNames.push(tab);
			smileParentHolder.appendChild(tabRef);

			var tabSmileys = smileyData[tab];
			for (var smile in tabSmileys) {
				if (tabSmileys.hasOwnProperty(smile)) {
					var fileRef = document.createElement('IMG');
					var fullSmileyUrl = SMILEY_URL + tab + '/' + tabSmileys[smile];
					fileRef.setAttribute("src", fullSmileyUrl);
					fileRef.setAttribute("alt", smile);
					 tabRef.appendChild(fileRef);
					// http://stackoverflow.com/a/1750860/3872976
					/** encode dict key, so {@link encodeSmileys} could parse smileys after encoding */
					smileyDict[encodeHTML(smile)] = fileRef.outerHTML;
				}
			}
		}
	}

	showTabByName(Object.keys(smileyData)[0]);

	loadMessagesFromLocalStorage();
}


function addSmile(event) {
	event = event || window.event;
	var smileImg = event.target;
	if (smileImg.tagName !== 'IMG') {
		return;
	}
	userMessage.value += smileImg.alt;
	console.log(getDebugMessage('Added smile "{}"', smileImg.alt));
	adjustUserMessageWidth();
}


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
			hideElement(navbar);
		} else {
			showElement(navbar);
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
	// 8 are padding + borders, 1 is top added height
	var allButChatSpaceHeight = textAreaHeight + navH + 5 + 8 +1 ;

	//console.log(getDebugMessage('bodyH {}; newH {}; textAr {}; navH {} ',
	// bodyHeight, allButChatSpaceHeight, textAreaHeight, navH));
	chatBoxWrapper.style.height = 'calc(100% - ' + allButChatSpaceHeight + 'px)';
	smileParentHolder.style.bottom = textAreaHeight + 14 + 'px';
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
	showElement(userSendMessageTo);
	// Empty sets display to none
	receiverId.innerHTML = destinationUserName;
	userMessage.focus();
	if (target.attributes.name != null) {
		// icon click
		destinationUserId = parseInt(target.attributes.name.value);
	}
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
	return html.replace(/[&<>"']/g, function (s) {
		return escapeMap[s];
	});
}

function encodeSmileys(html) {

	html = encodeHTML(html);
	html = html.replace(/\n/g, '<br>');
	html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
	for (var el in smileyDict) {
		if (smileyDict.hasOwnProperty(el)) {
			// replace all occurences
			// instead of replace that could generates infinitive loop
			html = html.split(el).join(smileyDict[el]);
		}
	}
	return html;
}


function getUserUrl(userId) {
	return getText('/profile/{}', userId);
}


function loadUsers(usernames) {
	if (!usernames) {
		return;
	}
	console.log(getDebugMessage("Load user names: {}", Object.keys(usernames)));
	chatUsersTable.innerHTML = '';
	var tbody = document.createElement('tbody');
	chatUsersTable.appendChild(tbody);
	for (var username in usernames) {
		if (usernames.hasOwnProperty(username)) {
			var icon;
			var gender = usernames[username].sex;
			var userId = usernames[username].userId;
			if (userId == 0) {
				icon = document.createElement('i');
			} else {
				icon = document.createElement('a');
				icon.setAttribute('target', '_blank');
				icon.setAttribute('href', getUserUrl(userId));
			}
			icon.className = genderIcons[gender];
			var tr = document.createElement('tr');
			var tdIcon = document.createElement('td');
			tdIcon.appendChild(icon);

			var tdUser = document.createElement('td');
			tdUser.setAttribute('name', userId);
			tdUser.className = userNameClass;
			tdUser.innerHTML = username;
			tdUser.onclick = userClick;
			tr.appendChild(tdIcon);
			tr.appendChild(tdUser);

			tbody.appendChild(tr);
		}
	}
}


function getPosition(time) {
	var lastTime = 0;
	var arrayEl;
	for (var i = 0; i < allMessages.length; i++) {
		arrayEl = allMessages[i];
		if (time == arrayEl) {
			throw "Already in list";
		}
		if (time < arrayEl) {
			allMessages.splice(i, 0, time);
			return arrayEl;
		}
	}
	return null;
}


function createMessageNode(timeMillis, headerStyle, displayedUsername, htmlEncodedContent, isPrefix, userId) {
	var date = new Date(timeMillis);
	var time =  sliceZero(date.getHours())+":"+sliceZero(date.getMinutes())+":"+sliceZero(date.getSeconds());

	var p = document.createElement('p');
	p.setAttribute("id", timeMillis);

	var headSpan = document.createElement('span');
	headSpan.className = headerStyle; // note it's not appending classes, it sets all classes to specified
	var timeSpan = document.createElement('span');
	timeSpan.className = timeSpanClass;
	timeSpan.innerHTML = getText('({})', time);
	headSpan.appendChild(timeSpan);

	var userNameA = document.createElement('span');
	userNameA.innerHTML = displayedUsername;
	if (displayedUsername != SYSTEM_USERNAME) {
		userNameA.className = userNameClass;
		userNameA.onclick = userClick;
	}
	if (userId != null) {
		userNameA.setAttribute('name', userId);
	}
	headSpan.insertAdjacentHTML('beforeend', ' ');
	headSpan.appendChild(userNameA);
	var userSuffix;
	if (!isPrefix) {
		 userSuffix = ': ';
	} else  {
		 userSuffix = ' >> ';
	}
	headSpan.insertAdjacentHTML('beforeend', userSuffix);

	var textSpan = document.createElement('span');
	textSpan.className = contentStyleClass;
	textSpan.innerHTML = htmlEncodedContent;

	p.appendChild(headSpan);
	p.appendChild(textSpan);
	return p;
}


function displayPreparedMessage(headerStyle, timeMillis, htmlEncodedContent, displayedUsername, isPrefix, receiverId) {
	var pos = null;

	if (allMessages.length > 0 && !(timeMillis > allMessages[allMessages.length-1])) {
		try {
			pos = getPosition(timeMillis);
		} catch (err) {
			console.warn(getDebugMessage("Skipping duplicate message, time: {}, content: <<<{}>>> ",
				timeMillis, htmlEncodedContent));
			return;
		}
	} else {
		allMessages.push(timeMillis);
	}

	var p = createMessageNode(timeMillis, headerStyle, displayedUsername, htmlEncodedContent, isPrefix, receiverId);
	// every message has UTC millis ID so we can detect if message is already displayed or position to display

	if (!isCurrentTabActive) {
		newMessagesCount++;
		document.title = newMessagesCount + " new messages";
	}
	if (pos != null) {
		chatBoxDiv.insertBefore(p , $(pos));
	} else {
		var oldscrollHeight = chatBoxDiv.scrollHeight;
		chatBoxDiv.appendChild(p);
		var newscrollHeight = chatBoxDiv.scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			chatBoxDiv.scrollTop = newscrollHeight;
		}
	}
}


function printMessage(data) {
	var headerStyle;
	var receiverName = data['receiverName'];
	var receiverId = data['receiverId'];
	var displayedUsername = data['user'];
	//private message
	var prefix = false;
	if (receiverName != null) {
		headerStyle = privateHeaderClass;
		if (receiverName !== loggedUser) {
			displayedUsername = receiverName;
			prefix = true;
		}
		// public message
	} else if (data['user'] === loggedUser) {
		headerStyle = selfHeaderClass;
	} else {
		headerStyle = othersHeaderClass;
	}
	var preparedHtml = encodeSmileys(data['content']);
	displayPreparedMessage(headerStyle, data['time'], preparedHtml, displayedUsername, prefix, receiverId);
}


function printRefreshUserNameToChat(data) {
	var message;
	var action = data['action'];
	if (action === 'changed') {
		// if userName label already changed or still
		if (data['oldName'] == loggedUser || data['user'] == loggedUser) {
			message = getText('You have changed nickname to <b>{}</b> ', data['user']);
		} else {
			message = getText('Anonymous <b>{}</b> has changed nickname to <b>{}</b> ', data['oldName'], data['user']) ;
		}
	} else if (action !== 'onlineUsers') {
		if (data['user'] == loggedUser) {
			message = 'You have ' + action + ' the chat';
		} else {
			var who;
			if (data['anonymous']) {
				who = 'Anonymous';
			} else {
				who = 'User';
			}
			message = getText('{} <b>{}</b> has {} the chat.', who, data['user'], action);
		}
		if (action === 'joined') {
			checkAndPlay(chatLogin);
		} else if (action === 'left') {
			checkAndPlay(chatLogout);
		}
	} else {
		return;
	}


	displayPreparedMessage(systemHeaderClass, data['time'], message, SYSTEM_USERNAME);

}


function setUsername(data) {
	console.log(getDebugMessage("UserName has been set to {}", data['content']));
	loggedUser = data['content'];
	userNameLabel.innerHTML = loggedUser;
}


function handleGetMessages(message) {
	console.log(getDebugMessage('appending messages to top'));

	// This check should fire only once,
	// because requests aren't being sent when there are no event for them, thus no responses
	if (message.length === 0) {
		console.log(getDebugMessage('Requesting messages has reached the top, removing loadUpHistoryEvent handlers'));
		chatBoxDiv.removeEventListener(mouseWheelEventName, mouseWheelLoadUp);
		chatBoxDiv.removeEventListener("keydown", keyDownLoadUp);
		return;
	}
	var firstMessage = message[message.length - 1];
	headerId = firstMessage.id;

	message.forEach(function (message) {
		printMessage(message);
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
		case 'onlineUsers':
		case 'changed':
			printRefreshUserNameToChat(data);
			loadUsers(data['content']);
			break;
		case 'me':
			setUsername(data);
			break;
		case 'system':
			displayPreparedMessage(systemHeaderClass, data['time'], data['content'], SYSTEM_USERNAME);
			break;
		case 'send':
			printMessage(data);
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
	charRooms.innerHTML = '';
	var ul = document.createElement('ul');
	for (var key in channels) {
		if (channels.hasOwnProperty(key)) {
			var li = document.createElement('li');
			li.setAttribute('name', key);
			li.innerHTML = channels[key];
			ul.appendChild(li);
		}
	}
	charRooms.appendChild(ul);
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


// OH man be carefull with this method, it should reinit history
function clearLocalHistory() {
	headerId = null;
	localStorage.removeItem(STORAGE_NAME);
	localStorage.removeItem(STORAGE_USER);
	chatBoxDiv.innerHTML = '';
	allMessages = [];
	chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp); //
	chatBoxDiv.addEventListener("keydown", keyDownLoadUp);
	console.log(getDebugMessage('History has been cleared'));
}


function hideUserSendToName() {
	destinationUserId = null;
	destinationUserName = null;
	hideElement(userSendMessageTo);
}