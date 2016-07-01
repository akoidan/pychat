// html for messages
if (!("WebSocket" in window)) {
	alert("Your browser doesn't support Web socket, chat options will be unavailable. " +
	"Please use Chrome, Firefox, Safari, Internet Explorer 10+ or any modern browser.");
	throw "Browser doesn't support Web socket";
}
const CONNECTION_RETRY_TIME = 5000;


const privateHeaderClass = 'message-header-private';
const systemHeaderClass = 'message-header-system';

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

const CANCEL_ICON_CLASS_NAME = 'icon-cancel-circled-outline';

var smileRegex = /<img[^>]*code="([^"]+)"[^>]*>/g;
var timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;

var lastLoadUpHistoryRequest = 0;
var mouseWheelEventName = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
// browser tab notification
var newMessagesCount = 0;
var isCurrentTabActive = true;
//localStorage  key
const STORAGE_NAME = 'main';
//current top message id for detecting from what

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
	"<span>Every time you join chat those help messages will be shown to you. " +
	"You can disable them in you profile settings (<i class='icon-wrench'></i> icon). Simply click on popup to hide them</span>",
	"<span>You can create a new room by clicking on <i class='icon-plus-squared'></i> icon." +
	" To delete created room hover mouse on its name and click on <i class='icon-cancel-circled-outline'></i> icon.</span>",
	"<span>You can make an audio/video call. Currently pychat allows calling only one person." +
	" To call someone you need to create ( <i class='icon-plus-squared'></i>) and join direct message," +
	" open call dialog by pressing <i class='icon-phone '></i> and click on phone <i class='icon-phone-circled'></i> </span>",
	"<span>You can change chat appearance in your profile. To open profile click on <i class='icon-wrench'></i> icon in top right corner</span>",
	"<span>Did you know that you could paste multiple lines content by simply pressing <b>shift+Enter</b>?</span>",
	"<span>You can add smileys by clicking on bottom right <i class='icon-smile'></i> icon. To close appeared smile container click outside of it or press <b>Esc</b></span>",
	"You can comment somebody's message. This will be shown to all users in current channel. Just click on message time" +
			"and it's content appears in message text",
	"<span>You have a feature to suggest or you lack some functionality? Click on <i class='icon-pencil'></i>icon on top menu and write your " +
			"suggestion there</span>",
	"<span>Chat uses your browser cache to store messages. If you want to clear history and all cached messages just click " +
	"<i class='icon-clear'></i> icon on the top menu</span>",
	"You can view offline users in current channel if u click on 'CHANNEL ONLINE'",
	"<span>You can invite user to current room by clicking on <i class='icon-user-plus'></i> icon</span>",
	"<span>You can collapse user list by pressing on <i class='icon-angle-circled-up'></i> icon</span>"
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
	singlePage = new PageHandler();
	webRtcApi = new WebRtcApi();
	smileyUtil = new SmileyUtil();
	wsHandler = new  WsHandler();
	//bottom call loadMessagesFromLocalStorage(); s
	smileyUtil.init();
	storage = new Storage();
	storage.loadMessagesFromLocalStorage();
	//TODO channelsHandler.loadMessagesFromLocalStorage(); /*Smileys should be encoded by time message load, otherwise they don't display*/
	wsHandler.start_chat_ws();
});


