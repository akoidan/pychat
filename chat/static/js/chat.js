// html for messages
if (!("WebSocket" in window)) {
	alert("Your browser doesn't support Web socket, chat options will be unavailable. " +
	"Please use Chrome, Firefox, Safari, Internet Explorer 10+ or any modern browser.");
	throw "Browser doesn't support Web socket";
}
const CONNECTION_RETRY_TIME = 5000;

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

var imgRegex = /<img[^>]*alt="([^"]+)"[^>]*>/g;
var timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;

var destinationUserName = null;
var destinationUserId = null;

var lastLoadUpHistoryRequest = 0;
var mouseWheelEventName = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
// browser tab notification
var newMessagesCount = 0;
var isCurrentTabActive = true;
//localStorage  key
const STORAGE_NAME = 'main';
const STORAGE_USER = 'user';
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
var chatUsersTable;
// input type that contains text for sending message
var userMessage;
// div that contains receiver id, icons, etc
var userSendMessageTo;
//user to send message input type text
var receiverId;
// navbar label with current user name
var userNameLabel;
var charRooms;
//main single socket for handling realtime messages
var ws;
var wsState = 0; // 0 - not inited, 1 - tried to connect but failed; 9 - connected;
var sessionWasntUpdated = true; // 0 - not inited, 1 - tried to connect but failed; 9 - connected;
var chatUserRoomWrapper; // for hiddding users

//All <p> ids (every id is UTC millis). this helps to prevent duplications, and detect position
var allMessages = [];
var allMessagesDates = [];
var onlineUsers = {};
var webRtcApi;
var smileyUtil;

var isFirefox = window.browserVersion.indexOf('Firefox') >= 0;
if (isFirefox) {
	RTCSessionDescription = mozRTCSessionDescription;
	RTCIceCandidate = mozRTCIceCandidate;
}

onDocLoad(function () {
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
	receiverId = $("receiverId");
	charRooms = $("rooms");
	chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp);
	// some browser don't fire keypress event for num keys so keydown instead of keypress
	window.addEventListener("blur", changeTittleFunction);
	window.addEventListener("focus", changeTittleFunction);
	console.log(getDebugMessage("Trying to resolve WebSocket Server"));
	start_chat_ws();
	//bottom call loadMessagesFromLocalStorage(); s
	showHelp();
	userMessage.focus();
	new Draggable($('callContainer'), $('callContainerHeader'));
	webRtcApi = new WebRtcApi();
	smileyUtil = new SmileyUtil();
	smileyUtil.init();
});


function showHelp() {
	growlInfo(infoMessages[Math.floor(Math.random() * infoMessages.length)]);
}


var SmileyUtil = function () {
	var self = this;
	self.dom = {
		smileParentHolder : $('smileParentHolder')
	};
	self.tabNames = [];
	self.smileyDict = {};
	self.init = function () {
		document.addEventListener("click", self.onDocClick);
		doGet(SMILEYS_JSON_URL, self.loadSmileys);
	};
	self.hideSmileys = function() {
		CssUtils.hideElement(self.dom.smileParentHolder);
	};
	self.onDocClick = function (event) {
		event = event || window.event;
		for (var element = event.target; element; element = element.parentNode) {
			if (element.id === "bottomWrapper" || element.id === self.dom.smileParentHolder.id) {
				userMessage.focus();
				return;
			}
		}
		self.hideSmileys();
	};
	self.addSmile = function (event) {
		event = event || window.event;
		var smileImg = event.target;
		if (smileImg.tagName !== 'IMG') {
			return;
		}
		userMessage.innerHTML += smileImg.outerHTML;
		console.log(getDebugMessage('Added smile "{}"', smileImg.alt));
	};
	self.encodeSmileys = function (html) {
		html = encodeAnchorsHTML(html);
		for (var el in self.smileyDict) {
			if (self.smileyDict.hasOwnProperty(el)) {
				// replace all occurences
				// instead of replace that could generates infinitive loop
				html = html.split(el).join(self.smileyDict[el]);
			}
		}
		return html;
	};
	self.toggleSmileys = function (event) {
		event.stopPropagation(); // prevent top event
		CssUtils.toggleVisibility(self.dom.smileParentHolder);
		userMessage.focus();
	};
	self.showTabByName = function (event) {
		if (event.target != null) {
			if (event.target.tagName !== 'LI') {
				// outer scope click
				return;
			}
		}
		var tagName = event.target == null ? event : event.target.innerHTML;
		for (var i = 0; i < self.tabNames.length; i++) {
			CssUtils.hideElement($("tab-" + self.tabNames[i])); // loadSmileys currentSmileyHolderId
			CssUtils.removeClass($("tab-name-" + self.tabNames[i]), 'activeTab');
		}
		CssUtils.showElement($("tab-" + tagName));
		CssUtils.addClass($("tab-name-" + tagName), 'activeTab');
	};

	self.loadSmileys = function (jsonData) {
		var smileyData = JSON.parse(jsonData);
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
				self.tabNames.push(tab);
				self.dom.smileParentHolder.appendChild(tabRef);

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
						self.smileyDict[encodeHTML(smile)] = fileRef.outerHTML;
					}
				}
			}
		}
		self.showTabByName(Object.keys(smileyData)[0]);
		loadMessagesFromLocalStorage(); /*Smileys should be encoded by time message load, otherwise they don't display*/
	}
};


