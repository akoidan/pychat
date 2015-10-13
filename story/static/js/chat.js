// html for messages
console.log('js is loaded');

if (!("WebSocket" in window)) {
	alert("Your browser doesn't support Web socket, chat options will be unavailable. " +
		"Please use Chrome, Firefox, Safari, Internet Explorer 10+ or any modern browser.");
	throw "Browser doesn't support Web socket";
}
var CONNECTION_RETRY_TIME = 5000;

var SMILEY_URL = '/static/smileys/';

const selfHeader = 'message-header-self';
const privateHeader = 'message-header-private';
const othersHeader = 'message-header-others';
const systemHeader = 'message-header-system';

var genderIcons = {
	'Male': 'icon-man',
	'Female': 'icon-girl',
	'Alien': 'icon-anonymous',
	'Secret': 'icon-user-secret'
};

var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
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


var controllers = {};
controllers.MessagesController = function ($scope) {
	$scope.cngMessages = [];
	$scope.users = [];
	$scope.rooms = [];
	$scope.smileysTabs = [];
	start_chat_ws();

	init();

	$scope.clearLocalHistory = function () { // TODO doesn;t work
		console.log("clearing history");
		headerId = null;
		localStorage.removeItem(STORAGE_NAME);
		localStorage.removeItem(STORAGE_USER);
		$scope.users = [];
		$scope.$apply();
		chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp); //
		chatBoxDiv.addEventListener("keydown", keyDownLoadUp);
		console.log(getDebugMessage('History has been cleared'));
	};

	function init() {
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
		smileParentHolder = $('smileParentHolder');
		navbar = document.querySelector('nav');
		receiverId = $("receiverId");
		charRooms = $("rooms");
		navbarList = $('navbarList');
		chatBoxWrapper = $('wrapper');
		smileToogler = $('smileToogler');
		$scope.userSendMessageToIsHidden = true;
		$scope.smileParentHolderIsHidden = true;
		addSmileysEvents();
		userMessage.addEventListener("keypress", sendMessage);
		chatUsersTable.addEventListener("click", userClick);
		chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp);
		// some browser don't fire keypress event for num keys so keydown instead of keypress
		chatBoxDiv.addEventListener("keydown", keyDownLoadUp);  //TODO doesn't work in chromium for div
		window.addEventListener("blur", changeTittleFunction);
		window.addEventListener("focus", changeTittleFunction);
		$('tabNames').addEventListener('click', showTabByName);
		console.log(getDebugMessage("Trying to resolve WebSocket Server"));
		isWsConnected = true;
		addTextAreaEvents();
		//bottom call loadMessagesFromLocalStorage(); s
		doGet(SMILEY_URL + 'info.json', loadSmileys);
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

	function webSocketMessage(message) {
		var jsonData = message.data;
		console.log(getDebugMessage("WS in: {}", jsonData));
		var data = JSON.parse(jsonData);

		handlePreparedWSMessage(data);

		//cache some messages to localStorage save only after handle, in case of errors +  it changes the message,
		saveMessageToStorage(data, jsonData);
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


	function displayPreparedMessage(headerStyle, time, htmlEncodedContent, displayedUsername, isTopDirection, apply, raw) {
		if (apply == null) {
			apply = true;
		}
		if (raw == null) {
			raw = false;
		}
		if (isTopDirection == null) {
			isTopDirection = false;
		}
		var newMessage = {};
		newMessage.headerClass = headerStyle;
		newMessage.sender = displayedUsername;
		newMessage.text =  htmlEncodedContent;
		newMessage.raw =  raw;
		newMessage.time =  time;

		if (!isCurrentTabActive) {
			newMessagesCount++;
			document.title = newMessagesCount + " new message";
		}

		$scope.cngMessages.push(newMessage);
		$scope.$apply();
		chatBoxDiv.scrollTop = chatBoxDiv.scrollHeight;

	}


	function printMessage(data) {
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
		displayPreparedMessage(headerStyle, data['time'], data['content'], displayedUsername);
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
		displayPreparedMessage(systemHeader, data['time'], message, 'System', false, true, true);
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
			printMessage(message);
		});
	}


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

	// TODO refactor this, it's hard to read
	function loadSmileys(jsonData) {
		//var smileyData = JSON.parse(jsonData);
		//for (var tab in smileyData) {
		//	if (smileyData.hasOwnProperty(tab)) {
		//		var smileysTab = {};
		//		smileysTab.id = "tab-"+tab;
		//		smileysTab.nameId = "tab-name-"+tab;
		//		smileysTab.name = tab;
		//		tabNames.push(tab);
		//		smileysTab.smileys = [];
		//		var tabSmileys = smileyData[tab];
		//		for (var smile in tabSmileys) {
		//			if (tabSmileys.hasOwnProperty(smile)) {
		//				var smiley = {};
		//				smiley.src  = SMILEY_URL + tab + '/' + tabSmileys[smile];
		//				smiley.alt = smile;
		//				smileysTab.smileys.push(smiley);
		//				// http://stackoverflow.com/a/1750860/3872976
		//				/** encode dict key, so angular smileys filter could parse smileys after encoding */
		//				// TODO remove hardcoded img
		//				smileyDict[encodeHTML(smile)] = '<img src="' + smiley.src + '" alt="' + smiley.alt + '"/>';
		//			}
		//		}
		//		$scope.smileysTabs.push(smileysTab);
		//	}
		//}
		//$scope.$apply();
		//// object is not created but needs to be shown
		// showTabByName(Object.keys(smileyData)[0]);
		//
		//loadMessagesFromLocalStorage();
	}

	// TODO threadid
	function loadUsers(usernames) {
		if (!usernames) {
			return;
		}
		$scope.users = []; // clear old userlist
		for (var name in usernames) {
			if (usernames.hasOwnProperty(name)) {
				var newUser = {};
				newUser.name = name;
				newUser.id = usernames[name].id;
				newUser.icon = genderIcons[usernames[name].sex];
				if (newUser.id != 0) {
					newUser.link = '/profile/' + newUser.id;
				}
				$scope.users.push(newUser);
			}
		}
		console.log(getDebugMessage("Load user names: {}", Object.keys(usernames)));
		$scope.$apply();
	}

	function setupChannels(channels) {
		$scope.rooms = [];
		for (var key in channels) {
			if (channels.hasOwnProperty(key)) {
				var newRoom = {};
				newRoom.id = key;
				newRoom.name = channels[key];
				$scope.rooms.push(newRoom);
			}
		}
		$scope.$apply(); // is not needed
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

};


