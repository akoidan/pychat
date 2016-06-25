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
const contentStyleClass = 'message-text-style';
const DEFAULT_CHANNEL_NAME = 'r1';
const USER_ID_ATTR = 'userid'; // used in ChannelsHandler and ChatHandler
const USER_NAME_ATTR = 'username';  // used in ChannelsHandler and ChatHandler
const SYSTEM_USERNAME = 'System';

const genderIcons = {
	'Male': 'icon-man',
	'Female': 'icon-girl',
	'Secret': 'icon-user-secret'
};

var smileRegex = /<img[^>]*code="([^"]+)"[^>]*>/g;
var timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;

var destinationUserId = null;

var lastLoadUpHistoryRequest = 0;
var mouseWheelEventName = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
// browser tab notification
var newMessagesCount = 0;
var isCurrentTabActive = true;
//localStorage  key
const STORAGE_NAME = 'main';
//current top message id for detecting from what
var headerId;
//  div that contains messages
var chatBoxDiv;

//sound
var chatIncoming;
var chatOutgoing;
var chatLogin;
var chatLogout;
// div for user list appending
// input type that contains text for sending message
var userMessage;
// div that contains receiver id, icons, etc
//user to send message input type text
// navbar label with current user name
var charRooms;
var headerText;
//main single socket for handling realtime messages
var wsState = 0; // 0 - not inited, 1 - tried to connect but failed; 9 - connected;
var chatUserRoomWrapper; // for hiddding users

//All <p> ids (every id is UTC millis). this helps to prevent duplications, and detect position
var onlineUsers = {};
var webRtcApi;
var smileyUtil;
var channelsHandler;
var wsHandler;
var storage;
var isFirefox = window.browserVersion.indexOf('Firefox') >= 0;
if (isFirefox) {
	RTCSessionDescription = mozRTCSessionDescription;
	RTCIceCandidate = mozRTCIceCandidate;
}
var singlePage;

var infoMessages = [
	"Every time you join chat it will show you this help messages. You can disable them in you profile settings. To hide them just simply chlick on theirs background",
	"You can change chat appearence in your profile. Change theme to simple if you like.",
	"Did you know that you could paste multiple lines content by simply pressing shift+Enter?",
	"You can add smileys by clicking on bottom right icon. To close the smile container click outside of it or press escape",
	"You can send direct message to user just by clicking on username in user list or in messages. After his username appears in the left bottom " +
			"corner and your messages become green. To send messages to all you should click on X right by username",
	"You can also comment somebody's message. This will be shown to all users in current channel. Just click on message" +
			"and it's content appears in message text",
	"You have a feature to suggest or you lack some functionality? Click on purple pencil icon on top menu and write your " +
			"suggestion there",
	"Chat uses your browser cache to store messages. If you want to clear history and all cached messages just click " +
	"on red Floppy drive icon on the top menu",
	"You can view userprofile by clicking on icon left by username in user list. To edit your profile you need to register" +
	"and click on light green wrench icon on the top right corner",
	"You can change your randomly generated username by clicking on it on top menu"
];

onDocLoad(function () {
	userMessage = $("usermsg");
	chatUserRoomWrapper = $("chat-room-users-wrapper");
	chatIncoming = $("chatIncoming");
	chatOutgoing = $("chatOutgoing");
	chatLogin = $("chatLogin");
	chatLogout = $("chatLogout");
	charRooms = $("rooms");
	headerText = $('headerText');
	// TODO chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp);
	// some browser don't fire keypress event for num keys so keydown instead of keypress
	window.addEventListener("blur", changeTittleFunction);
	window.addEventListener("focus", changeTittleFunction);
	console.log(getDebugMessage("Trying to resolve WebSocket Server"));
	channelsHandler = new ChannelsHandler();
	showHelp();
	userMessage.focus();
	singlePage = new PageHandler();
	webRtcApi = new WebRtcApi();
	smileyUtil = new SmileyUtil();
	wsHandler = new  WsHandler(channelsHandler);
	//bottom call loadMessagesFromLocalStorage(); s
	smileyUtil.init();
	storage = new Storage();
	storage.loadMessagesFromLocalStorage();
	//TODO channelsHandler.loadMessagesFromLocalStorage(); /*Smileys should be encoded by time message load, otherwise they don't display*/
	wsHandler.start_chat_ws();
	$('imgInput').onchange = handleFileSelect;
	new Draggable($('addUserHolder'), "Add direct user channel")
});


function Page() {
	var self = this;
	self.dom = {
		container: document.body,
		el: []
	};
	self.parser = new DOMParser();
	self.render  = function () {
		doGet(self.getUrl(), self.onLoad);
	};
	self.onLoad = function (html) {
		var tmpWrapper = document.createElement('div');
		tmpWrapper.innerHTML = html;
		var holder = tmpWrapper.firstChild;
		self.dom.el.push(holder);
		self.dom.container.appendChild(holder);
		self.fixTittle();
	};
	self.foreach = function (apply) {
		for (var i = 0; i< self.dom.el.length; i++) {
			apply(self.dom.el[i]);
		}
	};
	self.fixTittle = function () {
		var newTittle = self.getTitle();
		if (newTittle != null) {
			headerText.innerHTML = newTittle;
		}
	};
	self.show = function () {
		self.fixTittle();
		self.foreach(CssUtils.showElement);
	};
	self.update = self.show;
	self.hide = function () {
		self.foreach(CssUtils.hideElement);
	};
	self.getUrl = function () {
		return self.url;
	};
	self.getTitle = function () {
		return self.title;
	};
	self.super = {
		onLoad: self.onLoad,
		hide: self.hide
	};
	self.toString = function (event) {
		return self.name;
	}
}

