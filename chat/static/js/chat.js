const CONNECTION_RETRY_TIME = 5000;
const SYSTEM_HEADER_CLASS = 'message-header-system';
const TIME_SPAN_CLASS = 'timeMess';
const CONTENT_STYLE_CLASS = 'message-text-style';
const DEFAULT_CHANNEL_NAME = 1;
const USER_ID_ATTR = 'userid'; // used in ChannelsHandler and ChatHandler
const USER_NAME_ATTR = 'username';  // used in ChannelsHandler and ChatHandler
const SYSTEM_USERNAME = 'System';
const CANCEL_ICON_CLASS_NAME = 'icon-cancel-circled-outline';
const GENDER_ICONS = {
	'Male': 'icon-man',
	'Female': 'icon-girl',
	'Secret': 'icon-user-secret'
};

var timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;
var mouseWheelEventName = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
// browser tab notification
// input type that contains text for sending message
var userMessage;
// navbar label with current user name
var headerText;
// OOP variables
var notifier;
var webRtcApi;
var smileyUtil;
var channelsHandler;
var wsHandler;
var storage;
var singlePage;
var painter;

onDocLoad(function () {
	userMessage = $("usermsg");
	headerText = $('headerText');
	// some browser don't fire keypress event for num keys so keydown instead of keypress
	channelsHandler = new ChannelsHandler();
	singlePage = new PageHandler();
	webRtcApi = new WebRtcApi();
	smileyUtil = new SmileyUtil();
	wsHandler = new WsHandler();
	//bottom call loadMessagesFromLocalStorage(); s
	smileyUtil.init();
	storage = new Storage();
	notifier = new NotifierHandler();
	painter = new Painter();
	console.log(getDebugMessage("Trying to resolve WebSocket Server"));
	wsHandler.start_chat_ws();
	showHelp();
});

function readFileAsB64(file, callback, showGrowl) {
	if (!file) {
		console.warn(getDebugMessage("Context contains no files"));
	} else if (file.type.indexOf("image") < 0) {
		growlError("<span>Invalid image type <b>{}</b></span>".format(encodeHTML(file.type)));
	} else {
		var fileName = file.name ? file.name : '';
		if (showGrowl) {
			growlInfo("<span>Sending file <b>{}</b> ({}) to server</span>".format(fileName, bytesToSize(file.size)));
		}
		var reader = new FileReader();
		reader.onload = callback;
		reader.readAsDataURL(file);
	}
}

function Painter() {
	var self = this;
	Draggable.call(self, $('canvasHolder'), "Painter");
	self.PICKED_TOOL_CLASS = 'n-active-icon';
	self.dom.canvas = $('painter');
	self.dom.color = $('paintPicker');
	self.dom.sendButton = $('paintSend');
	self.dom.clearButton = $('paintClear');
	self.dom.range = $('paintRadius');
	self.dom.pen = $('paintPen');
	self.dom.eraser = $('paintEraser');
	self.dom.colorIcon = $('paintPickerIcon');
	self.ctx = self.dom.canvas.getContext('2d');
	self.mouse = {x: 0, y: 0};
	self.serializer = new XMLSerializer();
	self.mouseDown = 0;
	self.scale = 1;
	self.originx = 0;
	self.originy = 0;
	self.startDraw = function (e) {
		self.mouseDown++;
		var rect = painter.dom.canvas.getBoundingClientRect();
		self.leftOffset = rect.left;
		self.topOffset = rect.top;
		self.ctx.beginPath();
		self.dom.canvas.addEventListener('mousemove', self.onPaint, false);
	};
	self.changeColor = function (event) {
		self.ctx.strokeStyle = event.target.value;
		self.setColorStrikeColor();
		self.setPenUrl();
	};
	self.setColorStrikeColor = function () {
		self.dom.pen.style.color = self.ctx.strokeStyle;
	};
	self.setPen = function () {
		CssUtils.removeClass(self.dom.pen, self.PICKED_TOOL_CLASS);
		CssUtils.addClass(self.dom.eraser, self.PICKED_TOOL_CLASS);
		self.mode = 'onPaintPen';
		self.ctx.globalCompositeOperation = "source-over";
		self.setPenUrl();
	};
	self.setPenUrl = function () {
		var isPaint = self.mode == 'onPaintPen';
		var width = self.ctx.lineWidth;
		if (width < 3) {
			width = 3;
		} else if (width > 126) {
			width = 126;
		}
		var fill = isPaint ? self.ctx.strokeStyle : '#aaaaaa';
		var stroke = isPaint ? '' : ' stroke="black" stroke-width="2" ';
		var imB64 = btoa('<svg xmlns="http://www.w3.org/2000/svg" height="128" width="128"><circle cx="64" cy="64" r="{0}" fill="{1}"{2}/></svg>'.formatPos(
				width, fill, stroke
		));
		self.dom.canvas.style.cursor = 'url(data:image/svg+xml;base64,{}) {} {}, auto'.format(imB64, 64, 64);
	};
	self.setEraser = function () {
		CssUtils.addClass(self.dom.pen, self.PICKED_TOOL_CLASS);
		CssUtils.removeClass(self.dom.eraser, self.PICKED_TOOL_CLASS);
		self.ctx.globalCompositeOperation = "destination-out";
		self.mode = 'onPaintEraser';
		self.setPenUrl();
	};
	self.changeRadius = function (event) {
		self.ctx.lineWidth = parseInt(event.target.value);
		self.setPenUrl();
	};
	self.finishDraw = function () {
		if (self.mouseDown > 0) {
			self.mouseDown--;
			self.dom.canvas.removeEventListener('mousemove', self.onPaint, false);
		}
	};
	self.getScaledOrdinate = function(ordinateName/*width*/, value) {
		var clientOrdinateName = 'client'+ ordinateName.charAt(0).toUpperCase() + ordinateName.substr(1); /*clientWidth*/
		var clientOrdinate =  self.dom.canvas[clientOrdinateName];
		var ordinate = self.dom.canvas[ordinateName];
		return ordinate == clientOrdinate ? value : Math.round(ordinate * value / clientOrdinate); // apply page zoom
	};
	self.onPaint = function (e) {
		var x = e.pageX - self.leftOffset;
		var y = e.pageY - self.topOffset;
		self[self.mode](self.getScaledOrdinate('width', x), self.getScaledOrdinate('height', y));
	};
	self.onPaintPen = function (x, y) {
		self.ctx.lineTo(x, y);
		self.ctx.stroke();
	};
	self.onPaintEraser = function (x, y) {
		self.ctx.lineTo(x, y);
		self.ctx.stroke();
	};
	self.clearCanvas = function () {
		self.ctx.clearRect(0, 0, parseInt(self.dom.canvas.width), parseInt(self.dom.canvas.height));
	};
	self.sendImage = function () {
		wsHandler.sendToServer({
			image: self.dom.canvas.toDataURL(),
			content: null,
			action: 'sendMessage',
			channel: channelsHandler.activeChannel
		});
		self.hide();
	};
	self.contKeyPress = function (event) {
		if (event.keyCode === 13) {
			self.sendImage();
		}
	};
	self.canvasImagePaste = function(e) {
		if (e.clipboardData) {
			var items = e.clipboardData.items;
			if (items) {
				for (var i = 0; i < items.length; i++) {
					self.readAndPasteCanvas(items[i].getAsFile());
				}
				self.preventDefault(e);
			}
		}
	};
	self.canvasImageDrop = function(e) {
		self.preventDefault(e);
		self.readAndPasteCanvas(e.dataTransfer.files[0]);
	};
	self.readAndPasteCanvas = function(file) {
		readFileAsB64(file, function(event) {
			var img = new Image();
			img.src = event.target.result;
			var cnvW = self.dom.canvas.width;
			var cnvH = self.dom.canvas.height;
			var imgW = img.width;
			var imgH = img.height;
			if (imgW > cnvW || imgH > cnvH){
				var scaleH = imgH / cnvH;
				var scaleW = imgW / cnvW;
				var scale = scaleH > scaleW ? scaleH : scaleW;
				self.ctx.drawImage(img,
						0, 0, imgW, imgH,
						0, 0, Math.round(imgW / scale), Math.round(imgH / scale));
			} else {
				self.ctx.drawImage(img, 0, 0, imgW, img.height);
			}
		});
	};
	self.preventDefault = function (e) {
		e.preventDefault();
	};
	self.onZoom = function(event) {
		//var mousex = event.clientX - self.dom.canvas.offsetLeft;
		//var mousey = event.clientY - self.dom.canvas.offsetTop;
		var mousex = self.getScaledOrdinate('width', event.pageX - self.leftOffset);
		var mousey = self.getScaledOrdinate('height', event.pageX - self.leftOffset);
		var wheel = event.wheelDelta / 120;//n or -n
		var zoom = 1 + wheel / 2;
		self.ctx.translate(
				self.originx,
				self.originy
		);
		self.ctx.scale(zoom, zoom);
		self.ctx.translate(
				-( mousex / self.scale + self.originx - mousex / ( self.scale * zoom ) ),
				-( mousey / self.scale + self.originy - mousey / ( self.scale * zoom ) )
		);

		self.originx = ( mousex / self.scale + self.originx - mousex / ( self.scale * zoom ) );
		self.originy = ( mousey / self.scale + self.originy - mousey / ( self.scale * zoom ) );
		self.scale *= zoom;
	};
	self.initChild = function () {
		document.body.addEventListener('mouseup', self.finishDraw, false);
		self.dom.canvas.addEventListener('mousedown', self.startDraw, false);
		self.dom.container.onpaste = self.canvasImagePaste;
		self.dom.container.ondrop = self.canvasImageDrop;
		self.dom.container.ondragover = self.preventDefault;
		self.dom.color.addEventListener('input', self.changeColor, false);
		self.dom.range.addEventListener('change', self.changeRadius, false);
		self.dom.container.addEventListener('keypress', self.contKeyPress, false);
		self.dom.container.addEventListener(mouseWheelEventName, self.onZoom);
		self.dom.color.style.color = self.ctx.strokeStyle;
		self.dom.colorIcon.onclick = function () {
			self.dom.color.click();
		};
		self.dom.pen.onclick = self.setPen;
		self.dom.eraser.onclick = self.setEraser;
		self.dom.sendButton.onclick = self.sendImage;
		self.dom.clearButton.onclick = self.clearCanvas;
	};
	self.superShow = self.show;
	self.show = function () {
		self.superShow();
		self.dom.canvas.setAttribute('width', self.dom.canvas.offsetWidth);
		self.dom.canvas.setAttribute('height', self.dom.canvas.offsetHeight);
		self.ctx.lineWidth = 3;
		self.ctx.lineJoin = 'round';
		self.ctx.lineCap = 'round';
		self.ctx.strokeStyle = self.dom.color.value;
		self.setColorStrikeColor();
		self.setPen();
	};
	self.initChild();
}