/*==================== DOM EVENTS LISTENERS ============================*/
// keyboard and mouse handlers for loadUpHistory
// Those events are removed when loadUpHistory() reaches top
function mouseWheelLoadUp(e) {
	// IE has inverted scroll,
	var isTopDirection = e.detail < 0 || e.wheelDelta > 0; // TODO check all browser event name deltaY?
	if (isTopDirection) {
		loadUpHistory(10);
	}
}


function changeTittleFunction(e) {
	switch (e.type) {
		case "focus":
			// do work
			isCurrentTabActive = true;
			newMessagesCount = 0;
			document.title = 'PyChat';
			break;
		case "blur":
			isCurrentTabActive = false;
	}
}


function userClick(event) {
	event = event || window.event;
	var target = event.target || event.srcElement;
	destinationUserName = target.innerHTML;
	CssUtils.showElement(userSendMessageTo);
	// Empty sets display to none
	receiverId.textContent = destinationUserName;
	userMessage.focus();
	if (target.attributes.name != null) {
		// icon click
		destinationUserId = parseInt(target.attributes.name.value);
	}
}


function timeMessageClick(event) {
	var value = userMessage.innerHTML;
	var match = value.match(timePattern);
	var oldText = match ? value.substr(match[0].length) : value;
	userMessage.innerHTML = getText('{}>>> {}', event.target.parentElement.parentElement.textContent,  oldText);
	userMessage.focus();
}


function keyDownLoadUp(e) {
	if (e.which === 33) {    // page up
		loadUpHistory(25);
	} else if (e.which === 38) { // up
		loadUpHistory(10);
	} else if (e.ctrlKey && e.which === 36) {
		loadUpHistory(35);
	}
}


function sendMessage(messageContent) {
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
		userMessage.innerHTML = "";
	} else {
		growlError("Can't send message, because connection is lost :(")
	}
}


function checkAndSendMessage(event) {
	if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
		event.preventDefault();
		userMessage.innerHTML = userMessage.innerHTML.replace(imgRegex, "$1");
		var messageContent = userMessage.textContent;
		if (blankRegex.test(messageContent)) {
			return;
		}
		// http://stackoverflow.com/questions/6014702/how-do-i-detect-shiftenter-and-generate-a-new-line-in-textarea
		// Since messages are sent by pressing enter, enter goes inside of textarea after sending

		sendMessage(messageContent);
	} else if (event.keyCode === 27) { // 27 = escape
		smileyUtil.hideSmileys();
	}
}