function IssuePage() {
	var self = this;
	Page.call(self);
	self.url = '/report_issue';
	self.title = 'Report issue';
	self.dom = {
		issueForm:  $('issueForm'),
		version: $("version"),
		issue: $("issue")
	};
	self.dom.el = [self.dom.issueForm];
	self.render = function () {
		self.dom.version.value = window.browserVersion;
		self.dom.issue.addEventListener('input', function () {
			self.dom.issue.style.height = 'auto';
			var textAreaHeight = issue.scrollHeight;
			self.dom.issue.style.height = textAreaHeight + 'px';
		});
		self.dom.issueForm.onsubmit = self.onsubmit;
		self.show();
	};
	self.onsubmit = function (event) {
		event.preventDefault();
		var params = {};
		if ($('history').checked) {
			var logs = localStorage.getItem(HISTORY_STORAGE_NAME);
			if (logs != null) {
				params['log'] = logs
			}
		}
		doPost('/report_issue', params, function (response) {
			if (response === RESPONSE_SUCCESS) {
				growlSuccess("Your issue has been successfully submitted");
				singlePage.showDefaultPage();
			} else {
				growlError(response);
			}
		}, self.dom.issueForm);
	};
}

function ViewProfilePage(userId) {
	var self = this;
	Page.call(self);
	self.userId = userId;
	self.getUrl = function () {
		return getText('/profile/{}', self.userId);
	};
	self.getTitle = function () {
		self.username = self.username || self.dom.el[0].getAttribute('username');
		return getText("<b>{}</b>'s profile", self.username );
	};
}

function ChangeProfilePage() {
	var self = this;
	Page.call(self);
	self.url = '/profile';
	self.title = 'Change profile';
	self.onLoad = function (html) {
		self.super.onLoad(html);
		doGet(CHANGE_PROFILE_JS_URL, function () {
			initChangeProfile();
		});
	}
}

function ChatPage(args, focus) {
	var self = this;
	Page.call(self);
	if (args) {
		channelsHandler.activeChannel = args[0];
	}
	self.url = '';
	self.title = getText("Hello, <b>{}</b>", loggedUser);
	self.dom = {
		wrapper: $('wrapper'),
		userMessageWrapper: $('userMessageWrapper')
	};
	self.dom.el = [
		self.dom.wrapper,
		self.dom.userMessageWrapper
	];
	self.render = self.show;
}


function WebRtcPage() {
	var self = this;
	Page.call(self);
	self.url = '/call';
	self.title = 'Call';
	self.dom.el = [
		$('callContainer')
	];
	self.render = self.show;
	self.hide = function () { // TODO remove cross object reference webRtcApi < - > WebRtcPage
		if (webRtcApi.isActive()) {
			growlInfo("Call is still active. Press green phone icon to move back to it");
		}
		self.super.hide()
	}
}

function AmchartsPage() {
	var self = this;
	Page.call(self);
	self.title = 'Statistics';
	self.url = '/statistics';
	self.render = function () {
		doGet(AMCHART_URL, function () {
			var holder = document.createElement("div");
			self.dom.el.push(holder);
			self.dom.container.appendChild(holder);
			holder.setAttribute("id", "chartdiv");
			doGet(self.url, function (data) {
				window.amchartJson = JSON.parse(data);
				doGet(STATISTICS_JS_URL);
			});
		});
	};
}

function PageHandler() {
	var self = this;
	self.pages = {
		'/report_issue': IssuePage,
		'/chat/': ChatPage,
		'/statistics': AmchartsPage,
		'/profile/': ViewProfilePage,
		'/profile': ChangeProfilePage,
		'/call': WebRtcPage
	};
	self.pageRegex = /\w\/#(\/\w+\/?)(.*)/g;
	self.storagePages = [];
	self.init = function () {
		self.storagePages.push(new self.pages['/call']());
		self.showPageFromUrl();
		window.onhashchange = self.showPageFromUrl;
	};
	self.showPageFromUrl = function () {
		var currentUrl = window.location.href;
		var match = self.pageRegex.exec(currentUrl);
		var params;
		var page;
		if (match) {
			page = match[1];
			if (match[2]) {
				params = match[2].split('/');
			}
			self.showPage(page, params, true);
		} else {
			self.showDefaultPage();
		}
	};
	self.getPageByUrl = function (url) {
		for (var i = 0; i< self.storagePages.length; i++) {
			if (self.storagePages[i].getUrl() == url) {
				return self.storagePages[i];
			}
		}
	};
	self.showDefaultPage = function () {
		self.showPage('/chat/', [DEFAULT_CHANNEL_NAME]);
	};
	self.showPage = function (page, params, dontHistory) {
		console.log(getDebugMessage('Rendering page "{}"', page));
		var newPage;
		var storagePage = self.getPageByUrl(page);
		if (self.currentPage) self.currentPage.hide();
		if (storagePage) {
			newPage = storagePage;
			newPage.update();
		} else {
			newPage = new self.pages[page](params);
			self.storagePages.push(newPage);
			newPage.render();
		}
		self.currentPage = newPage;
		if (!dontHistory ) {
			var historyUrl = self.getHistoryUrl(newPage);
			// TODO remove triple, carefull of undefined tittle in ViewProfilePage
			window.history.pushState(historyUrl, historyUrl, historyUrl);
		}
	};
	self.getHistoryUrl = function (pageObj) {
		return getText("#{}", pageObj.getUrl());
	};
	self.init();
}