function checkAndPlay(element) {
	if (!window.sound || !notifier.isTabMain()) {
		return;
	}
	try {
		element.pause();
		element.currentTime = 0;
		element.volume = volumeProportion[window.sound];
		element.play();
	} catch (e) {
		console.error(getDebugMessage("Skipping playing message, because {}", e.message || e));
	}
}

function NotifierHandler() {
	var self = this;
	self.maxNotifyTime = 300;
	self.currentTabId = new Date().getTime().toString();
	/*This is required to know if this tab is the only one and don't spam with same notification for each tab*/
	self.LAST_TAB_ID_VARNAME = 'lastTabId';
	self.clearNotificationTime = 5000;
	self.askPermissions = function () {
		if (notifications && Notification.permission !== "granted") {
			Notification.requestPermission();
		}
	};
	self.popedNotifQueue = [];
	self.init = function () {
		window.addEventListener("blur", self.onFocusOut);
		window.addEventListener("focus", self.onFocus);
		window.addEventListener("beforeunload", self.onUnload);
		window.addEventListener("unload", self.onUnload);
		self.onFocus();
		if (!window.Notification) {
			console.warn(getDebugMessage("Notification is not supported"));
		} else {
			self.askPermissions();
		}
	};
	self.notificationClick = function (x) {
		window.focus();
		this.close()
	};
	self.lastNotifyTime = new Date().getTime();
	self.notify = function (title, message) {
		if (self.isCurrentTabActive) {
			return;
		}
		self.newMessagesCount++;
		document.title = self.newMessagesCount + " new messages";
		if (navigator.vibrate) {
			navigator.vibrate(200);
		}
		var currentTime = new Date().getTime();
		// last opened tab not this one, leave the oppotunity to show notification from last tab
		if (!window.Notification || !self.isTabMain() || !notifications || currentTime - self.maxNotifyTime < self.lastNotifyTime) {
			return
		}
		self.askPermissions();
		var notification = new Notification(title, {
			icon: NOTIFICATION_ICON_URL,
			body: message
		});
		self.popedNotifQueue.push(notification);
		self.lastNotifyTime = currentTime;
		notification.onclick = self.notificationClick;
		notification.onclose = function () {
			self.popedNotifQueue.pop(this);
		};
		setTimeout(self.clearNotification, self.clearNotificationTime);
	};
	self.isTabMain = function() {
		var activeTab = localStorage.getItem(self.LAST_TAB_ID_VARNAME);
		if (activeTab == "0") {
			localStorage.setItem(self.LAST_TAB_ID_VARNAME, self.currentTabId);
			activeTab = self.currentTabId;
		}
		return activeTab ==  self.currentTabId;
	};
	self.onUnload = function() {
		if (self.unloaded) {
			return
		}
		if (self.isTabMain) {
			localStorage.setItem(self.LAST_TAB_ID_VARNAME, "0");
		}
		self.unloaded = true;
	};
	self.clearNotification = function () {
		if (self.popedNotifQueue.length > 0) {
			var notif = self.popedNotifQueue[0];
			notif.close();
			self.popedNotifQueue.shift();
		}
	};
	self.onFocus = function() {
		localStorage.setItem(self.LAST_TAB_ID_VARNAME, self.currentTabId);
		self.isCurrentTabActive = true;
		self.newMessagesCount = 0;
		document.title = 'PyChat';
	};
	self.onFocusOut = function() {
		self.isCurrentTabActive = false
	};
	self.init();
}