function loadMessagesFromLocalStorage() {
	loggedUser = localStorage.getItem(STORAGE_USER);
	var jsonData = localStorage.getItem(STORAGE_NAME);
	if (jsonData != null) {
		var parsedData = JSON.parse(jsonData);
		console.log(getDebugMessage('Loading {} messages from localstorage', parsedData.length));
		// don't make sound on loadHistory
		var savedSoundStatus = window.sound ;
		window.sound = 0;
		window.loggingEnabled = false;
		for (var i = 0; i < parsedData.length; i++) {
			MessagedHandler[parsedData[i].action](parsedData[i]);
		}
		window.loggingEnabled = true;
		window.sound = savedSoundStatus;
	}
}


function onWsClose(e) {
	var reason = e.reason || e;
	if (e.code === 403 && sessionWasntUpdated) {
		sessionWasntUpdated = false;
		var message = getText("Server has forbidden request because '{}'. Trying to update session key", reason);
		growlInfo(message);
		console.error(getDebugMessage(message));
		doGet("/update_session_key", function (response) {
			if (response === RESPONSE_SUCCESS) {
				console.log(getDebugMessage('Session key has been successfully updated'));
			} else {
				console.error(getDebugMessage('Updating session key has failed. Server response: "{}"', response));
			}
		});
	} else if (wsState === 0) {
		growlError("Can't establish connection with chat server");
		console.error(getText("Chat server is down because ", reason));
	} else if (wsState === 9) {
		growlError(getText("Connection to chat server has been lost", reason));
		console.error(getDebugMessage(
				'Connection to WebSocket has failed because "{}". Trying to reconnect every {}ms',
				e.reason, CONNECTION_RETRY_TIME));
	}
	wsState = 1;
	// Try to reconnect in 10 seconds
	setTimeout(start_chat_ws, CONNECTION_RETRY_TIME);
}


function start_chat_ws() {
	ws = new WebSocket(API_URL);
	ws.onmessage = webSocketMessage;
	ws.onclose = onWsClose;
	ws.onopen = function () {
		if (wsState === 1) { // if not inited don't growl message on page load
			growlSuccess("Connection to server has been established");
		}
		wsState = 9;
		console.log(getDebugMessage("Connection to WebSocket established"));
	};
}


function getUserUrl(userId) {
	return getText('/profile/{}', userId);
}