function ChannelsHandler() {
	var self = this;
	self.ROOM_ID_ATTR = 'roomid';
	self.activeChannel = null;
	self.channels = {};
	self.dom = {
		chatUsersTable: $("chat-user-table"),
		rooms: $("rooms"),
		activeUserContext: null,
		userContextMenu: $('user-context-menu'),
		addUserHolder: $('addUserHolder'),
		addUserList: $('addUserList'),
		addUserInput: $('addUserInput'),
		directUserTable: $('directUserTable')
	};
	self.roomClick = function (event) {
		if (event.target.tagName == 'UL') {
			return;
		}
		var roomId = event.target.getAttribute(self.ROOM_ID_ATTR);
		if (self.activeRoomId == roomId) {
			return;
		}
		self.setActiveChannel(self.generateRoomKey(roomId));
	};
	self.setActiveChannel = function (key) {
		self.hideActiveChannel();
		self.activeChannel = key;
		self.showActiveChannel();
	};
	self.generateRoomKey = function (roomId) {
		return "r" + roomId;
	};
	self.generateUserKey = function(userId) {
		return "u" + userId;
	};
	self.showActiveChannel = function (){
		if (self.activeChannel) {
			self.channels[self.activeChannel].show()
		}
	};
	self.hideActiveChannel = function (){
		if (self.activeChannel) {
			self.channels[self.activeChannel].hide()
		}
	};
	self.userClick = function (event) {
		event = event || window.event;
		var target = event.target || event.srcElement;
		if (target.tagName == 'I') {
			target = target.parentNode;
		}
		if (target.tagName != 'LI') {
			return;
		}
		var userId = event.target.getAttribute(USER_ID_ATTR);
		var userKey = self.generateUserKey(userId);
		if (!self.channels[userKey]) {
			self.createNewUserChatHandler();
		}
		self.setActiveChannel(userKey);
	};
	self.sendMessage = function (messageRequest) {
		// anonymous is set by name, registered user is set by id.
		var sendSuccessful = wsHandler.sendToServer(messageRequest);
		if (sendSuccessful) {
			userMessage.innerHTML = "";
		} else {
			growlError("Can't send message, because connection is lost :(")
		}
	};
	self.checkAndSendMessage = function (event) {
		if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
			event.preventDefault();
			userMessage.innerHTML = userMessage.innerHTML.replace(smileRegex, "$1");
			var messageContent = userMessage.textContent;
			if (blankRegex.test(messageContent)) {
				return;
			}
			self.sendMessage({
				content: messageContent,
				action: 'sendMessage',
				channel: self.activeChannel
			});
		} else if (event.keyCode === 27) { // 27 = escape
			smileyUtil.hideSmileys();
		}
	};
	self.finishAddUser = function (event) {
		var target = event.target;
		if (target.tagName != 'LI') {
			return
		}
		var userId = parseInt(target.getAttribute(USER_ID_ATTR));
		var userKey = self.generateUserKey(userId);
		if (!self.channels[userKey]) {
			wsHandler.sendToServer({
				action: 'direct',
				userId: userId
			});
		}
	};
	self.showAddUser = function () {
		CssUtils.showElement(self.dom.addUserHolder);
		self.dom.addUserList.innerHTML = '';
		self.addUserUsersList = {};
		var allUsers = self.getAllUsersInfo();
		for (var userId in allUsers) {
			if (allUsers.hasOwnProperty(userId)) {
				var li = document.createElement('LI');
				var username = allUsers[userId].user;
				self.addUserUsersList[username] = li;
				li.innerText = username;
				li.setAttribute(USER_ID_ATTR, userId);
				self.dom.addUserList.appendChild(li);
			}
		}
	};
	self.getAllUsersInfo = function () {
		return self.channels[DEFAULT_CHANNEL_NAME].allUsers;
	};
	self.filterAddUser = function () {
		var filterValue = self.dom.addUserInput.value;
		for (var userName in self.addUserUsersList) {
			if (self.addUserUsersList.hasOwnProperty(userName)) {
				if (userName.indexOf(filterValue) > -1) {
					CssUtils.showElement(self.addUserUsersList[userName]);
				} else {
					CssUtils.hideElement(self.addUserUsersList[userName]);
				}
			}
		}
	};
	self.dom.rooms.onclick = self.roomClick;
	self.createNewUserChatHandler = function(roomId, allUsers) {
		var allUsersIds = Object.keys(allUsers);
		var anotherUserId;
		if (allUsersIds.length == 2) {
			anotherUserId = allUsersIds[0] == '' + loggedUserId ? allUsersIds[1] : allUsersIds[0];
		} else {
			anotherUserId = allUsersIds[0];
		}
		var li = createUserLi(anotherUserId, allUsers[anotherUserId].sex, allUsers[anotherUserId].user);
		var roomKey = self.generateRoomKey(roomId);
		li.setAttribute(self.ROOM_ID_ATTR, roomId);
		self.dom.directUserTable.appendChild(li);
		var chatHandler = new ChatHandler(li, allUsers);
		self.channels[roomKey] = chatHandler;
		if (self.activeChannel == roomKey) {
			chatHandler.show();
		}
	};
	self.getCurrentRoomIDs = function () {

	};
	self.setRooms = function (message) {
		var rooms = message.content;
		var oldRooms = [];
		for (var channelKey in self.channels) {
			if (self.channels.hasOwnProperty(channelKey) && channelKey.startsWith('r')) {
				var oldRoomId = parseInt(channelKey.substring(1));
				oldRooms.push(oldRoomId);
				if (!rooms[oldRoomId]) {
					self.channels[channelKey].destroy();
				}
			}
		}
		for (var roomId in rooms) {
			// if a new room has been added while disconnected
			if (rooms.hasOwnProperty(roomId)) {
				var intKey = parseInt(roomId);
				if (oldRooms.indexOf(intKey) < 0) {
					var room = rooms[roomId];
					if (room.name) {
						self.createNewRoomChatHandler(roomId, room.name, room.users);
					} else {
						self.createNewUserChatHandler(roomId, room.users);
					}
				}
			}
		}
	};
	self.createNewRoomChatHandler = function(roomId, roomName, users) {
		if (users == null) {
			throw 'Users are empty';
		}
		var li = document.createElement('li');
		var roomKey = self.generateRoomKey(roomId);
		li.setAttribute(self.ROOM_ID_ATTR, roomId);
		li.innerHTML = roomName;
		self.dom.rooms.appendChild(li);
		var chatHandler = new ChatHandler(li, users);
		self.channels[roomKey] = chatHandler;

		if (self.activeChannel == roomKey) {
			chatHandler.show();
		}
	};
	self.handle = function (message) {
		if (message.handler == 'channels') {
			self[message.action](message);
		}
		else if (message.handler == 'chat') {
			self.channels[message.channel][message.action](message);
		} else {
			throw getText("Handler {} is uknown", message.handler);
		}
	};
	self.direct = function(message) {
		var users = message.users;
		var anotherUserName = self.getAllUsersInfo();
		var channelUsers = {};
		channelUsers[users[1]] = anotherUserName[users[1]];
		channelUsers[users[0]] = anotherUserName[users[0]];
		self.createNewUserChatHandler(message.roomId, channelUsers)
	};
	self.viewProfile = function() {
		singlePage.showPage('/profile/', self.getActiveUserId());
	};
	self.init = function() {
		self.dom.chatUsersTable.addEventListener('contextmenu', self.showContextMenu, false);
		for (var roomId in roomsUsers) {
			if (roomsUsers.hasOwnProperty(roomId)) {
				self.createNewRoomChatHandler(roomId, roomsUsers[roomId].name, roomsUsers[roomId].users);
			}
		}
	};

	self.getActiveUserId = function() {
		return self.dom.activeUserContext.getAttribute(USER_ID_ATTR);
	};
	self.getActiveUsername = function() {
		return self.dom.activeUserContext.textContent;
	};
	self.call = function() {
		if (self.getActiveUsername() != loggedUser) {
			webRtcApi.showCallDialog();
			webRtcApi.receiverId = parseInt(self.getActiveUserId());
			webRtcApi.receiverName = self.getActiveUsername();
			webRtcApi.callPeople();
		} else {
			growlError("You can't call yourself");
		}
	};
	self.dom.activeUserContext = null;
	self.showContextMenu = function (e) {
		var li = e.target;
		if (li.tagName == 'I') {
			li = li.parentElement;
		} else if (li.tagName != 'LI') {
			return;
		}
		if (self.dom.activeUserContext != null) {
			CssUtils.removeClass(self.dom.activeUserContext, 'active-user');
		}
		self.dom.activeUserContext =  li;
		self.dom.userContextMenu.style.top = li.offsetTop + li.clientHeight + "px";
		CssUtils.addClass(self.dom.activeUserContext, 'active-user');
		CssUtils.showElement(self.dom.userContextMenu);
		document.addEventListener("click", self.removeContextMenu);
		e.preventDefault();
	};
	self.removeContextMenu = function() {
		CssUtils.hideElement(self.dom.userContextMenu);
		document.removeEventListener("click", self.removeContextMenu);
		CssUtils.removeClass(self.dom.activeUserContext, 'active-user');
	};
}