function Page() {
	var self = this;
	self.dom = {
		container: document.body,
		el: []
	};
	self.setParams = function (params) {
		if (params) {
			console.warn(getDebugMessage('Params are not set for {}', self.getUrl()))
		}
	};
	self.parser = new DOMParser();
	self.render = function () {
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
		for (var i = 0; i < self.dom.el.length; i++) {
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
		issueForm: $('issueForm'),
		version: $("version"),
		issue: $("issue")
	};
	self.dom.el = [self.dom.issueForm];
	self.show = function () {
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
		return '/profile/{}'.format(self.userId);
	};
	self.setParams = function (params) {
		self.setUserId(params[0]);
	};
	self.getTitle = function () {
		self.username = self.username || self.dom.el[0].getAttribute('username');
		return "<b>{}</b>'s profile".format(self.username);
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
		self.rendered = true;
		doGet(AMCHART_URL, function () {
			var holder = document.createElement("div");
			self.dom.el.push(holder);
			self.dom.container.appendChild(holder);
			holder.setAttribute("id", "chartdiv");
			holder.className = 'max-height-scrollable';
			doGet(self.url, function (data) {
				window.amchartJson = JSON.parse(data);
				doGet(STATISTICS_JS_URL);
			});
		});
	};
	self.update = self.show;
}


function PageHandler() {
	var self = this;
	self.pages = {
		'/report_issue': new IssuePage(),
		'/chat/': channelsHandler,
		'/statistics': new AmchartsPage(),
		'/profile/': new ViewProfilePage(),
		'/profile': new ChangeProfilePage()
	};
	self.pageRegex = /\w\/#(\/\w+\/?)(.*)/g;
	self.init = function () {
		self.showPageFromUrl();
		window.onhashchange = self.showPageFromUrl;
	};
	self.getPage = function (url) {
		return self.pages[url];
	};
	self.showPageFromUrl = function () {
		var currentUrl = window.location.href;
		var match = self.pageRegex.exec(currentUrl);
		var params;
		var page;
		if (match) {
			page = match[1];
			var handler = self.getPage(page);
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
	self.pushHistory = function () {
		var historyUrl = "#{}".format(self.currentPage.getUrl());
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
	self.title = "Hello, <b>{}</b>".format(loggedUser);
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
	self.getActiveChannel = function () {
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
			var res = parseInt(params[0]);
			return isNaN(res) ? null : res;
		}
	};
	self.clearChannelHistory = function () {
		localStorage.clear();
		self.getActiveChannel().clearHistory ();
		console.log(getDebugMessage('History has been cleared'));
		growlSuccess('History has been cleared');
	};
	self.setParams = function (params) {
		self.activeChannel = self.parseActiveChannelFromParams(params);
	};
	self.roomClick = function (event) {
		var target = event.target;
		var tagName = target.tagName;
		if (tagName == 'UL') {
			return;
		}
		// liEl = closest parent with LI
		var liEl = tagName == 'I' || tagName == 'SPAN' ? target.parentNode : target;
		var roomId = parseInt(liEl.getAttribute(self.ROOM_ID_ATTR));
		if (CssUtils.hasClass(target, CANCEL_ICON_CLASS_NAME)) {
			wsHandler.sendToServer({
				action: 'deleteRoom',
				roomId: roomId
			});
		} else {
			self.setActiveChannel(roomId);
		}
	};
	self.setActiveChannel = function (key) {
		self.hideActiveChannel();
		self.activeChannel = key;
		self.showActiveChannel();
		singlePage.pushHistory();
	};
	self.showActiveChannel = function () {
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
	self.toggleChannelOfflineOnline = function () {
		var isOnline = CssUtils.toggleClass(self.dom.chatUsersTable, 'hideOffline');
		self.dom.usersStateText.textContent = isOnline ? "Channel online" : "Channel users";
	};
	self.hideActiveChannel = function () {
		if (self.activeChannel && self.getActiveChannel()) {
			self.getActiveChannel().hide()
		}
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
		self.readDataAndSend(files[0]);
		self.dom.imgInput.value = "";
	};
	self.readDataAndSend = function (file) {
		readFileAsB64(file, function (event) {
			self.sendMessage({
				image: event.target.result,
				content: null,
				action: 'sendMessage',
				channel: self.activeChannel
			});
		}, true);
	};
	self.preventDefault = function (e) {
		e.preventDefault();
	};
	self.imageDrop = function (evt) {
		self.preventDefault(evt);
		self.readDataAndSend(evt.dataTransfer.files[0]);
	};
	self.imagePaste = function (e) {
		if (e.clipboardData) {
			var items = e.clipboardData.items;
			if (items) {
				for (var i = 0; i < items.length; i++) {
					self.readDataAndSend(items[i].getAsFile());
				}
				self.preventDefault(e);
			}
		}
	};
	self.checkAndSendMessage = function (event) {
		if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
			event.preventDefault();
			smileyUtil.purgeImagesFromSmileys();
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
	self.showAddRoom = function () {
		self.addRoomHandler.show();
		self.dom.addRoomInput.focus();
	};
	self.showInviteUser = function () {
		var activeChannel = self.getActiveChannel();
		var exclude = activeChannel.allUsers;
		var isEmpty = self.fillAddUser(exclude);
		if (isEmpty) {
			growlInfo("All users are already in the channel");
			return;
		}
		self.addUserHandler.show();
		self.dom.addUserInput.focus();
		self.addUserHolderAction = 'inviteUser';
		self.addUserHandler.setHeaderText("Invite user to room <b>{}</b>".format(activeChannel.roomName));
	};
	self.inviteUser = function (message) {
		self.createNewRoomChatHandler(message.roomId, message.name, message.content);
	};
	self.fillAddUser = function (excludeUsersId) {
		self.dom.addUserList.innerHTML = '';
		self.addUserUsersList = {};
		var allUsers = self.getAllUsersInfo();
		for (var userId in allUsers) {
			if (!allUsers.hasOwnProperty(userId)) continue;
			if (excludeUsersId[userId]) continue;
			var li = document.createElement('LI');
			var username = allUsers[userId].user;
			self.addUserUsersList[username] = li;
			li.innerText = username;
			li.setAttribute(USER_ID_ATTR, userId);
			self.dom.addUserList.appendChild(li);
		}
		if (self.dom.addUserList.childNodes.length === 0) return true;
	};
	self.getDirectMessagesUserIds = function () {
		var els = document.querySelectorAll('#directUserTable li');
		var res = {};
		for (var i = 0; i < els.length; i++) {
			var userId = els[i].getAttribute(USER_ID_ATTR);
			res[userId] = true;
		}
		return res;
	};
	self.showAddUser = function () {
		var exclude = self.getDirectMessagesUserIds();
		var isEmpty = self.fillAddUser(exclude);
		if (isEmpty) {
			growlInfo("You already have all users in direct channels");
			return;
		}
		self.addUserHandler.show();
		self.addUserHolderAction = 'addDirectChannel';
		self.addUserHandler.setHeaderText("Create Direct Channel");
		self.dom.addUserInput.focus();
	};
	self.getAllUsersInfo = function () {
		return self.channels[DEFAULT_CHANNEL_NAME].allUsers;
	};
	self.filterAddUser = function (event) {
		var filterValue = self.dom.addUserInput.value;
		if (event.keyCode == 13) {
			if (self.addUserUsersList[filterValue]) {
				self.addUserHolderClick({target: self.addUserUsersList[filterValue]});
				return;
			}
		}
		for (var userName in self.addUserUsersList) {
			if (!self.addUserUsersList.hasOwnProperty(userName)) continue;
			if (userName.indexOf(filterValue) > -1) {
				CssUtils.showElement(self.addUserUsersList[userName]);
			} else {
				CssUtils.hideElement(self.addUserUsersList[userName]);
			}
		}
	};
	self.createDirectChannel = function () {
		var userId = self.getActiveUserId();
		var exclude = self.getDirectMessagesUserIds();
		if (exclude[userId]) {
			document.querySelector("#directUserTable li[userid='{}']".format(userId)).click();
		} else {
			wsHandler.sendToServer({
				action: 'addDirectChannel',
				userId: userId
			});
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
	self.getAnotherUserId = function (allUsersIds) {
		var anotherUserId;
		if (allUsersIds.length == 2) {
			anotherUserId = allUsersIds[0] == '' + loggedUserId ? allUsersIds[1] : allUsersIds[0];
		} else {
			anotherUserId = allUsersIds[0];
		}
		return anotherUserId;
	};
	self.createChannelChatHandler = function (roomId, li, users, roomName) {
		var i = document.createElement('span');
		i.className = CANCEL_ICON_CLASS_NAME;
		li.appendChild(i);
		li.setAttribute(self.ROOM_ID_ATTR, roomId);
		var chatBoxDiv = document.createElement('div');
		chatBoxDiv.onpaste = self.imagePaste;
		chatBoxDiv.ondrop = self.imageDrop;
		chatBoxDiv.ondragover = self.preventDefault;
		self.channels[roomId] = new ChatHandler(li, chatBoxDiv, users, roomId, roomName);
	};
	self.createNewUserChatHandler = function (roomId, users) {
		var allUsersIds = Object.keys(users);
		var anotherUserId = self.getAnotherUserId(allUsersIds);
		var roomName = users[anotherUserId].user;
		var li = createUserLi(anotherUserId, users[anotherUserId].sex, roomName);
		self.dom.directUserTable.appendChild(li);
		self.createChannelChatHandler(roomId, li, users, roomName);
		return anotherUserId;
	};
	self.createNewRoomChatHandler = function (roomId, roomName, users) {
		var li = document.createElement('li');
		self.dom.rooms.appendChild(li);
		li.innerHTML = roomName;
		self.createChannelChatHandler(roomId, li, users, roomName);
	};
	self.getCurrentRoomIDs = function () {

	};
	self.destroyChannel = function (channelKey) {
		self.channels[channelKey].destroy();
		delete self.channels[channelKey];
	};
	self.setRooms = function (message) {
		var rooms = message.content;
		var oldRooms = [];
		for (var channelKey in self.channels) {
			if (!self.channels.hasOwnProperty(channelKey)) continue;
			var oldRoomId = parseInt(channelKey.substring(1));
			oldRooms.push(oldRoomId);
			if (!rooms[oldRoomId]) {
				self.destroyChannel(channelKey);
			}
		}
		for (var roomId in rooms) {
			// if a new room has been added while disconnected
			if (!rooms.hasOwnProperty(roomId)) continue;
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
		self.showActiveChannel();
		if (!self.roomsInited) {
			storage.loadMessagesFromLocalStorage();
		}
		self.roomsInited = true;
	};
	self.handle = function (message) {
		if (message.handler == 'channels') {
			self[message.action](message);
		}
		else if (message.handler == 'chat') {
			var channelHandler = self.channels[message.channel];
			if (!channelHandler) {
				throw 'Unknown channel {} for message "{}"'.format(message.channel, JSON.stringify(message));
			}
			channelHandler[message.action](message);
		}
	};
	self.deleteRoom = function (message) {
		var roomId = message.roomId;
		var userId = message.userId;
		var handler = self.channels[roomId];
		if (handler.dom.roomNameLi.getAttribute('userid') || userId == loggedUserId) {
			self.destroyChannel(roomId);
			growlInfo("<div>Channel <b>{}</b> has been deleted</div>".format(handler.dom.roomNameLi.textContent));
			if (self.activeChannel == roomId) {
				self.setActiveChannel(DEFAULT_CHANNEL_NAME);
			}
		} else {
			handler.removeUser(message)
		}
	};
	self.addDirectChannel = function (message) {
		var users = message.users;
		var anotherUserName = self.getAllUsersInfo();
		var channelUsers = {};
		channelUsers[users[1]] = anotherUserName[users[1]];
		channelUsers[users[0]] = anotherUserName[users[0]];
		var anotherUserId = self.createNewUserChatHandler(message.roomId, channelUsers);
		self.setActiveChannel(message.roomId);
		growlInfo('<span>Room for user <b>{}</b> has been created</span>'.format(anotherUserName[anotherUserId].user));
	};
	self.addRoom = function (message) {
		var users = message.users;
		var roomName = message.name;
		var channelUsers = {};
		channelUsers[users[0]] = self.getAllUsersInfo()[users[0]];
		self.createNewRoomChatHandler(message.roomId, roomName, channelUsers);
		growlInfo('<span>Room <b>{}</b> has been created</span>'.format(roomName));
	};
	self.viewProfile = function () {
		singlePage.showPage('/profile/', self.getActiveUserId());
	};
	self.init = function () {
		self.dom.chatUsersTable.addEventListener('contextmenu', self.showContextMenu, false);
		self.dom.rooms.onclick = self.roomClick;
		self.dom.directUserTable.onclick = self.roomClick;
		self.dom.imgInput.onchange = self.handleFileSelect;
		self.dom.addRoomInput.onkeypress = self.finishAddRoomOnEnter;
		self.dom.addRoomButton.onclick = self.finishAddRoom;
		self.addUserHandler = new Draggable(self.dom.addUserHolder, "");
		self.addRoomHandler = new Draggable(self.dom.addRoomHolder, "Create New Room");
		var minifier = self.dom.minifier;
		for (var el in minifier) {
			if (minifier.hasOwnProperty(el)) {
				minifier[el].icon.onclick = self.minifyList;
			}
		}
		self.dom.usersStateText.onclick = self.toggleChannelOfflineOnline;
		self.dom.usersStateText.click()
	};
	self.minifyList = function (event) {
		var minifier = self.dom.minifier[event.target.getAttribute('name')];
		var visible = CssUtils.toggleVisibility(minifier.body);
		minifier.icon.className = visible ? 'icon-angle-circled-down' : 'icon-angle-circled-up';

	};
	self.getActiveUserId = function () {
		return self.dom.activeUserContext.getAttribute(USER_ID_ATTR);
	};
	self.getActiveUsername = function () {
		return self.dom.activeUserContext.textContent;
	};
	self.m2Call = function () {
		growlError("<span>This function is not implemented yet. Use <i class='icon-phone'></i> " +
				"icon in <b style='font-size: 13px'>DIRECT MESSAGES</b> to make a call</span>");
	};
	self.call = function () {
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
		self.dom.activeUserContext = li;
		self.dom.userContextMenu.style.top = li.offsetTop + li.clientHeight + "px";
		CssUtils.addClass(self.dom.activeUserContext, 'active-user');
		CssUtils.showElement(self.dom.userContextMenu);
		document.addEventListener("click", self.removeContextMenu);
		e.preventDefault();
	};
	self.removeContextMenu = function () {
		CssUtils.hideElement(self.dom.userContextMenu);
		document.removeEventListener("click", self.removeContextMenu);
		CssUtils.removeClass(self.dom.activeUserContext, 'active-user');
	};
	self.init();
}

function showHelp() {
	if (!suggestions) {
		return
	}
	var infoMessages = [
		"<span>Every time you join chat those help messages will be shown to you. " +
		"You can disable them in you profile settings (<i class='icon-wrench'></i> icon). Simply click on popup to hide them</span>",
		"<span>Browser will notify you on incoming message every time when chat tab is not active. " +
		"You can disable this option in your profile(<i class='icon-wrench'></i> icon).</span>",
		"<span>You can create a new room by clicking on <i class='icon-plus-squared'></i> icon." +
		" To delete created room hover mouse on its name and click on <i class='icon-cancel-circled-outline'></i> icon.</span>",
		"<span>You can make an audio/video call. Currently pychat allows calling only one person." +
		" To call someone you need to create ( <i class='icon-plus-squared'></i>) and join direct message," +
		" open call dialog by pressing <i class='icon-phone '></i> and click on phone <i class='icon-phone-circled'></i> </span>",
		"<span>You can change chat appearance in your profile. To open profile click on <i class='icon-wrench'></i> icon in top right corner</span>",
		"<span>You can write multiline message by pressing <b>shift+Enter</b></span>",
		"<span>You can add smileys by clicking on bottom right <i class='icon-smile'></i> icon. To close appeared smile container click outside of it or press <b>Esc</b></span>",
		"You can comment somebody's message. This will be shown to all users in current channel. Just click on message time" +
		"and it's content appears in message text",
		"<span>You have a feature to suggest or you lack some functionality? Click on <i class='icon-pencil'></i>icon on top menu and write your " +
		"suggestion there</span>",
		"<span>Chat uses your browser cache to store messages. To clear current cache click on " +
		"<i class='icon-clear'></i> icon on the top menu</span>",
		"<span>You can view offline users in current channel by clicking on <b>CHANNEL ONLINE</b> text</span>",
		"<span>You can invite a new user to current room by clicking on <i class='icon-user-plus'></i> icon</span>",
		"You can load history of current channel. For this you need to focus place with messages by simply" +
		" clicking on it and press arrow up/page up or just scroll up with mousewheel",
		"<span>You can collapse user list by pressing on <i class='icon-angle-circled-up'></i> icon</span>",
		"<span>To paste image from clipboard: focus box with messages (by clicking on it) and press <B>Ctrl + V</b></span>"
	];
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


function SmileyUtil() {
	var self = this;
	self.dom = {
		smileParentHolder: $('smileParentHolder')
	};
	self.smileRegex = /<img[^>]*code="([^"]+)"[^>]*>/g;
	self.tabNames = [];
	self.smileyDict = {};
	self.init = function () {
		document.addEventListener("click", self.onDocClick);
		self.loadSmileys(window.smileys_bas64_data);
	};
	self.hideSmileys = function () {
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
	self.purgeImagesFromSmileys = function() {
		userMessage.innerHTML = userMessage.innerHTML.replace(self.smileRegex, "$1");
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
			if (!smileyData.hasOwnProperty(tab)) continue;
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
				if (!tabSmileys.hasOwnProperty(smile)) continue;
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
		self.showTabByName(Object.keys(smileyData)[0]);
	};
}


function timeMessageClick(event) {
	var value = userMessage.innerHTML;
	var match = value.match(timePattern);
	var oldText = match ? value.substr(match[0].length) : value;
	userMessage.innerHTML = '{}>>> {}'.format(event.target.parentElement.parentElement.textContent, oldText);
	userMessage.focus();
}

function ChatHandler(li, chatboxDiv, allUsers, roomId, roomName) {
	var self = this;
	self.UNREAD_MESSAGE_CLASS = 'unreadMessage';
	self.roomId = roomId;
	self.roomName = roomName;
	self.dom = {
		chatBoxDiv: chatboxDiv,
		userList: document.createElement('ul'),
		roomNameLi: li,
		newMessages: document.createElement('span'),
		deleteIcon: li.lastChild,
		chatBoxHolder: $('chatBoxHolder'),
		chatLogin: $("chatLogin"),
		chatLogout: $("chatLogout"),
		chatIncoming: $("chatIncoming"),
		chatOutgoing: $("chatOutgoing")
	};
	self.newMessages = 0;
	self.lastLoadUpHistoryRequest = 0;
	self.allMessages = [];
	self.allMessagesDates = [];
	self.activeRoomClass = 'active-room';
	self.dom.newMessages.className = 'newMessagesCount hidden';
	li.appendChild(self.dom.newMessages);
	self.SELF_HEADER_CLASS = 'message-header-self';
	self.OTHER_HEADER_CLASS = 'message-header-others';
	self.dom.userList.className = 'hidden';
	channelsHandler.dom.chatUsersTable.appendChild(self.dom.userList);
	self.dom.chatBoxDiv.className = 'chatbox hidden';
	self.dom.chatBoxHolder.appendChild(self.dom.chatBoxDiv);
	// tabindex allows focus, focus allows keydown binding event
	self.dom.chatBoxDiv.setAttribute('tabindex', '1');
	self.show = function () {
		self.rendered = true;
		CssUtils.showElement(self.dom.chatBoxDiv);
		CssUtils.showElement(self.dom.userList);
		CssUtils.addClass(self.dom.roomNameLi, self.activeRoomClass);
		self.removeNewMessages();
		CssUtils.hideElement(self.dom.newMessages);
		CssUtils.showElement(self.dom.deleteIcon);
		var isHidden = webRtcApi.isActive() && webRtcApi.channel != self.roomId;
		CssUtils.setVisibility(webRtcApi.dom.callContainer, self.callIsAttached && !isHidden);
	};
	/*==================== DOM EVENTS LISTENERS ============================*/
// keyboard and mouse handlers for loadUpHistory
// Those events are removed when loadUpHistory() reaches top
	self.mouseWheelLoadUp = function (e) {
		// IE has inverted scroll,
		var isTopDirection = e.detail < 0 || e.wheelDelta > 0; // TODO check all browser event name deltaY?
		if (isTopDirection) {
			self.loadUpHistory(10);
		}
	};
	self.removeNewMessages = function() {
		self.newMessages = 0;
		CssUtils.hideElement(self.dom.newMessages);
	};
	self.dom.chatBoxDiv.addEventListener(mouseWheelEventName, self.mouseWheelLoadUp);
	self.keyDownLoadUp = function (e) {
		if (e.which === 33) {    // page up
			self.loadUpHistory(25);
		} else if (e.which === 38) { // up
			self.loadUpHistory(10);
		} else if (e.ctrlKey && e.which === 36) {
			self.loadUpHistory(35);
		}
	};
	self.clearHistory = function () {
		self.headerId = null;
		self.dom.chatBoxDiv.innerHTML = '';
		self.allMessages = [];
		self.allMessagesDates = [];
		self.dom.chatBoxDiv.addEventListener(mouseWheelEventName, self.mouseWheelLoadUp);
		self.dom.chatBoxDiv.addEventListener("keydown", self.keyDownLoadUp);
	};
	self.dom.chatBoxDiv.addEventListener('keydown', self.keyDownLoadUp);
	self.hide = function () {
		CssUtils.hideElement(self.dom.chatBoxDiv);
		CssUtils.hideElement(self.dom.userList);
		CssUtils.removeClass(self.dom.roomNameLi, self.activeRoomClass);
	};
	self.setChannelAttach = function (isAttached) {
		self.callIsAttached = isAttached;
	};
	self.isPrivate = function () {
		return self.dom.roomNameLi.hasAttribute(USER_ID_ATTR);
	};
	self.getOpponentId = function () {
		return self.dom.roomNameLi.getAttribute(USER_ID_ATTR);
	};
	self.getUserNameById = function (id) {
		return self.allUsers[id].user;
	};
	self.addUserToDom = function (message) {
		if (!self.allUsers[message.userId]) {
			self.allUsers[message.userId] = {
				sex: message.sex,
				user: message.user
			};
			self.addDomUserOnline(message.userId, message.sex, message.user);
		}
	};
	self.addUserToAll = self.addUserToDom;
	self.setDomOnlineUsers = function (users) {
		self.dom.userList.innerHTML = '';
		self.allUsers = users;
		for (var userId in self.allUsers) {
			if (!self.allUsers.hasOwnProperty(userId)) continue;
			var user = self.allUsers[userId];
			self.addDomUserOnline(userId, user.sex, user.user);
		}
	};
	self.addDomUserOnline = function (userId, sex, username) {
		var li = createUserLi(userId, sex, username);
		li.className = 'offline';
		self.allUsers[userId].li = li;
		self.dom.userList.appendChild(li);
	};
	self.setDomOnlineUsers(allUsers);
	self.isHidden = function () {
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
	self.removeUser = function (message) {
		//if (self.onlineUsers.indexOf(message.userId) >= 0) {
		//	message.content = self.onlineUsers;
		//	self.printChangeOnlineStatus('has left the conversation.', message, chatLogout);
		//}
		var user = self.allUsers[message.userId];
		CssUtils.deleteElement(user.li);
		var dm = 'User <b>{}</b> has left the conversation'.format(user.user);
		self.displayPreparedMessage(SYSTEM_HEADER_CLASS, message.time, dm, SYSTEM_USERNAME);
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
		timeSpan.className = TIME_SPAN_CLASS;
		timeSpan.textContent = '({})'.format(time);
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
			textSpan.className = CONTENT_STYLE_CLASS;
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
				pos = self.getPosition(timeMillis);
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
		pos = self.insertCurrentDay(timeMillis, pos);
		if (pos != null) {
			self.dom.chatBoxDiv.insertBefore(p, pos);
		} else {
			var oldscrollHeight = self.dom.chatBoxDiv.scrollHeight;
			self.dom.chatBoxDiv.appendChild(p);
			if (htmlEncodedContent.startsWith('<img')) {
				(function (id, oldScrollHeight) {
					document.querySelector('[id="{}"] img'.format(id)).addEventListener('load', function () {
						self.scrollBottom(oldScrollHeight);
					});
				})(p.id, oldscrollHeight);
			} else {
				self.scrollBottom(oldscrollHeight);
			}
		}
		return p;
	};
	self.scrollBottom = function (oldscrollHeight) {
		var newscrollHeight = self.dom.chatBoxDiv.scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			self.dom.chatBoxDiv.scrollTop = newscrollHeight;
		}
	};
	self.loadOfflineMessages = function(data) {
		var messages = data.content || [];
		var oldSound = window.sound;
		window.sound = 0;
		messages.forEach(function(message) {
			self.printMessage(message, true);
		});
		window.sound = oldSound;
	};
	self.setHeaderId = function (headerId){
		if (!self.headerId || headerId < self.headerId) {
			self.headerId = headerId;
		}
	};
	self.printMessage = function (data, isNew) {
		self.setHeaderId(data.id);
		var user = self.allUsers[data.userId];
		if (loggedUserId === data.userId) {
			checkAndPlay(self.dom.chatOutgoing);
		} else {
			checkAndPlay(self.dom.chatIncoming);
		}
		var displayedUsername = user.user;
		//private message
		var prefix = false;
		var headerStyle = data.userId == loggedUserId ? self.SELF_HEADER_CLASS : self.OTHER_HEADER_CLASS;
		var preparedHtml = data.image ? "<img src=\'{}\'/>".format(data.image) : smileyUtil.encodeSmileys(data.content);
		notifier.notify(displayedUsername, data.content || 'image');
		var p = self.displayPreparedMessage(headerStyle, data.time, preparedHtml, displayedUsername, prefix);
		if (self.isHidden() && !window.newMessagesDisabled) {
			self.newMessages++;
			self.dom.newMessages.textContent = self.newMessages;
			if (self.newMessages == 1) {
				CssUtils.showElement(self.dom.newMessages);
				CssUtils.hideElement(self.dom.deleteIcon);
			}
		}
		// if tab is inactive the message is new only if flag newMessagesDisabled wasn't set to true
		if (!window.newMessagesDisabled && (self.isHidden() || isNew || !notifier.isCurrentTabActive)) {
			CssUtils.addClass(p, self.UNREAD_MESSAGE_CLASS);
			p.onmouseover = function(event){
				var pTag = event.target;
				pTag.onmouseover = null;
				CssUtils.removeClass(pTag, self.UNREAD_MESSAGE_CLASS);
			}
		}
	};
	self.loadMessages = function (data) {
		var windowsSoundState = window.sound;
		window.sound = 0;
		console.log(getDebugMessage('appending messages to top'));
		// This check should fire only once,
		// because requests aren't being sent when there are no event for them, thus no responses
		var message = data.content;
		if (message.length === 0) {
			console.log(getDebugMessage('Requesting messages has reached the top, removing loadUpHistoryEvent handlers'));
			self.dom.chatBoxDiv.removeEventListener(mouseWheelEventName, self.mouseWheelLoadUp);
			self.dom.chatBoxDiv.removeEventListener("keydown", self.keyDownLoadUp);
			return;
		}
		window.newMessagesDisabled = true;
		message.forEach(function (message) {  // dont pass function straight , foreach passes index as 2nd arg
			self.printMessage(message);
		});
		window.newMessagesDisabled = false;
		self.lastLoadUpHistoryRequest = 0; // allow fetching again, after new header is set
		window.sound = windowsSoundState;
	};
	self.addOnlineUser = function (message) {
		self.addUserToDom(message);
		self.printChangeOnlineStatus('appeared online.', message, self.dom.chatLogin);
	};
	self.removeOnlineUser = function (message) {
		self.printChangeOnlineStatus('gone offline.', message, self.dom.chatLogout);
	};
	self.printChangeOnlineStatus = function (action, message, sound) {
		var dm;
		var username = self.allUsers[message.userId].user;
		if (message.userId == loggedUserId) {
			dm = 'You have ' + action;
		} else {
			dm = 'User <b>{}</b> has {}'.format(username, action);
		}
		checkAndPlay(sound);
		self.displayPreparedMessage(SYSTEM_HEADER_CLASS, message.time, dm, SYSTEM_USERNAME);
		self.setOnlineUsers(message);
	};
	self.setOnlineUsers = function (message) {
		self.onlineUsers = message.content;
		console.log(getDebugMessage("Load user names: {}", Object.keys(self.onlineUsers)));
		for (var userId in self.allUsers) {
			if (!self.allUsers.hasOwnProperty(userId)) continue;
			var user = self.allUsers[userId];
			if (self.onlineUsers.indexOf(parseInt(userId)) >= 0) {
				CssUtils.removeClass(user.li, 'offline');
			} else {
				CssUtils.addClass(user.li, 'offline');
			}
		}
	};
	self.loadUpHistory = function (count) {
		if (self.dom.chatBoxDiv.scrollTop === 0) {
			var currentMillis = new Date().getTime();
			// 0 if locked, or last request was sent earlier than 3 seconds ago
			if (self.lastLoadUpHistoryRequest + 3000 > currentMillis) {
				console.log(getDebugMessage("Skipping loading message, because it's locked"));
				return
			}
			self.lastLoadUpHistoryRequest = currentMillis;
			var getMessageRequest = {
				headerId: self.headerId,
				count: count,
				action: 'loadMessages',
				channel: self.roomId
			};
			wsHandler.sendToServer(getMessageRequest);
		}
	};
	self.destroy = function () {
		var elements = [self.dom.chatBoxDiv, self.dom.roomNameLi, self.dom.userList];
		for (var i = 0; i < elements.length; i++) {
			CssUtils.deleteElement(elements[i]);
		}
	}
}


function DownloadBar(stringId) {
	var self = this;
	self.dom = {
		wrapper: $(stringId),
		text: document.querySelector("#{} > a".format(stringId))
	};
	self.PROGRESS_CLASS = 'animated';
	self.SUCC_CLASS = 'success';
	self.ERR_CLASS = 'error';
	self.setMax = function (max) {
		self.max = max;
		self.start();
	};
	self.setValue = function (value) {
		var percent = Math.round(value * 100 / self.max) + "%";
		self.dom.text.style.width = percent;
		self.dom.text.textContent = percent;
	};
	self.setSuccess = function () {
		CssUtils.removeClass(self.dom.wrapper, self.PROGRESS_CLASS);
		CssUtils.addClass(self.dom.wrapper, self.SUCC_CLASS);
	};
	self.setError = function () {
		CssUtils.removeClass(self.dom.wrapper, self.PROGRESS_CLASS);
		CssUtils.addClass(self.dom.wrapper, self.ERR_CLASS);
	};
	self.start = function () {
		self.dom.text.removeAttribute('href');
		self.dom.text.removeAttribute('download');
		CssUtils.removeClass(self.dom.wrapper, self.SUCC_CLASS);
		CssUtils.removeClass(self.dom.wrapper, self.ERR_CLASS);
		CssUtils.addClass(self.dom.wrapper, self.PROGRESS_CLASS);
		CssUtils.showElement(self.dom.wrapper);
		self.setValue(0);
	};
}

function WebRtcApi() {
	var self = this;
	self.activeUserClass = "active-call-user";
	self.isForTransferFile = false;
	self.CHUNK_SIZE = 16384;
	self.dom = {
		callContainer: $('callContainer'),
		callAnswerParent: $('callAnswerParent'),
		callContainerHeaderText: headerText,
		callAnswerText: $('callAnswerText'),
		remote: $('remoteVideo'),
		local: $('localVideo'),
		callSound: $('chatCall'),
		hangUpIcon: $('hangUpIcon'),
		audioStatusIcon: $('audioStatusIcon'),
		videoStatusIcon: $('videoStatusIcon'),
		videoContainer: $('videoContainer'),
		fsContainer: $('icon-webrtc-cont'),
		callIcon: $('callIcon'),
		callVolume: $('callVolume'),
		microphoneLevel: $("microphoneLevel"),
		fs: {
			/*FullScreen*/
			video: $('fs-video'),
			audio: $('fs-audio'),
			hangup: $('fs-hangup'),
			minimize: $('fs-minimize'),
			enterFullScreen: $('enterFullScreen')
		},
		// transfer file dome
		fileInput: $('webRtcFileInput')
		// transfer file dome
	};
	//file transfer  variables
	self.receiveBuffer = [];
	self.receivedSize = 0;
	//file transfer  variables
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
		self.downloadBar = new DownloadBar('transmitProgress');
		$('webRtcFileIcon').onclick = function () {
			self.dom.fileInput.click();
		};
		self.dom.fileInput.addEventListener('change', self.transferFile, false);
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
		self.dom.fs.minimize.onclick = self.exitFullScreen;
		self.idleTime = 0;
		self.dom.fs.hangup.title = 'Hang up';
		self.dom.hangUpIcon.title = self.dom.fs.hangup.title;
	};
	self.changeVolume = function () {
		self.dom.remote.volume = self.dom.callVolume.value / 100;
	};
	self.dom.callVolume.addEventListener('input', self.changeVolume);
	self.exitFullScreen = function () {
		document.cancelFullScreen();
	};
	self.hideContainerTimeout = function () {
		self.idleTime++;
		if (self.idleTime > 6) {
			CssUtils.addClass(self.dom.videoContainer, 'inactive');
		}
	};
	self.enterFullScreenMode = function () {
		self.dom.remote.removeEventListener('dblclick', self.enterFullScreenMode);
		self.dom.videoContainer.requestFullscreen();
		CssUtils.addClass(self.dom.videoContainer, 'fullscreen');
		document.addEventListener('mousemove', self.fsMouseMove, false);
		self.hideContainerTimeoutRes = setInterval(self.hideContainerTimeout, 1000);
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
		optional: [/*Firefox*/
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
	self.toggleInput = function (isVideo) {
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
			growlError("You need to call/reply with {} to turn it on".format(kind));
		}
	};
	self.toggleVideo = function () {
		self.toggleInput(true);
	};
	self.toggleMic = function () {
		self.toggleInput(false);
	};
	self.onreply = function () {
		self.setHeaderText("Waiting for <b>{}</b> to accept".format(self.receiverName))
	};
	self.setHeaderText = function (text) {
		if (self.isForTransferFile) {
			self.downloadBar.dom.text.textContent = "Waiting_to_accept";
		} else {
			headerText.innerHTML = text;
		}
	};
	self.oniceconnectionstatechange = function () {
		if (self.pc.iceConnectionState == 'disconnected') {
			self.closeEvents("Connection has been lost");
		}
	};
	self.onoffer = function (message) {
		if (message.content) {
			self.onFileOffer(message);
		} else {
			self.onCallOffer(message);
		}
	};
	self.setAnswerOpponentVariables = function (message) {
		self.receiverName = message.user;
		self.receiverId = message.userId;
		self.channel = message.channel;
		self.sendBaseEvent(null, "reply");
	};
	self.onCallOffer = function (message) {
		self.clearTimeout();
		self.setAnswerOpponentVariables(message);
		checkAndPlay(self.dom.callSound);
		CssUtils.showElement(self.dom.callAnswerParent);
		notifier.notify(self.receiverName, "Calls you");
		self.timeoutFunnction = setTimeout(function () {
					self.declineWebRtcCall();
					// displayPreparedMessage(SYSTEM_HEADER_CLASS, new Date().getTime(),
					//getText("You have missed a call from <b>{}</b>", self.receiverName)
					// TODO replace growl with System message in user thread and unread
					growlInfo("<div>You have missed a call from <b>{}</b></div>".format(self.receiverName));
				}, self.callTimeoutTime
		);
		self.dom.callAnswerText.textContent = "{} is calling you".format(self.receiverName);
	};
	self.setIconState = function (isCall) {
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
		self.setHeaderText("Answered for {} call with audio".format(self.receiverName));
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
		self.setHeaderText("Answered for {} call with video".format(self.receiverName));
		self.createAfterResponseCall();
	};
	self.captureInput = function (callback, callIfNoSource) {
		if (self.constraints.audio || self.constraints.video) {
			navigator.getUserMedia(self.constraints, callback, self.failWebRtc);
		} else if (callIfNoSource) {
			callback();
		}
	};
	self.sendFileOffer = function () {
		self.sendBaseEvent(
				{
					name: self.file.name,
					size: self.file.size
				},
				'offer');
		self.isForTransferFile = true;
		self.waitForAnswer();
	};
	self.transferFile = function () {
		self.file = self.dom.fileInput.files[0];
		//self.dom.fileInput.disabled = true;
		var username = self.setOpponentVariables();
		if (username) {
			growlError("<span>Can't send file because user <b>{}</b> is not online.</span>".format(username));
			console.log(getDebugMessage('Skip call because user {} is not online', username));
			return;
		}
		self.downloadBar.setMax(self.file.size);
		self.sendFileOffer();
	};
	self.onFileOffer = function (message) {
		self.receivedFileSize = parseInt(message.content.size);
		self.downloadBar.setMax(self.receivedFileSize);
		self.receivedFileName = message.content.name;
		self.lastGrowl = new Growl("<div style='cursor: pointer'>Accept file <b>{}</b>, size: {} from user <b>{}</b> </div>"
				.format(encodeHTML(self.receivedFileName), bytesToSize(self.receivedFileSize), encodeHTML(message.user)));
		self.lastGrowl.show(3600000, 'col-info');
		self.lastGrowl.growl.addEventListener('click', self.acceptFileReply);
		self.setAnswerOpponentVariables(message);
		notifier.notify(message.user, "Sends file {}".format(self.receivedFileName));
	};
	self.acceptFileReply = function () {
		self.createPeerConnection();
		self.createSendChannelAndOffer();
		self.lastGrowl.growl.removeEventListener('click', self.acceptFileReply);
		self.lastGrowl.hide();
		self.showAndAttachCallDialogOnResponse();
	};
	self.setOpponentVariables = function () {
		var activeChannel = channelsHandler.getActiveChannel();
		if (!(Object.keys(activeChannel.onlineUsers).length > 1)) {
			return activeChannel.getUserNameById(activeChannel.getOpponentId());
		}
		self.receiverId = activeChannel.getOpponentId();
		self.receiverName = activeChannel.getUserNameById(self.receiverId);
		self.channel = channelsHandler.activeChannel
	};
	self.callPeople = function () {
		self.isForTransferFile = false;
		var username = self.setOpponentVariables();
		if (username) {
			growlError("<span>Can't make a call file because user <b>{}</b> is not online.</span>".format(username));
			console.log(getDebugMessage('Skip call because user {} is not online', username));
			return;
		}
		self.setHeaderText("Confirm browser to use your input devices for call");
		self.waitForAnswer();
		self.captureInput(self.captureInputStream);

	};
	self.captureInputStream = function (stream) {
		self.setIconState(true);
		self.setHeaderText("Establishing connection with {}".format(self.receiverName));
		self.attachLocalStream(stream);
		self.sendBaseEvent(null, 'offer');
		self.timeoutFunnction = setTimeout(self.closeDialog, self.callTimeoutTime);
	};
	self.createCallAfterCapture = function (stream) {
		self.createPeerConnection();
		self.attachLocalStream(stream);
		self.createSendChannelAndOffer();
	};
	self.createAfterResponseCall = function () {
		self.captureInput(self.createCallAfterCapture, true);
		self.showAndAttachCallDialogOnResponse();
		self.showCallDialog(true);
	};
	self.showAndAttachCallDialogOnResponse = function () {
		channelsHandler.setActiveChannel(self.channel);
		channelsHandler.getActiveChannel().setChannelAttach(true);
		CssUtils.showElement(self.dom.callContainer);
	};
	self.print = function (message) {
		console.log(getDebugMessage("Call message {}", JSON.stringify(message)));
	};
	self.gotReceiveChannel = function (event) {
		console.log(getDebugMessage('Received Channel Callback'));
		self.sendChannel = event.channel;
		// self.sendChannel.onmessage = self.print;
		self.sendChannel.onopen = self.channelOpen;
		//self.sendChannel.onclose = self.print;
	};
	self.channelOpen = function () {
		if (self.isForTransferFile) {
			self.sendData();
		}
	};
	self.sendData = function () {
		console.log(getDebugMessage('file is ' + [self.file.name, self.file.size, self.file.type,
					self.file.lastModifiedDate].join(' ')));
		if (self.file.size === 0) {
			self.downloadBar.dom.text.textContent = "skip empty file";
			self.closeEvents("Can't send empty file");
			return;
		}
		self.sliceFile(0);
	};
	self.sliceFile = function (offset) {
		var reader = new window.FileReader();
		reader.onload = (function () {
			return function (e) {
				self.sendChannel.send(e.target.result);
				if (self.file.size > offset + e.target.result.byteLength) {
					window.setTimeout(self.sliceFile, 0, offset + self.CHUNK_SIZE);
				}
				self.downloadBar.setValue(offset + e.target.result.byteLength);
			};
		})(self.file);
		var slice = self.file.slice(offset, offset + self.CHUNK_SIZE);
		reader.readAsArrayBuffer(slice);
	};
	self.waitForAnswer = function () {
		self.webrtcInitiator = false;
		self.createPeerConnection();
		self.pc.ondatachannel = self.gotReceiveChannel;
	};
	self.handle = function (data) {
		if (data.type != 'offer' && self.receiverId != data.userId) {
			console.warn(getDebugMessage("Skipping webrtc because message.userId={}, and self.receiverId={}'", data.userId,
					self.receiverId));
			return;
		}
		self["on" + data.type](data);
	};
	self.clearTimeout = function () {
		var timeoutCleaned = false;
		if (self.timeoutFunnction) {
			clearTimeout(self.timeoutFunnction);
			self.timeoutFunnction = null;
			//timeoutCleaned = true;
		}
	};
	self.answerToWebrtc = function () {
		console.log(getDebugMessage('creating answer...'));
		self.pc.createAnswer(function (answer) {
			console.log(getDebugMessage('sent answer...'));
			self.pc.setLocalDescription(answer, function () {
				self.sendWebRtcEvent(answer);
			}, self.failWebRtcP3);
		}, self.failWebRtcP4, self.sdpConstraints);
	};
	self.onSuccessAnswer = function () {
		console.log(getDebugMessage('answer received'))
	};
	self.onwebrtc = function (message) {
		var data = message.content;
		self.clearTimeout();
		if (self.pc.iceConnectionState && self.pc.iceConnectionState != 'closed') {
			if (data.sdp) {
				var successCall = self.webrtcInitiator ? self.onSuccessAnswer : self.answerToWebrtc;
				self.pc.setRemoteDescription(new RTCSessionDescription(data), successCall, self.failWebRtc);
			} else if (data.candidate) {
				self.pc.addIceCandidate(new RTCIceCandidate(data));
			} else if (data.message) {
				growlInfo(data.message);
			}
		} else {
			console.warn(getDebugMessage("Skipping ws message for closed connection"));
		}
	};
	self.setVideoSource = function (domEl, stream) {
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
		self.createMicrophoneLevelVoice(stream);
	};
	self.createMicrophoneLevelVoice = function (stream) {
		try {
			var audioContext = new AudioContext();
			var analyser = audioContext.createAnalyser();
			var microphone = audioContext.createMediaStreamSource(stream);
			self.javascriptNode = audioContext./*createJavaScriptNode*/createScriptProcessor(2048, 1, 1);
			analyser.smoothingTimeConstant = 0.3;
			analyser.fftSize = 1024;
			microphone.connect(analyser);
			analyser.connect(self.javascriptNode);
			self.javascriptNode.connect(audioContext.destination);
			self.prevVolumeValues = 0;
			self.volumeValuesCount = 0;
			self.javascriptNode.onaudioprocess = function () {
				if (!self.constraints.audio) {
					return;
				}
				var array = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(array);
				var values = 0;
				var length = array.length;
				for (var i = 0; i < length; i++) {
					values += array[i];
				}
				var value = values / length;
				self.prevVolumeValues += value;
				self.volumeValuesCount++;
				if (self.volumeValuesCount == 100 && self.prevVolumeValues == 0) {
					self.showNoMicError();
				}
				self.dom.microphoneLevel.value = value;
			}
		} catch (err) {
			console.error(getDebugMessage("Unable to use microphone level because " + err));
		}
	};
	self.showNoMicError = function () {
		var url = isChrome ? 'setting in chrome://settings/content' : 'your browser settings';
		url += navigator.platform.indexOf('Linux') >= 0 ?
				'. Open pavucontrol for more info' :
				' . Right click on volume icon in system tray -> record devices -> input -> microphone';
		growlError('<div>Unable to capture input from microphone. Check your microphone connection or {}'
				.format(url));
	};
	self.createPeerConnection = function () {
		if (!RTCPeerConnection) {
			throw "Your browser doesn't support RTCPeerConnection";
		}
		self.pc = new RTCPeerConnection(self.pc_config, self.pc_constraints);
		self.pc.oniceconnectionstatechange = self.oniceconnectionstatechange;
		self.pc.onaddstream = function (event) {
			self.setVideoSource(self.dom.remote, event.stream);
			self.setHeaderText("You're talking to <b>{}</b> now".format(self.receiverName));
			self.setIconState(true);
			console.log(getDebugMessage("Stream attached"));
			self.showPhoneIcon();
		};
		self.pc.onicecandidate = function (event) {
			if (event.candidate) {
				self.sendWebRtcEvent(event.candidate);
			}
		};
	};
	self.showPhoneIcon = function () {
		self.hidePhoneIcon();
		self.dom.phoneIcon = document.createElement('i');
		self.dom.phoneIcon.className = 'icon-phone';
		var roomNameLi = channelsHandler.channels[self.channel].dom.roomNameLi;
		roomNameLi.insertBefore(self.dom.phoneIcon, roomNameLi.firstChild);
	};
	self.hidePhoneIcon = function () {
		if (self.dom.phoneIcon) {
			CssUtils.deleteElement(self.dom.phoneIcon);
			delete self.dom.phoneIcon;
		}
	};
	self.closeEvents = function (text) {
		self.clearTimeout();
		self.receiverName = null;
		self.receiverId = null;
		try {
			if (self.sendChannel) {
				self.sendChannel.close();
			}
			if (self.pc) {
				self.pc.close();
			}
		} catch (error) {
			console.warn(getDebugMessage('{} Error while closing channels, description {}', error.message, error, name));
		}
		if (self.localStream) {
			var tracks = self.localStream.getTracks();
			for (var i = 0; i < tracks.length; i++) {
				tracks[i].stop()
			}
		}
		self.setIconState(false);
		if (text) {
			growlInfo(text);
		}
		self.hidePhoneIcon();
		if (self.javascriptNode) {
			self.javascriptNode.onaudioprocess = null;
			self.dom.microphoneLevel.value = 0;
		}
		self.exitFullScreen();
		/*also executes removing event on exiting from fullscreen*/
	};
	self.hangUp = function () {
		self.sendBaseEvent(null, 'finish');
		self.closeEvents("Call is finished.");
	};
	self.ondecline = function () {
		self.closeEvents("User has declined the call");
	};
	self.onfinish = function () {
		self.declineWebRtcCall(true);
		self.closeEvents("Opponent hung up. Call is finished.");
	};
	self.closeDialog = function () {
		if (self.isActive()) {
			self.hangUp();
		} else {
			singlePage.showDefaultPage();
		}
	};
	self.webrtcDirectMessage = function (event) {
		// console.log(getDebugMessage('Received Message ' + event.data.byteLength));
		self.receiveBuffer.push(event.data);
		self.receivedSize += event.data.byteLength;

		self.downloadBar.setValue(self.receivedSize);

		// we are assuming that our signaling protocol told
		// about the expected file size (and name, hash, etc).
		if (self.receivedSize === self.receivedFileSize) {
			self.assembleFile();
			self.closeEvents();
		}
	};
	self.onfileAccepted = function (message) {
		console.log(getDebugMessage("Transfer file {} result : {}", self.file.name, message.content));
		growlInfo('Transferring  {} is finished '.format(self.file.name));
		self.downloadBar.setSuccess();
		self.downloadBar.dom.text.innerHTML = 'Transferred!';
		self.closeEvents();
	};
	self.assembleFile = function () {
		var received = new window.Blob(self.receiveBuffer);
		var message = "File {} is received.".format(self.receivedFileName);
		growlInfo(message);
		console.info(getDebugMessage(message));
		self.sendBaseEvent(null, 'fileAccepted');
		self.downloadBar.setSuccess();
		self.receiveBuffer = [];
		self.receivedSize = 0;
		self.downloadBar.dom.text.href = URL.createObjectURL(received);
		self.downloadBar.dom.text.download = self.receivedFileName;
		self.downloadBar.dom.text.textContent = 'Save {}'.format(self.receivedFileName);
	};
	self.createSendChannelAndOffer = function () {
		self.webrtcInitiator = true;
		try {
			// Reliable data channels not supported by Chrome
			self.sendChannel = self.pc.createDataChannel("sendDataChannel", {reliable: false});
			self.sendChannel.onmessage = self.webrtcDirectMessage;
			console.log(getDebugMessage("Created send data channel"));
		} catch (e) {
			var error = "Failed to create data channel because {} ".format(e.message || e);
			growlError(error);
			console.error(getDebugMessage(error));
		}
		self.pc.createOffer(function (offer) {
			console.log(getDebugMessage('created offer...'));
			self.pc.setLocalDescription(offer, function () {
				console.log(getDebugMessage('sending to remote...'));
				self.sendWebRtcEvent(offer);
			}, self.failWebRtcP2);
		}, self.failWebRtcP1, self.sdpConstraints);
	};
	self.sendBaseEvent = function (content, type) {
		wsHandler.sendToServer({
			content: content,
			action: 'call',
			type: type,
			channel: channelsHandler.activeChannel
		});
	};
	self.sendWebRtcEvent = function (message) {
		self.sendBaseEvent(message, 'webrtc');
	};
	self.failWebRtcP1 = function () {
		self.failWebRtc.apply(self, arguments);
	};
	self.failWebRtcP2 = function () {
		self.failWebRtc.apply(self, arguments);
	};
	self.failWebRtcP3 = function () {
		self.failWebRtc.apply(self, arguments);
	};
	self.failWebRtcP4 = function () {
		self.failWebRtc.apply(self, arguments);
	};
	self.failWebRtc = function () {
		var isError = arguments.length === 1 && (arguments[0].message || arguments[0].name);
		var errorContext = isError ? "{}: {}".format(arguments[0].name, arguments[0].message)
				: Array.prototype.join.call(arguments, ' ');
		growlError("An error occurred while establishing a connection: {}".format(errorContext));
		console.error(getDebugMessage("OnError way from {}, exception: {}", getCallerTrace(), errorContext));
	};
	self.attachDomEvents();
}


function WsHandler() {
	var self = this;
	self.wsState = 0; // 0 - not inited, 1 - tried to connect but failed; 9 - connected;
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
		self.handleMessage(data);
		//cache some messages to localStorage save only after handle, in case of errors +  it changes the message,
		storage.saveMessageToStorage(data, jsonData);
	};
	self.handleMessage = function (data) {
		self.handlers[data.handler].handle(data);
	};
	self.sendToServer = function (messageRequest) {
		var jsonRequest = JSON.stringify(messageRequest);
		var logEntry = jsonRequest.substring(0, 500);
		if (self.ws.readyState !== WebSocket.OPEN) {
			console.warn(getDebugMessage("Web socket is closed. Can't send {}", logEntry));
			growlError("Can't send message, because connection is lost :(");
			return false;
		} else {
			console.log(getDebugMessage("WS out: {} ", logEntry));
			self.ws.send(jsonRequest);
			return true;
		}
	};

	self.setStatus = function (isOnline) {
		var statusClass = isOnline ? self.dom.onlineClass : self.dom.offlineClass;
		CssUtils.setOnOf(self.dom.onlineStatus, statusClass, [self.dom.onlineClass, self.dom.offlineClass]);
	};
	self.onWsClose = function (e) {
		self.setStatus(false);
		var reason = e.reason || e;
		if (e.code === 403) {
			var message = "Server has forbidden request because '{}'".format(reason);
			growlError(message);
			console.error(getDebugMessage(message));
		} else if (self.wsState === 0) {
			growlError("Can't establish connection with server");
			console.error(getDebugMessage("Chat server is down because {}", reason));
		} else if (self.wsState === 9) {
			growlError("Connection to chat server has been lost, because {}".format(reason));
			console.error(getDebugMessage(
					'Connection to WebSocket has failed because "{}". Trying to reconnect every {}ms',
					e.reason, CONNECTION_RETRY_TIME));
		}
		self.wsState = 1;
		// Try to reconnect in 10 seconds
		setTimeout(self.start_chat_ws, CONNECTION_RETRY_TIME);
	};
	self.start_chat_ws = function () {
		if (!window.WebSocket) {
			growlError(getText("Your browser ({}) doesn't support webSockets. Supported browsers: " +
					"Android, Chrome, Opera, Safari, IE11, Edge, Firefox", window.browserVersion));
			return;
		}
		self.ws = new WebSocket(API_URL);
		self.ws.onmessage = self.onWsMessage;
		self.ws.onclose = self.onWsClose;
		self.ws.onopen = function () {
			self.setStatus(true);
			var message = "Connection to server has been established";
			if (self.wsState === 1) { // if not inited don't growl message on page load
				growlSuccess(message);
			}
			self.wsState = 9;
			console.log(getDebugMessage(message));
		};
	};
}

function Storage() {
	var self = this;
	self.STORAGE_NAME = 'main';
	self.loadMessagesFromLocalStorage = function () {
		var jsonData = localStorage.getItem(self.STORAGE_NAME);
		if (jsonData != null) {
			var parsedData = JSON.parse(jsonData);
			console.log(getDebugMessage('Loading {} messages from localstorage', parsedData.length));
			// don't make sound on loadHistory
			var savedSoundStatus = window.sound;
			window.sound = 0;
			window.loggingEnabled = false;
			window.newMessagesDisabled = true;
			for (var i = 0; i < parsedData.length; i++) {
				try {
					wsHandler.handleMessage(parsedData[i]);
				} catch (err) {
					console.warn(getDebugMessage("Message '{}' isn't loaded because {}",
							JSON.stringify(parsedData[i]), err));
				}
			}
			window.loggingEnabled = true;
			window.newMessagesDisabled = false;
			window.sound = savedSoundStatus;
		}
	};
	// Use both json and object repr for less JSON actions
	self.saveMessageToStorage = function (objectItem, jsonItem) {
		if (!notifier.isTabMain()) {
			return
		}
		switch (objectItem['action']) {
			case 'printMessage':
			case 'loadMessages':
			case 'loadOfflineMessages':
				self.fastAddToStorage(jsonItem);
				break;
		}
	};
	self.fastAddToStorage = function (text) {
		var storageData = localStorage.getItem(self.STORAGE_NAME);
		var newStorageData;
		if (storageData) {
			// insert new text before "]" symbol and add it manually
			var copyUntil = storageData.length - 1;
			newStorageData = storageData.substr(0, copyUntil) + ',' + text + ']';
		} else {
			newStorageData = '[' + text + ']';
		}
		localStorage.setItem(self.STORAGE_NAME, newStorageData);
	};
}

function createUserLi(userId, gender, username) {
	var icon;
	icon = document.createElement('i');
	icon.className = GENDER_ICONS[gender];
	var li = document.createElement('li');
	li.appendChild(icon);
	li.innerHTML += username;
	li.setAttribute(USER_ID_ATTR, userId);
	li.setAttribute(USER_NAME_ATTR, username);
	return li;
}