angular.module('chat').controller(controllers);

function encodeHTML(html) {
	return html.replace(/[&<>"']/g, function (s) {
		return entityMap[s];
	});
}


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
		hideElement($("tab-" + tabNames[i])); // hide smileys
		showElement($("tab-name-" + tabNames[i]), 'activeTab'); // remove highlight
	}
	showElement($("tab-" + tagName)); // show smileys
	hideElement($("tab-name-" + tagName), 'activeTab'); // hightlight active tab
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
	var height = parseInt(rawHeight.substr(0, rawHeight.length - 2)); // remove px suffix , 1 for round up
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
	var allButChatSpaceHeight = textAreaHeight + navH + 5 + 8 + 1;

	//console.log(getDebugMessage('bodyH {}; newH {}; textAr {}; navH {} ', bodyHeight, allButChatSpaceHeight, textAreaHeight, navH));
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
	if (target.attributes.name != null) {
		// icon click
		destinationUserId = parseInt(target.attributes.name.value);
		showUserSendMess(destinationUserName);
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


// Used by {@link loadUsers}
function showUserSendMess(username) {
	showElement(userSendMessageTo);
	// Empty sets display to none

	//userSendMessageTo.style.display = "inline-block";
	receiverId.innerHTML = username;
}


function fastAddToStorage(text) {
	var storageData = localStorage.getItem(STORAGE_NAME);
	var newStorageData;
	if (storageData) {
		// insert new text before "]" symbol and add it manually
		var copyUntil = storageData.length - 1;
		newStorageData = storageData.substr(0, copyUntil) + ',' + text + ']';
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


function hideUserSendToName() {
	destinationUserId = null;
	destinationUserName = null;
	hideElement(userSendMessageTo);
}