var handleFileSelect = function (evt) {
	var files = evt.target.files;
	var file = files[0];
	if (files && file) {
		var reader = new FileReader();
		reader.onload = function (readerEvt) {
			var binaryString = readerEvt.target.result;
			sendMessage({
				image: getText("data:{};base64,{}",file.type, btoa(binaryString)),
				content: null,
				action: 'send'
			});
			$('imgInput').value = "";
		};
		reader.readAsBinaryString(file);
	}
};

function showHelp() {
	if (suggestions) {
		var index = localStorage.getItem('HelpIndex');
		if (index == null) {
			index = 0;
		} else {
			index = parseInt(index);
		}
		if (index < infoMessages.length) {
			growlInfo(infoMessages[index]);
			localStorage.setItem('HelpIndex', index + 1);
		}
	}
}


function SmileyUtil() {
	var self = this;
	self.dom = {
		smileParentHolder : $('smileParentHolder')
	};
	self.tabNames = [];
	self.smileyDict = {};
	self.init = function () {
		document.addEventListener("click", self.onDocClick);
		self.loadSmileys(window.smileys_bas64_data);
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
		html = html.replace(window.smileUnicodeRegex, function (s) {
			return self.smileyDict[s];
		});
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
		//var smileyData = JSON.parse(jsonData);
		var smileyData = jsonData;
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
						var fullSmileyUrl = "data:image/gif;base64," + tabSmileys[smile].base64;
						fileRef.setAttribute("src", fullSmileyUrl);
						fileRef.setAttribute("code", smile);
						fileRef.setAttribute("alt", tabSmileys[smile].text_alt);
						tabRef.appendChild(fileRef);
						// http://stackoverflow.com/a/1750860/3872976
						/** encode dict key, so {@link encodeSmileys} could parse smileys after encoding */
						self.smileyDict[encodeHTML(smile)] = fileRef.outerHTML;
					}
				}
			}
		}
		self.showTabByName(Object.keys(smileyData)[0]);
	};
}


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