function Page() {
	var self = this;
	self.dom = {
		container: document.body,
		el: []
	};
	self.setParams = function(params){
		if (params) {
			console.warn(getDebugMessage('Params are not set for {}', self.getUrl()))
		}
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
		self.rendered = true;
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
		hide: self.hide,
		show: self.show,
		dom: self.dom
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
	self.show = function() {
		self.super.show();
		self.dom.issue.focus();
	};
	self.update = self.show;
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
			if (historyStorage != null) {
				params['log'] = historyStorage
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

function ViewProfilePage() {
	var self = this;
	Page.call(self);
	self.getUrl = function () {
		return getText('/profile/{}', self.userId);
	};
	self.setParams = function(params) {
		self.setUserId(params[0]);
	};
	self.getTitle = function () {
		self.username = self.username || self.dom.el[0].getAttribute('username');
		return getText("<b>{}</b>'s profile", self.username );
	};
	self.setUserId = function (userId) {
		self.userId = userId;
	}
}

function ChangeProfilePage() {
	var self = this;
	Page.call(self);
	self.url = '/profile';
	self.title = 'Change profile';
	self.onLoad = function (html) {
		self.rendered = true;
		self.super.onLoad(html);
		doGet(CHANGE_PROFILE_JS_URL, function () {
			initChangeProfile();
		});
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
		'/report_issue': new IssuePage(),
		'/chat/': channelsHandler,
		'/statistics': new AmchartsPage(),
		'/profile/': new ViewProfilePage(),
		'/profile': new  ChangeProfilePage()
	};
	self.pageRegex = /\w\/#(\/\w+\/?)(.*)/g;
	self.init = function () {
		self.showPageFromUrl();
		window.onhashchange = self.showPageFromUrl;
	};
	self.getPage = function(url) {
		return self.pages[url];
	};
	self.showPageFromUrl = function () {
		var currentUrl = window.location.href;
		var match = self.pageRegex.exec(currentUrl);
		var params;
		var page;
		if (match) {
			page = match[1];
			var handler =  self.getPage(page);
			if (match[2]) {
				params = match[2].split('/');
			}
			if (handler) {
				self.showPage(page, params, true);
			} else {
				self.showDefaultPage();
			}
		} else {
			self.showDefaultPage();
		}
	};
	self.showDefaultPage = function () {
		self.showPage('/chat/', [DEFAULT_CHANNEL_NAME]);
	};
	self.pushHistory = function() {
		var historyUrl = getText("#{}", self.currentPage.getUrl());
		// TODO remove triple, carefull of undefined tittle in ViewProfilePage
		window.history.pushState(historyUrl, historyUrl, historyUrl);
	};
	self.showPage = function (page, params, dontHistory) {
		console.log(getDebugMessage('Rendering page "{}"', page));
		if (self.currentPage) self.currentPage.hide();
		self.currentPage = self.pages[page];
		if (self.currentPage.rendered) {
			self.currentPage.update(params);
		} else {
			self.currentPage.setParams(params);
			self.currentPage.render();
		}
		if (!dontHistory) {
			self.pushHistory(dontHistory);
		}
	};
	self.init();
}

function ChannelsHandler() {
	var self = this;
	Page.call(self);
	self.url = '/chat/';
	self.title = getText("Hello, <b>{}</b>", loggedUser);
	self.render = self.show;
	self.ROOM_ID_ATTR = 'roomid';
	self.activeChannel = DEFAULT_CHANNEL_NAME;
	self.channels = {};
	self.childDom = {
		wrapper: $('wrapper'),
		userMessageWrapper: $('userMessageWrapper'),
		chatUsersTable: $("chat-user-table"),
		rooms: $("rooms"),
		activeUserContext: null,
		userContextMenu: $('user-context-menu'),
		addUserHolder: $('addUserHolder'),
		addRoomHolder: $('addRoomHolder'),
		addRoomInput: $('addRoomInput'),
		addUserList: $('addUserList'),
		addUserInput: $('addUserInput'),
		addRoomButton: $('addRoomButton'),
		directUserTable: $('directUserTable'),
		imgInput: $('imgInput'),
		usersStateText: $('usersStateText'),
		inviteUser: $('inviteUser'),
		navCallIcon: $('navCallIcon')
	};
	self.getActiveChannel = function() {
		return self.channels[self.activeChannel];
	};
	self.childDom.minifier = {
		channel: {
			icon: $('channelsMinifier'),
			body: self.childDom.rooms
		},
		direct: {
			icon: $('directMinifier'),
			body: self.childDom.directUserTable
		},
		user: {
			icon: $('usersMinifier'),
			body: self.childDom.chatUsersTable
		}
	};
	for (var attrname in self.dom) {
		if (self.dom.hasOwnProperty(attrname)) {
			self.childDom[attrname] = self.dom[attrname];
		}
	}
	self.dom = self.childDom;
	delete self.childDom;
	self.dom.el = [
		self.dom.wrapper,
		self.dom.userMessageWrapper
	];
	self.getUrl = function () {
		return self.url + self.activeChannel;
	};
	self.update = function (params) {
		self.setActiveChannel(self.parseActiveChannelFromParams(params));
		self.show();
	};
	self.parseActiveChannelFromParams = function (params) {
		if (params && params.length > 0) {
			return params[0];
		}
	};
	self.setParams = function(params){
		self.activeChannel = self.parseActiveChannelFromParams(params);
	};
	self.roomClick = function (event) {
		var target = event.target;
		var tagName = target.tagName;
		if (tagName == 'UL') {
			return;
		}
		var liEl;
		if (tagName == 'I' || tagName == 'SPAN') {
			liEl = target.parentNode;
		} else {
			liEl = target;
		}
		var roomId = parseInt(liEl.getAttribute(self.ROOM_ID_ATTR));
		if (CssUtils.hasClass(target, CANCEL_ICON_CLASS_NAME)) {
			wsHandler.sendToServer({
				action: 'deleteRoom',
				roomId: roomId
			});
			return;
		}
		self.setActiveChannel(self.generateRoomKey(roomId));
	};
	self.setActiveChannel = function (key) {
		self.hideActiveChannel();
		self.activeChannel = key;
		self.showActiveChannel();
		singlePage.pushHistory();
	};
	self.generateRoomKey = function (roomId) {
		return "r" + roomId;
	};
	self.showActiveChannel = function (){
		if (self.activeChannel) {
			var chatHandler = self.getActiveChannel();
			if (chatHandler == null) {
				self.activeChannel = DEFAULT_CHANNEL_NAME;
				chatHandler = self.getActiveChannel();
			}
			chatHandler.show();
			if (chatHandler.isPrivate()) {
				CssUtils.hideElement(self.dom.inviteUser);
				CssUtils.showElement(self.dom.navCallIcon);
			} else {
				CssUtils.showElement(self.dom.inviteUser);
				CssUtils.hideElement(self.dom.navCallIcon);
			}
		}
		userMessage.focus()
	};
	self.toggleChannelOfflineOnline = function() {
		var isOnline = CssUtils.toggleClass(self.dom.chatUsersTable, 'hideOffline');
		self.dom.usersStateText.textContent = isOnline ? "Channel online" : "Channel users";
	};
	self.hideActiveChannel = function (){
		if (self.activeChannel && self.getActiveChannel()) {
			self.getActiveChannel().hide()
		}
	};
	self.userClick = function (event) {
		throw 'Deprecated';
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
		}
	};
	self.handleFileSelect = function (evt) {
		var files = evt.target.files;
		var file = files[0];
		if (files && file) {
			var reader = new FileReader();
			reader.onload = function (readerEvt) {
				var binaryString = readerEvt.target.result;
				self.sendMessage({
					image: getText("data:{};base64,{}",file.type, btoa(binaryString)),
					content: null,
					action: 'sendMessage',
					channel: self.activeChannel
				});
				self.dom.imgInput.value = "";
			};
			reader.readAsBinaryString(file);
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
	self.addUserHolderClick = function (event) {
		var target = event.target;
		if (target.tagName != 'LI') {
			return
		}
		var userId = parseInt(target.getAttribute(USER_ID_ATTR));
		var message = {
			action: self.addUserHolderAction,
			userId: userId
		};
		if (self.addUserHolderAction == 'inviteUser') {
			message.roomId = self.getActiveChannel().roomId;
		}
		wsHandler.sendToServer(message);
		self.addUserHandler.hide();
	};
	self.showAddRoom = function() {
		self.addRoomHandler.show();
		self.dom.addRoomInput.focus();
	};
	self.showInviteUser = function() {
		self.fillAddUser();
		self.addUserHandler.show();
		self.dom.addUserInput.focus();
		self.addUserHolderAction = 'inviteUser';
		self.addUserHandler.setHeaderText(getText("Invite user to room <b>{}</b>", self.getActiveChannel().roomName));
	};
	self.inviteUser = function(message) {
		self.createNewRoomChatHandler(message.roomId, message.name, message.content);
	};
	self.fillAddUser = function() {
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
	self.showAddUser = function () {
		self.fillAddUser();
		self.addUserHandler.show();
		self.addUserHolderAction = 'addDirectChannel';
		self.addUserHandler.setHeaderText("Create direct channel");
		self.dom.addUserInput.focus();
	};
	self.getAllUsersInfo = function () {
		return self.channels[DEFAULT_CHANNEL_NAME].allUsers;
	};
	self.filterAddUser = function (event) {
		var filterValue = self.dom.addUserInput.value;
		if (event.keyCode == 13) {
			if (self.addUserUsersList[filterValue]) {
				self.addUserHolderClick({target:self.addUserUsersList[filterValue]});
				return;
			}
		}
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
	self.finishAddRoom = function () {
		var roomName = self.dom.addRoomInput.value;
		var sendSucc = wsHandler.sendToServer({
			action: 'addRoom',
			name: roomName
		});
		if (sendSucc) {
			self.addRoomHandler.hide()
		}
	};
	self.finishAddRoomOnEnter = function (event) {
		if (event.keyCode == 13) { // enter
			self.finishAddRoom();
		}
	};
	self.getAnotherUserId = function(allUsersIds) {
		var anotherUserId;
		if (allUsersIds.length == 2) {
			anotherUserId = allUsersIds[0] == '' + loggedUserId ? allUsersIds[1] : allUsersIds[0];
		} else {
			anotherUserId = allUsersIds[0];
		}
		return anotherUserId;
	};
	self.createChannelChatHandler = function(roomId, li, users, roomName) {
		var i = document.createElement('span');
		i.className = CANCEL_ICON_CLASS_NAME;
		li.appendChild(i);
		var roomKey = self.generateRoomKey(roomId);
		li.setAttribute(self.ROOM_ID_ATTR, roomId);
		self.channels[roomKey] = new ChatHandler(li, users, roomId, roomName);
	};
	self.createNewUserChatHandler = function(roomId, users) {
		var allUsersIds = Object.keys(users);
		var anotherUserId = self.getAnotherUserId(allUsersIds);
		var roomName = users[anotherUserId].user;
		var li = createUserLi(anotherUserId, users[anotherUserId].sex, roomName);
		self.dom.directUserTable.appendChild(li);
		self.createChannelChatHandler(roomId, li, users, roomName);
		return anotherUserId;
	};
	self.createNewRoomChatHandler = function(roomId, roomName, users) {
		var li = document.createElement('li');
		self.dom.rooms.appendChild(li);
		li.innerHTML = roomName;
		self.createChannelChatHandler(roomId, li, users, roomName);
	};
	self.getCurrentRoomIDs = function () {

	};
	self.destroyChannel = function(channelKey) {
		self.channels[channelKey].destroy();
		delete self.channels[channelKey];
	};
	self.setRooms = function (message) {
		var rooms = message.content;
		var oldRooms = [];
		for (var channelKey in self.channels) {
			if (self.channels.hasOwnProperty(channelKey) && channelKey.startsWith('r')) {
				var oldRoomId = parseInt(channelKey.substring(1));
				oldRooms.push(oldRoomId);
				if (!rooms[oldRoomId]) {
					self.destroyChannel(channelKey);
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
		self.showActiveChannel();
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
	self.deleteRoom = function(message) {
		var roomId = message.roomId;
		var userId = message.userId;
		var channel = self.generateRoomKey(roomId);
		var handler = self.channels[channel];
		if (handler.dom.roomNameLi.getAttribute('userid') || userId == loggedUserId) {
			self.destroyChannel(channel);
			growlInfo(getText("<div>Channel <b>{}</b> has been deleted</div>", handler.dom.roomNameLi.textContent));
			if (self.activeChannel == channel) {
				self.setActiveChannel(DEFAULT_CHANNEL_NAME);
			}
		} else {
			handler.removeUser(message)
		}
	};
	self.addDirectChannel = function(message) {
		var users = message.users;
		var anotherUserName = self.getAllUsersInfo();
		var channelUsers = {};
		channelUsers[users[1]] = anotherUserName[users[1]];
		channelUsers[users[0]] = anotherUserName[users[0]];
		var anotherUserId = self.createNewUserChatHandler(message.roomId, channelUsers);
		growlInfo(getText('<span>Channel for user <b>{}</b> has been created</span>', anotherUserName[anotherUserId].user));
	};
	self.addRoom = function(message) {
		var users = message.users;
		var roomName = message.name;
		var channelUsers = {};
		channelUsers[users[0]] =  self.getAllUsersInfo()[users[0]];
		self.createNewRoomChatHandler(message.roomId, roomName, channelUsers);
		growlInfo(getText('<span>Room <b>{}</b> has been created</span>', roomName));
	};
	self.viewProfile = function() {
		singlePage.showPage('/profile/', self.getActiveUserId());
	};
	self.init = function() {
		self.dom.chatUsersTable.addEventListener('contextmenu', self.showContextMenu, false);
		self.dom.rooms.onclick = self.roomClick;
		self.dom.directUserTable.onclick = self.roomClick;
		self.dom.imgInput.onchange = self.handleFileSelect;
		self.dom.addRoomInput.onkeypress = self.finishAddRoomOnEnter;
		self.dom.addRoomButton.onclick = self.finishAddRoom;
		self.addUserHandler = new Draggable(self.dom.addUserHolder, "");
		self.addRoomHandler = new Draggable(self.dom.addRoomHolder, "Create new room");
		var minifier = self.dom.minifier;
		for (var el in minifier) {
			if (minifier.hasOwnProperty(el)) {
				minifier[el].icon.onclick = self.minifyList;
			}
		}
		self.dom.usersStateText.onclick = self.toggleChannelOfflineOnline;
		self.dom.usersStateText.click()
	};
	self.minifyList = function(event) {
		var minifier = self.dom.minifier[event.target.getAttribute('name')];
		var visible = CssUtils.toggleVisibility(minifier.body);
		minifier.icon.className = visible ? 'icon-angle-circled-down' :'icon-angle-circled-up';

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
	self.init();
}

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

function ChatHandler(li, allUsers, roomId, roomName) {
	var self = this;
	self.roomId = roomId;
	self.roomName = roomName;
	self.dom = {
		chatBoxDiv: document.createElement('div'),
		userList: document.createElement('ul'),
		roomNameLi: li,
		newMessages: document.createElement('span'),
		deleteIcon: li.lastChild,
		chatBoxHolder: $('chatBoxHolder')
	};
	self.newMessages = 0;
	self.allMessages = [];
	self.allMessagesDates = [];
	self.activeRoomClass = 'active-room';
	self.dom.newMessages.className = 'newMessages hidden';
	li.appendChild(self.dom.newMessages);
	self.SELF_HEADER_CLASS = 'message-header-self';
	self.OTHER_HEADER_CLASS = 'message-header-others';
	self.dom.userList.className = 'hidden';
	channelsHandler.dom.chatUsersTable.appendChild(self.dom.userList);
	self.dom.chatBoxDiv.className = 'chatbox hidden';
	self.dom.chatBoxHolder.appendChild(self.dom.chatBoxDiv);
	// tabindex allows focus, focus allows keydown binding event
	self.dom.chatBoxDiv.tabindex="0";
	self.dom.chatBoxDiv.onkeydown=keyDownLoadUp;
	self.show = function () {
		self.rendered = true;
		CssUtils.showElement(self.dom.chatBoxDiv);
		CssUtils.showElement(self.dom.userList);
		CssUtils.addClass(self.dom.roomNameLi, self.activeRoomClass);
		CssUtils.hideElement(self.dom.newMessages);
		CssUtils.showElement(self.dom.deleteIcon);
		var isHidden = webRtcApi.isActive() && webRtcApi.channel != webRtcApi.generateRoomKey(roomId);
		CssUtils.setVisibility(webRtcApi.dom.callContainer, self.callIsAttached && !isHidden);
	};
	self.hide = function () {
		CssUtils.hideElement(self.dom.chatBoxDiv);
		CssUtils.hideElement(self.dom.userList);
		CssUtils.removeClass(self.dom.roomNameLi, self.activeRoomClass);
	};
	self.setChannelAttach = function(isAttached) {
		self.callIsAttached = isAttached;
	};
	self.isPrivate = function() {
		return self.dom.roomNameLi.hasAttribute(USER_ID_ATTR);
	};
	self.getOpponentId = function() {
		return self.dom.roomNameLi.getAttribute(USER_ID_ATTR);
	};
	self.getUserNameById = function(id) {
		return self.allUsers[id].user;
	};
	self.addUserToDom = function(message) {
		if (!self.allUsers[message.userId]) {
			self.allUsers[message.userId] = {
				sex: message.sex,
				user: message.user
			};
			self.addDomUserOnline(message.userId, message.sex, message.user);
		}
	};
	self.addUserToAll = function(message) {
		self.addUserToDom(message);
	};
	self.setDomOnlineUsers = function(users) {
		self.dom.userList.innerHTML = null;
		self.allUsers = users;
		for (var userId in self.allUsers) {
			if (self.allUsers.hasOwnProperty(userId)) {
				var user = self.allUsers[userId];
				self.addDomUserOnline(userId, user.sex,user.user);
			}
		}
	};
	self.addDomUserOnline = function(userId, sex, username) {
		var li = createUserLi(userId, sex, username);
		li.className = 'offline';
		self.allUsers[userId].li = li;
		self.dom.userList.appendChild(li);
	};
	self.setDomOnlineUsers(allUsers);
	self.isHidden = function() {
		return CssUtils.isHidden(self.dom.chatBoxDiv);
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
	self.removeUser = function(message) {
		//if (self.onlineUsers.indexOf(message.userId) >= 0) {
		//	message.content = self.onlineUsers;
		//	self.printChangeOnlineStatus('has left the conversation.', message, chatLogout);
		//}
		var user = self.allUsers[message.userId];
		CssUtils.deleteElement(user.li);
		var dm = getText('User <b>{}</b> has left the conversation', user.user);
		self.displayPreparedMessage(systemHeaderClass, message.time, dm, SYSTEM_USERNAME);
		delete self.allUsers[message.userId];
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
	self.increaseNewMessages = function() {
		if (self.isHidden()) {
			self.newMessages += 1;
			self.dom.newMessages.textContent = self.newMessages;
			CssUtils.showElement(self.dom.newMessages);
			CssUtils.hideElement(self.dom.deleteIcon);
		}
	};
	self.printMessage = function (data) {
		var user = self.allUsers[data.userId];
		if (loggedUserId === data.userId) {
			checkAndPlay(chatOutgoing);
		} else {
			checkAndPlay(chatIncoming);
			setTimeout(vibrate);
		}
		self.increaseNewMessages();
		var displayedUsername = user.user;
		//private message
		var prefix = false;
		var headerStyle = data.userId  == loggedUserId ? self.SELF_HEADER_CLASS : self.OTHER_HEADER_CLASS;
		var preparedHtml;
		if (data.image) {
			preparedHtml = getText("<img src=\'{}\'/>", data.image);
		} else {
			preparedHtml = smileyUtil.encodeSmileys(data['content']);
		}
		self.displayPreparedMessage(headerStyle, data['time'], preparedHtml, displayedUsername, prefix);
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
		self.headerId = firstMessage.id;

		message.forEach(function (message) {
			self.printMessage(message);
		});
		lastLoadUpHistoryRequest = 0; // allow fetching again, after new header is set
	};
	self.addOnlineUser = function (message) {
		self.addUserToDom(message);
		self.printChangeOnlineStatus('appeared online.', message, chatLogin);
	};
	self.removeOnlineUser = function(message) {
		self.printChangeOnlineStatus('gone offline.', message, chatLogout);
	};
	self.printChangeOnlineStatus = function (action, message, sound) {
		var dm;
		var username = self.allUsers[message.userId].user;
		if (message.userId == loggedUserId) {
			dm = 'You have ' + action ;
		} else {
			dm = getText('User <b>{}</b> has {}', username, action);
		}
		checkAndPlay(sound);
		self.displayPreparedMessage(systemHeaderClass, message.time, dm, SYSTEM_USERNAME);
		self.setOnlineUsers(message);
	};
	self.setOnlineUsers = function(message) {
		self.onlineUsers = message.content;
		console.log(getDebugMessage("Load user names: {}", Object.keys(self.onlineUsers)));
		for (var userId in self.allUsers) {
			if (self.allUsers.hasOwnProperty(userId)) {
				var user = self.allUsers[userId];
				if (self.onlineUsers.indexOf(parseInt(userId)) >= 0) {
					CssUtils.removeClass(user.li, 'offline');
				} else {
					CssUtils.addClass(user.li, 'offline');
				}
			}
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
				headerId: self.headerId,
				count: count,
				action: 'messages'
			};
			wsHandler.sendToServer(getMessageRequest);
		}
	};
	self.destroy = function () {
		var elements = [self.dom.chatBoxDiv, self.dom.roomNameLi, self.dom.userList];
		for (var i = 0; i< elements.length; i++) {
			CssUtils.deleteElement(elements[i]);
		}
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
		remote: $('remoteVideo'),
		local: $('localVideo'),
		callSound: $('chatCall'),
		hangUpIcon: $('hangUpIcon'),
		audioStatusIcon: $('audioStatusIcon'),
		videoStatusIcon: $('videoStatusIcon'),
		videoContainer: $('videoContainer'),
		fsContainer: $('icon-webrtc-cont'),
		callIcon: $('callIcon'),
		fs: { /*FullScreen*/
			video: $('fs-video'),
			audio: $('fs-audio'),
			hangup: $('fs-hangup'),
			minimize: $('fs-minimize'),
			enterFullScreen: $('enterFullScreen')
		}
	};
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
		self.dom.hangUpIcon.onclick = self.hangUp;
		self.dom.fs.hangup.onclick = self.hangUp;
		self.dom.fs.audio.onclick = self.toggleMic;
		self.dom.audioStatusIcon.onclick = self.toggleMic;
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
		headerText.innerHTML = text;
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
		self.channel = message.channel;
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
		isCall = isCall || self.isActive();
		CssUtils.setVisibility(self.dom.hangUpIcon, isCall);
		CssUtils.setVisibility(self.dom.videoContainer, isCall);
		CssUtils.setVisibility(self.dom.callIcon, !isCall);
	};
	self.toggleCallContainer = function () {
		if (self.isActive()) {
			return;
		}
		var visible = CssUtils.toggleVisibility(self.dom.callContainer);
		self.setIconState(false);
		channelsHandler.getActiveChannel().setChannelAttach(!visible);
	};
	self.showCallDialog = function (isCallActive) {
		isCallActive = isCallActive || self.isActive();
		var activeChannel = channelsHandler.getActiveChannel();
		self.setIconState(isCallActive);
		if (!isCallActive) {
			self.setHeaderText("Make a call");
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
		self.createAfterResponseCall();
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
		self.createAfterResponseCall();
	};
	self.captureInput = function (callback, callIfNoSource) {
		if (self.constraints.audio || self.constraints.video) {
			navigator.getUserMedia(self.constraints, callback, self.failWebRtc);
		} else if (callIfNoSource) {
			callback();
		}
	};
	self.callPeople = function () {
		var activeChannel = channelsHandler.getActiveChannel();
		if (!(Object.keys(activeChannel.onlineUsers).length > 1)) {
			growlError(getText("<span>Can't make a call, user <b>{}</b> is not online.</span>",
					activeChannel.getUserNameById(activeChannel.getOpponentId())));
			return;
		}
		self.receiverId = activeChannel.getOpponentId();
		self.receiverName = activeChannel.getUserNameById(self.receiverId);
		self.channel = channelsHandler.activeChannel;
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
	self.createAfterResponseCall = function () {
		self.captureInput(self.createCallAfterCapture, true);
		channelsHandler.setActiveChannel(self.channel);
		channelsHandler.getActiveChannel().setChannelAttach(true);
		CssUtils.showElement(self.dom.callContainer);
		self.showCallDialog(true);
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
		if (data.type != 'offer' && self.receiverId != data.userId) {
			console.warn(getDebugMessage("Skipping webrtc because message.userId={}, and self.receiverId={}'", data.userId,
					self.receiverId));
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
		self.receiverId = null;
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
		self.setIconState(false);
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
		wsHandler.sendToServer({
			content: content,
			action: 'call',
			type: type,
			channel: self.channel
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
	self.attachDomEvents();
}


function WsHandler() {
	var self = this;
	self.dom = {
		onlineStatus: $('onlineStatus'),
		onlineClass: 'online',
		offlineClass: 'offline'
	};
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
			growlError("Can't send message, because connection is lost :(")
			return false;
		} else {
			console.log(getDebugMessage("WS out: {} ", logEntry));
			self.ws.send(jsonRequest);
			return true;
		}
	};

	self.setStatus = function(isOnline) {
		var statusClass = isOnline ? self.dom.onlineClass : self.dom.offlineClass;
		CssUtils.setOnOf(self.dom.onlineStatus, statusClass, [self.dom.onlineClass, self.dom.offlineClass]);
	};
	self.onWsClose = function (e) {
		self.setStatus(false);
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
			self.setStatus(true);
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
	self.headerId // For all channels TODO
	localStorage.clear();
	allMessagesDates = [];
	//TODO uncomment
	//chatBoxDiv.innerHTML = '';
	//chatBoxDiv.addEventListener(mouseWheelEventName, mouseWheelLoadUp); //
	//chatBoxDiv.addEventListener("keydown", keyDownLoadUp);
	console.log(getDebugMessage('History has been cleared'));
	growlSuccess('History has been cleared');
}