function loadUsers(usernames) {
	if (!usernames) {
		return;
	}
	onlineUsers = usernames;
	if (!CssUtils.hasClass(webRtcApi.dom.callContainer, 'hidden')) {
		webRtcApi.updateDomOnlineUsers();
	}
	console.log(getDebugMessage("Load user names: {}", Object.keys(usernames)));
	chatUsersTable.innerHTML = null;
	var tbody = document.createElement('tbody');
	chatUsersTable.appendChild(tbody);
	for (var username in usernames) {
		if (usernames.hasOwnProperty(username)) {
			var icon;
			var gender = usernames[username].sex;
			var userId = usernames[username].userId;
			if (userId === 0) {
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
			tdUser.textContent = username;
			tdUser.onclick = userClick;
			tr.appendChild(tdIcon);
			tr.appendChild(tdUser);

			tbody.appendChild(tr);
		}
	}
}


/** Inserts element in the middle if it's not there
 * @param time element
 * @returns Node element that follows the inserted one
 * @throws exception if element already there*/
function getPosition(time) {
	var arrayEl;
	for (var i = 0; i < allMessages.length; i++) {
		arrayEl = allMessages[i];
		if (time === arrayEl) {
			throw "Already in list";
		}
		if (time < arrayEl) {
			allMessages.splice(i, 0, time);
			return $(arrayEl);
		}
	}
	return null;
}


/** Creates a DOM node with attached events and all message content*/
function createMessageNode(timeMillis, headerStyle, displayedUsername, htmlEncodedContent, isPrefix, userId) {
	var date = new Date(timeMillis);
	var time = [sliceZero(date.getHours()), sliceZero(date.getMinutes()), sliceZero(date.getSeconds())].join(':');

	var p = document.createElement('p');
	p.setAttribute("id", timeMillis);

	var headSpan = document.createElement('span');
	headSpan.className = headerStyle; // note it's not appending classes, it sets all classes to specified
	var timeSpan = document.createElement('span');
	timeSpan.className = timeSpanClass;
	timeSpan.textContent = getText('({})', time);
	timeSpan.onclick = timeMessageClick;
	headSpan.appendChild(timeSpan);

	var userNameA = document.createElement('span');
	userNameA.textContent = displayedUsername;
	if (displayedUsername !== SYSTEM_USERNAME) {
		userNameA.className = userNameClass;
		userNameA.onclick = userClick;
	}
	if (userId != null) {
		userNameA.setAttribute('name', userId);
	}
	headSpan.insertAdjacentHTML('beforeend', ' ');
	headSpan.appendChild(userNameA);
	var userSuffix;
	userSuffix = isPrefix ?  ' >> ' : ': ';
	headSpan.insertAdjacentHTML('beforeend', userSuffix);

	var textSpan = document.createElement('span');
	textSpan.className = contentStyleClass;
	textSpan.innerHTML = htmlEncodedContent;

	p.appendChild(headSpan);
	p.appendChild(textSpan);
	return p;
}

/**Insert ------- Mon Dec 21 2015 ----- if required
 * @param pos {Node} element of following message
 * @param timeMillis {number} current message
 * @returns Node element that follows the place where new message should be inserted
 * */
function insertCurrentDay(timeMillis, pos) {
	var innerHTML = new Date(timeMillis).toDateString();
	//do insert only if date is not in chatBoxDiv
	var insert = allMessagesDates.indexOf(innerHTML)  < 0;
	var fieldSet;
	if (insert) {
		allMessagesDates.push(innerHTML);
		fieldSet = document.createElement('fieldset');
		var legend = document.createElement('legend');
		legend.setAttribute('align', 'center');
		fieldSet.appendChild(legend);
		legend.textContent = innerHTML;
	}
	var result;
	if (pos != null) { // position of the following message <p>
		var prevEl = pos.previousSibling;
		// if it's not the same day block, prevElement always exist its either fieldset  either prevmessage
		// TODO innerText instead for ie?
		result = (prevEl.tagName === 'FIELDSET' && prevEl.textContent.trim() !== innerHTML) ? prevEl : pos;
		if (insert) {
			chatBoxDiv.insertBefore(fieldSet, result);
		}
	} else {
		if (insert) chatBoxDiv.appendChild(fieldSet);
		result =  null;
	}
	return result;
}


/** Inserts a message to positions, saves is to variable and scrolls if required*/
function displayPreparedMessage(headerStyle, timeMillis, htmlEncodedContent, displayedUsername, isPrefix, receiverId) {
	var pos = null;

	if (allMessages.length > 0 && !(timeMillis > allMessages[allMessages.length-1])) {
		try {
			pos = getPosition(timeMillis);
		} catch ( err) {
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
	pos = insertCurrentDay(timeMillis, pos);
	if (pos != null) {
		chatBoxDiv.insertBefore(p , pos);
	} else {
		var oldscrollHeight = chatBoxDiv.scrollHeight;
		chatBoxDiv.appendChild(p);
		var newscrollHeight = chatBoxDiv.scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			chatBoxDiv.scrollTop = newscrollHeight;
		}
	}
}

function vibrate() {
	window.navigator.vibrate(200);
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
	var preparedHtml = smileyUtil.encodeSmileys(data['content']);
	displayPreparedMessage(headerStyle, data['time'], preparedHtml, displayedUsername, prefix, receiverId);
}


function getJoinLeftChatMessage(data, action) {
	var message;
	if (data['user'] === loggedUser) {
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
	return message;
}


function printRefreshUserNameToChat(data) {
	var message;
	var action = data['action'];
	if (action === 'changed') {
		// if userName label already changed or still
		if (data['oldName'] === loggedUser || data['user'] === loggedUser) {
			message = getText('You have changed nickname to <b>{}</b> ', data['user']);
		} else {
			message = getText('Anonymous <b>{}</b> has changed nickname to <b>{}</b> ', data['oldName'], data['user']) ;
		}
	} else if (action !== 'onlineUsers') {
		message = getJoinLeftChatMessage(data, action);
	} else {
		return;
	}

	displayPreparedMessage(systemHeaderClass, data['time'], message, SYSTEM_USERNAME);
}


function setUsername(newUserName) {
	console.log(getDebugMessage("UserName has been set to {}", newUserName));
	loggedUser = newUserName;
	userNameLabel.textContent = newUserName;
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
	lastLoadUpHistoryRequest = 0; // allow fetching again, after new header is set
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
	// everything else is not saved;
	}
}


function changeOnlineUsers(data) {
	if (data.oldName === loggedUser) {
		setUsername(data.user);
	}
	printRefreshUserNameToChat(data);
	loadUsers(data.content);
}


function handleSendMessage(data) {
	printMessage(data);
	if (loggedUser === data.user) {
		checkAndPlay(chatOutgoing);
	} else {
		checkAndPlay(chatIncoming);
		setTimeout(vibrate);
	}
}


var MessagedHandler = {
	joined: changeOnlineUsers,
	left: changeOnlineUsers,
	onlineUsers: changeOnlineUsers,
	changed: changeOnlineUsers,
	messages: function (data) {
		handleGetMessages(data.content);
	},
	me: function(data) {
		setUsername(data.content);
	},
	system: function(data) {
		displayPreparedMessage(systemHeaderClass, data.time, data.content, SYSTEM_USERNAME);
	},
	send: handleSendMessage,
	rooms: function(data) {
		setupChannels(data.content);
	},
	call: function(data) {
		webRtcApi.onWsMessage(data);
	},
	growl: function (data) {
		growlError(data.content);
	}
};


var WebRtcApi = function () {
	var self = this;
	self.activeUserClass = "active-call-user";
	self.dom = {
		callContainer : $('callContainer'),
		callAnswerParent : $('callAnswerParent'),
		callContainerHeaderText: $('callContainerHeaderText'),
		callAnswerText : $('callAnswerText'),
		callUserList : $("callUserList"),
		remote: $('remoteVideo'),
		local: $('localVideo'),
		callSound: $('chatCall'),
		callIcon: $('callIcon'),
		hangUpIcon: $('hangUpIcon'),
		audioStatusIcon: $('audioStatusIcon'),
		videoStatusIcon: $('videoStatusIcon')
	};
	self.callTimeoutTime = 60000;
	self.dom.callSound.addEventListener("ended", function () {
		checkAndPlay(self.dom.callSound);
	});
	self.pc = {};
	self.constraints = {
		audio: true,
		video: true
	};
	var webRtcUrl = isFirefox ? 'stun:23.21.150.121' : 'stun:stun.l.google.com:19302';
	self.pc_config = {iceServers: [{url: webRtcUrl}]};
	self.pc_constraints = {
		optional: [
			{DtlsSrtpKeyAgreement: true},
			{RtpDataChannels: true}
		]
	};
	// Set up audio and video regardless of what devices are present.
	self.sdpConstraints = {
		'mandatory': {
			'OfferToReceiveAudio': true,
			'OfferToReceiveVideo': true
		}
	};
	self.webRtcReceivers = {};
	var RTCPeerConnection = isFirefox ? mozRTCPeerConnection : webkitRTCPeerConnection;

	self.getTrack = function (isVideo) {
		var track = null;
		if (self.localStream) {
			var tracks = isVideo ? self.localStream.getVideoTracks() : self.localStream.getAudioTracks();
			if (tracks.length > 0) {
				track = tracks[0]
			}
		}
		return track;
	};
	self.setAudio = function (value) {
		self.constraints.audio = value;
		self.dom.audioStatusIcon.className = value ? "icon-mic" : "icon-mute callActiveIcon";
	};
	self.setVideo = function (value) {
		self.constraints.video = value;
		self.dom.videoStatusIcon.className = value ? "icon-videocam" : "icon-no-videocam callActiveIcon";
	};
	self.isActive = function () {
		return self.localStream && self.localStream.active;
	};
	self.toggleInput = function(isVideo) {
		var kind = isVideo ? 'video' : 'audio';
		var track = self.getTrack(isVideo);
		if (!self.isActive() || track) {
			var newValue = !self.constraints[kind];
			if (isVideo) {
				self.setVideo(newValue);
			} else {
				self.setAudio(newValue);
			}
		}
		if (track) {
			track.enabled = self.constraints[kind];
		} else if (self.isActive()) {
			growlError(getText("Unable set {} while it's disabled from the start", kind));
		}
	};
	self.toggleVideo = function () {
		self.toggleInput(true);
	};
	self.toggleMic = function () {
		self.toggleInput(false);
	};
	self.onreply = function() {
		self.setHeaderText(getText("Waiting for {} to answer", self.receiverName))
	};
	self.setHeaderText = function(text) {
		self.dom.callContainerHeaderText.innerText = text;
	};
	self.onoffer = function (message) {
		self.clearTimeout();
		self.receiverName = message.user;
		self.receiverId = message.userId;
		self.sendBaseEvent(null, "reply");
		checkAndPlay(self.dom.callSound);
		CssUtils.showElement(self.dom.callAnswerParent);
		self.timeoutFunnction = setTimeout(function () {
					self.declineWebRtcCall();
					displayPreparedMessage(systemHeaderClass, new Date().getTime(),
							getText("You have missed a call from <b>{}</b>", self.receiverName), SYSTEM_USERNAME);
				}, self.callTimeoutTime
		);
		self.dom.callAnswerText.textContent = getText("{} is calling you", self.receiverName)
	};
	self.setIconState = function(isCall) {
		if (isCall) {
			CssUtils.hideElement(self.dom.callIcon);
			CssUtils.showElement(self.dom.hangUpIcon);
		} else {
			CssUtils.showElement(self.dom.callIcon);
			CssUtils.hideElement(self.dom.hangUpIcon);
		}
	};
	self.updateDomOnlineUsers = function() {
		self.dom.callUserList.innerHTML = '';
		self.receiverName = null;
		for (var userName in onlineUsers) {
				if (onlineUsers.hasOwnProperty(userName) && userName !== loggedUser) {
					var li = document.createElement('li');
					li.textContent = userName;
					self.dom.callUserList.appendChild(li);
				}
			}
	};
	self.showCallDialog = function (isCallActive) {
		self.setIconState(isCallActive);
		if (!isCallActive) {
			self.setHeaderText("Make a call");
			self.updateDomOnlineUsers();
		} else {
			self.clearTimeout();
		}
		CssUtils.showElement(self.dom.callContainer);
	};
	self.answerWebRtcCall = function () {
		CssUtils.hideElement(self.dom.callAnswerParent);
		self.dom.callSound.pause();
		self.setAudio(true);
		self.setVideo(false);
		self.showCallDialog(true);
		self.setHeaderText(getText("Answered for {} call with audio", self.receiverName));
		self.createCall();
	};
	self.declineWebRtcCall = function (dontResponde) {
		CssUtils.hideElement(self.dom.callAnswerParent);
		self.dom.callSound.pause();
		if (!dontResponde) {
			self.sendBaseEvent(null, 'decline');
		}
	};
	self.videoAnswerWebRtcCall = function () {
		CssUtils.hideElement(self.dom.callAnswerParent);
		self.dom.callSound.pause();
		self.setAudio(true);
		self.setVideo(true);
		self.showCallDialog(true);
		self.setHeaderText(getText("Answered for {} call with video", self.receiverName));
		self.createCall();
	};
	self.captureInput = function (callback, callIfNoSource) {
		if (self.constraints.audio || self.constraints.video) {
			navigator.getUserMedia(self.constraints, callback, self.failWebRtc);
		} else if (callIfNoSource) {
			callback();
		}
	};
	self.callPeople = function () {
		if (self.receiverName == null) {
			growlError("Select exactly one user to call");
			return;
		}
		self.setHeaderText("Confirm browser to use your input devices for call");
		self.waitForAnswer();
		self.captureInput(function(stream) {
			self.setIconState(true);
			self.setHeaderText(getText("Establishing connection with {}", self.receiverName));
			self.attachLocalStream(stream);
			self.sendBaseEvent(null, 'offer');
			self.timeoutFunnction = setTimeout(self.closeDialog, self.callTimeoutTime);
		});
	};
	self.createCallAfterCapture = function(stream) {
		self.init();
		self.attachLocalStream(stream);
		self.connectWebRtc();
	};
	self.createCall = function () {
		self.captureInput(self.createCallAfterCapture, true);
	};
	self.print = function (message){
		growlInfo(getText("Call message {}", JSON.stringify(message)));
	};
	self.gotReceiveChannel = function (event) { /* TODO is it used ? */
		console.log(getDebugMessage('Received Channel Callback'));
		self.sendChannel = event.channel;
		self.sendChannel.onmessage = self.print;
		self.sendChannel.onopen = self.print;
		self.sendChannel.onclose = self.print;
	};
	self.waitForAnswer = function () {
		self.init();
		self.pc.ondatachannel = self.gotReceiveChannel;
	};
	self.onWsMessage = function (data) {
		if (data.type != 'offer' && self.receiverName != data.user) {
			console.warn(getDebugMessage("Skipping webrtc from '{}' as current user is '{}'", data.user,
					self.receiverName));
			return;
		}
		self["on"+data.type](data);
	};
	self.clearTimeout = function () {
		var timeoutCleaned = false;
		if (self.timeoutFunnction) {
			clearTimeout(self.timeoutFunnction);
			self.timeoutFunnction = null;
			//timeoutCleaned = true;
		}
		//try {
		//	throw Error('')
		//} catch (err) {
		//	var caller_line = err.stack.split("\n")[3];
		//	var index = caller_line.indexOf("at ");
		//	var clean = caller_line.slice(index + 2, caller_line.length);
		//	if (timeoutCleaned) {
		//		console.error(getText("Cleaned callback from {}", clean));
		//	} else {
		//		console.warn(getText("NOT cleaned callback from {}", clean));
		//	}
		//}
	};
	self.answerToWebrtc = function () {
		console.log(getDebugMessage('creating answer...'));
		self.pc.createAnswer(function (answer) {
			console.log(getDebugMessage('sent answer...'));
			self.pc.setLocalDescription(answer, function () {
				self.sendWebRtcEvent(answer);
			}, self.failWebRtc);
		}, self.failWebRtc, self.sdpConstraints);
	};
	self.onwebrtc = function (data) {
		var offer = data.content;
		self.clearTimeout();
		if (self.pc.iceConnectionState && self.pc.iceConnectionState != 'closed') {
			if (offer.sdp) {
				self.pc.setRemoteDescription(new RTCSessionDescription(offer), self.answerToWebrtc , self.failWebRtc);
			} else if (offer.candidate) {
				self.pc.addIceCandidate(new RTCIceCandidate(offer));
			} else if (offer.message) {
				growlInfo(offer.message);
			}
		} else {
			console.warn(getDebugMessage("Skipping ws message for closed connection"));
		}
	};
	self.setVideoSource = function(domEl, stream) {
		domEl.src = URL.createObjectURL(stream);
		domEl.play();
	};
	self.attachLocalStream = function (stream) {
		self.localStream = stream;
		if (stream) {
			self.pc.addStream(stream);
			self.setVideoSource(self.dom.local, stream);
		}
		self.setVideo(self.getTrack(true) != null);
		self.setAudio(self.getTrack(false) != null);
	};
	self.init = function() {
		self.pc = new RTCPeerConnection(self.pc_config, self.pc_constraints);
		self.pc.onaddstream = function (event) {
			self.setVideoSource(self.dom.remote, event.stream);
			self.setHeaderText(getText("You're talking to {} now", self.receiverName));
			self.setIconState(true);
			console.log(getDebugMessage("Stream attached"));
		};
		self.pc.onicecandidate = function (event) {
			if (event.candidate) {
				self.sendWebRtcEvent(event.candidate);
			}
		};
	};
	self.closeEvents = function (text) {
		self.clearTimeout();
		self.receiverName = null;
		CssUtils.hideElement(self.dom.callContainer);
		try {
			self.pc.close();
		} catch (error) {
		}
		if (self.localStream) {
			var tracks = self.localStream.getTracks();
			for (var i=0; i< tracks.length; i++) {
				tracks[i].stop()
			}
		}
		growlInfo(text);
	};
	self.hangUp = function() {
		self.sendBaseEvent(null, 'finish');
		self.closeEvents("Call is finished.");
	};
	self.ondecline = function () {
		self.closeEvents("User has declined the call");
	};
	self.onfinish = function() {
		self.declineWebRtcCall(true);
		self.closeEvents("Opponent hung up. Call is finished.");
	};
	self.closeDialog = function() {
		if (self.isActive()) {
			self.hangUp();
		} else {
			CssUtils.hideElement(self.dom.callContainer);
		}
	};
	self.connectWebRtc = function () {
		try {
			// Reliable data channels not supported by Chrome
			self.sendChannel = self.pc.createDataChannel("sendDataChannel", {reliable: false});
			self.sendChannel.onmessage = function (message) {
				console.log(getDebugMessage("SC in {}", message.data));
			};
			console.log(getDebugMessage("Created send data channel"));
		} catch (e) {
			var error = getText("Failed to create data channel because {} ", e.message || e);
			growlError(error);
			console.error(getDebugMessage(error));
		}
		self.pc.createOffer(function (offer) {
			console.log(getDebugMessage('created offer...'));
			self.pc.setLocalDescription(offer, function () {
				console.log(getDebugMessage('sending to remote...'));
				self.sendWebRtcEvent(offer);
			}, self.failWebRtc);
		}, self.failWebRtc, self.sdpConstraints);
	};
	self.sendBaseEvent = function(content, type) {
		sendToServer({
			content: content,
			action: 'call',
			type: type,
			receiverName: self.receiverName,
			receiverId: self.receiverId
		});
	};
	self.sendWebRtcEvent = function (message) {
		self.sendBaseEvent(message, 'webrtc');
	};
	self.failWebRtc = function () {
		var isError = arguments.length === 1 && (arguments[0].message || arguments[0].name);
		var errorContext = isError ? getText("{}: {}", arguments[0].name, arguments[0].message) : Array.prototype.join.call(arguments, ' ');
		var text = getText("Error while calling because {}", errorContext);
		growlError(text);
		console.error(getDebugMessage(text));
	};
	self.callUserListClick = function (event) {
		if (event.target.tagName === 'LI') {
			var hasClass = CssUtils.hasClass(event.target, self.activeUserClass);
			var users = self.dom.callUserList.childNodes;
			for (var i=0; i< users.length; i++) {
				CssUtils.removeClass(users[i], self.activeUserClass);
			}
			var userName = event.target.textContent;
			if (hasClass) {
				self.receiverName = null;
				self.receiverId = null;
				CssUtils.removeClass(event.target, self.activeUserClass);
			} else {
				self.receiverName = userName;
				self.receiverId = parseInt(onlineUsers[userName].userId);
				CssUtils.addClass(event.target, self.activeUserClass);
			}
		}
		event.stopPropagation();
	};
};


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

	MessagedHandler[data.action](data);

	//cache some messages to localStorage save only after handle, in case of errors +  it changes the message,
	saveMessageToStorage(data, jsonData);
}


function sendToServer(messageRequest) {
	var jsonRequest = JSON.stringify(messageRequest);
	if (ws.readyState !== WebSocket.OPEN) {
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
		var currentMillis = new Date().getTime();
		// 0 if locked, or last request was sent earlier than 3 seconds ago
		if (lastLoadUpHistoryRequest + 3000 > currentMillis) {
			console.log(getDebugMessage("Skipping loading message, because it's locked"));
			return
		}
		lastLoadUpHistoryRequest = currentMillis;
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
	localStorage.removeItem(HISTORY_STORAGE_NAME);
	chatBoxDiv.innerHTML = '';
	allMessages = [];
	allMessagesDates = [];
	chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp); //
	chatBoxDiv.addEventListener("keydown", keyDownLoadUp);
	console.log(getDebugMessage('History has been cleared'));
	growlSuccess('History has been cleared');
}


function hideUserSendToName() {
	destinationUserId = null;
	destinationUserName = null;
	CssUtils.hideElement(userSendMessageTo);
}