function ChatHandler(li, allUsers) {
	var self = this;
	var wrapper = $('wrapper');
	self.allUsers = allUsers;
	self.dom = {};
	self.allMessages = [];
	self.allMessagesDates = [];
	self.activeRoomClass = 'active-room';
	self.dom.chatBoxDiv = document.createElement('div');
	self.dom.userList = document.createElement('ul');
	self.dom.roomNameLi = li;
	self.dom.userList.className = 'hidden';
	$('chat-user-table').appendChild(self.dom.userList);
	self.dom.chatBoxDiv.className = 'chatbox hidden';
	wrapper.insertBefore(self.dom.chatBoxDiv, wrapper.firstChild);
	// tabindex allows focus, focus allows keydown binding event
	self.dom.chatBoxDiv.tabindex="0";
	self.dom.chatBoxDiv.onkeydown=keyDownLoadUp;
	self.show = function () {
		CssUtils.showElement(self.dom.chatBoxDiv);
		CssUtils.showElement(self.dom.userList);
		CssUtils.addClass(self.dom.roomNameLi, self.activeRoomClass);
	};
	self.hide = function () {
		CssUtils.hideElement(self.dom.chatBoxDiv);
		CssUtils.hideElement(self.dom.userList);
		CssUtils.removeClass(self.dom.roomNameLi, self.activeRoomClass);
	};
	/** Inserts element in the middle if it's not there
	 * @param time element
	 * @returns Node element that follows the inserted one
	 * @throws exception if element already there*/
	self.getPosition = function (time) {
		var arrayEl;
		for (var i = 0; i < self.allMessages.length; i++) {
			arrayEl = self.allMessages[i];
			if (time === arrayEl) {
				throw "Already in list";
			}
			if (time < arrayEl) {
				self.allMessages.splice(i, 0, time);
				return $(arrayEl);
			}
		}
		return null;
	};
	/** Creates a DOM node with attached events and all message content*/
	self.createMessageNode = function (timeMillis, headerStyle, displayedUsername, htmlEncodedContent, isPrefix) {
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
		headSpan.insertAdjacentHTML('beforeend', ' ');
		headSpan.appendChild(userNameA);
		var userSuffix;
		userSuffix = isPrefix ? ' >> ' : ': ';
		headSpan.insertAdjacentHTML('beforeend', userSuffix);
		p.appendChild(headSpan);
		if (htmlEncodedContent.indexOf("<img") == 0) {
			p.insertAdjacentHTML('beforeend', htmlEncodedContent);
		} else {
			var textSpan = document.createElement('span');
			textSpan.className = contentStyleClass;
			textSpan.innerHTML = htmlEncodedContent;
			p.appendChild(textSpan);
		}
		return p;
	};
	/**Insert ------- Mon Dec 21 2015 ----- if required
	 * @param pos {Node} element of following message
	 * @param timeMillis {number} current message
	 * @returns Node element that follows the place where new message should be inserted
	 * */
	self.insertCurrentDay = function (timeMillis, pos) {
		var innerHTML = new Date(timeMillis).toDateString();
		//do insert only if date is not in chatBoxDiv
		var insert = self.allMessagesDates.indexOf(innerHTML) < 0;
		var fieldSet;
		if (insert) {
			self.allMessagesDates.push(innerHTML);
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
				self.dom.chatBoxDiv.insertBefore(fieldSet, result);
			}
		} else {
			if (insert) self.dom.chatBoxDiv.appendChild(fieldSet);
			result = null;
		}
		return result;
	};
	/** Inserts a message to positions, saves is to variable and scrolls if required*/
	self.displayPreparedMessage = function (headerStyle, timeMillis, htmlEncodedContent, displayedUsername, isPrefix) {
		var pos = null;

		if (self.allMessages.length > 0 && !(timeMillis > self.allMessages[self.allMessages.length - 1])) {
			try {
				pos = getPosition(timeMillis);
			} catch (err) {
				console.warn(getDebugMessage("Skipping duplicate message, time: {}, content: <<<{}>>> ",
						timeMillis, htmlEncodedContent));
				return;
			}
		} else {
			self.allMessages.push(timeMillis);
		}

		var p = self.createMessageNode(timeMillis, headerStyle, displayedUsername, htmlEncodedContent, isPrefix);
		// every message has UTC millis ID so we can detect if message is already displayed or position to display

		if (!isCurrentTabActive) {
			newMessagesCount++;
			document.title = newMessagesCount + " new messages";
		}
		pos = self.insertCurrentDay(timeMillis, pos);
		if (pos != null) {
			self.dom.chatBoxDiv.insertBefore(p, pos);
		} else {
			var oldscrollHeight = self.dom.chatBoxDiv.scrollHeight;
			self.dom.chatBoxDiv.appendChild(p);
			var newscrollHeight = self.dom.chatBoxDiv.scrollHeight;
			if (newscrollHeight > oldscrollHeight) {
				self.dom.chatBoxDiv.scrollTop = newscrollHeight;
			}
		}
	};
	self.printMessage = function (data) {
		var user = self.allUsers[data.userId];
		var displayedUsername = user.user;
		//private message
		var prefix = false;
		var headerStyle = othersHeaderClass;
		var preparedHtml;
		if (data.image) {
			preparedHtml = getText("<img src=\'{}\'/>", data.image);
		} else {
			preparedHtml = smileyUtil.encodeSmileys(data['content']);
		}
		self.displayPreparedMessage(headerStyle, data['time'], preparedHtml, displayedUsername, prefix);
	};
	self.getJoinLeftChatMessage = function (userId, action) {
		var message;
		var username = self.allUsers[userId].user;
		if (username === loggedUser) {
			message = 'You have ' + action ;
		} else {
			message = getText('User <b>{}</b> has {}', username, action);
		}
		return message;
	};
	self.handleGetMessages= function(message) {
		console.log(getDebugMessage('appending messages to top'));
		// This check should fire only once,
		// because requests aren't being sent when there are no event for them, thus no responses
		if (message.length === 0) {
			console.log(getDebugMessage('Requesting messages has reached the top, removing loadUpHistoryEvent handlers'));
			self.dom.chatBoxDiv.removeEventListener(mouseWheelEventName, mouseWheelLoadUp);
			self.dom.chatBoxDiv.removeEventListener("keydown", keyDownLoadUp);
			return;
		}
		var firstMessage = message[message.length - 1];
		headerId = firstMessage.id;

		message.forEach(function (message) {
			self.printMessage(message);
		});
		lastLoadUpHistoryRequest = 0; // allow fetching again, after new header is set
	};
	self.addOnlineUser = function (message) {
		self.printChangeOnlineStatus('appeared online.', message, chatLogin);

	};
	self.removeOnlineUser = function(message) {
		self.printChangeOnlineStatus('has gone offline.', message, chatLogout);
	};
	self.printChangeOnlineStatus = function (action, message, sound) {
		var dm = self.getJoinLeftChatMessage(message.userId, action);
		checkAndPlay(sound);
		self.displayPreparedMessage(systemHeaderClass, message.time, dm, SYSTEM_USERNAME);
		self.setOnlineUsers(message);
	};


	self.setOnlineUsers = function(message) {
		self.onlineUsers = message.content;
		// if (!CssUtils.hasClass(webRtcApi.dom.callContainer, 'hidden')) {
		// 	webRtcApi.updateDomOnlineUsers();
		// } TODO
		console.log(getDebugMessage("Load user names: {}", Object.keys(self.onlineUsers)));
		self.dom.userList.innerHTML = null;
		for (var i = 0; i < self.onlineUsers.length; i++) {
			var userId = self.onlineUsers[i];
			var user = self.allUsers[userId];
			var li = createUserLi(userId, user.sex, user.user);
			self.dom.userList.appendChild(li);
		}
	};
	self.handleSendMessage = function(data) {
		self.printMessage(data);
		if (loggedUser === data.user) {
			checkAndPlay(chatOutgoing);
		} else {
			checkAndPlay(chatIncoming);
			setTimeout(vibrate);
		}
	};
	self.loadUpHistory = function (count) {
		if (self.dom.chatBoxDiv.scrollTop === 0) {
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
	};
	self.destroy = function () {
		throw  'Not implemented'; // should remove current handler with its dom
	}
}


function vibrate() {
	window.navigator.vibrate(200);
}


function WebRtcApi() {
	var self = this;
	self.activeUserClass = "active-call-user";
	self.dom = {
		callContainer : $('callContainer'),
		callAnswerParent : $('callAnswerParent'),
		callContainerHeaderText: headerText,
		callAnswerText : $('callAnswerText'),
		callUserList : $("callUserList"),
		remote: $('remoteVideo'),
		local: $('localVideo'),
		callSound: $('chatCall'),
		callIcon: $('callIcon'),
		hangUpIcon: $('hangUpIcon'),
		audioStatusIcon: $('audioStatusIcon'),
		videoStatusIcon: $('videoStatusIcon'),
		videoContainer: $('videoContainer'),
		fsContainer: $('icon-webrtc-cont'),
		fs: { /*FullScreen*/
			video: $('fs-video'),
			audio: $('fs-audio'),
			hangup: $('fs-hangup'),
			minimize: $('fs-minimize'),
			enterFullScreen: $('enterFullScreen')
		}
	};
	self.page = singlePage.getPageByUrl('/call');
	self.onExitFullScreen = function () {
		if (!(document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement)) {
			CssUtils.removeClass(self.dom.videoContainer, 'fullscreen');
			document.removeEventListener('mousemove', self.fsMouseMove, false);
			clearInterval(self.hideContainerTimeoutRes);
			self.dom.remote.ondblclick = self.enterFullScreenMode;
		}
	};
	self.attachDomEvents = function () {
		self.dom.videoStatusIcon.onclick = self.toggleVideo;
		self.dom.fs.video.onclick = self.toggleVideo;
		self.dom.callIcon.onclick = self.callPeople;
		self.dom.hangUpIcon.onclick = self.hangUp;
		self.dom.fs.hangup.onclick = self.hangUp;
		self.dom.fs.audio.onclick = self.toggleMic;
		self.dom.audioStatusIcon.onclick = self.toggleMic;
		self.dom.callUserList.onclick = self.callUserListClick;
		var fullScreenChangeEvents = ['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange', 'MSFullscreenChange'];
		for (var i = 0; i < fullScreenChangeEvents.length; i++) {
			document.addEventListener(fullScreenChangeEvents[i], self.onExitFullScreen, false);
		}
		var elem = self.dom.videoContainer;
		if (elem.requestFullscreen) {
			//nothing
		} else if (elem.msRequestFullscreen) {
			elem.requestFullscreen = elem.msRequestFullscreen;
			document.cancelFullScreen = document.msCancelFullScreen;
		} else if (elem.mozRequestFullScreen) {
			elem.requestFullscreen = elem.mozRequestFullScreen;
			document.cancelFullScreen = document.mozCancelFullScreen;
		} else if (elem.webkitRequestFullscreen) {
			elem.requestFullscreen = elem.webkitRequestFullscreen;
			document.cancelFullScreen = document.webkitCancelFullScreen;
		} else {
			growlError("Can't enter fullscreen")
		}
		self.dom.remote.ondblclick = self.enterFullScreenMode;
		self.dom.fs.enterFullScreen.onclick = self.enterFullScreenMode;
		self.dom.fs.minimize.onclick =  self.exitFullScreen;
		self.idleTime = 0;
		self.dom.fs.hangup.title = 'Hang up';
		self.dom.hangUpIcon.title = self.dom.fs.hangup.title;
		mute = function () {
			self.baseMute();
			self.dom.remote.volume = volumeProportion[window.sound];
		};
	};
	self.exitFullScreen = function () {
		document.cancelFullScreen();
	};
	self.baseMute = mute;
	self.hideContainerTimeout = function () {
		self.idleTime += 1;
		if (self.idleTime > 6) {
			CssUtils.addClass(self.dom.videoContainer, 'inactive');
		}
	};
	self.enterFullScreenMode = function () {
		self.dom.remote.removeEventListener('dblclick', self.enterFullScreenMode);
		self.dom.videoContainer.requestFullscreen();
		CssUtils.addClass(self.dom.videoContainer, 'fullscreen');
		document.addEventListener('mousemove', self.fsMouseMove, false);
		self.hideContainerTimeoutRes = setInterval(self.hideContainerTimeout , 1000);
		/*to clear only function from resultOf setInterval should be passed, otherwise doesn't work*/
	};
	self.fsMouseMove = function () {
		if (self.idleTime > 0) {
			CssUtils.removeClass(self.dom.videoContainer, 'inactive');
		}
		self.idleTime = 0;
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
		optional: [ /*Firefox*/
			/*{DtlsSrtpKeyAgreement: true},*/
			{RtpDataChannels: false /*true*/}
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
		self.dom.fs.audio.className = value ? "icon-webrtc-mic" : "icon-webrtc-nomic";
		var title = value ? "Turn off your microphone" : "Turn on your microphone";
		self.dom.audioStatusIcon.title = title;
		self.dom.fs.audio.title = title;
	};
	self.setVideo = function (value) {
		self.constraints.video = value;
		self.dom.videoStatusIcon.className = value ? "icon-videocam" : "icon-no-videocam callActiveIcon";
		self.dom.fs.video.className = value ? "icon-webrtc-video" : "icon-webrtc-novideo";
		CssUtils.setVisibility(self.dom.local, value);
		var title = value ? "Turn off your webcamera" : "Turn on your webcamera";
		self.dom.videoStatusIcon.title = title;
		self.dom.fs.video.title = title;
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
			growlError(getText("You need to call/reply with {} to turn it on", kind));
		}
	};
	self.toggleVideo = function () {
		self.toggleInput(true);
	};
	self.toggleMic = function () {
		self.toggleInput(false);
	};
	self.onreply = function() {
		self.setHeaderText(getText("Waiting for <b>{}</b> to answer", self.receiverName))
	};
	self.setHeaderText = function(text) {
		self.page.title = text;
		self.page.fixTittle();
	};
	self.oniceconnectionstatechange = function () {
		if (self.pc.iceConnectionState == 'disconnected') {
			self.closeEvents("Connection has been lost");
		}
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
					// displayPreparedMessage(systemHeaderClass, new Date().getTime(),
					//getText("You have missed a call from <b>{}</b>", self.receiverName)
					// TODO replace growl with System message in user thread and unread
					growlInfo(getText("<div>You have missed a call from <b>{}</b></div>", self.receiverName));
				}, self.callTimeoutTime
		);
		self.dom.callAnswerText.textContent = getText("{} is calling you", self.receiverName)
	};
	self.setIconState = function(isCall) {
		CssUtils.setVisibility(self.dom.callIcon, !isCall);
		CssUtils.setVisibility(self.dom.hangUpIcon, isCall);
		CssUtils.setVisibility(self.dom.callUserList, !isCall);
		CssUtils.setVisibility(self.dom.videoContainer, isCall);
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
		isCallActive = isCallActive || self.isActive();
		if (isCallActive || Object.keys(onlineUsers).length > 1) {
			singlePage.showPage('/call');
		} else {
			growlError("Nobody's online. Who do you call?");
		}
		self.setIconState(isCallActive);
		if (!isCallActive) {
			self.setHeaderText("Make a call");
			self.updateDomOnlineUsers();
		} else {
			self.clearTimeout();
		}
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
		console.log(getDebugMessage("Call message {}", JSON.stringify(message)));
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
	self.handle = function (data) {
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
		// if (typeof RTCPeerConnection  == 'undefined' && typeof mozRTCPeerConnection == 'undefined' && typeof webkitRTCPeerConnection == 'undefined') {
		// 	growlError(getText("Unfortunately {} doesn't support webrtc. Video/audio call is unuvailable", browserVersion));
		// 	return;
		// }
		var RTCPeerConnection = isFirefox ? mozRTCPeerConnection : webkitRTCPeerConnection;
		self.pc = new RTCPeerConnection(self.pc_config, self.pc_constraints);
		self.pc.oniceconnectionstatechange = self.oniceconnectionstatechange;
		self.pc.onaddstream = function (event) {
			self.setVideoSource(self.dom.remote, event.stream);
			self.dom.remote.volume = volumeProportion[window.sound];
			self.setHeaderText(getText("You're talking to <b>{}</b> now", self.receiverName));
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
		singlePage.showDefaultPage();
		growlInfo(text);
		self.exitFullScreen(); /*also executes removing event on exiting from fullscreen*/
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
			singlePage.showDefaultPage();
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
			var wasActiveBefore = CssUtils.hasClass(event.target, self.activeUserClass);
			var users = self.dom.callUserList.childNodes;
			for (var i=0; i< users.length; i++) {
				CssUtils.removeClass(users[i], self.activeUserClass);
			}
			var userName = event.target.textContent;
			if (!wasActiveBefore) {
				self.receiverName = userName;
				self.receiverId = parseInt(onlineUsers[userName].userId);
				CssUtils.addClass(event.target, self.activeUserClass);
			}
		}
		event.stopPropagation();
	};
	self.attachDomEvents();
}


function WsHandler() {
	var self = this;
	// self.actions = {
	// 	addOnlineUser: chatHandler.changeOnlineUsers,
	// 	left: chatHandler.changeOnlineUsers,
	// 	onlineUsers: chatHandler.changeOnlineUsers,
	// 	changed: chatHandler.changeOnlineUsers,
	// 	messages: function (data) {
	// 		chatHandler.handleGetMessages(data.content);
	// 	},
	// 	system: function (data) {
	// 		chatHandler.displayPreparedMessage(systemHeaderClass, data.time, data.content, SYSTEM_USERNAME);
	// 	},
	// 	send: chatHandler.handleSendMessage,
	// 	rooms: function (data) {
	// 		userTable.setupChannels(data.content);
	// 	},
	// 	call: function (data) {
	// 		webRtcApi.onWsMessage(data);
	// 	},
	// 	growl: function (data) {
	// 		growlError(data.content);
	// 	}
	// };
	self.handlers = {
		channels: channelsHandler,
		chat: channelsHandler,
		webrtc: webRtcApi,
		growl: {
			handle: function (message) {
				growlError(message.content);
			}
		}
	};
	self.onWsMessage = function (message) {
		var jsonData = message.data;
		console.log(getDebugMessage("WS in: {}", jsonData));
		var data = JSON.parse(jsonData);
		self.handlers[data.handler].handle(data);
		//cache some messages to localStorage save only after handle, in case of errors +  it changes the message,
		storage.saveMessageToStorage(data, jsonData);
	};
	self.sendToServer = function (messageRequest) {
		var jsonRequest = JSON.stringify(messageRequest);
		var logEntry = jsonRequest.substring(0, 500);
		if (self.ws.readyState !== WebSocket.OPEN) {
			console.warn(getDebugMessage("Web socket is closed. Can't send {}", logEntry));
			return false;
		} else {
			console.log(getDebugMessage("WS out: {} ", logEntry));
			self.ws.send(jsonRequest);
			return true;
		}
	};

	self.onWsClose = function (e) {
		var reason = e.reason || e;
		if (e.code === 403) {
			var message = getText("Server has forbidden request because '{}'", reason);
			growlError(message);
			console.error(getDebugMessage(message));
		} else if (wsState === 0) {
			growlError("Can't establish connection with server");
			console.error(getDebugMessage("Chat server is down because {}", reason));
		} else if (wsState === 9) {
			growlError(getText("Connection to chat server has been lost", reason));
			console.error(getDebugMessage(
					'Connection to WebSocket has failed because "{}". Trying to reconnect every {}ms',
					e.reason, CONNECTION_RETRY_TIME));
		}
		wsState = 1;
		// Try to reconnect in 10 seconds
		setTimeout(self.start_chat_ws, CONNECTION_RETRY_TIME);
	};
	self.start_chat_ws = function () {
		self.ws = new WebSocket(API_URL);
		self.ws.onmessage = self.onWsMessage; // TODO
		self.ws.onclose = self.onWsClose;
		self.ws.onopen = function () {
			var message = "Connection to server has been established";
			if (wsState === 1) { // if not inited don't growl message on page load
				growlSuccess(message);
			}
			wsState = 9;
			console.log(getDebugMessage(message));
		};
	};

}

function Storage() {
	var self = this;
	self.loadMessagesFromLocalStorage = function () {
		return ; // TODO
		var jsonData = localStorage.getItem(STORAGE_NAME);
		if (jsonData != null) {
			var parsedData = JSON.parse(jsonData);
			console.log(getDebugMessage('Loading {} messages from localstorage', parsedData.length));
			// don't make sound on loadHistory
			var savedSoundStatus = window.sound;
			window.sound = 0;
			window.loggingEnabled = false;
			for (var i = 0; i < parsedData.length; i++) {
				wsHandler.actions[parsedData[i].action](parsedData[i]);
			}
			window.loggingEnabled = true;
			window.sound = savedSoundStatus;
		}
	};
		// Use both json and object repr for less JSON actions
	self.saveMessageToStorage = function(objectItem, jsonItem) {
		switch (objectItem['action']) {
			case 'addOnlineUser':
			case 'changed':
			case 'left':
				delete objectItem['content']; // don't store usernames in db
				jsonItem = JSON.stringify(objectItem);
			case 'system': // continue from 3 top events:
			case 'messages':
			case 'send':
				self.fastAddToStorage(jsonItem);
				break;
				// everything else is not saved;
		}
	};
	self.fastAddToStorage = function (text) {
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
	};
}

function createUserLi(userId, gender, username) {
	var icon;
	icon = document.createElement('i');
	icon.className = genderIcons[gender];
	var li = document.createElement('li');
	li.appendChild(icon);
	li.innerHTML += username;
	li.setAttribute(USER_ID_ATTR, userId);
	li.setAttribute(USER_NAME_ATTR, username);
	return li;
}

// OH man be carefull with this method, it should reinit history
function clearLocalHistory() {
	headerId = null;
	localStorage.clear();
	allMessagesDates = [];
	//TODO uncomment
	//chatBoxDiv.innerHTML = '';
	//chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp); //
	//chatBoxDiv.addEventListener("keydown", keyDownLoadUp);
	console.log(getDebugMessage('History has been cleared'));
	growlSuccess('History has been cleared');
}