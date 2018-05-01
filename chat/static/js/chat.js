var CONNECTION_RETRY_TIME = 5000;
var SYSTEM_HEADER_CLASS = 'message-header-system';
var TIME_SPAN_CLASS = 'timeMess';
var CONTENT_STYLE_CLASS = 'message-text-style';
// used in ChannelsHandler and ChatHandler
var USER_ID_ATTR = 'userid';
var SELF_HEADER_CLASS = 'message-header-self';
var USER_NAME_ATTR = 'username';
var REMOVED_MESSAGE_CLASSNAME = 'removed-message';
var MESSAGE_ID_ATTRIBUTE = 'messageId';
var MAX_ACCEPT_FILE_SIZE_WO_FS_API = Math.pow(2, 28); // 256 MB
// end used
var FLOOD_FILL_CURSOR = '<?xml version="1.0" encoding="UTF-8" standalone="no"?> <svg    xmlns:osb="http://www.openswatchbook.org/uri/2009/osb"    xmlns:dc="http://purl.org/dc/elements/1.1/"    xmlns:cc="http://creativecommons.org/ns#"    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"    xmlns:svg="http://www.w3.org/2000/svg"    xmlns="http://www.w3.org/2000/svg"    xmlns:xlink="http://www.w3.org/1999/xlink"    height="128"    width="128"    id="svg12"    xml:space="preserve"    enable-background="new 0 0 1000 1000"    viewBox="0 0 128 128"    y="0px"    x="0px"    version="1.1"><defs      id="defs16"><linearGradient        osb:paint="solid"        id="linearGradient4668"><stop          id="stop4666"          offset="0"          style="stop-color:#a70000;stop-opacity:1;" /></linearGradient><linearGradient        gradientUnits="userSpaceOnUse"        y2="129.24489"        x2="8692.8536"        y1="129.24489"        x1="124.50469"        id="linearGradient4670"        xlink:href="#linearGradient4668" /></defs><metadata      id="metadata2"> Svg Vector Icons : http://www.onlinewebfonts.com/icon <rdf:RDF><cc:Work      rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type        rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title></dc:title></cc:Work></rdf:RDF></metadata><g      transform="matrix(-0.06545548,0,0,0.06545548,96.091518,32.9054)"      id="g10"><g        id="g8"        transform="matrix(0.1,0,0,-0.1,0,511)"><path          style="fill-opacity:1;fill:url(#linearGradient4670)"          id="path4"          d="M 2923.3,4723.5 C 2495.2541,4641.7289 2116.2015,4282.4666 2019.575,3861.7722 2010.936,2974.8482 2002.3121,2087.9242 1993.7,1201 1372.6067,561.9446 713.75686,-43.111911 124.50469,-711.1 177.79443,-1124.6012 696.18046,-1384.5817 946.92256,-1721.6746 1873.0645,-2644.7129 2784.7436,-3583.1992 3733.8,-4482.7 c 414.8568,-14.5444 672.1458,554.0816 1010.5846,786.2741 C 5933.4015,-2520.7561 7113.1744,-1335.7883 8297.1,-155 8684.9234,-201.73044 8869.3553,83.429201 8467.4077,323.01301 7303.9011,1506.5241 6142.0458,2693.2924 4939.988,3837.6106 4686.657,4091.5786 4729.7111,3391.5044 4719.1559,3565.1616 4714.1012,2956.3168 4711.3726,2347.458 4708.5,1738.6 5031.0341,1335.4454 4991.2388,661.12765 4526.4426,380.70059 4035.9919,26.383144 3257.4044,327.55874 3152.1031,931.46414 c -39.8563,589.13426 159.3241,863.35076 203.329,893.32976 2.2707,246.6969 2.431,493.4008 2.1679,740.1061 -300.1928,-300.1072 -600.3595,-600.2405 -900.5,-900.4 12.8139,725.2498 -32.7477,1454.2178 35.8271,2176.4281 162.6751,558.7872 1062.6877,586.7614 1253.7345,27.8061 112.979,-515.8061 41.7341,-1055.8192 61.1384,-1582.3166 -12.3655,-253.837 24.6538,-527.0728 -18.3526,-768.8737 -333.2237,-217.6526 -244.4878,-787.61406 173.4897,-834.19331 511.1059,-79.84462 657.2051,617.00781 295.0629,870.31461 -13.3602,773.8703 35.6765,1552.1607 -42.4,2322.3348 -122.666,568.0766 -724.5835,955.0335 -1292.3,847.5 z" /><path          style="fill:{};fill-opacity:1"          id="path6"          d="m 8652.1,-872.8 c -387.3878,-526.6483 -739.4695,-1099.2442 -952.5422,-1720.4453 -255.0408,-767.135 561.8384,-1583.3109 1332.0652,-1367.7587 707.6368,133.0412 1091.285,1010.324 735.7851,1630.769 -236.9486,492.8542 -488.9007,986.3895 -824.0081,1420.335 -74.892,70.77849 -202.3378,99.68687 -291.3,37.1 z" /></g></g></svg>';
var SYSTEM_USERNAME = 'System';
var SETTINGS_ICON_CLASS_NAME = 'icon-cog';
var PASTED_IMG_CLASS = 'B4j2ContentEditableImg';
var OFFLINE_CLASS = 'offline';
var GENDER_ICONS = {
	'Male': 'icon-man',
	'Female': 'icon-girl',
	'Secret': 'icon-user-secret'
};
var webRtcFileIcon;
var directUserTable;
var audioProcesssors = [];
var smileUnicodeRegex = /[\u3400-\u3500]/g;
var imageUnicodeRegex = /[\u3501-\u3600]/g;
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
var minimizedWindows;
var chatFileAudio;
var chatTestVolume;
var tmpCanvasContext = document.createElement('canvas').getContext('2d');
onDocLoad(function () {
	userMessage = $("usermsg");
	headerText = $('headerText');
	chatFileAudio = $('chatFile');
	chatTestVolume = $('chatTestVolume');
	directUserTable = $('directUserTable');
	webRtcFileIcon = $('webRtcFileIcon');
	var navbar = $('navbar');
	navbar.onclick = function(e) {
		if (e.target == navbar) {
			return
		} else {
			CssUtils.toggleClass(navbar, 'expanded');
		}
	}
	minimizedWindows = new MinimizedWindows();
	// some browser don't fire keypress event for num keys so keydown instead of keypress
	channelsHandler = new ChannelsHandler();
	singlePage = new PageHandler();
	webRtcApi = new WebRtcApi();
	smileyUtil = new SmileyUtil();
	wsHandler = new WsHandler();
	//bottom call loadMessagesFromLocalStorage(); s
	storage = new Storage();
	notifier = new NotifierHandler();
	painter = new Painter();
	wsHandler.listenWS();
	Utils.showHelp();
	$('singout').onclick = function() {
		channelsHandler.clearChannelHistory();
		doPost('/logout', {registration_id: notifier.subscriptionId}, function(response) {
			if (response === RESPONSE_SUCCESS) {
				window.location = '/register'
			} else {
				growlError("<div>Unable to logout, because: " + response + "</div>")
			}
		});
	}
});


function MinimizedWindows() {
	var self = this;
	self.draggables = [];
	self.dom = {
		ul: document.createElement('UL'),
		minimizedWindowsIcon: $('minimizedWindows')
	};
	self.init = function () {
		self.dom.ul.className = 'minimizedList window list ' + CssUtils.visibilityClass;
		document.body.appendChild(self.dom.ul);
		self.dom.minimizedWindowsIcon.onclick = self.toggle;
		self.dom.ul.onclick = self.onulclick;
	};
	self.onulclick = function (e) {
		if (e.target.tagName === 'LI') {
			document.removeEventListener("click", self.hideWindow);
			var el = self.findAndRemove(e.target, true);
			el.show();
			self.hideIfNeeded();
			CssUtils.hideElement(self.dom.ul);
		}
	};
	self.toggle = function (e) {
		var wasVisible = CssUtils.toggleVisibility(self.dom.ul);
		if (!wasVisible) {
			document.addEventListener("click", self.hideWindow);
			var a = self.dom.minimizedWindowsIcon;
			e.stopPropagation();
			self.dom.ul.style.top = a.offsetHeight + a.offsetTop + 'px';
			self.dom.ul.style.left = a.offsetLeft - 100 + 'px';
		} else {
			document.removeEventListener("click", self.hideWindow);
		}
	};
	self.hideWindow = function () {
		document.removeEventListener("click", self.hideWindow);
		CssUtils.hideElement(self.dom.ul);
	};
	self.add = function (draggable) {
		var li = document.createElement('li');
		self.dom.ul.appendChild(li);
		li.textContent = draggable.getHeaderText();
		self.draggables.push({obj: draggable, li: li});
		draggable.hide();
		CssUtils.showElement(self.dom.minimizedWindowsIcon);
	};
	self.findAndRemove = function (li, isLi) {
		for (var i = 0; i < self.draggables.length; i++) {
			var e = self.draggables[i];
			if ((isLi && e.li === li) || (!isLi && e.obj === li)) {
				self.draggables.splice(i, 1);
				self.dom.ul.removeChild(e.li);
				return e.obj;
			}
		}
	};
	self.hideIfNeeded = function () {
		if (self.draggables.length === 0) {
			CssUtils.hideElement(self.dom.minimizedWindowsIcon);
		}
	};
	self.remove = function (draggable) {
		var e = self.findAndRemove(draggable);
		if (e) {
			e.hide();
			self.hideIfNeeded();
		} else {
			logger.error("Draggable {} not found", draggable)();
		}
	};
	self.init();
}


function Draggable(container, headerText) {
	var self = this;
	self.UNACTIVE_CLASS = 'blurred';
	self.MOVING_CLASS = 'moving';
	self.dom = {
		container: container,
		iconMinimize: document.createElement('I'),
		header: document.createElement('DIV'),
		iconCancel: document.createElement('i'),
	};
	self.headerText = headerText;
	self.preventDefault = function (e) {
		e.stopPropagation();
		e.preventDefault();
	};
	self.onMouseMove = function (e) {
		self.top = e.pageY;
		self.left = e.pageX;
	};
	self.headerDragStart = function(e) {
		self.mouseDownElement = e.target;
		self.dom.container.setAttribute('draggable', true);
	};
	self.init = function () {
		CssUtils.addClass(self.dom.container, "modal-body");
		self.dom.container.style.left = '0px';
		self.dom.container.style.top = '50px';
		self.dom.header.appendChild(self.dom.iconMinimize);
		self.dom.iconMinimize.onclick = self.minimize;
		self.dom.iconMinimize.className = 'icon-minimize';
		self.dom.iconMinimize.setAttribute('title', 'Minimize window');
		self.dom.header.className = 'windowHeader noSelection';
		self.zoom = 1;
		self.dom.header.addEventListener('mousedown', self.headerDragStart, false);
		self.dom.header.addEventListener('touchstart', self.headerDragStart, false);
		self.dom.container.ondragstart = self.ondragstart;
		self.dom.container.ondragend = self.ondragend;
		// self.dom.container.ondrop = self.preventDefault; // TODO doens't work
		// self.dom.container.ondragleave  = self.preventDefault; // this thing causes ondrop event on messages
		// self.dom.container.ondragenter  = self.preventDefault;
		self.dom.headerText = document.createElement('span');
		self.dom.header.appendChild(self.dom.headerText);
		self.setHeaderText(self.headerText);
		self.dom.header.appendChild(self.dom.iconCancel);
		self.dom.iconCancel.onclick = self.hide;
		self.dom.iconCancel.className = 'icon-cancel';
		self.dom.iconCancel.setAttribute('title', 'Close window');
		self.dom.body = self.dom.container.children[0];
		if (!self.dom.body) {
			self.dom.body = document.createElement('DIV');
			self.dom.container.appendChild(self.dom.body);
		}
		CssUtils.addClass(self.dom.body, 'window-body');
		self.dom.container.insertBefore(self.dom.header, self.dom.body);
		self.dom.container.addEventListener('focus', self.onfocus);
		self.dom.container.addEventListener('blur', self.onfocusout);
		self.dom.container.setAttribute('tabindex', "-1");
	};
	self.ondragend = function (e) {
		var x, y;
		if (isFirefox) {
			document.removeEventListener('dragover', self.onMouseMove);
			x = self.left;
			y = self.top;
		} else {
			x = e.pageX;
			y = e.pageY;
		}
		CssUtils.removeClass(self.dom.container, self.MOVING_CLASS);
		var left = x + self.leftCorrection;
		if (left < 0) {
			left = 0;
		} else if (left > self.maxLeft) {
			left = self.maxLeft;
		}
		var top = y + self.topCorrection;
		if (top < 0) {
			top = 0;
		} else if (top > self.maxTop) {
			top = self.maxTop;
		}
		self.dom.container.style.left = left + "px";
		self.dom.container.style.top = top + "px";
		self.dom.container.removeAttribute('draggable');
	};
	self.ondragstart = function (e) {
		if (isFirefox) {
			e.dataTransfer.setData('text/plain', 'won');
			document.addEventListener('dragover', self.onMouseMove);
		}
		var clickedEl = self.mouseDownElement;
		self.mouseDownElement = null;
		if (isDescendant(self.dom.header, clickedEl)) {
			if (clickedEl.tagName !== 'I') {
				CssUtils.addClass(self.dom.container, self.MOVING_CLASS);
				self.leftCorrection = self.dom.container.offsetLeft - e.pageX;
				self.topCorrection = self.dom.container.offsetTop - e.pageY;
				self.maxTop = document.body.clientHeight - self.dom.container.clientHeight - 7;
				self.maxLeft = document.body.clientWidth - self.dom.container.clientWidth - 3;
				return;
			}
		}
		e.preventDefault();
	};
	self.fixInputs = function () {
		if (!self.dom.container.id) {
			self.dom.container.id = 'draggable' + getRandomId();
		}
		var inputs = document.querySelectorAll('#{0} input, #{0} button, .fixInput'.formatPos(container.id));
		// typeOf(inputs) = HTMLCollection, not an array. that doesn't have forEach
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].addEventListener('focus', function () {
				CssUtils.addClass(self.dom.container, self.UNACTIVE_CLASS);
			});
			inputs[i].addEventListener('blur', function () {
				CssUtils.removeClass(self.dom.container, self.UNACTIVE_CLASS);
			});
		}
	};
	self.hide = function () {
		CssUtils.hideElement(self.dom.container);
	};
	self.setHeaderText = function (text) {
		self.dom.headerText.innerHTML = text;
	};
	self.getHeaderText = function () {
		return self.dom.headerText.textContent;
	};
	self.show = function () {
		CssUtils.showElement(self.dom.container);
	};
	self.destroy = function () {
		CssUtils.deleteElement(self.dom.container);
	};
	self.minimize = function () {
		minimizedWindows.add(self);
	};
	self.super = {
		show: self.show,
		hide: self.hide
	};
	self.init();
}

function Painter() {
	var self = this;
	Draggable.call(self, $('canvasHolder'), "Painter");
	self.ZOOM_SCALE = 1.1;
	self.PICKED_TOOL_CLASS = 'active-icon';
	self.dom.canvas = $('painter');
	self.dom.paintDimensions = $('paintDimensions');
	self.dom.paintXY = $('paintXY');
	self.dom.trimImage = $('trimImage');
	self.dom.canvasResize = $('canvasResize');
	self.dom.canvasWrapper = $('canvasWrapper');
	self.tmp = new function() {
		var tool = this;
		tool.tmpCanvas = document.createElement('canvas');
		tool.tmpData = tool.tmpCanvas.getContext('2d');
		tool.saveState = function() {
			tool.tmpCanvas.width = self.dom.canvas.width;
			tool.tmpCanvas.height = self.dom.canvas.height;
			tool.tmpData.clearRect(0, 0, self.dom.canvas.width, self.dom.canvas.height);
			tool.tmpData.drawImage(self.dom.canvas, 0, 0);
			self.log("Context saved")();
		};
		tool.restoreState = function() {
			self.ctx.clearRect(0, 0, self.dom.canvas.width, self.dom.canvas.height);
			self.helper.drawImage(tool.tmpCanvas, 0, 0);
			//clear in case new image is transparen
		}
	};
	self.instruments = {
		color: {
			holder: $('paintColor'),
			handler: 'onChangeColor',
			ctxSetter: function (v) {
				self.ctx.strokeStyle = v;
			}
		},
		colorFill: {
			holder: $('paintColorFill'),
			handler: 'onChangeColorFill',
			ctxSetter: function (v) {
				self.ctx.fillStyle = v;
			}
		},
		opacityFill: {
			holder: $('paintFillOpacity'),
			handler: 'onChangeFillOpacity',
			range: true,
			ctxSetter: function (v) {
				self.instruments.opacityFill.inputValue = v / 100;
			}
		},
		apply: {
			holder: $('paintApplyText'),
			trigger: 'click',
			handler: 'onApply'
		},
		opacity: {
			holder: $('paintOpacity'),
			handler: 'onChangeOpacity',
			range: true,
			ctxSetter: function (v) {
				self.ctx.globalAlpha = v / 100;
				self.instruments.opacity.inputValue = v / 100;
			}
		},
		width: {
			range: true,
			holder: $('paintRadius'),
			handler: 'onChangeRadius',
			ctxSetter: function (v) {
				self.ctx.lineWidth = v;
			},
		},
		font: {
			holder: $('paintFont'),
			handler: 'onChangeFont',
			ctxSetter: function (v) {
				self.ctx.fontFamily = v;
			}
		}
	};
	self.init = {
		createFullScreen: function() {
			self.dom.header.ondblclick = function() {
				var xy = Utils.getWindowParams();
				self.dom.canvasWrapper.style.width = xy.x -60 + 'px';
				self.dom.canvasWrapper.style.height =  xy.y - 95 + 'px';
				self.dom.container.style.left = '1px';
				self.dom.container.style.top = '1px';
			}
		},
		createCanvas: function() {
			self.ctx = self.dom.canvas.getContext('2d');
			self.ctx.imageSmoothingEnabled= false;
			self.ctx.mozImageSmoothingEnabled = false;
			var height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight,
					document.documentElement.scrollHeight, document.documentElement.offsetHeight);
			var width = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight,
					document.documentElement.scrollHeight, document.documentElement.offsetHeight);
			self.helper.setDimensions(500, 500);
			self.dom.canvasWrapper.style.height = height * 0.9 - 100 + 'px'
			self.dom.canvasWrapper.style.width = width * 0.9 - 80 + 'px'
		},
		fixInput: self.fixInputs,
		initInstruments: function () { // TODO this looks bad
			Object.keys(self.instruments).forEach(function (k) {
				var instr = self.instruments[k];
				instr.value = instr.holder.querySelector('.value')
				instr.value.addEventListener(instr.trigger || 'input', function (e) {
					if (instr.range && instr.value.value.length > 2 && this.value != 100) { // != isntead !== in case it's a string
						instr.value.value = this.value.slice(0, 2)
					}
					instr.ctxSetter && instr.ctxSetter(e.target.value);
					var handler = self.tools[self.mode][instr.handler];
					handler && handler(e);
					if (instr.range) {
						instr.range.value = instr.value.value;
						fixInputRangeStyle(instr.range);
					}
				});
				if (instr.range) {
					instr.value.addEventListener('keypress', function (e) {
						var charCode = e.which || e.keyCode;
						return charCode > 47 && charCode < 58;
					});
					instr.range = instr.holder.querySelector('input[type=range]');
					instr.range.addEventListener('input', function (e) {
						instr.value.value = instr.range.value;
						instr.ctxSetter(e.target.value);
						var handler = self.tools[self.mode][instr.handler];
						handler && handler(e);
					});
				}
			});
		},
		setContext: function () {
			Object.keys(self.instruments).forEach(function (k) {
				var instr = self.instruments[k];
				instr.ctxSetter && instr.ctxSetter(instr.value.value);
			});
		},
		initTools: function () {
			var toolsHolder = $('painterTools');
			self.keyProcessors = [];
			$('paintOpen').onclick = self.helper.openCanvas;
			$('paintSend').onclick = self.helper.pasteToTextArea;
			function createIcon(keyActivator,f) {
				var i = document.createElement('i');
				toolsHolder.appendChild(i);
				i.setAttribute('title', keyActivator.title);
				i.className = keyActivator.icon;
				keyActivator.clickAction = f;
				i.onclick = f;
				self.keyProcessors.push(keyActivator);
				return i;
			}
			for (var tool in self.tools) {
				if (!self.tools.hasOwnProperty(tool)) continue;
				self.tools[tool].icon = createIcon(self.tools[tool].keyActivator, self.setMode.bind(self, tool));
			}
			self.actions.forEach(function(a) {
				var i = createIcon(a.keyActivator, function(e) {
					a.handler(e);
					self.helper.applyZoom();
				});
			});
		},
		checkEventCodes: function() {
			var check = [];
			self.keyProcessors.forEach(function (proc) {
				if (check.indexOf(proc.code) >= 0) {
					throw "key " + proc.code + "is used";
				}
				check.push(proc.code);
			});
			self.log("Registered keys: {}", JSON.stringify(check))();
		},
		initCanvas: function () {
			[
				{dom: self.dom.canvas, listener: ['mousedown', 'touchstart'], handler: 'onmousedown'},
				{dom: self.dom.canvas, listener: ['mousemove', 'touchmove'], handler: 'onmousemove'},
				{dom: self.dom.container, listener: 'keypress', handler: 'contKeyPress', params: false},
				{dom: document.body, listener: 'paste', handler: 'canvasImagePaste', params: false},
				{dom: self.dom.canvasWrapper, listener: mouseWheelEventName, handler: 'onmousewheel', params: {passive: false}},
				{dom: self.dom.container, listener: 'drop', handler: 'canvasImageDrop', params: {passive: false}},
				{dom: self.dom.canvasResize, listener: 'mousedown', handler: 'painterResize'}
			].forEach(function (e) {
				var listeners = Array.isArray(e.listener) ? e.listener: [e.listener];
				listeners.forEach(function(listener) {
					e.dom.addEventListener(listener, self.events[e.handler], e.params);
				});

			});
		},
		createFonts: function () {
			var select = self.instruments.font.value;
			var fonts = [
				'Arial, Helvetica, sans-serif',
				'"Arial Black", Gadget, sans-serif',
				'"Comic Sans MS", cursive, sans-serif',
				'Impact, Charcoal, sans-serif',
				'"Lucida Sans Unicode", "Lucida Grande", sans-serif',
				'Tahoma, Geneva, sans-serif',
				'"Trebuchet MS", Helvetica, sans-serif',
				'Verdana, Geneva, sans-serif',
				'"Courier New", Courier, monospace',
				'"Lucida Console", Monaco, monospace'
			];
			fonts.forEach(function (t) {
				var o = document.createElement('option');
				select.appendChild(o);
				o.textContent = t;
				o.style.fontFamily = t;
				o.value = t;
			});
		},
	};
	self.log = loggerFactory.getLogger("Painter", console.log, 'color: #f200da');
	self.helper = {
		setUIText: function(text) {
			self.dom.paintXY.textContent = text + ' ' + Math.round(self.zoom * 100) + '%';
		},
		openCanvas: function (e) {
			self.show();
			self.buffer.clear();
			self.init.setContext();
			self.setMode('pen');
		},
		getPageXY: function(e) {
			return {
				pageX: e.pageX || e.touches[0].pageX,
				pageY: e.pageY || e.touches[0].pageY,
			}
		},
		pasteToTextArea: function () {
			if (singlePage.currentPage.pageName != 'channels') {
				return;
			}
			if (self.dom.trimImage.checked) {
				var trimImage = self.helper.trimImage();
				if (trimImage) {
					trimImage.toBlob(Utils.pasteBlobImgToTextArea);
					self.hide();
				} else {
					growlError("You can't paste empty images");
				}
			} else {
				self.dom.canvas.toBlob(Utils.pasteBlobImgToTextArea);
				self.hide();
			}
		},
		drawImage: function() {
			var savedA = self.ctx.globalAlpha;
			self.ctx.globalAlpha = 1;
			self.ctx.drawImage.apply(self.ctx, arguments);
			self.ctx.globalAlpha = savedA;
		},
		setCursor: function(text) {
			self.dom.canvas.style.cursor = text;
		},
		buildCursor: function (fill, stroke, width) {
			if (width < 3) {
				width = 3;
			} else if (width > 126) {
				width = 126;
			}
			var svg = '<svg xmlns="http://www.w3.org/2000/svg" height="128" width="128"><circle cx="64" cy="64" r="{0}" fill="{1}"{2}/></svg>'.formatPos(width, fill, stroke);
			return 'url(data:image/svg+xml;base64,{}) {} {}, auto'.format(btoa(svg), 64, 64);
		},
		isNumberKey: function (evt) {
			var charCode = evt.which || evt.keyCode;
			return charCode > 47 && charCode < 58;
		},
		trimImage: function () { // TODO this looks bad
					var pixels = self.ctx.getImageData(0, 0, self.dom.canvas.width, self.dom.canvas.height),
					l = pixels.data.length,
					i,
					bound = {
						top: null,
						left: null,
						right: null,
						bottom: null
					},
					x, y;
			for (i = 0; i < l; i += 4) {
				if (pixels.data[i + 3] !== 0) {
					x = (i / 4) % self.dom.canvas.width;
					y = ~~((i / 4) / self.dom.canvas.width);
					if (bound.top === null) {
						bound.top = y;
					}
					if (bound.left === null) {
						bound.left = x;
					} else if (x < bound.left) {
						bound.left = x;
					}
					if (bound.right === null) {
						bound.right = x;
					} else if (bound.right < x) {
						bound.right = x;
					}
					if (bound.bottom === null) {
						bound.bottom = y;
					} else if (bound.bottom < y) {
						bound.bottom = y;
					}
				}
			}
			var trimHeight = bound.bottom - bound.top,
					trimWidth = bound.right - bound.left;
			if (trimWidth && trimHeight) {
				var trimmed = self.ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
				tmpCanvasContext.canvas.width = trimWidth;
				tmpCanvasContext.canvas.height = trimHeight;
				tmpCanvasContext.putImageData(trimmed, 0, 0);
				return tmpCanvasContext.canvas;
			} else {
				return false;
			}
		},
		setZoom: function (isIncrease) {
			if (isIncrease) {
				self.zoom *= self.ZOOM_SCALE;
			} else {
				self.zoom /= self.ZOOM_SCALE;
			}
			self.helper.setUIText(self.dom.paintXY.textContent.split(' ')[0]);
			if (self.tools[self.mode].onZoomChange) {
				self.tools[self.mode].onZoomChange(self.zoom);
			}
		},
		applyZoom: function() {
			self.dom.canvas.style.width = self.dom.canvas.width * self.zoom + 'px';
			self.dom.canvas.style.height = self.dom.canvas.height * self.zoom + 'px';
		},
		getScaledOrdinate: function (ordinateName, clientOrdinateName, value) {
			var clientOrdinate = self.dom.canvas[clientOrdinateName];
			var ordinate = self.dom.canvas[ordinateName];
			return ordinate == clientOrdinate ? value : Math.round(ordinate * value / clientOrdinate); // apply page zoom
		},
		getOffset: function (el) {
			var _x = 0;
			var _y = 0;
			while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
				_x += el.offsetLeft - el.scrollLeft;
				_y += el.offsetTop - el.scrollTop;
				el = el.offsetParent;
			}
			return {offsetTop: _y, offsetLeft: _x};
		},
		setOffset: function(e) {
			if (!e.offsetX && e.touches) {
				var offset = self.helper.getOffset(self.dom.canvas);
				var pxy = self.helper.getPageXY(e);
				e.offsetX = Math.round(pxy.pageX- offset.offsetLeft);
				e.offsetY = Math.round(pxy.pageY- offset.offsetTop);
			}
		},
		getXY: function (e) {
			var newVar = {
				x: self.helper.getScaledOrdinate('width', 'clientWidth', e.offsetX),
				y: self.helper.getScaledOrdinate('height', 'clientHeight', e.offsetY)
			};
			return newVar
		},
		setDimensions: function(w, h) {
			var state = self.buffer.getState();
			w = parseInt(w);
			h = parseInt(h);
			self.dom.canvas.width = w;
			self.dom.canvas.height = h;
			self.buffer.restoreState(state);
			self.dom.paintDimensions.textContent = '{}x{}'.format(w, h);
		}
	};
	self.Appliable = function() {
		var tool = this;
		tool.applyBtn = document.querySelector('#paintApplyText input[type=button]');
		tool.enableApply = function() {
			tool.applyBtn.removeAttribute('disabled');
		};
		tool.disableApply = function() {
			tool.applyBtn.setAttribute('disabled', 'disabled');
		};
	};
	self.events = {
		mouseDown: false,
		onmousedown: function (e) {
			var tool = self.tools[self.mode];
			if (!tool.onMouseDown) {
				return;
			}
			self.helper.setOffset(e);
			// self.log("{} mouse down", self.mode)();
			self.events.mouseDown = true
			var rect = painter.dom.canvas.getBoundingClientRect();
			var imgData;
			if (!tool.bufferHandler) {
				imgData = self.buffer.startAction();
			}
			tool.onMouseDown(e, imgData);
		},
		onmousemove: function(e) {
			var tool = self.tools[self.mode];
			self.helper.setOffset(e);
			var xy = self.helper.getXY(e);
			self.helper.setUIText("[{},{}]".format(xy.x, xy.y));
			if (self.events.mouseDown && tool.onMouseMove) {
				tool.onMouseMove(e, xy);
			}
		},
		onmouseup: function (e) {
			if (self.events.mouseDown) {
				self.events.mouseDown = false;
				var tool = self.tools[self.mode];
				if (!tool.bufferHandler) {
					self.buffer.finishAction();
				}
				var mu = tool.onMouseUp;
				if (mu) {
					// self.log("{} mouse up", self.mode)();
					mu(e)
				}
			}
		},
		onmousewheel: function (e) {
			if (!e.ctrlKey) {
				return;
			}
			e.preventDefault();
			self.helper.setOffset(e);
			var xy = self.helper.getXY(e)
			self.helper.setZoom(e.detail < 0 || e.wheelDelta > 0); // isTop
			self.helper.applyZoom()
			var clientRect = self.dom.canvasWrapper.getBoundingClientRect();
			var scrollLeft = (xy.x * self.zoom) - (e.clientX - clientRect.left);
			var scrollTop = (xy.y * self.zoom) - (e.clientY - clientRect.top);
			self.dom.canvasWrapper.scrollLeft = scrollLeft
			self.dom.canvasWrapper.scrollTop = scrollTop;
		},
		contKeyPress: function (event) {
			self.log("keyPress: {} ({})", event.keyCode, event.code)();
			if (event.keyCode === 13) {
				if (self.tools[self.mode].onApply) {
					self.tools[self.mode].onApply();
				} else {
					self.helper.pasteToTextArea();
				}
			}
			self.keyProcessors.forEach(function(proc) {
				if (event.code == proc.code
						&& (!proc.ctrlKey || (proc.ctrlKey && event.ctrlKey))) {
					proc.clickAction(event);
				}
			});
		},
		painterResize: function(e) {
			var st = painter.dom.canvasWrapper.style;
			var w = parseInt(st.width.split('px')[0]);
			var h = parseInt(st.height.split('px')[0]);
			var pxy =self.helper.getPageXY(e);
			var listener = function(e) {
				var cxy = self.helper.getPageXY(e);
				self.dom.canvasWrapper.style.width = w - pxy.pageX + cxy.pageX + 'px';
				self.dom.canvasWrapper.style.height = h - pxy.pageY + cxy.pageY + 'px';
			};
			self.log("Added mousmove. touchmove")();
			document.addEventListener('mousemove', listener);
			document.addEventListener('touchmove', listener);
			var remove = function() {
				document.removeEventListener('mousemove', listener);
				document.removeEventListener('touchmove', listener);
			};
			document.addEventListener('mouseup', remove);
			document.addEventListener('touchend', remove);
		},
		canvasImageDrop: function (e) {
			e.preventDefault();
			self.setMode('img');
			self.tools.img.readAndPasteCanvas(e.dataTransfer.files[0]);
		},
		canvasImagePaste: function (e) {
			if (document.activeElement == self.dom.container && e.clipboardData && e.clipboardData.items) {

				for (var i = 0; i < e.clipboardData.items.length; i++) {
					var asFile = e.clipboardData.items[i].getAsFile();
					if (asFile && asFile.type.indexOf('image') >= 0) {
						self.log("Pasting images")();
						self.setMode('img');
						self.tools.img.readAndPasteCanvas(asFile);
						self.preventDefault(e);
						return;
					}
				}
			}
		}
	};
	self.resizer = new (function() {
		var tool = this;
		tool.cursorStyle = document.createElement('style');
		document.head.appendChild(tool.cursorStyle);
		tool.imgHolder = $('paint-crp-rect');
		tool.params = {
			alias: {
				width: 'ow',
				height: 'oh',
				top: 'oy',
				left: 'ox'
			},
			restoreOrd: function(name, padd) {
				var alias = tool.params.alias[name];
				tool.params[name] = tool.params.lastCoord[alias] + (padd ? tool.params.lastCoord[padd] : 0)  ;
				tool.imgHolder.style[name] = tool.params[name]* self.zoom + 'px';
			},
			setOrd: function(name, v, ampl, padding) {
				ampl = ampl || 1;
				padding = padding || 0;
				var alias = tool.params.alias[name];
				tool.imgHolder.style[name] = ampl * ((tool.params.lastCoord[alias] + padding) * self.zoom)+ v + 'px';
				tool.params[name] = ampl * tool.params.lastCoord[alias] + v / self.zoom + padding;
			},
			rotate: function() {
				var w = tool.imgHolder.style.width;
				tool.imgHolder.style.width = tool.imgHolder.style.height;
				tool.imgHolder.style.height = w;
				w = tool.params.width;
				tool.params.width = tool.params.height;
				tool.params.height = w;
			}
		};
		tool.setMode = function (m) {
			tool.mode = m;
		};
		tool.setData = function (t, l, w, h) {
			tool.params.top = t / self.zoom;
			tool.params.left = l / self.zoom;
			tool.params.width = w;
			tool.params.height = h;
			tool.imgHolder.style.left = l - 1 + 'px';
			tool.imgHolder.style.top = t - 1 + 'px';
			tool.imgHolder.style.width = w * self.zoom + 2 + 'px';
			tool.imgHolder.style.height = h * self.zoom + +2 + 'px';
		};
		tool._setCursor = function (cursor) {
			tool.cursorStyle.textContent = cursor ? "#paintPastedImg, #paint-crp-rect, #painter {cursor: {} !important}".format(cursor) : ""
		};
		tool.onZoomChange = function () {
			tool.imgHolder.style.width = tool.params.width * self.zoom + 2 + 'px';
			tool.imgHolder.style.height = tool.params.height * self.zoom + 2 + 'px';
			tool.imgHolder.style.top = tool.params.top * self.zoom - 1 + 'px';
			tool.imgHolder.style.left = tool.params.left * self.zoom - 1 + 'px';
		};
		tool.show = function () {
			CssUtils.showElement(tool.imgHolder);
			document.addEventListener('mouseup', tool.docMouseUp);
			document.addEventListener('touchend', tool.docMouseUp);
		};
		tool.hide = function() {
			tool._setCursor(null);
			CssUtils.hideElement(tool.imgHolder);
			document.removeEventListener('mouseup', tool.docMouseUp);
			document.removeEventListener('touchend', tool.docMouseUp);
		};
		tool.trackMouseMove = function(e, mode) {
			self.log("Resizer mousedown")();
			tool.mode = mode || e.target.getAttribute('pos');
			self.dom.canvasWrapper.addEventListener('mousemove', tool.handleMouseMove);
			self.dom.canvasWrapper.addEventListener('touchmove', tool.handleMouseMove);
			tool.setParamsFromEvent(e);
			tool._setCursor(tool.cursors[tool.mode]);
		};
		tool.imgHolder.onmousedown = tool.trackMouseMove;
		tool.imgHolder.ontouchstart = tool.trackMouseMove;
		tool.setParamsFromEvent = function(e) {
			var pxy =self.helper.getPageXY(e);
			tool.params.lastCoord = {
				x: pxy.pageX,
				y: pxy.pageY,
				ox: tool.params.left, // origin x
				oy: tool.params.top, // origin y
				ow: tool.params.width, // origin width
				oh: tool.params.height, // origin height
				op: tool.params.width / tool.params.height // origin proportion
			};
			// ( lastCoord.op * x)^2 + x^2 = z;
			tool.params.lastCoord.nl = Math.pow(tool.params.lastCoord.op, 2) + 1;
		};
		tool.docMouseUp = function (e) {
			//self.log("Resizer mouseup")();
			self.dom.canvasWrapper.removeEventListener('mousemove', tool.handleMouseMove);
			self.dom.canvasWrapper.removeEventListener('touchmove', tool.handleMouseMove);
		};
		tool.cursors = {
			m: 'move',
			b: 's-resize',
			t: 's-resize',
			l: 'e-resize',
			r: 'e-resize',
			tl: 'se-resize',
			br: 'se-resize',
			bl: 'ne-resize',
			tr: 'ne-resize'
		};
		tool.handlers = {
			m: function (x, y) {
				tool.params.setOrd('top', y);
				tool.params.setOrd('left', x);
			},
			b: function (x, y) {
				if (y / self.zoom < -tool.params.lastCoord.oh) {
					tool.params.setOrd('height', -y, -1);
					tool.params.setOrd('top', y, null, tool.params.lastCoord.oh);
				} else {
					tool.params.setOrd('height', y);
					tool.params.restoreOrd('top');
				}
			},
			t: function (x, y) {
				if (y / self.zoom > tool.params.lastCoord.oh) {
					tool.params.setOrd('height', y, -1);
					tool.params.restoreOrd('top', 'oh');
				} else {
					tool.params.setOrd('top', y);
					tool.params.setOrd('height', -y);
				}
			},
			l: function (x, y) {
				if (x / self.zoom  > tool.params.lastCoord.ow) {
					tool.params.setOrd('width', x, -1);
					tool.params.restoreOrd('left', 'ow');
				} else {
					tool.params.setOrd('left', x);
					tool.params.setOrd('width', -x);
				}
			},
			r: function (x, y) {
				if (x / self.zoom  < -tool.params.lastCoord.ow) {
					tool.params.setOrd('width', -x, -1);
					tool.params.setOrd('left', x, null, tool.params.lastCoord.ow);
				} else {
					tool.params.restoreOrd('left');
					tool.params.setOrd('width', x);
				}
			}
		};
		tool.calcProportion = function (x, y) {
			var d = {
				tl: {dx: 1, dy: 1},
				tr: {dx: 1, dy: -1},
				bl: {dx: -1, dy: 1},
				br: {dx: 1, dy: 1}
			}[tool.mode];
			var dx = x > 0 ? 1 : -1;
			var dy = y > 0 ? 1 : -1;
			var nl = x * x * dx * d.dx + y * y * dy * d.dy;
			var dnl = nl > 0 ? 1 : -1;
			var v = dnl * Math.sqrt(Math.abs(nl) / tool.params.lastCoord.nl);
			y = v * d.dy;
			x = v * tool.params.lastCoord.op * d.dx;
			return {x: x, y: y};
		};
		tool.handleMouseMove = function (e) {
			//self.log('handleMouseMove {}', e)();
			var pxy =self.helper.getPageXY(e);
			var x = pxy.pageX - tool.params.lastCoord.x;
			var y = pxy.pageY - tool.params.lastCoord.y;
			if (e.shiftKey && tool.mode.length === 2) {
				var __ret = tool.calcProportion(x, y);
				x = __ret.x;
				y = __ret.y;
			}
 			self.log('handleMouseMove ({}, {})', x, y)();
			tool.handlers[tool.mode.charAt(0)](x, y);
			if (tool.mode.length === 2) {
				tool.handlers[tool.mode.charAt(1)](x, y);
			}
		};
	})();
	self.tools = {
		select: new (function () {
			var tool = this;
			self.Appliable.call(this);
			tool.keyActivator = {
				code: 'KeyS',
				icon: 'icon-selection',
				title: 'Select (S)'
			};
			tool.bufferHandler = true;
			tool.domImg = $('paintPastedImg');
			tool.getCursor = function () {
				return 'crosshair';
			};
			tool.onActivate = function() {
				tool.inProgress = false;
				tool.mouseUpClicked = false;
			};
			// document.addEventListener('copy', tool.onCopy);
			tool.onZoomChange = self.resizer.onZoomChange;
			tool.onDeactivate = function () {
				if (tool.inProgress) {
					var params = self.resizer.params;
					self.log(
							'Applying image {}, {}x{}, to  {x: {}, y: {}, w: {}, h:{}',
							tool.imgInfo.width,
							tool.imgInfo.height,
							params.left,
							params.top,
							params.width,
							params.height
					)();
					self.helper.drawImage(tool.domImg,
							0, 0, tool.imgInfo.width, tool.imgInfo.height,
							params.left, params.top, params.width, params.height);
					self.buffer.finishAction();
					tool.inProgress = false; // don't restore in onDeactivate
				}
				self.resizer.hide();
				CssUtils.hideElement(tool.domImg);
			};
			tool.isSelectionActive = function() {
				return self.mode === 'select' && tool.inProgress && tool.mouseUpClicked;
			};
			tool.onMouseDown = function (e) {
				//self.log('select mouseDown')();
				tool.onDeactivate();
				tool.mouseUpClicked = false;
				self.resizer.show();
				self.resizer.setData(e.offsetY, e.offsetX, 0, 0);
				self.resizer.trackMouseMove(e, 'br');
			};
			tool.onMouseUp = function (e) {
				if (tool.mouseUpClicked) {
					return;
				}
				var params = self.resizer.params;
				if (!params.width || !params.height) {
					self.resizer.hide();
				} else {
					//self.log('select mouseUp')();
					tool.inProgress = true;
					tool.mouseUpClicked = true;
					var imageData = self.ctx.getImageData(params.left, params.top, params.width, params.height);
					tmpCanvasContext.canvas.width = params.width;
					tmpCanvasContext.canvas.height = params.height;
					tool.imgInfo = {width: params.width, height: params.height};
					tmpCanvasContext.putImageData(imageData, 0, 0);
					CssUtils.showElement(tool.domImg);
					tool.domImg.src = tmpCanvasContext.canvas.toDataURL();
					self.buffer.startAction();
					self.ctx.clearRect(params.left, params.top, params.width, params.height);
				}
			};
			tool.rotateInfo = function() {
				var c = tool.imgInfo.width;
				tool.imgInfo.width = tool.imgInfo.height;
				tool.imgInfo.height = c;
				self.resizer.params.rotate();
			};
			tool.getAreaData = function() {
				return {
					width: tool.imgInfo.width,
					height: tool.imgInfo.height,
					img: tool.domImg
				}
			};
		})(),
		pen: new (function () {
			var tool = this;
			tool.keyActivator = {
				code: 'KeyB',
				icon: 'icon-brush-1',
				title: 'Brush (B)'
			};
			tool.onChangeColor = function (e) {
				self.helper.setCursor(tool.getCursor());
			};
			tool.onChangeRadius = function (e) {
				self.helper.setCursor(tool.getCursor());
			};
			tool.onChangeOpacity = function (e) {
				self.helper.setCursor(tool.getCursor());
			};
			tool.getCursor = function () {
				return self.helper.buildCursor(self.ctx.strokeStyle, '', self.ctx.lineWidth);
			};
			tool.onActivate = function () {
				self.ctx.lineJoin = 'round';
				self.ctx.lineCap = 'round';
				self.ctx.globalCompositeOperation = "source-over";
			};
			tool.onMouseDown = function (e) {
				var coord = self.helper.getXY(e);
				self.ctx.moveTo(coord.x, coord.y);
				tool.points = [];
				self.tmp.saveState();
				tool.onMouseMove(e, coord)
			};
			tool.onMouseMove = function (e, coord) {
				// self.log("mouse move,  points {}", JSON.stringify(tool.points))();
				self.tmp.restoreState();
				tool.points.push(coord);
				self.ctx.beginPath();
				self.ctx.moveTo(tool.points[0].x, tool.points[0].y);
				for (var i = 0; i < tool.points.length; i++) {
					self.ctx.lineTo(tool.points[i].x, tool.points[i].y);
				}
				self.ctx.stroke();
			};
			tool.onMouseUp = function (e) {
				self.ctx.closePath();
				tool.points = [];
			};
	}),
		line: new (function () {
			var tool = this;
			tool.keyActivator = {
				code: 'KeyL',
				icon: 'icon-line',
				title: 'Line (L)'
			};
			tool.getCursor = function () {
				return 'crosshair';
			};
			tool.onChangeColor = function (e) { };
			tool.onChangeRadius = function (e) { };
			tool.onChangeOpacity = function (e) { };
			tool.onMouseDown = function (e) {
				self.tmp.saveState();
				tool.startCoord = self.helper.getXY(e);
				tool.onMouseMove(e, tool.startCoord);
			};
			tool.calcProportCoord = function(currCord) {
				var deg = Math.atan((tool.startCoord.x - currCord.x) / (currCord.y - tool.startCoord.y)) * 8 / Math.PI;
				if (Math.abs(deg) < 1) { // < 45/2
					currCord.x = tool.startCoord.x;
				} else if (Math.abs(deg) > 3) { // > 45 + 45/2
					currCord.y = tool.startCoord.y;
				} else {
					var base = (Math.abs(currCord.x - tool.startCoord.x) + Math.abs(currCord.y - tool.startCoord.y, 2)) / 2;
					currCord.x = tool.startCoord.x + base * (tool.startCoord.x < currCord.x ? 1 : -1);
					currCord.y = tool.startCoord.y + base * (tool.startCoord.y < currCord.y ? 1 : -1);
				}
			};
			tool.onMouseMove = function (e, currCord) {
				self.tmp.restoreState();
				self.ctx.beginPath();
				if (e.shiftKey) {
					tool.calcProportCoord(currCord);
				}
				self.ctx.moveTo(tool.startCoord.x, tool.startCoord.y);
				self.ctx.lineTo(currCord.x, currCord.y);
				self.ctx.stroke();
			};
			tool.onMouseUp = function (e) {
				self.ctx.closePath();
			};
		})(),
		fill: new (function (ctx) {
			var tool = this;
			tool.keyActivator = {
				code: 'KeyF',
				icon: 'icon-fill',
				title: 'Flood Fill (F)'
			};
			tool.bufferHandler = true;
			tool.buildCursor = function() {
				return 'url(data:image/svg+xml;base64,{}) {} {}, auto'.format(btoa(FLOOD_FILL_CURSOR.format(self.ctx.fillStyle)), 39, 86);
			}
			tool.getCursor = function() {
				return tool.buildCursor();
			};
			tool.onChangeColorFill = function(e) {
				self.helper.setCursor(tool.buildCursor());
			};
			tool.onChangeFillOpacity = function(e) {};
			tool.floodFill = (function() {
				function floodfill(data, x, y, fillcolor, tolerance, width, height) {
					var length = data.length;
					var Q = [];
					var i = (x + y * width) * 4;
					var e = i, w = i, me, mw, w2 = width * 4;
					var targetcolor = [data[i], data[i + 1], data[i + 2], data[i + 3]];
					if (!pixelCompare(i, targetcolor, fillcolor, data, length, tolerance)) {
						return false;
					}
					Q.push(i);
					while (Q.length) {
						i = Q.pop();
						if (pixelCompareAndSet(i, targetcolor, fillcolor, data, length, tolerance)) {
							e = i;
							w = i;
							mw = parseInt(i / w2) * w2; //left bound
							me = mw + w2;             //right bound
							while (mw < w && mw < (w -= 4) && pixelCompareAndSet(w, targetcolor, fillcolor, data, length, tolerance)); //go left until edge hit
							while (me > e && me > (e += 4) && pixelCompareAndSet(e, targetcolor, fillcolor, data, length, tolerance)); //go right until edge hit
							for (var j = w; j < e; j += 4) {
								if (j - w2 >= 0 && pixelCompare(j - w2, targetcolor, fillcolor, data, length, tolerance)) Q.push(j - w2); //queue y-1
								if (j + w2 < length && pixelCompare(j + w2, targetcolor, fillcolor, data, length, tolerance)) Q.push(j + w2); //queue y+1
							}
						}
					}
					return data;
				}

				function pixelCompare(i, targetcolor, fillcolor, data, length, tolerance) {
					if (i < 0 || i >= length) return false; //out of bounds
					if (data[i + 3] === 0 && fillcolor.a > 0) return true;  //surface is invisible and fill is visible

					if (
							Math.abs(targetcolor[3] - fillcolor.a) <= tolerance &&
							Math.abs(targetcolor[0] - fillcolor.r) <= tolerance &&
							Math.abs(targetcolor[1] - fillcolor.g) <= tolerance &&
							Math.abs(targetcolor[2] - fillcolor.b) <= tolerance
					) return false; //target is same as fill

					if (
							(targetcolor[3] === data[i + 3]) &&
							(targetcolor[0] === data[i]  ) &&
							(targetcolor[1] === data[i + 1]) &&
							(targetcolor[2] === data[i + 2])
					) return true; //target matches surface

					if (
							Math.abs(targetcolor[3] - data[i + 3]) <= (255 - tolerance) &&
							Math.abs(targetcolor[0] - data[i]) <= tolerance &&
							Math.abs(targetcolor[1] - data[i + 1]) <= tolerance &&
							Math.abs(targetcolor[2] - data[i + 2]) <= tolerance
					) return true; //target to surface within tolerance

					return false; //no match
				}

				function pixelCompareAndSet(i, targetcolor, fillcolor, data, length, tolerance) {
					if (pixelCompare(i, targetcolor, fillcolor, data, length, tolerance)) {
						//fill the color
						data[i] = fillcolor.r;
						data[i + 1] = fillcolor.g;
						data[i + 2] = fillcolor.b;
						data[i + 3] = fillcolor.a;
						return true;
					}
					return false;
				}
				return floodfill;
			})();
			tool.getRGBA = function () {
				var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(self.ctx.fillStyle);
				if (!result) {
					throw "Invalid color";
				}
				return {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
					a: (self.instruments.opacityFill.inputValue || 0) * 255
				}
			};
			tool.onMouseDown = function (e) {
				if (!((self.dom.canvas.width * self.dom.canvas.height) < 1000001)) {
					growlError("Can't fill image because amount of  data is too huge. Your browser would just explode ;(");
				} else {
					var xy = self.helper.getXY(e);
					var image = self.buffer.startAction();
					var processData = image.data.slice(0);
					tool.floodFill(processData, xy.x, xy.y, tool.getRGBA(), 0, image.width, image.height);
					var resultingImg = new ImageData(processData, image.width, image.height);
					self.ctx.putImageData(resultingImg, 0, 0);
					self.buffer.finishAction(resultingImg);
				}
			}
		})(),
		rect: new (function () {
			var tool = this;
			tool.keyActivator = {
				code: 'KeyQ',
				icon: 'icon-rect',
				title: 'Rectangle (Q)'
			};
			tool.getCursor = function () {
				return 'crosshair';
			};
			tool.onChangeRadius = function (e) { };
			tool.onChangeColor = function (e) { };
			tool.onChangeOpacity = function (e) { };
			tool.onChangeColorFill = function (e) { };
			tool.onChangeFillOpacity = function (e) { };
			tool.onMouseDown = function (e) {
				self.tmp.saveState();
				tool.startCoord = self.helper.getXY(e);
				tool.onMouseMove(e, tool.startCoord)
			};
			tool.calcProportCoord = function(currCord) {
				if (currCord.w < currCord.h) {
					currCord.h = currCord.w;
				} else {
					currCord.w = currCord.h;
				}
			};
			tool.onMouseMove = function (e, endCoord) {
				var dim = {
					w: endCoord.x - tool.startCoord.x,
					h: endCoord.y - tool.startCoord.y,
				};
				if (e.shiftKey) {
					tool.calcProportCoord(dim);
				}
				self.ctx.beginPath();
				self.tmp.restoreState();
				self.ctx.rect(tool.startCoord.x, tool.startCoord.y, dim.w, dim.h);
				self.ctx.globalAlpha = self.instruments.opacityFill.inputValue;
				self.ctx.fill();
				self.ctx.globalAlpha = self.instruments.opacity.inputValue;
				self.ctx.stroke();
			};
		})(),
		ellipse: new (function () {
			var tool = this;
			tool.keyActivator = {
				code: 'KeyE',
				icon: 'icon-ellipse',
				title: 'Eclipse (E)'
			};
			tool.getCursor = function () {
				return 'crosshair';
			};
			tool.onChangeColor = function (e) { };
			tool.onChangeColorFill = function (e) { };
			tool.onChangeRadius = function (e) { };
			tool.onChangeOpacity = function (e) { };
			tool.onChangeFillOpacity = function (e) { };
			tool.onMouseDown = function (e, data) {
				self.tmp.saveState();
				tool.startCoord = self.helper.getXY(e);
				tool.onMouseMove(e, tool.startCoord)
			};
			tool.calcProportCoord = function(currCord) {
				if (currCord.w < currCord.h) {
					currCord.h = currCord.w;
				} else {
					currCord.w = currCord.h;
				}
			};
			tool.draw = function (x, y, w, h) {
				var kappa = .5522848,
						ox = (w / 2) * kappa, // control point offset horizontal
						oy = (h / 2) * kappa, // control point offset vertical
						xe = x + w,           // x-end
						ye = y + h,           // y-end
						xm = x + w / 2,       // x-middle
						ym = y + h / 2;       // y-middle
				self.ctx.moveTo(x, ym);
				self.ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
				self.ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
				self.ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
				self.ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
			};
			tool.onMouseMove = function (e, endCoord) {
				var dim = {
					w: endCoord.x - tool.startCoord.x,
					h: endCoord.y - tool.startCoord.y
				};
				self.tmp.restoreState();
				self.ctx.beginPath();
				if (e.shiftKey) {
					tool.calcProportCoord(dim);
				}
				tool.draw(tool.startCoord.x, tool.startCoord.y, dim.w, dim.h);
				self.ctx.closePath();
				self.ctx.globalAlpha = self.instruments.opacityFill.inputValue;
				self.ctx.fill();
				self.ctx.globalAlpha = self.instruments.opacity.inputValue;
				self.ctx.stroke();
			};
		})(),
		text: new (function () {
			var tool = this;
			self.Appliable.call(this);
			tool.keyActivator = {
				code: 'KeyT',
				icon: 'icon-text',
				title: 'Text (T)'
			};
			tool.span = $('paintTextSpan');
			//prevent self.events.contKeyPress
			tool.span.addEventListener('keypress', function (e) {
				if (e.keyCode !== 13 || e.shiftKey) {
					e.stopPropagation(); //proxy onapply
				}
			});
			tool.bufferHandler = true;
			tool.onChangeFont = function (e) {
				tool.span.style.fontFamily = e.target.value;
			};
			tool.onActivate = function () { // TODO this looks bad
				tool.disableApply();
				tool.onChangeFont({target: {value: self.ctx.fontFamily}});
				tool.onChangeRadius({target: {value: self.ctx.lineWidth}});
				tool.onChangeFillOpacity({target: {value: self.instruments.opacityFill.inputValue * 100}});
				tool.onChangeColorFill({target: {value: self.ctx.fillStyle}});
				tool.span.innerHTML = '';
			};
			tool.onDeactivate = function () {
				if (tool.lastCoord) {
						tool.onApply();
				}
				CssUtils.hideElement(tool.span);
			};
			tool.onApply = function () {
				self.buffer.startAction();
				self.ctx.font = "{}px {}".format(5 + self.ctx.lineWidth, self.ctx.fontFamily);
				self.ctx.globalAlpha = self.instruments.opacityFill.inputValue;
				var width = 5 + self.ctx.lineWidth; //todo lineheight causes so many issues
				var lineheight = parseInt(width * 1.25);
				var linediff = parseInt(width * 0.01);
				var lines = tool.span.textContent.split('\n');
				for (var i = 0; i < lines.length; i++) {
					self.ctx.fillText(lines[i], tool.lastCoord.x, width + i * lineheight + tool.lastCoord.y - linediff);
				}
				self.ctx.globalAlpha = self.instruments.opacity.inputValue;
				self.buffer.finishAction();
				self.setMode('pen');
			};
			tool.onZoomChange = function () {
				tool.span.style.fontSize = (self.zoom * (self.ctx.lineWidth + 5)) + 'px';
				tool.span.style.top = (tool.originOffest.y * self.zoom  / tool.originOffest.z) + 'px';
				tool.span.style.left = (tool.originOffest.x * self.zoom  / tool.originOffest.z) + 'px';
			};
			tool.getCursor = function () {
				return 'text';
			};
			tool.onChangeRadius = function (e) {
				tool.span.style.fontSize = (self.zoom * (5 + parseInt(e.target.value))) + 'px';
			};
			tool.onChangeFillOpacity = function (e) {
				tool.span.style.opacity = e.target.value / 100
			};
			tool.onChangeColorFill = function (e) {
				tool.span.style.color = e.target.value;
			};
			tool.onMouseDown = function (e) {
				CssUtils.showElement(tool.span);
				tool.originOffest = {
					x: e.offsetX,
					y: e.offsetY,
					z: self.zoom
				};
				tool.enableApply();
				tool.span.style.top = tool.originOffest.y +'px';
				tool.span.style.left = tool.originOffest.x +'px';
				tool.lastCoord = self.helper.getXY(e);
				setTimeout(function (e) {
					tool.span.focus()
				});
			};
		}),
		eraser: new (function () {
			var tool = this;
			tool.keyActivator = {
				code: 'KeyD',
				icon: 'icon-eraser',
				title: 'Eraser (D)'
			};
			tool.getCursor = function () {
				return self.helper.buildCursor('#aaaaaa', ' stroke="black" stroke-width="2"', self.ctx.lineWidth);
			};
			tool.onChangeRadius = function (e) {
				self.helper.setCursor(tool.getCursor());
			};
			tool.onActivate = function () {
				tool.tmpAlpha = self.ctx.globalAlpha;
				self.ctx.globalAlpha = 1;
				self.ctx.globalCompositeOperation = "destination-out";
			};
			tool.onDeactivate = function () {
				self.ctx.globalAlpha = tool.tmpAlpha;
			};
			tool.onMouseDown = function (e) {
				var coord = self.helper.getXY(e);
				self.ctx.moveTo(coord.x, coord.y);
				self.ctx.beginPath();
				tool.onMouseMove(e, coord)
			};
			tool.onMouseMove = function (e, coord) {
				self.ctx.lineTo(coord.x, coord.y);
				self.ctx.stroke();
			};
			tool.onMouseUp = function () {
				self.ctx.closePath();
			};
		})(),
		img: new (function () {
			var tool = this;
			tool.keyActivator = {
				icon: 'icon-picture hidden',
				title: 'Pasting image'
			};
			tool.img = $('paintPastedImg');
			tool.bufferHandler = true;
			tool.imgObj = null;
			tool.readAndPasteCanvas = function (file) {
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function (event) {
					tool.imgObj = new Image();
					var b64 = event.target.result;
					tool.imgObj.onload = function () {
						tool.img.src = b64;
						self.resizer.setData(
								self.dom.canvasWrapper.scrollTop,
								self.dom.canvasWrapper.scrollLeft,
								tool.imgObj.width,
								tool.imgObj.height
						);
					};
					tool.imgObj.src = b64;
				};
			};
			tool.getCursor = function () {
				return null;
			};
			tool.onApply = function (event) {
				var data = self.buffer.startAction();
				var params = self.resizer.params;
				var nw = params.left + params.width;
				var nh = params.top + params.height;
				if (nw > self.dom.canvas.width || nh > self.dom.canvas.height) {
					self.helper.setDimensions(
							Math.max(nw, self.dom.canvas.width),
							Math.max(nh, self.dom.canvas.height)
					);
					self.ctx.putImageData(data, 0, 0);
				}
				self.helper.drawImage(tool.imgObj,
						0, 0, tool.imgObj.width, tool.imgObj.height,
						params.left, params.top, params.width, params.height);
				self.buffer.finishAction();
				self.setMode('pen');
			};
			tool.onZoomChange = self.resizer.onZoomChange;
			tool.onActivate = function(e) {
				self.resizer.show();
				CssUtils.showElement(tool.img);
			};
			tool.onDeactivate = function() {
				tool.onApply();
				self.resizer.hide();
				CssUtils.hideElement(tool.img);
			};
		}),
		crop: new (function () {
			var tool = this;
			self.Appliable.call(this);
			tool.keyActivator = {
				code: 'KeyC',
				icon: 'icon-crop',
				title: 'Crop Image (C)'
			};
			tool.bufferHandler = true;
			tool.getCursor = function () {
				return 'crosshair';
			};
			tool.onApply = function () {
				var params = self.resizer.params;
				if (!params.width || !params.height) {
					growlError("Can't crop to {}x{}".format(params.width, params.height));
				} else {
					self.buffer.startAction();
					var img = self.ctx.getImageData(params.left, params.top, params.width, params.height);
					self.helper.setDimensions(params.width, params.height);
					self.ctx.putImageData(img, 0, 0);
					self.buffer.finishAction(img);
					self.setMode('pen');
				}
			};
			tool.onActivate = function() {
				tool.disableApply();
			};
			tool.onZoomChange = self.resizer.onZoomChange;
			tool.onDeactivate = function() {
				self.resizer.hide();
				tool.enableApply();
			};
			tool.onMouseDown = function (e) {
				self.resizer.show();
				tool.disableApply();
				self.resizer.setData(e.offsetY, e.offsetX, 0, 0);
				self.resizer.trackMouseMove(e, 'br');
			};
			tool.onMouseUp = function (e) {
				var params = self.resizer.params;
				if (!params.width || !params.height) {
					self.resizer.hide();
				} else {
					tool.onApply();
				}

			};
		})(),
		resize: new (function () {
			var tool = this;
			tool.keyActivator = {
				code: 'KeyW',
				icon: 'icon-resize',
				title: 'Change dimensions (W)'
			};
			tool.container = $('paintResizeTools');
			tool.width = tool.container.querySelector('[placeholder=width]');
			tool.height = tool.container.querySelector('[placeholder=height]');
			tool.lessThan4 = function(e) {
				if (this.value.length > 4) {
					this.value = this.value.slice(0, 4);
				}
			};
			tool.onlyNumber = function(e) {
				var charCode = e.which || e.keyCode;
				return  charCode > 47 && charCode < 58;
			};
			tool.width.onkeypress = tool.onlyNumber;
			tool.width.oninput = tool.lessThan4;
			tool.height.oninput = tool.lessThan4;
			tool.height.onkeypress = tool.onlyNumber;
			tool.onApply = function() {
				var data = self.buffer.startAction();
				self.helper.setDimensions(tool.width.value, tool.height.value);
				self.ctx.putImageData(data, 0, 0);
				self.buffer.finishAction();
				self.setMode('pen')
			};
			tool.getCursor = function() {
				return null;
			};
			tool.onActivate = function() {
				CssUtils.showElement(tool.container);
				tool.width.value = self.dom.canvas.width;
				tool.height.value = self.dom.canvas.height;
			};
			tool.onDeactivate = function() {
				CssUtils.hideElement(tool.container);
			};
		}),
		move: new (function () {
			var tool = this;
			tool.keyActivator = {
				code: 'KeyM',
				icon: 'icon-move',
				title: 'Move (M)'
			};
			tool.getCursor = function () {
				return 'move';
			};
			tool.onMouseDown = function (e) {
				var pxy = self.helper.getPageXY(e);
				tool.lastCoord = {x: pxy.pageX, y: pxy.pageY};
			};
			tool.onMouseMove = function (e) {
				var pxy = self.helper.getPageXY(e);
				var x = tool.lastCoord.x - pxy.pageX;
				var y = tool.lastCoord.y - pxy.pageY;
				self.log("Moving to: {{}, {}}", x, y)();
				self.dom.canvasWrapper.scrollTop += y;
				self.dom.canvasWrapper.scrollLeft += x;
				tool.lastCoord = {x: pxy.pageX, y: pxy.pageY};
				// self.log('X,Y: {{}, {}}', self.dom.canvasWrapper.scrollLeft, self.dom.canvasWrapper.scrollTop )();
			};
			tool.onMouseUp = function (coord) {
				tool.lastCoord = null;
			};
		})
	};
	self.actions = [
		{
			keyActivator: {
				code: 'KeyR',
				icon: 'icon-rotate',
				title: 'Rotate (R)'
			},
			handler: function () {
				if (self.tools['select'].isSelectionActive()) {
					var m = self.tools.select;
					var d = m.getAreaData();
					self.log("{}x{}", d.width, d.height)();
					tmpCanvasContext.canvas.width = d.height; //specify width of your canvas
					tmpCanvasContext.canvas.height = d.width; //specify height of your canvas
					var ctx = tmpCanvasContext;
					ctx.save();
					ctx.translate(d.height / 2, d.width / 2);
					ctx.rotate(Math.PI / 2);
					ctx.drawImage(d.img, -d.width / 2, -d.height / 2); //draw it
					ctx.restore();
					d.img.src = tmpCanvasContext.canvas.toDataURL();
					m.rotateInfo();
				} else {
					self.buffer.startAction();
					var tmpData = self.dom.canvas.toDataURL();
					var w = self.dom.canvas.width;
					var h = self.dom.canvas.height;
					self.helper.setDimensions(h, w);
					self.ctx.save();
					self.ctx.translate(h / 2, w / 2);
					self.ctx.rotate(Math.PI / 2);
					var img = new Image();
					img.onload = function (e) {
						self.helper.drawImage(img, -w / 2, -h / 2);
						self.ctx.restore();
						self.buffer.finishAction();
					};
					img.src = tmpData;
				}
			}
		}, {
			keyActivator: {
				code: 'KeyZ',
				ctrlKey: true,
				icon: 'icon-undo',
				title: 'Undo (Ctrl+Z)'
			},
			handler: function () {
				self.buffer.undo();
			}
		}, {
			keyActivator: {
				code: 'KeyY',
				ctrlKey: true,
				icon: 'icon-redo',
				title: 'Redo (Ctrl+Y)'
			},
			handler: function () {
				self.buffer.redo();
			}
		}, {
			keyActivator: {
				code: '+',
				icon: 'icon-zoom-in',
				title: 'Zoom In (Ctrl+)/(Mouse Wheel)'
			},
			handler: function () {
				self.helper.setZoom(true);
			}
		}, {
			keyActivator: {
				code: '-',
				icon: 'icon-zoom-out',
				title: 'Zoom Out (Ctrl-)/(Mouse Wheel)'
			},
			handler: function () {
				self.helper.setZoom(false);
			}
		}, {
			keyActivator: {
				code: 'Delete',
				icon: 'icon-trash-circled',
				title: 'Delete (Del)'
			},
			handler: function () {
				if (self.tools['select'].isSelectionActive()) {
					self.tools['select'].inProgress = false; // don't restore image
					self.buffer.finishAction();
					self.tools['select'].onDeactivate();
				} else {
					self.buffer.startAction();
					self.ctx.clearRect(0, 0, self.dom.canvas.width, self.dom.canvas.height);
					self.buffer.finishAction();
				}
			}
		}
	];
	self.buffer = new (function () {
		var tool = this;
		var undoImages = [];
		var redoImages = [];
		var paintUndo = $('paintUndo');
		var paintRedo = $('paintRedo');
		var buStateData = ['lineWidth', 'strokeStyle', 'globalAlpha', 'lineJoin', 'lineCap', 'globalCompositeOperation'];
		var current = null;
		tool.getCanvasImage = function (img) {
			return {
				width: self.dom.canvas.width,
				height: self.dom.canvas.height,
				data: img || self.ctx.getImageData(0, 0, self.dom.canvas.width, self.dom.canvas.height)
			}
		};
		tool.clear = function () {
			undoImages = [];
			redoImages = [];
			current = null;
		};
		tool.getUndo = function() {
			return undoImages;
		};
		tool.getRedo = function() {
			return redoImages;
		};
		tool.dodo = function(from, to) {
			var restore = from.pop();
			if (restore) {
				to.push(current);
				current = restore;
				if (self.dom.canvas.width != current.width
						|| self.dom.canvas.height != current.height) {
					self.log("Resizing canvas from {}x{} to {}x{}",
							self.dom.canvas.width, self.dom.canvas.height,
							current.width, current.height
					)();
					self.helper.setDimensions(current.width, current.height)
				}
				self.ctx.putImageData(restore.data, 0, 0);
				tool.setIconsState();
			}
		};
		tool.setIconsState = function() {
			//CssUtils.setClassToState(paintUndo, undoImages.length, 'disabled'); TODO
			//CssUtils.setClassToState(paintRedo, redoImages.length, 'disabled');
		};
		tool.redo = function () {
			tool.dodo(redoImages, undoImages);
		};
		tool.undo = function () {
			tool.dodo(undoImages, redoImages);
		};
		tool.finishAction = function (img) {
			self.log('finish action')();
			if (current) {
				undoImages.push(current);
			}
			redoImages = [];
			tool.setIconsState();
			current = tool.getCanvasImage(img);
			self.helper.applyZoom();
		};
		tool.getState = function() {
			var d = {};
			buStateData.forEach(function (e) {
				d[e] = self.ctx[e];
			});
			return d;
		};
		tool.restoreState = function (state) {
			buStateData.forEach(function (e) {
				self.ctx[e] = state[e];
			});
		};
		tool.setCurrent = function(newCurrent) {
			current = newCurrent;
		};
		tool.startAction = function () {
			self.log('start action')();
			if (!current) {
				current = tool.getCanvasImage();
			}
			return current.data;
		};
	})();
	self.setMode = function (mode) {
		var oldMode = self.tools[self.mode];
		self.mode = mode;
		if (oldMode) {
			oldMode.onDeactivate && oldMode.onDeactivate();
			CssUtils.removeClass(oldMode.icon, self.PICKED_TOOL_CLASS);
		}
		var newMode = self.tools[self.mode];
		newMode.onActivate && newMode.onActivate();
		newMode.getCursor && self.helper.setCursor(newMode.getCursor());
		newMode.icon && CssUtils.addClass(newMode.icon, self.PICKED_TOOL_CLASS);
		Object.keys(self.instruments).forEach(function (k) {
			var instr = self.instruments[k];
			if (oldMode && oldMode[instr.handler]) {
				CssUtils.hideElement(instr.holder);
			}
			if (newMode[instr.handler]) {
				CssUtils.showElement(instr.holder);
			}
		});
	};
	self.show = function () {
		self.super.show();
		document.body.addEventListener('mouseup', self.events.onmouseup, false);
		document.body.addEventListener('touchend', self.events.onmouseup, false);
	};
	self.superHide = self.hide;
	self.hide = function () {
		self.superHide();
		document.body.removeEventListener('mouseup', self.events.onmouseup, false);
		document.body.removeEventListener('touchend', self.events.onmouseup, false);
	};
	Object.keys(self.init).forEach(function (k) {
		self.init[k]()
	});
}


function NotifierHandler() {
	var self = this;
	var logger = {
		info: loggerFactory.getLogger("NOTIFY", console.log, 'color: #ffb500; font-weight: bold'),
		warn: loggerFactory.getLogger("NOTIFY", console.warn, 'color: #ffb500; font-weight: bold'),
		error: loggerFactory.getLogger("NOTIFY", console.error, 'color: #ffb500; font-weight: bold')
	};
	self.currentTabId = Date.now().toString();
	/*This is required to know if this tab is the only one and don't spam with same notification for each tab*/
	self.LAST_TAB_ID_VARNAME = 'lastTabId';
	self.serviceWorkedTried = false;

	self.replaceIfMultiple = function(data) {
		var count = 1;
		var newMessData = data.options.data;
		if (newMessData && newMessData.replaced) {
			for (var i = 0; i < self.popedNotifQueue.length; i++) {
				if (self.popedNotifQueue[i].data.title == newMessData.title) {
					count += self.popedNotifQueue[i].data.replaced;
					self.popedNotifQueue[i].close();
				}
			}
			if (count > 1) {
				newMessData.replaced = count;
				data.title = newMessData.title + "(+" + count + ")";
			}
		}
	}

// Permissions are granted here!
	self.showNot = function(title, options) {
		try {
			if (self.serviceWorkerRegistration && isMobile && isChrome) {
				// TODO  options should contain page id here but it's not
				// so we open unfefined url
				self.serviceWorkerRegistration.showNotification(title, options).then(function(r) {
					logger.info("res {}", r)();
					//TODO https://stackoverflow.com/questions/39717947/service-worker-notification-promise-broken#comment83407282_39717947
				})
			} else {
				var data = {title: title, options: options}
				self.replaceIfMultiple(data);
				var not = new Notification(data.title, data.options)
				self.popedNotifQueue.push(not);
				not.onclick = self.notificationClick;
				not.onclose = function () {
					self.popedNotifQueue.splice(self.popedNotifQueue.indexOf(this), 1);
				};
				logger.info("Notification {} {} has been spawned, current queue {}", title, options, self.popedNotifQueue)();
			}
		} catch (e) {
			logger.error("Failed to show notification {}", e)();
		}
	};
	self.checkPermissions = function (cb) {
		if (Notification.permission !== "granted") {
			Notification.requestPermission(function (result) {
				if (result === 'granted') {
					cb(true);
				} else {
					logger.warn("User blocked notification permission. Notifications won't be available")();
				}
			});
		} else {
			cb(false);
		}
	};

	self.getSubscriptionId = function (pushSubscription) {
		var mergedEndpoint = pushSubscription.endpoint;
		if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0) {
			// Make sure we only mess with GCM
			// Chrome 42 + 43 will not have the subscriptionId attached
			// to the endpoint.
			if (pushSubscription.subscriptionId &&
					pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
				// Handle version 42 where you have separate subId and Endpoint
				mergedEndpoint = pushSubscription.endpoint + '/' +
						pushSubscription.subscriptionId;
			}
		}
		var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';
		if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
			return null;
		} else {
			return mergedEndpoint.split('/').pop();
		}
	}

	self.registerWorker = function (cb) {
		if (!window.Promise || !navigator.serviceWorker) {
			return cb(false, "Service worker is not supported", true)
		} else if (!window.manifest) {
			return cb(false, "FIREBASE_API_KEY is missing in settings.py or file chat/static/manifest.json is missing", false)
		}
		navigator.serviceWorker.register('/sw.js',  {scope: '/'}).then(function (r) {
			logger.info("Registered service worker {}", r)();
			return navigator.serviceWorker.ready;
		}).then(function (serviceWorkerRegistration) {
			logger.info("Service worker is ready {}", serviceWorkerRegistration)();
			self.serviceWorkerRegistration = serviceWorkerRegistration;
			return serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
		}).then(function (subscription) {
			logger.info("Got subscription {}", subscription)();
			self.subscriptionId = self.getSubscriptionId(subscription);
			if (!self.subscriptionId) {
				throw 'Current browser doesnt support offline notifications';
			} else {
				return new Promise(function (resolve, reject) {
					doPost('/register_fcb', {
						registration_id: self.subscriptionId,
						agent: browserVersion,
						is_mobile: isMobile
					}, function (response) {
						if (response == RESPONSE_SUCCESS) {
							resolve()
						} else {
							reject();
						}
					})
				});
			}
		}).then(function () {
			logger.info("Saved subscription to server")();
			cb(true);
		}).catch(function (e) {
			cb(false, e, true);
		});
	}
	self.popedNotifQueue = [];
	self.init = function () {
		window.addEventListener("blur", self.onFocusOut);
		window.addEventListener("focus", self.onFocus);
		window.addEventListener("beforeunload", self.onUnload);
		window.addEventListener("unload", self.onUnload);
		self.onFocus();
		if (!window.Notification) {
			logger.warn("Notifications are not supported")();
		} else {
			self.tryAgainRegisterServiceWorker();
		}
	};
	self.tryAgainRegisterServiceWorker = function () {
		self.checkPermissions(function (result) {
			if (!self.serviceWorkedTried) {
				self.serviceWorkedTried = true;
				self.registerWorker(function (succ, error, growl) {
					if (growl){
						growlError("Offline notifications won't work, because " + Utils.extractError(error));
					}
					if (!succ) {
						 logger.error("Unable to load serviceWorker to show notification because {}", error)();
					}
					if (result) {
						self.showNot('Pychat notifications enabled', {
							body:  "You can disable them in room's settings",
						});
					}
				});
			}
		}, true);
	}
	self.notificationClick = function () {
		window.focus();
		if (this.data && this.data.roomId) {
			channelsHandler.setActiveChannel(this.data.roomId);
		}
		this.close()
	};
	self.notify = function (title, options) {
		if (self.isCurrentTabActive) {
			return;
		}
		self.newMessagesCount++;
		document.title = self.newMessagesCount + " new messages";
		if (navigator.vibrate) {
			navigator.vibrate(200);
		}
		// last opened tab not this one, leave the oppotunity to show notification from last tab
		if (!window.Notification
				|| !self.isTabMain()) {
			return
		}
		self.checkPermissions(function (withGranted) {
			self.showNot(title, options);
		});
	};
	self.isTabMain = function () {
		var activeTab = localStorage.getItem(self.LAST_TAB_ID_VARNAME);
		if (activeTab == "0") {
			localStorage.setItem(self.LAST_TAB_ID_VARNAME, self.currentTabId);
			activeTab = self.currentTabId;
		}
		return activeTab == self.currentTabId;
	};
	self.onUnload = function () {
		if (self.unloaded) {
			return
		}
		if (self.isTabMain) {
			localStorage.setItem(self.LAST_TAB_ID_VARNAME, "0");
		}
		self.unloaded = true;
	};
	self.onFocus = function (e) {
		localStorage.setItem(self.LAST_TAB_ID_VARNAME, self.currentTabId);
		logger.info("Marking current tab as active")();
		wsHandler.onTimeout();
		self.isCurrentTabActive = true;
		self.newMessagesCount = 0;
		document.title = 'PyChat';
		self.popedNotifQueue.forEach(function(n) {
			n.close()
		})
	};
	self.onFocusOut = function () {
		self.isCurrentTabActive = false;
		logger.info("Deactivating current tab")();
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
			logger.warn('Params are not set for {}', self.getUrl())();
		}
	};
	self.render = function () {
		doGet(self.getUrl(), self.onLoad);
	};
	self.onLoad = function (html) {
		var tmpWrapper = document.createElement('div');
		tmpWrapper.innerHTML = html;
		var holder = tmpWrapper.firstChild;
		self.dom.el.push(holder);
		self.dom.container.appendChild(holder);
		self.fixTitle();
	};
	self.foreach = function (apply) {
		for (var i = 0; i < self.dom.el.length; i++) {
			apply(self.dom.el[i]);
		}
	};
	self.setTitle = function (newTitle) {
		self.title = newTitle;
	};
	self.getDefaultTitle = function () {
		return "<b>{}</b>".format(loggedUser);
	};
	self.fixTitle = function () {
		var newTittle = self.getTitle();
		if (newTittle != null) {
			headerText.innerHTML = newTittle;
		} else {
			headerText.innerHTML = self.getDefaultTitle();
		}
	};
	self.show = function () {
		self.rendered = true;
		self.fixTitle();
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
	self.title = self.getDefaultTitle();
	self.toString = function () {
		return self.name;
	};
}

function IssuePage() {
	var self = this;
	Page.call(self);
	self.pageName = 'issue';
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
		doPost('/report_issue', {}, function (response) {
			if (response === RESPONSE_SUCCESS) {
				growlSuccess("Your issue has been successfully submitted");
				singlePage.showDefaultPage();
			} else {
				growlError(response);
			}
		}, new FormData(self.dom.issueForm));
	};
}

function ViewProfilePage() {
	var self = this;
	Page.call(self);
	self.pageName = 'viewprofile';
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
	self.pageName = 'changeProfile';
	self.title = "<b>{}</b> (your) profile".format(loggedUser);
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
	self.pageName = 'amcharts';
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
				doGet(STATISTICS_JS_URL, self.show);
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
	self.updateTitle = function () {
		self.currentPage.fixTitle();
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
		logger.info('Rendering page "{}"', page)();
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
	self.MAX_MESSAGE_SIZE = 40000000;
	var logger = {
		warn: loggerFactory.getLogger("CHAT", console.warn, 'color: #FF0F00; font-weight: bold'),
		info: loggerFactory.getLogger("CHAT", console.log, 'color: #FF0F00; font-weight: bold'),
		error: loggerFactory.getLogger("CHAT", console.error, 'color: #FF0F00; font-weight: bold')
	};
	self.pageName = 'channels';
	Page.call(self);
	self.url = '/chat/';
	self.render = self.show;
	self.ROOM_ID_ATTR = 'roomid';
	self.activeChannel = DEFAULT_CHANNEL_NAME;
	self.HIGHLIGHT_MESSAGE_CLASS = 'highLightMessage';
	self.channels = {};
	self.dom = (function () {
		var childDom = {
			wrapper: $('wrapper'),
			searchIcon : $('navSearchIcon'),
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
			directUserTable: directUserTable,
			imgInput: $('imgInput'),
			imgInputIcon: $('imgInputIcon'),
			usersStateText: $('usersStateText'),
			inviteUser: $('inviteUser'),
			navCallIcon: $('navCallIcon'),
			webRtcFileIcon: webRtcFileIcon,
			m2Message: $('m2Message'),
		};
		childDom.minifier = {
			channel: {
				icon: $('channelsMinifier'),
				body: childDom.rooms
			},
			direct: {
				icon: $('directMinifier'),
				body: childDom.directUserTable
			},
			user: {
				icon: $('usersMinifier'),
				body: childDom.chatUsersTable
			}
		};
		for (var attrname in self.dom) {
			if (self.dom.hasOwnProperty(attrname)) {
				childDom[attrname] = self.dom[attrname];
			}
		}
		return childDom;
	})();
	self.initCha = function() {
		self.dom.navCallIcon.onclick = function() {
			self.getActiveChannel().toggleCallHandler();
		};
		window.addEventListener("keydown", function (e) {
			if (e.shiftKey && e.ctrlKey && e.keyCode === 70) {
				if (!CssUtils.isHidden(self.dom.wrapper)) {
					self.getActiveChannel().search.toggle();
				}
			}
		});
		self.dom.searchIcon.onclick = function() {
			self.getActiveChannel().search.toggle();
		};
		self.dom.addUserInput.onkeyup = self.filterAddUser;
		self.dom.addUserList.onclick = self.addUserHolderClick;
		document.body.ondrop = self.imageDrop;
		document.body.ondragover = self.preventDefault;
	};
	self.getActiveChannel = function () {
		return self.channels[self.activeChannel];
	};
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
		storage.clearStorage();
		for (var i in self.channels) {
			if (!self.channels.hasOwnProperty(i)) continue;
			self.channels[i].clearHistory();
		}
		logger.info('History has been cleared')();
		growlSuccess('History has been cleared');
	};
	self.setParams = function (params) {
		self.activeChannel = self.parseActiveChannelFromParams(params);
	};
	self.rightRoomClick = function(event) {
		event.preventDefault();
		self.roomClick(event, true);
	}
	self.roomClick = function (event, isRight) {
		var target = event.target;
		var tagName = target.tagName;
		if (tagName == 'UL') {
			return;
		}
		// liEl = closest parent with LI
		var liEl = tagName == 'I' || tagName == 'SPAN' ? target.parentNode : target;
		var roomId = parseInt(liEl.getAttribute(self.ROOM_ID_ATTR));
		if (CssUtils.hasClass(target, SETTINGS_ICON_CLASS_NAME) || isRight) {
			self.channelSettings.show(roomId);
		} else {
			self.setActiveChannel(roomId);
		}
	};
	self.setActiveChannel = function (key) {
		self.removeEditingMode();
		self.hideActiveChannel();
		self.activeChannel = key;
		self.showActiveChannel();
		singlePage.pushHistory();
	};
	self.showActiveChannel = function () {
		var chatHandler = self.getActiveChannel();
		if (chatHandler == null) {
			//singlePage.showDefaultPage();
		} else {
			chatHandler.show();
			if (chatHandler.isPrivate()) {
				CssUtils.hideElement(self.dom.inviteUser);
			} else {
				CssUtils.showElement(self.dom.inviteUser);
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
	self.handleFileSelect = function (evt) {
		var files = evt.target.files;
		for (var i = 0; i < evt.target.files.length; i++) {
			Utils.pasteImgToTextArea(files[i]);
		}
		self.dom.imgInput.value = "";
	};
	self.preventDefault = function (e) {
		e.preventDefault();
	};
		self.imageDrop = function (evt) {
		self.preventDefault(evt);
		if (singlePage.currentPage.pageName === 'channels' && evt.dataTransfer.files) {
			for (var i = 0; i < evt.dataTransfer.files.length; i++) {
				var file = evt.dataTransfer.files[i];
				if (file.type.indexOf("image") >= 0) {
					Utils.pasteImgToTextArea(file);
				} else {
					webRtcApi.offerFile(file, self.activeChannel);
				}
			}
		}
	};
	self.imagePaste = function (e) {
		if (e.clipboardData) {
			var items = e.clipboardData.items;
			if (items && items.length > 0) {
				var prevent = false;
				for (var i = 0; i < items.length; i++) {
					var asFile = items[i].getAsFile();
					if (asFile) {
						logger.info("Pasting image")();
						prevent = true;
						Utils.pasteImgToTextArea(asFile);
					}
				}
				if (prevent) {
					self.preventDefault(e);
				}
			}
		}
	};
	self.showM2EditMenu = function (event, el, messageId, time) {
		event.preventDefault();
		event.stopPropagation();
		self.removeEditingMode();
		CssUtils.showElement(self.dom.m2Message);
		CssUtils.addClass(el, channelsHandler.HIGHLIGHT_MESSAGE_CLASS);
		self.dom.m2Message.style.top = event.pageY - 20 + 'px';
		self.dom.m2Message.style.left = event.pageX - 5 + 'px';
		document.addEventListener('click', self.hideM2EditMessage);
		self.editLastMessageNode = {
			dom: el,
			id: messageId,
			notReady: true,
			time: time
		}
	};
	self.showM2ContextDelete = function (event) {
		var el = event.target;
		while (el != self.dom.chatBoxDiv) {
			if (el.tagName == 'P') {
				var strMessageId = el.getAttribute(MESSAGE_ID_ATTRIBUTE);
				if (strMessageId) {
					var messageId = parseInt(strMessageId);
					var time = parseInt(el.id);
					var selector = "[{}='{}']:not(.{}) .{}".format(
							MESSAGE_ID_ATTRIBUTE,
							strMessageId,
							REMOVED_MESSAGE_CLASSNAME,
							SELF_HEADER_CLASS
					);
					var p = document.querySelector(selector);
					if (p && self.isMessageEditable(time)) {
						self.showM2EditMenu(event, el, messageId, time);
					}
				}
			} else if (el.tagName == 'IMG') { // show default menu on images
				break;
			}
			el = el.parentNode;
		}
	};
	self.hideM2EditMessage = function () {
		self.removeEditingMode();
		document.removeEventListener('click', self.hideM2EditMessage);
		CssUtils.hideElement(self.dom.m2Message);
	};
	self.m2EditMessage = function () {
		self.editLastMessageNode.notReady = false;
		self.continueEdit($(self.editLastMessageNode.time));
		event.stopPropagation();
		CssUtils.hideElement(self.dom.m2Message);
		document.removeEventListener('click', self.hideM2EditMessage);
	};
	self.continueEdit = function(p) {
		userMessage.innerHTML = Utils.encodeP(p);
		Utils.placeCaretAtEnd();
	};
	self.m2DeleteMessage = function () {
		wsHandler.sendToServer({
			id: self.editLastMessageNode.id,
			action: 'editMessage',
			content: null
		});
		// eventPropagande will execute onclick on document.body that will hide contextMenu
	};
	self.handleEditMessage = function (event) {
		// if (blankRegex.test(userMessage.textContent)) {
		// 	return;
		// }
		var editLastMessageNode = self.getActiveChannel().lastMessage;
		// only if message was sent 10 min ago + 2seconds for message to being processed
		if (editLastMessageNode && self.isMessageEditable(editLastMessageNode.time)) {
			self.editLastMessageNode = editLastMessageNode;
			self.editLastMessageNode.dom = $(editLastMessageNode.time);
			if (!self.editLastMessageNode.dom) { //if history has been cleared
				return
			}
			CssUtils.addClass(self.editLastMessageNode.dom, self.HIGHLIGHT_MESSAGE_CLASS);
			self.continueEdit(self.editLastMessageNode.dom);
			event.preventDefault();
		}
	};
	self.isMessageEditable = function (time) {
		return true;/* time + 595000 > Date.now()*/;
	};
	self.nextChar = function (c) {
		return String.fromCharCode(c.charCodeAt(0) + 1)
	};
	self.getPastedImage = function (currSymbol) {
		var res = []; // return array from nodeList
		var images = userMessage.querySelectorAll('.' + PASTED_IMG_CLASS);
		for (var i = 0; i < images.length; i++) {
			var img = images[i];
			var elSymbol = img.getAttribute('symbol');
			if (!elSymbol) {
				currSymbol = self.nextChar(currSymbol);
				elSymbol = currSymbol;
			}
			var textNode = document.createTextNode(elSymbol);
			img.parentNode.replaceChild(textNode, img);
			if (!img.getAttribute('symbol')) { // don't send image again, it's already in server
				var assVideo = img.getAttribute('associatedVideo');
				if (assVideo) {
					res.push({
						file: Utils.videoFiles[assVideo],
						type: 'v',
						symbol:  elSymbol
					});
					res.push({
						file: Utils.previewFiles[img.src],
						type: 'p',
						symbol:  elSymbol
					});
				} else {
					res.push({
						file: Utils.imagesFiles[img.src],
						type: 'i',
						symbol:  elSymbol
					});
				}
			}
		}
		var urls = [Utils.imagesFiles, Utils.videoFiles, Utils.previewFiles];
		urls.forEach(function(url) {
			for (var k in url) {
				logger.info("Revoking url {}", k)();
				URL.revokeObjectURL(k);
				delete urls[k];
			}
		});
		return res;
	};
	self.sendMessage = function(lastEditedNodeId, files, messageContent) {
		if (lastEditedNodeId) {
			wsHandler.sendToServer({
				id: lastEditedNodeId,
				action: 'editMessage',
				files: files,
				content: messageContent
			});
		} else if (messageContent) {
			wsHandler.sendToServer({
				files: files,
				action: 'sendMessage',
				content: messageContent,
				channel: self.activeChannel
			})
		}
	};
	self.handleSendMessage = function () {
		if (!wsHandler.isWsOpen()) {
			growlError("Can't send message, because server is not available atm");
		}
		var isEdit = self.editLastMessageNode && !self.editLastMessageNode.notReady;
		if (isEdit) {
			isEdit = self.editLastMessageNode.id;
		}
		var currSymbol = '\u3500'; // it's gonna increase in getPastedImage
		if (isEdit && self.editLastMessageNode.dom) {
			// dom can be null if we cleared the history
			// in this case symbol will be parsed in be
			var newSymbol = self.editLastMessageNode.dom.getAttribute('symbol');
			if (newSymbol) {
				currSymbol = newSymbol;
			}
		}
		var files = self.getPastedImage(currSymbol);
		smileyUtil.purgeImagesFromSmileys();
		var messageContent = typeof userMessage.innerText != 'undefined' ? userMessage.innerText : userMessage.textContent;
		messageContent = blankRegex.test(messageContent) ? null : messageContent;
		self.removeEditingMode();
		CssUtils.deleteChildren(userMessage);
		if (files.length) {
			var fd = new FormData();
			files.forEach(function(sd) {
				fd.append(sd.type + sd.symbol, sd.file);
			});
			var gr;
			doPost('/upload_file', null, function (res) {
				if (gr) {
					gr.hide();
				}
				var d;
				try {
					d = JSON.parse(res);
				} catch (e) {
					growlError("Unable to upload videos, failed to parse response from server");
					return;
				}
				self.sendMessage(isEdit, d, messageContent)
			}, fd, null, function(r) {
				var db;
				var text;
				r.upload.addEventListener('progress', function (evt) {
					if (evt.lengthComputable) {
						if (!db) {
							var div = document.createElement("DIV");
							var holder = document.createElement("DIV");
							text = document.createElement("SPAN");
							holder.appendChild(text);
							holder.appendChild(div);
							text.innerText = "Uploading files...";
							db = new DownloadBar(div, evt.total);
							gr = new Growl(null, null, holder);
							gr.show();
						}
						db.setValue(evt.loaded);
						if (evt.loaded === evt.total) {
							text.innerText = "Server is processing files...";
						}
					}
				}, false);
			});
		} else {
			self.sendMessage(isEdit, [], messageContent);
		}
	};
	self.checkAndSendMessage = function (event) {
		if (event.keyCode === 13 && !event.shiftKey) { // 13 = enter
			event.preventDefault();
			self.handleSendMessage();
		} else if (event.keyCode === 27) { // 27 = escape
			smileyUtil.hideSmileys();
			self.removeEditingMode();
		} else if (event.keyCode === 38) { // up arrow
			self.handleEditMessage(event);
		}
	};
	self.removeEditingMode = function () {
		if (self.editLastMessageNode) {
			CssUtils.removeClass(self.editLastMessageNode.dom, self.HIGHLIGHT_MESSAGE_CLASS);
			self.editLastMessageNode = null;
			CssUtils.deleteChildren(userMessage);
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
		CssUtils.deleteChildren(self.dom.addUserList);
		self.addUserUsersList = {};
		var allUsers = self.getAllUsersInfo();
		for (var userId in allUsers) {
			if (!allUsers.hasOwnProperty(userId)) continue;
			if (excludeUsersId[userId]) continue;
			var li = document.createElement('LI');
			var username = allUsers[userId].user;
			self.addUserUsersList[username] = li;
			li.textContent = username;
			li.setAttribute(USER_ID_ATTR, userId);
			self.dom.addUserList.appendChild(li);
		}
		if (self.dom.addUserList.childNodes.length === 0) return true;
	};
	self.getDirectMessagesUserIds = function () {
		var res = {};
		for (var i = 0; i < directUserTable.children.length; i++) {
			var userId = directUserTable.children[i].getAttribute(USER_ID_ATTR);
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
	self.getOnlineUsersIds = function () {
		return self.channels[DEFAULT_CHANNEL_NAME].onlineUsers;
	};
	self.filterAddUser = function (event) {
		var filterValue = self.dom.addUserInput.value;
		if (event.keyCode === 13) {
			if (self.addUserUsersList[filterValue]) {
				self.addUserHolderClick({target: self.addUserUsersList[filterValue]});
				return;
			}
		}
		var v = new RegExp(filterValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),'i');
		for (var userName in self.addUserUsersList) {
			if (!self.addUserUsersList.hasOwnProperty(userName)) continue;
			if (v.exec(userName)) {
				CssUtils.showElement(self.addUserUsersList[userName]);
			} else {
				CssUtils.hideElement(self.addUserUsersList[userName]);
			}
		}
	};
	self.m2QuoteMessage = function (event) {
		var p = self.dom.activeUserContext.parentElement.parentElement;
		self.getActiveChannel().quoteMessage(p);
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
		if (event.keyCode === 13) { // enter
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
	self.createChannelChatHandler = function (roomId, li, users, roomName, private) {
		var i = document.createElement('span');
		i.className = SETTINGS_ICON_CLASS_NAME;
		li.appendChild(i);
		li.setAttribute(self.ROOM_ID_ATTR, roomId);
		var chatBoxDiv = document.createElement('div');
		userMessage.onpaste = self.imagePaste;
		self.channels[roomId] = new ChatHandler(li, chatBoxDiv, users, roomId, roomName, private);
		self.channels[roomId].dom.chatBoxDiv.oncontextmenu = self.showM2ContextDelete;
	};
	self.createNewUserChatHandler = function (roomId, users) {
		var allUsersIds = Object.keys(users);
		var anotherUserId = self.getAnotherUserId(allUsersIds);
		var roomName = users[anotherUserId].user;
		var li = Utils.createUserLi(anotherUserId, users[anotherUserId].sex, roomName);
		var oIds = self.getOnlineUsersIds() || [];
		CssUtils.setClassToState(li, oIds.indexOf(parseInt(anotherUserId)) >= 0, OFFLINE_CLASS);
		self.dom.directUserTable.appendChild(li);
		self.createChannelChatHandler(roomId, li, users, roomName, true);
		return anotherUserId;
	};
	self.createNewRoomChatHandler = function (roomId, roomName, users) {
		var li = document.createElement('li');
		self.dom.rooms.appendChild(li);
		li.innerHTML = roomName;
		self.createChannelChatHandler(roomId, li, users, roomName, false);
	};
	self.destroyChannel = function (channelKey) {
		logger.info("Destroying channel {} while offline", channelKey)();
		self.channels[channelKey].destroy();
		delete self.channels[channelKey];
	};
	self.setRooms = function (message) {
		var rooms = message.content;
		for (var channelKey in self.channels) {
			if (!self.channels.hasOwnProperty(channelKey)) continue;
			if (!rooms[channelKey]) {
				self.destroyChannel(channelKey);
			}
		}
		for (var roomId in rooms) {
			// if a new room has been added while disconnected
			if (!rooms.hasOwnProperty(roomId)) continue;
			var newRoom = rooms[roomId];
			var oldRoom = self.channels[roomId];
			var newUserList = newRoom.users;
			if (oldRoom) {
				oldRoom.updateAllDomUsers(newUserList);
			} else {
				var roomName = newRoom.name;
				logger.info("Creating new room '{}' with id {} while offline", roomName, roomId)();
				if (roomName) {
					self.createNewRoomChatHandler(roomId, roomName, newUserList);
				} else {
					self.createNewUserChatHandler(roomId, newUserList);
				}
			}
			self.channels[roomId].setRoomSettings(newRoom.volume, newRoom.notifications)
		}
		self.showActiveChannel();
	};
	self.handle = function (message) {
		if (message.handler === 'channels') {
			self[message.action](message);
		} else if (message.handler === 'chat') {
			var channelHandler = self.channels[message.channel];
			if (channelHandler) {
				channelHandler[message.action](message);
				self.executePostUserAction(message);
			} else if (message.action == 'removeOnlineUser') {
				logger.info("Skipping removing online user cause channel {} could have been destroyed", message.channel)();
			} else {
				throw 'Unknown channel {} for message "{}"'.format(message.channel, JSON.stringify(message));
			}
		}
	};
	self.executePostUserAction = function (message) {
		if (self.postUserAction) {
			if (self.postUserAction.time + 30000 > Date.now()) {
				if (self.postUserAction.actionTrigger == message.action
						&& self.postUserAction.userId == message.userId) {
					logger.info("Proceeding postUserAction {}", self.postUserAction)();
					self.postUserAction.action();
					self.postUserAction = null;
				}
			} else {
				self.postUserAction = null;
			}
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
		// dont assign, close the structure so changes in 1 room don't affect others
		channelUsers[users[1]] = Object.assign({}, anotherUserName[users[1]]);
		channelUsers[users[0]] = Object.assign({}, anotherUserName[users[0]]);
		var anotherUserId = self.createNewUserChatHandler(message.roomId, channelUsers);
		self.setActiveChannel(message.roomId);
		growlInfo('<span>Room for user <b>{}</b> has been created</span>'.format(anotherUserName[anotherUserId].user));
		self.channels[message.roomId].setRoomSettings(message.volume, message.notifications)
	};
	self.addRoom = function (message) {
		var users = message.users;
		var roomName = message.name;
		var channelUsers = {};
		channelUsers[users[0]] = self.getAllUsersInfo()[users[0]];
		self.createNewRoomChatHandler(message.roomId, roomName, channelUsers);
		growlInfo('<span>Room <b>{}</b> has been created</span>'.format(roomName));
		self.channels[message.roomId].setRoomSettings(message.volume, message.notifications)
	};
	self.viewProfile = function () {
		singlePage.showPage('/profile/', [self.getActiveUserId()]);
	};
	self.init = function () {
		self.dom.wrapper.addEventListener('contextmenu', self.showContextMenu, false);
		self.dom.rooms.onclick = self.roomClick;
		self.dom.directUserTable.onclick = self.roomClick;
		if (isMobile) {
			self.dom.rooms.oncontextmenu = self.rightRoomClick;
			self.dom.directUserTable.oncontextmenu = self.rightRoomClick;
		}
		self.dom.imgInput.onchange = self.handleFileSelect;
		self.dom.imgInputIcon.onclick = function () {
			self.dom.imgInput.click()
		};
		self.dom.addRoomInput.onkeypress = self.finishAddRoomOnEnter;
		self.dom.addRoomButton.onclick = self.finishAddRoom;
		self.addUserHandler = new Draggable(self.dom.addUserHolder, "");
		self.addUserHandler.fixInputs();
		self.addRoomHandler = new Draggable(self.dom.addRoomHolder, "Create New Room");
		self.channelSettings = new RoomSettings();
		self.channelSettings.fixInputs();
		self.addUserHandler.fixInputs();
		var minifier = self.dom.minifier;
		for (var el in minifier) {
			if (minifier.hasOwnProperty(el)) {
				minifier[el].icon.onclick = self.minifyList;
			}
		}
		self.dom.usersStateText.onclick = self.toggleChannelOfflineOnline;
		self.dom.usersStateText.textContent = 'Channel Users';
	};
	self.minifyList = function (event) {
		var minifier = self.dom.minifier[event.target.getAttribute('name')];
		var visible = CssUtils.toggleVisibility(minifier.body);
		minifier.icon.className = visible ? 'icon-angle-circled-down' : 'icon-angle-circled-up';

	};
	self.getActiveUserId = function () {
		return parseInt(self.dom.activeUserContext.getAttribute(USER_ID_ATTR));
	};
	self.getActiveUsername = function () {
		return self.dom.activeUserContext.textContent;
	};
	self.m2Call = function () {
		self.showOrInviteDirectChannel(self.postCallUserAction);
	};
	self.postCallUserAction = function () {
		self.getActiveChannel().getCallHandler().offerCall();
	};
	self.m2TransferFile = function () {
		self.showOrInviteDirectChannel(self.getActiveChannel().toggleCallHandler);
		webRtcApi.dom.fileInput.value = null;
		webRtcApi.dom.fileInput.click();
	};
	self.showOrInviteDirectChannel = function (postAction) {
		var userId = self.getActiveUserId();
		var exclude = self.getDirectMessagesUserIds();
		if (userId == loggedUserId) {
			growlError("You can't call yourself");
		} else if (exclude[userId]) {
			var selector = "#directUserTable li[userid='{}']".format(userId);
			var strRoomId = document.querySelector(selector).getAttribute(self.ROOM_ID_ATTR);
			self.setActiveChannel(parseInt(strRoomId));
			postAction();
		} else {
			self.postUserAction = {
				action: postAction,
				time: Date.now(),
				userId: userId,
				actionTrigger: 'addOnlineUser'
			};
			wsHandler.sendToServer({
				action: 'addDirectChannel',
				userId: userId
			});
		}
	};
	self.dom.activeUserContext = null;
	self.showContextMenu = function (e) {
		var li = e.target;
		if (li.tagName === 'I') {
			li = li.parentElement;
		}
		var userId = li.getAttribute('userid');
		if (!userId) {
			return
		}
		if (self.dom.activeUserContext != null) {
			CssUtils.removeClass(self.dom.activeUserContext, 'active-user');
		}
		self.dom.activeUserContext = li;
		var bcr = li.getBoundingClientRect();
		self.dom.userContextMenu.style.top = bcr.top + (li.clientHeight || 20) + "px";
		self.dom.userContextMenu.style.left = bcr.left -2 + "px";
		self.dom.userContextMenu.style.width = Math.max(bcr.width, 205) + "px";
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
	self.superShow = self.show;
	self.superHide = self.hide;
	self.show = function() {
		self.superShow();
		CssUtils.showElement(self.dom.navCallIcon);
		CssUtils.showElement(webRtcFileIcon);
		CssUtils.showElement(self.dom.searchIcon);
	};
	self.render = self.show;
	self.hide = function() {
		self.superHide();
		CssUtils.hideElement(self.dom.navCallIcon);
		CssUtils.hideElement(webRtcFileIcon);
		CssUtils.hideElement(self.dom.searchIcon);
	};
	self.initCha();
}


function SmileyUtil() {
	var self = this;
	self.dom = {
		smileParentHolder: $('smileParentHolder'),
		tabNames: $('tabNames'),
		iconSmile: $('iconSmile')
	};
	self.smileRegex = /<img[^>]*code="([^"]+)"[^>]*>/g;
	self.tabNames = [];
	self.smileyDict = {};
	self.inited = false;
	self.init = function (smileys_bas64_data) {
		self.dom.iconSmile.addEventListener('click', self.toggleSmileys, true);
		self.dom.tabNames.addEventListener('click', self.showTabByName, true);
		self.dom.smileParentHolder.addEventListener('click', self.addSmile, true);
		self.inited = true;
		doGet(SMILEY_URL+'/info.json', function(smileys_bas64_data) {
			self.loadSmileys(smileys_bas64_data);
		})
		userMessage.addEventListener("click", function (event) {
			event.stopPropagation(); // Don't fire onDocClick
		});
	};
	self.hideSmileys = function () {
		document.removeEventListener("click", self.onDocClick);
		CssUtils.hideElement(self.dom.smileParentHolder);
	};
	self.onDocClick = function (event) {
		event = event || window.event;
		event.preventDefault(); //don't lose focus on usermessage
		self.hideSmileys();
	};
	self.purgeImagesFromSmileys = function () {
		userMessage.innerHTML = userMessage.innerHTML.replace(self.smileRegex, "$1");
	};
	self.addSmile = function (event) {
		if (event.target.tagName == 'LI') {
			return
		}
		event.preventDefault(); // prevents from losing focus
		event.stopPropagation(); // don't allow onDocClick
		var smileImg = event.target;
		if (smileImg.tagName !== 'IMG') {
			return;
		}
		Utils.pasteHtmlAtCaret(smileImg.cloneNode());
		logger.info('Added smile "{}"', smileImg.alt)();
	};
	self.encodeSmileys = function (html) {
		return html.replace(smileUnicodeRegex, function (s) {
			return self.smileyDict[s];
		});
	};
	self.toggleSmileys = function (event) {
		event.stopPropagation(); // prevent top event
		event.preventDefault();
		var becomeHidden = CssUtils.toggleVisibility(self.dom.smileParentHolder);
		if (becomeHidden) {
			document.removeEventListener("click", self.onDocClick);
		} else {
			document.addEventListener("click", self.onDocClick);
			if (document.activeElement != userMessage) {
				userMessage.focus();
			}
		}
	};
	self.showTabByName = function (eventOrTabName) {
		var tagName;
		if (eventOrTabName.target) { // if called by actionListener
			if (eventOrTabName.target.tagName !== 'LI') {
				// outer scope click
				return;
			}
			eventOrTabName.stopPropagation();
			eventOrTabName.preventDefault();
			tagName = eventOrTabName.target.innerHTML;
		} else {
			tagName = eventOrTabName;
		}
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
			tabSmileys.forEach(function(smile) {
				var fileRef = document.createElement('IMG');
				var fullSmileyUrl = SMILEY_URL + '/' + tab + '/' + smile.src;
				fileRef.setAttribute("src", fullSmileyUrl);
				fileRef.setAttribute("code", smile.code);
				fileRef.setAttribute("alt", smile.alt);
				tabRef.appendChild(fileRef);
				// http://stackoverflow.com/a/1750860/3872976
				/** encode dict key, so {@link encodeSmileys} could parse smileys after encoding */
				self.smileyDict[encodeHTML(smile.code)] = fileRef.outerHTML;
			});
		}
		self.showTabByName(Object.keys(smileyData)[0]);
	};
	self.init();
}


function Search(channel) {
	var self = this;
	self.dom = {
		query: document.createElement('input'),
		result: document.createElement('div'),
		loading: document.createElement('div'),
		container: document.createElement('div'),
	};
	self.lastSearchNodes = [];
	self.channel = channel;
	self.isHidden = true;
	self.init = function() {
		self.dom.query.type = 'search';
		self.dom.loading.className = 'search-loading';
		self.dom.container.appendChild(self.dom.query);
		self.dom.container.appendChild(self.dom.loading);
		self.dom.container.appendChild(self.dom.result);
		self.dom.container.className = 'search hidden';
		self.dom.result.className = 'search_result hidden';
		self.dom.query.oninput = self.oninput;
		self.channel.dom.chatBoxHolder.appendChild(self.dom.container);
	};
	self.hide = function() {
		if (!self.isHidden) {
			CssUtils.hideElement(self.dom.container);
		}
	};
	self.show = function() {
		if (!self.isHidden) {
			CssUtils.showElement(self.dom.container);
		}
	};
	self.toggle = function () {
		self.isHidden = CssUtils.toggleVisibility(self.dom.container);
		if (self.isHidden) {
			CssUtils.removeClass(self.channel.dom.chatBoxDiv, 'display-search-only');
			self.clearSearch();
			userMessage.focus();
		} else {
			self.dom.query.focus();
		}
	};
	self.inProgress = false;
	self.clearSearch = function() {
		CssUtils.hideElement(self.dom.result);
		self.lastSearchNodes.forEach(function (node) {
			CssUtils.removeClass(node, 'filter-search');
		});
		self.lastSearchNodes= [];
	};
	self.oninput = function(event) {
		self.lastSearch = self.dom.query.value;
		if (!self.inProgress) {
			if (self.lastSearch.length < 2) {
				self.clearSearch();
				CssUtils.removeClass(self.channel.dom.chatBoxDiv, 'display-search-only');
				if (self.lastSearch.length === 1) {
					CssUtils.showElement(self.dom.result);
					self.dom.result.textContent = "Query is to broad";
				}
				return;
			}
			self.inProgress = true;
			var currentSearch = self.lastSearch;
			CssUtils.addClass(self.dom.container, 'loading');
			doPost('/search_messages', {
				data: self.dom.query.value,
				room: channel.roomId
			}, function(response, error) {
				if (error) {
					growlError("Unable to search because" + error);
					return;
				}
				self.clearSearch();
				var b = self.lastSearch == currentSearch;
				self.inProgress = false;
				CssUtils.addClass(channel.dom.chatBoxDiv, 'display-search-only');
				CssUtils.removeClass(self.dom.container, 'loading');
				var r = JSON.parse(response);
				if (r.length) {
					CssUtils.hideElement(self.dom.result);
					r.forEach(function (data) {
						var p = self.channel.createMessageNodeAll(data);
						self.lastSearchNodes.push(p.node);
						CssUtils.addClass(p.node, 'filter-search');
					})
				} else {
					self.dom.result.textContent = "No results found";
					CssUtils.showElement(self.dom.result);
				}
				if (!b) {
					self.oninput();
				}
			})
		}
	};
	self.init();
}



function ChatHandler(li, chatboxDiv, allUsers, roomId, roomName, private) {
	var self = this;
	self.UNREAD_MESSAGE_CLASS = 'unreadMessage';
	self.EDITED_MESSAGE_CLASS = 'editedMessage';
	self.roomId = parseInt(roomId);
	self.roomName = roomName;
	var logger = {
		warn: loggerFactory.getLogger("CH:"+roomId, console.warn, 'color: #FF0F00; font-weight: bold'),
		info: loggerFactory.getLogger("CH:"+roomId, console.log, 'color: #FF0F00; font-weight: bold'),
		error: loggerFactory.getLogger("CH:"+roomId, console.error, 'color: #FF0F00; font-weight: bold')
	}
	self.lastMessage = {};
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
	self.dom.userList.setAttribute('roomId', roomId);
	self.newMessages = 0;
	self.lastLoadUpHistoryRequest = 0;
	self.allMessages = [];
	self.search = new Search(self);
	self.allMessagesDates = [];
	self.activeRoomClass = 'active-room';
	self.dom.newMessages.className = 'newMessagesCount ' + CssUtils.visibilityClass;
	li.appendChild(self.dom.newMessages);
	self.OTHER_HEADER_CLASS = 'message-header-others';
	self.dom.userList.className = CssUtils.visibilityClass;
	channelsHandler.dom.chatUsersTable.appendChild(self.dom.userList);
	self.dom.chatBoxDiv.className = 'chatbox ' + CssUtils.visibilityClass;
	self.dom.chatBoxHolder.appendChild(self.dom.chatBoxDiv);
	// tabindex allows focus, focus allows keydown binding event
	self.dom.chatBoxDiv.setAttribute('tabindex', '1');

	self.show = function () {
		self.rendered = true;
		self.search.show();
		CssUtils.showElement(self.dom.chatBoxDiv);
		CssUtils.showElement(self.dom.userList);
		CssUtils.addClass(self.dom.roomNameLi, self.activeRoomClass);
		self.removeNewMessages();
		CssUtils.hideElement(self.dom.newMessages);
		CssUtils.showElement(self.dom.deleteIcon);
		if (self.callHandler) {
			self.callHandler.restoreState()
		}
		self.dom.chatBoxDiv.scrollTop = self.dom.chatBoxDiv.scrollHeight;
	};
	self.setRoomSettings = function(volume, notifications) {
		self.volume = volume;
		self.notifications = notifications;
	}
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
	self.removeNewMessages = function () {
		self.newMessages = 0;
		CssUtils.hideElement(self.dom.newMessages);
	};

	self.xDown = null;
	self.yDown = null;
	self.handleTouchStart = function (evt) {
		self.xDown = evt.touches[0].clientX;
		self.yDown = evt.touches[0].clientY;
	};
	self.handleTouchMove = function(evt) {
		if (!self.xDown || !self.yDown) {
			return;
		}
		var xUp = evt.touches[0].clientX;
		var yUp = evt.touches[0].clientY;
		var xDiff = self.xDown - xUp;
		var yDiff = self.yDown - yUp;
		if (Math.abs(xDiff) < Math.abs(yDiff) && yDiff < 0) {/*most significant*/
			self.loadUpHistory();
		}
		/* reset values */
		self.xDown = null;
		self.yDown = null;
	};
	self.dom.chatBoxDiv.addEventListener('touchstart', self.handleTouchStart, false);
	self.dom.chatBoxDiv.addEventListener('touchmove', self.handleTouchMove, false);
	self.dom.chatBoxDiv.addEventListener(mouseWheelEventName, self.mouseWheelLoadUp, {passive: true});
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
		self.dom.chatBoxDiv.innerHTML = '';
		self.allMessages = [];
		self.allMessagesDates = [];
		self.dom.chatBoxDiv.addEventListener(mouseWheelEventName, self.mouseWheelLoadUp, {passive: true});
		self.dom.chatBoxDiv.addEventListener("keydown", self.keyDownLoadUp);
	};
	self.dom.chatBoxDiv.addEventListener('keydown', self.keyDownLoadUp);
	self.hide = function () {
		CssUtils.hideElement(self.dom.chatBoxDiv);
		if (self.callHandler) {
			self.callHandler.hide();
		}
		self.search.hide();
		CssUtils.hideElement(self.dom.userList);
		CssUtils.removeClass(self.dom.roomNameLi, self.activeRoomClass);
	};
	self.getCallHandler = function () {
		if (!self.callHandler) {
			self.callHandler = new CallHandler(self.roomId);
		}
		return self.callHandler;
	};
	self.createCallHandler = function () {
		if (self.callHandler && ['new', 'closed'].indexOf(self.callHandler.getCallStatus()) < 0) {
			return false;
		} else if (self.callHandler) {
			return self.callHandler;
		} else {
			self.callHandler = new CallHandler(self.roomId);
			self.callHandler.toggle(); // I mean hide + set this.visible
			return self.callHandler;
		}
	};
	self.toggleCallHandler = function () {
		if (self.callHandler) {
			self.callHandler.toggle();
		} else {
			self.getCallHandler();
		}
	};
	self.isPrivate = function () {
		return self.dom.roomNameLi.hasAttribute(USER_ID_ATTR);
	};
	self.getOpponentId = function () {
		return self.dom.roomNameLi.getAttribute(USER_ID_ATTR);
	};
	self.getUserNameById = function (id) {
		return self.allUsers[id] ? self.allUsers[id].user : null;
	};
	self.addUserToDom = function (message) {
		if (!self.allUsers[message.userId]) {
			self.allUsers[message.userId] = {
				sex: message.sex,
				user: message.user
			};
			self.addUserLi(message.userId, message.sex, message.user);
		}
	};
	self.updateAllDomUsers = function (newUsers) {
		for (var oldUserId in self.allUsers) {
			if (!self.allUsers.hasOwnProperty(oldUserId)) continue;
			if (!newUsers[oldUserId]) {
				var oldLi = document.querySelector('ul[roomId="{}"] > li[userId="{}"]'.format(self.roomId, oldUserId));
				CssUtils.deleteElement(oldLi);
				logger.info("User with id {} has been deleted while offline", oldUserId)();
				delete self.allUsers[oldUserId];
			}
		}
		for (var newUserId in newUsers) {
			if (!newUsers.hasOwnProperty(newUserId)) continue;
			var newUser = newUsers[newUserId];
			if (!self.allUsers[newUserId]) {
				self.allUsers[newUserId] = newUser;
				logger.info("User with id {} has been signed up while offline", newUserId)();
				self.addUserLi(newUserId, newUser.sex, newUser.user);
			}
		}
	};
	self.setAllDomUsers = function (users) {
		self.dom.userList.innerHTML = '';
		self.allUsers = users;
		for (var userId in self.allUsers) {
			if (!self.allUsers.hasOwnProperty(userId)) continue;
			var user = self.allUsers[userId];
			self.addUserLi(userId, user.sex, user.user);
		}
	};
	self.addUserLi = function (userId, sex, username) {
		var li = Utils.createUserLi(userId, sex, username);
		li.className = OFFLINE_CLASS;
		self.allUsers[userId].li = li;
		self.dom.userList.appendChild(li);
	};
	self.setAllDomUsers(allUsers);
	self.isHidden = function () {
		return CssUtils.isHidden(self.dom.chatBoxDiv);
	};
	/** Inserts element in the middle if it's not there
	 * @param time element
	 * @returns dict: {exists: boolean, el: Node} where el is element that follows the inserted one
	 * @throws exception if element already there*/
	self.getPosition = function (time) {
		var arrayEl;
		for (var i = 0; i < self.allMessages.length; i++) {
			arrayEl = self.allMessages[i];
			if (time === arrayEl) {
				return {exists: $(arrayEl)};
			}
			if (time < arrayEl) {
				self.allMessages.splice(i, 0, time);
				return {el: $(arrayEl)};
			}
		}
		return {el: null};
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
	self.timeMessageClick = function (event) {
		self.quoteMessage(event.target.parentElement.parentElement);
	};
	self.quoteMessage = function(p) {
		userMessage.focus();
		var oldValue = userMessage.innerHTML;
		var match = oldValue.match(timePattern);
		var timeText = p.querySelector('[class^="message-header').textContent;
		oldValue = match ? oldValue.substr(match[0].length + 1) : oldValue;
		userMessage.innerHTML = encodeHTML(timeText) + Utils.encodeP(p) + encodeHTML(' >>>') + String.fromCharCode(13) +' '+ oldValue;
		Utils.placeCaretAtEnd();
	};
	/** Creates a DOM node with attached events and all message content*/
	self.createMessageNode = function (timeMillis, headerStyle, displayedUsername, htmlEncodedContent, messageId, userId) {
		var date = new Date(timeMillis);
		var time = [sliceZero(date.getHours()), sliceZero(date.getMinutes()), sliceZero(date.getSeconds())].join(':');

		var p = document.createElement('p');
		p.setAttribute("id", timeMillis);
		if (messageId) {
			p.setAttribute(MESSAGE_ID_ATTRIBUTE, messageId);
		}
		var headSpan = document.createElement('span');
		headSpan.className = headerStyle; // note it's not appending classes, it sets all classes to specified
		var timeSpan = document.createElement('span');
		timeSpan.className = TIME_SPAN_CLASS;
		timeSpan.textContent = '({})'.format(time);
		timeSpan.onclick = self.timeMessageClick;
		headSpan.appendChild(timeSpan);

		var userNameA = document.createElement('span');
		userNameA.textContent = displayedUsername;
		if (userId)  {
				userNameA.setAttribute('userid', userId);
		}
		headSpan.insertAdjacentHTML('beforeend', ' ');
		headSpan.appendChild(userNameA);
		headSpan.insertAdjacentHTML('beforeend', ': ');
		p.appendChild(headSpan);
		var textSpan = document.createElement('span');
		textSpan.className = CONTENT_STYLE_CLASS;
		textSpan.innerHTML = htmlEncodedContent;
		p.appendChild(textSpan);
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

	self.isScrollInTHeMiddle = function () {
		var element = self.dom.chatBoxDiv;
		logger.info("{} [scrollHeight] - {} [scrollTop] >  [element.clientHeight] + 30 {},  {} > {}",element.scrollHeight, element.scrollTop, element.clientHeight, element.scrollHeight - element.scrollTop, element.clientHeight + 30 )();
		return element.scrollHeight - element.scrollTop > element.clientHeight + 30;
	};
	/** Inserts a message to positions, saves is to variable and scrolls if required*/
	self.displayPreparedMessage = function (headerStyle, timeMillis, htmlEncodedContent, displayedUsername, messageId, userId, edited) {
		var pos;
		var existed = false;
		if (self.allMessages.length > 0 && !(timeMillis > self.allMessages[self.allMessages.length - 1])) {
			var posRes = self.getPosition(timeMillis);
			if (posRes.exists) {
				if (posRes.exists.getAttribute('edited') == edited) {
					logger.info("Skipping rendering for message #{} as it exists", messageId)();
					return {node: posRes.exists, skip: true}
				}
				existed = posRes.exists;
			} else {
				pos = posRes.el;
			}
		} else {
			self.allMessages.push(timeMillis);
		}
		var p = self.createMessageNode(timeMillis, headerStyle, displayedUsername, htmlEncodedContent, messageId, userId);
		if (existed) {
			self.dom.chatBoxDiv.replaceChild(p, existed);
		} else {
			// every message has UTC millis ID so we can detect if message is already displayed or position to display
			pos = self.insertCurrentDay(timeMillis, pos);
			if (pos != null) {
				self.dom.chatBoxDiv.insertBefore(p, pos);
			} else {
				var inTheMiddle = self.isScrollInTHeMiddle();
				self.dom.chatBoxDiv.appendChild(p);
				if (!inTheMiddle) {
					if (htmlEncodedContent.startsWith('<img')) {
						document.querySelector('[id="{}"] img'.format(p.id)).onload = function () {
							self.dom.chatBoxDiv.scrollTop = self.dom.chatBoxDiv.scrollHeight;
						}
					} else {
						self.dom.chatBoxDiv.scrollTop = self.dom.chatBoxDiv.scrollHeight;
					}
				}
			}
		}
		return {node: p, skip: false};
	};
	self.loadOfflineMessages = function (data) {
		var hisMess = data.content.history || [];
		var offlMess = data.content.offline || [];
		var bu = Utils.checkAndPlay;
		Utils.checkAndPlay = function() {}
		offlMess.forEach(function(d) {
			self._printMessage(d, true, false);
		});
		hisMess.forEach(function(d) {
			self._printMessage(d, false, true);
		});
		Utils.checkAndPlay = bu;
	};
	self.getMaxSymbol = function (images) { //deprecated
		var symbols = images && Object.keys(images);
		if (symbols && symbols.length) {
			var symbol = '\u3501';
			for (var i = 0; i < symbols.length; i++) {
				if (symbols[i].charCodeAt(0) > symbol.charCodeAt(0)) {
					symbol = symbols[i]
				}
			}
			return symbol;
		}

	};
	self.setAttributesData = function (p, data) {
		if (data.symbol) {
			p.setAttribute('symbol', data.symbol);
		}
		p.setAttribute('content', data.content);
		p.setAttribute('files', JSON.stringify(data.files));
		p.setAttribute('edited', data.edited);
		if (data.edited != '0') {
					CssUtils.addClass(p, self.EDITED_MESSAGE_CLASS);
		}
	};
	self.editMessage = function (data) {
		var p = $(data.time);
		if (p != null) {
			var html = Utils.encodeMessage(data);
			var element = p.querySelector("." + CONTENT_STYLE_CLASS);
			self.setAttributesData(p, data);
			element.innerHTML = html;
			self.setupMessageEvents(p);
		}
	};
	self.deleteMessage = function (data) {
		var target = document.querySelector("[id='{}'] .{}".format(data.time, CONTENT_STYLE_CLASS));
		if (target) {
			target.innerHTML = 'This message has been removed.';
			CssUtils.addClass($(data.time), REMOVED_MESSAGE_CLASSNAME);
			if (data.userId == loggedUserId) {
				self.lastMessage = null;
			}
		}
	};
	self.printMessage = function (data) {
		self._printMessage(data, false);
	};
	self.setupMessageEvents = function(data) {
		Utils.setYoutubeEvent(data);
		Utils.setVideoEvent(data);
		Utils.highlightCode(data)
	};
	self.createMessageNodeAll = function (data) {
		var displayedUsername = channelsHandler.getAllUsersInfo()[data.userId].user;
		var html = Utils.encodeMessage(data);
		var p = self.displayPreparedMessage(
				data.userId == loggedUserId ? SELF_HEADER_CLASS : self.OTHER_HEADER_CLASS,
				data.time,
				html,
				displayedUsername,
				data.id,
				data.userId,
				data.edited
		);
		if (!p.skip) {
			self.setAttributesData(p.node, data);
			self.setupMessageEvents(p.node);
		}
		p.username = displayedUsername;
		return p;
	};
	self._printMessage = function (data, isNew, forceSkipHL) {
		storage.setRoomHeaderId(self.roomId, data.id);
		self.printMessagePlay(data);
		// we can't use self.allUsers[data.userId].user; since user could left and his message remains
		var p = self.createMessageNodeAll(data);
		if (!p.skip && !forceSkipHL) {
			self.highLightMessageIfNeeded(p.node, p.username, isNew, data.content, data.images);
			if (data.userId != loggedUserId && self.notifications) {
				notifier.notify(p.username, {
					body: data.content,
					data: {
						replaced: 1,
						title: p.username,
						roomId: data.channel
					},
					requireInteraction: true,
					icon: data.images || NOTIFICATION_ICON_URL
				});
			}
		}
	};
	self.printMessagePlay = function (data) {
		if (window.messageSound) {
			if (loggedUserId === data.userId) {
				Utils.checkAndPlay(self.dom.chatOutgoing, self.volume);
				self.lastMessage = {
					id: data.id,
					time: data.time
				}
			} else {
				Utils.checkAndPlay(self.dom.chatIncoming, self.volume);
			}
		}
	};
	self.highLightMessageIfNeeded = function (p, displayedUsername, isNew, content, images) {
		var keys = images && Object.keys(images);
		var img = keys && images[keys[0]];
		if (self.isHidden() && !window.newMessagesDisabled) {
			self.newMessages++;
			self.dom.newMessages.textContent = self.newMessages;
			if (self.newMessages == 1) {
				CssUtils.showElement(self.dom.newMessages);
				CssUtils.hideElement(self.dom.deleteIcon);
			}
		}
		// if flag newMessagesDisabled wasn't set to true  && (...))
		if (!window.newMessagesDisabled && (self.isHidden() || isNew || !notifier.isCurrentTabActive)) {
			CssUtils.addClass(p, self.UNREAD_MESSAGE_CLASS);
			p.onmouseover = function (event) {
				var pTag = event.target;
				pTag.onmouseover = null;
				CssUtils.removeClass(pTag, self.UNREAD_MESSAGE_CLASS);
			}
		}
	};
	self.loadMessages = function (data) {
		var bu = Utils.checkAndPlay;
		Utils.checkAndPlay = function() {}
		logger.info('appending messages to top')();
		// This check should fire only once,
		// because requests aren't being sent when there are no event for them, thus no responses
		var message = data.content;
		if (message.length === 0) {
			logger.info('Requesting messages has reached the top, removing loadUpHistoryEvent handlers')();
			self.dom.chatBoxDiv.removeEventListener(mouseWheelEventName, self.mouseWheelLoadUp);
			self.dom.chatBoxDiv.removeEventListener("keydown", self.keyDownLoadUp);
			return;
		}
		// loadMessages could be called from localStorage
		var savedNewMessagesDisabledStatus = window.newMessagesDisabled;
		window.newMessagesDisabled = true;
		message.forEach(function(message) {
			self._printMessage(message, false, true)
		});
		window.newMessagesDisabled = savedNewMessagesDisabledStatus;
		self.lastLoadUpHistoryRequest = 0; // allow fetching again, after new header is set
		Utils.checkAndPlay = bu;
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
		if (window.onlineChangeSound) {
				Utils.checkAndPlay(sound, self.volume);
		}
		self.displayPreparedMessage(SYSTEM_HEADER_CLASS, message.time, dm, SYSTEM_USERNAME);
		self.setOnlineUsers(message);
	};
	self.setOnlineUsers = function (message) {
		self.onlineUsers = message.content;
		//logger.info("Load user names: {}", Object.keys(self.onlineUsers))();
		for (var userId in self.allUsers) {
			if (!self.allUsers.hasOwnProperty(userId)) continue;
			var user = self.allUsers[userId];
			if (self.onlineUsers.indexOf(parseInt(userId)) >= 0) {
				CssUtils.removeClass(user.li, OFFLINE_CLASS);
			} else {
				CssUtils.addClass(user.li, OFFLINE_CLASS);
			}
		}
		self.setDirectChannelOnline();
	};
	self.setDirectChannelOnline = function() {
		if (roomId == DEFAULT_CHANNEL_NAME) {
			for (var i = 0; i < directUserTable.children.length; i++) {
				var e = directUserTable.children[i];
				var userid = parseInt(e.getAttribute('userid'));
				CssUtils.setClassToState(e, self.onlineUsers.indexOf(userid) >= 0, OFFLINE_CLASS);
			}
		}
	}
	self.loadUpHistory = function (count) {
		if (self.dom.chatBoxDiv.scrollTop === 0) {
			var currentMillis = Date.now();
			// 0 if locked, or last request was sent earlier than 3 seconds ago
			if (self.lastLoadUpHistoryRequest + 3000 > currentMillis) {
				logger.info("Skipping loading message, because it's locked")();
				return
			}
			self.lastLoadUpHistoryRequest = currentMillis;
			var getMessageRequest = {
				headerId: storage.getRoomHeaderId(self.roomId),
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


function DownloadBar(holder, fileSize, statusDiv) {
	var self = this;
	self.dom = {
		wrapper: holder,
		text: document.createElement('A'),
		statusDiv: statusDiv
	};
	logger.info("Added download bar")();
	self.max = fileSize;
	self.dom.wrapper.className = 'progress-wrap';
	self.dom.wrapper.appendChild(self.dom.text);
	self.PROGRESS_CLASS = 'animated';
	self.SUCC_CLASS = 'success';
	self.ERR_CLASS = 'error';
	self.setValue = function (value) {
		var percent = Math.round(value * 100 / self.max) + "%";
		self.dom.text.style.width = percent;
		self.dom.text.textContent = percent;
	};
	self.setStatus = function (text) {
		if (self.dom.statusDiv) {
			self.dom.statusDiv.textContent = text;
		}
	};
	self.getAnchor = function () {
		return self.dom.text;
	};
	self.show = function () {
		CssUtils.showElement(self.dom.wrapper);
	};
	self.hide = function () {
		CssUtils.hideElement(self.dom.wrapper);
	};
	self.setSuccess = function () {
		CssUtils.setOnOf(self.dom.wrapper, self.SUCC_CLASS, [self.PROGRESS_CLASS, self.ERR_CLASS]);
	};
	self.setError = function () {
		CssUtils.setOnOf(self.dom.wrapper, self.ERR_CLASS, [self.PROGRESS_CLASS, self.SUCC_CLASS]);
	};
	self.start = function () {
		self.dom.text.removeAttribute('href');
		self.dom.text.removeAttribute('download');
		CssUtils.setOnOf(self.dom.wrapper, self.PROGRESS_CLASS, [self.ERR_CLASS, self.SUCC_CLASS]);
	};
	self.start();
	self.setValue(0); // start is used somewhere else so setValue is here
}

function SenderPeerConnection(connectionId, opponentWsId, removeChildPeerReferenceFn) {
	var self = this;
	AbstractPeerConnection.call(self, connectionId, opponentWsId, removeChildPeerReferenceFn);


}

function ReceiverPeerConnection(connectionId, opponentWsId, removeChildPeerReferenceFn) {
	var self = this;
	AbstractPeerConnection.call(self, connectionId, opponentWsId, removeChildPeerReferenceFn);

	self.onChannelMessage = function (msg) {
// 		self.log('Received {} from webrtc data channel', bytesToSize(event.data.byteLength))();
	}
}


function AbstractPeerConnection(connectionId, opponentWsId, removeChildPeerReferenceFn) {
	var self = this;
	self.sendRtcDataQueue = [];
	self.opponentWsId = opponentWsId;
	self.connectionId = connectionId;
	self.pc = null;
	self.connectionStatus = 'new';
	self.removeChildPeerReference = removeChildPeerReferenceFn;
	var webRtcUrl = isFirefox ? 'stun:23.21.150.121' : 'stun:stun.l.google.com:19302';
	self.pc_config = {iceServers: [{url: webRtcUrl}]};
	self.pc_constraints = {
		optional: [/*Firefox*/
			/*{DtlsSrtpKeyAgreement: true},*/
			{RtpDataChannels: false /*true*/}
		]
	};
	self.setConnectionStatus = function(newStatus) {
		self.connectionStatus = newStatus;
		self.log("Setting connection status to {}", newStatus)();
	},
	self.getConnectionStatus = function() {
		return self.connectionStatus;
	}
	self.log = loggerFactory.getLogger(self.connectionId + ":" + self.opponentWsId, console.log,  "color: #960055; font-weight: bold");
	self.logErr = loggerFactory.getLogger(self.connectionId + ":" + self.opponentWsId, console.error,  "color: #960055; font-weight: bold");
	self.print = function (message) {
		self.log("Call message {}", JSON.stringify(message))();
	};
	self.onsendRtcData = function (message) {
		if (!self.connectedToRemote) {
			self.log("Connection is not accepted yet, pushing data to queue")();
			self.sendRtcDataQueue.push(message); // TODO https://stackoverflow.com/questions/47496922/tornado-redis-garantee-order-of-published-messages
			return;
		} else {
			var data = message.content;
			self.log("onsendRtcData")();
			if (self.pc.iceConnectionState && self.pc.iceConnectionState !== 'closed') {
				if (data.sdp) {
					self.pc.setRemoteDescription(new RTCSessionDescription(data), self.handleAnswer, self.failWebRtc('setRemoteDescription'));
				} else if (data.candidate) {
					self.pc.addIceCandidate(new RTCIceCandidate(data));
				} else if (data.message) {
					growlInfo(data.message);
				}
			} else {
				self.logErr("Skipping ws message for closed connection")();
			}
		}
	};
	self.createPeerConnection = function () {
		self.log("Creating RTCPeerConnection")();
		if (!RTCPeerConnection) {
			throw "Your browser doesn't support RTCPeerConnection";
		}
		self.pc = new RTCPeerConnection(self.pc_config, self.pc_constraints);
		self.pc.oniceconnectionstatechange = self.oniceconnectionstatechange;
		self.pc.onicecandidate = function (event) {
			self.log('onicecandidate')();
			if (event.candidate) {
				self.sendWebRtcEvent(event.candidate);
			}
		};
	};
	self.closePeerConnection = function (text) {
		self.setConnectionStatus('closed');
		if (self.pc && self.pc.signalingState !== 'closed') {
			self.log("Closing peer connection")();
			self.pc.close();
		} else {
			self.log("No peer connection to close")();
		}
	};

	self.sendWebRtcEvent = function (message) {
		wsHandler.sendToServer({
			content: message,
			action: 'sendRtcData',
			connId: self.connectionId,
			opponentWsId: self.opponentWsId
		});
	};
	self.failWebRtc = function (parent) {
		return function () {
			var message = "An error occurred while {}: {}".format(parent, Utils.extractError(arguments));
			growlError(message);
			self.logErr(message)();
		}
	};
	self.createOffer = function () { // each peer should be able to createOffer in case of microphone change
		self.log('Creating offer...')();
		self.offerCreator = true;
		self.pc.createOffer(function (offer) {
			offer.sdp = Utils.setMediaBitrate(offer.sdp, 1638400);
			self.log('Created offer, setting local description')();
			self.pc.setLocalDescription(offer, function () {
				self.log('Sending offer to remote')();
				self.sendWebRtcEvent(offer);
			}, self.failWebRtc('setLocalDescription'));
		}, self.failWebRtc('createOffer'), self.sdpConstraints);
	};
	self.respondeOffer = function() {
		self.offerCreator = false;
		self.pc.createAnswer(function (answer) {
			answer.sdp = Utils.setMediaBitrate(answer.sdp, 1638400);
			self.log('Sending answer')();
			self.pc.setLocalDescription(answer, function () {
				self.sendWebRtcEvent(answer);
			}, self.failWebRtc('setLocalDescription'));
		}, self.failWebRtc('createAnswer'), self.sdpConstraints);
	}
	self.handleAnswer = function () {
		self.log('Creating answer')();
		if (!self.offerCreator ) {
			self.respondeOffer();
		}
		self.offerCreator = false;
	};
}


function BaseTransferHandler(removeReferenceFn) {
	var self = this;
	self.log = loggerFactory.getLogger("WRTC", console.log, 'color: #960055; font-weight: bold');
	self.logErr = loggerFactory.getLogger("WRTC", console.error, 'color: #960055; font-weight: bold');
	self.removeReference = function () {
		removeReferenceFn(self.connectionId);
	};
	self.removeChildPeerReference = function (id) {
		self.log("Removing peer connection {}", id)();
		delete self.peerConnections[id];
	};
	self.peerConnections = {};
	self.handle = function (data) {
		if (data.handler === 'webrtcTransfer') {
			self['on' + data.action](data);
		} else if (self.peerConnections[data.opponentWsId]) {
			self.peerConnections[data.opponentWsId]['on' + data.action](data);
		} else { // this is only supposed to be for destroyPeerConnection
			// when self.pc.iceConnectionState === 'disconnected' fired before destroyCallConnection action came
			self.logErr("Can't execute {} on {}, because such PC doesn't exist. Existing PC:{}",
					data.action, data.opponentWsId, Object.keys(self.peerConnections))();
		}
	};
	self.setConnectionId = function (id) {
		self.connectionId = id;
		self.log("CallHandler initialized")();
		self.log = loggerFactory.getLogger(self.connectionId, console.log, 'color: #960055; font-weight: bold');
		self.logErr = loggerFactory.getLogger(self.connectionId, console.error, 'color: #960055; font-weight: bold');
	};
	self.closeAllPeerConnections = function (text) {
		var hasConnections = false;
		for (var pc in self.peerConnections) {
			if (!self.peerConnections.hasOwnProperty(pc)) continue;
			self.peerConnections[pc].closeEvents(text);
			hasConnections = true;
		}
		return hasConnections;
	};
}

function RoomSettings() {
	var self = this;
	Draggable.call(self, $('roomSettings'), "");
	self.dom.roomSettExit = $('roomSettExit')
	self.dom.roomSettApply = $('roomSettApply')
	self.dom.roomSettNotifications = $('roomSettNotifications')
	self.dom.roomSettSound = $('roomSettSound')
	self.dom.roomSettName = $('roomSettName')
	self.dom.roomSettNameHolder = $('roomSettNameHolder')
	self.apply = function() {
		var data = {
			roomId: self.roomId,
			volume: self.dom.roomSettSound.value,
			notifications: self.dom.roomSettNotifications.checked
		};
		if (self.originName != roomSettName.value) {
			var value = roomSettName.value.trim()
			if (value.length < 1) {
				growlError("Room name cannot be empty");
				return
			}
			self.roomChanged = true;
			data.roomName = value;
		} else {
			self.roomChanged = false;
		}
		doPost('/save_room_settings', data, function(response) {
			if (response == RESPONSE_SUCCESS) {
				if (self.roomChanged) {
					channelsHandler.channels[self.roomId].roomName = data.roomName;
					growlSuccess("Settings have been saved, room name will be updated on next page refresh");
				} else {
					growlSuccess("Settings have been saved");
				}
				self.hide();
				channelsHandler.channels[self.roomId].setRoomSettings(data.volume, data.notifications)
			} else {
				growlError("Failed to save settings: " + response);
			}
		});
	}
	self.superShow = self.show;
	self.show = function(roomId) {
		self.superShow()
		self.roomId = roomId;
		var sd = channelsHandler.channels[roomId];
		self.dom.roomSettSound.value = sd.volume;
		self.dom.roomSettNotifications.checked = sd.notifications;
		CssUtils.setVisibility(roomSettNameHolder, !sd.isPrivate() && roomId != DEFAULT_CHANNEL_NAME);
		roomSettName.value = sd.roomName;
		self.originName = sd.roomName;
		fixInputRangeStyle(self.dom.roomSettSound)
		self.setHeaderText("<b>{}</b>'s room settings".format(sd.roomName));
	}
	self.leave = function() {
		var sent = wsHandler.sendToServer({
			action: 'deleteRoom',
			roomId: self.roomId
		});
		if (sent) {
			self.hide()
		}
	}
	self.dom.roomSettApply.onclick = self.apply;
	self.dom.roomSettExit.onclick = self.leave;
}


function CallPopup(answerFn, videoAnswerFn, declineFn, user, channelName, volume) {
	var self = this;
	Draggable.call(self, document.createElement('DIV'), "Call");
	self.dom.callSound = $('chatCall');
	self.init = function () {
		var answerButtons = document.createElement('div');
		self.dom.users = document.createElement('table');
		self.dom.users.className = 'table';
		answerButtons.className = 'answerButtons noSelection';
		answerButtons.appendChild(self.addButton('answerWebRtcCall', 'icon-call-aswer', 'answer-btn', 'Answer', answerFn));
		answerButtons.appendChild(self.addButton('videoAnswerWebRtcCall', 'icon-videocam', 'video-answer-btn', 'With video', videoAnswerFn));
		answerButtons.appendChild(self.addButton('declineWebRtcCall', 'icon-hang-up', 'decline-btn', 'Decline', declineFn));
		self.dom.body.appendChild(self.dom.users);
		self.dom.body.appendChild(answerButtons);
		document.querySelector('body').appendChild(self.dom.container);
		self.fixInputs();
		self.setHeaderText("Incoming call");
		self.inserRow("From: ", user);
		self.inserRow("Room: ", channelName);
		self.show();
		if (window.incomingFileCallSound) {
			Utils.checkAndPlay(self.dom.callSound, volume);
			self.dom.callSound.onended = function () {
				Utils.checkAndPlay(self.dom.callSound, volume);
			}
		}
	};
	self.inserRow = function (name, value) {
		var raw = self.dom.users.insertRow();
		var th = document.createElement('th');
		raw.appendChild(th);
		th.textContent = name;
		var valueField = raw.insertCell();
		valueField.textContent = value;
		return th;
	};
	self.addButton = function (name, icon, className, text, onClickFn) {
		var btn = document.createElement('button');
		self.dom[name] = btn;
		btn.className = className;
		btn.onclick = onClickFn;
		var iconCallAnswer = document.createElement('i');
		iconCallAnswer.className = icon;
		var textDiv = document.createElement('div');
		textDiv.textContent = text;
		btn.appendChild(iconCallAnswer);
		btn.appendChild(textDiv);
		return btn;
	};
	self.hide = function () {
		self.dom.callSound.pause();
		self.super.hide();
	};
	self.closeEvents = function () {
		CssUtils.deleteChildren(self.dom.users);
	};
	self.init();
}


function CallHandler(roomId) {
	var self = this;
	BaseTransferHandler.call(self);
	self.acceptedPeers = [];
	self.CALL_TIMEOUT_NO_ANSWER = 60000;
	self.CALL_TIMEOUT_NO_USERS = 3000;
	self.callStatus = 'new';
	self.visible = true;
	self.roomId = roomId;
	self.audioProcessor = null;
	self.callPopupTable = {};
	self.dom = {
		callAnswerText: $('callAnswerText'),
		callContainer: $('callContainer'),
		callContainerContent: document.createElement("DIV"),
		videoContainer: document.createElement("DIV"),
		videoContainerForVideos: document.createElement("DIV"),
		settingsContainer: document.createElement("TABLE"),
		headerText: document.createElement("span"),
		local: document.createElement('video'),
		audioStatusIcon: document.createElement('i'),
		videoStatusIcon: document.createElement('i'),
		hangUpIcon: document.createElement('i'),
		hangUpHolder: document.createElement('div'),
		microphoneLevel: document.createElement('progress'),
		callIcon: document.createElement('i'),
		shareScreen: document.createElement('i'),
		microphones: document.createElement('select'),
		cameras: document.createElement('select'),
		speakers: document.createElement('select'),
		playTestSound: document.createElement('span'),
		settings: document.createElement('i'),
		fs: {
			/*FullScreen*/
			video: document.createElement("i"),
			audio: document.createElement("i"),
			share: document.createElement("i"),
			hangup: document.createElement("i"),
			minimize: document.createElement("i"),
			enterFullScreen: document.createElement("i")
		}
	};
	self.constraints = {
		audio: true,
		video: true,
		share: false,
	};
	self.hidePhoneIcon = function () {
		if (self.dom.phoneIcon) {
			CssUtils.deleteElement(self.dom.phoneIcon);
			delete self.dom.phoneIcon;
		}
	};
	self.showPhoneIcon = function () {
		if (!self.dom.phoneIcon) {
			self.dom.phoneIcon = document.createElement('i');
			self.dom.phoneIcon.className = 'icon-phone';
			var roomNameLi = channelsHandler.channels[self.roomId].dom.roomNameLi;
			roomNameLi.insertBefore(self.dom.phoneIcon, roomNameLi.firstChild);
		}
	};
	self.getCallStatus = function() {
		var hasPcActive = false;
		for (var pcName in self.peerConnections) {
			if (!self.peerConnections.hasOwnProperty(pcName)) continue;
			var abstrPc = self.peerConnections[pcName].getConnectionStatus();
			if (abstrPc == 'running') {
				hasPcActive = true;
			}
		}
		return hasPcActive ? 'running': self.callStatus;
	}
	self.setCallStatus = function(newStatus) {
		self.log("Setting call status to {}", newStatus)();
		self.callStatus = newStatus;
	}
	self.setIconState = function (isCall) {
		if (isCall) {
			self.showPhoneIcon()
		} else {
			self.hidePhoneIcon();
		}
		CssUtils.setVisibility(self.dom.hangUpHolder, isCall);
		CssUtils.setVisibility(self.dom.videoContainer, isCall);
		CssUtils.setVisibility(self.dom.callIcon, !isCall);
	};
	self.setDesktopCapture = function (value) {
		self.constraints.share = value;
		CssUtils.setClassToState(self.dom.shareScreen, value, 'callActiveIcon');
		self.dom.fs.share.className = value ? "icon-desktop" : "icon-no-desktop";
		var title = value ? "Turn off screen sharing" :"Capture your desktop screen and start sharing it" ;
		self.dom.shareScreen.title = title;
		self.dom.fs.share.title = title;
	};
	self.setAudio = function (value) {
		self.constraints.audio = value;
		if (!value) {
			self.dom.microphoneLevel.value = 0;
		}
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
		var title = value ? "Turn off your webcam" : "Turn on your webcam";
		self.dom.videoStatusIcon.title = title;
		self.dom.fs.video.title = title;
	};
	self.attachDomEvents = function () {
		self.dom.videoStatusIcon.onclick = self.toggleVideo;
		self.dom.fs.video.onclick = self.toggleVideo;
		self.dom.hangUpIcon.onclick = self.hangUp;
		self.dom.fs.hangup.onclick = self.hangUp;
		self.dom.fs.audio.onclick = self.toggleMic;
		self.dom.audioStatusIcon.onclick = self.toggleMic;
		self.dom.shareScreen.onclick = self.toggleShare;
		self.dom.fs.share.onclick = self.toggleShare;
		self.dom.microphones.onchange = self.microphoneChanged;
		self.dom.speakers.onchange = self.speakerChanged;
		self.dom.cameras.onchange = self.cameraChanged;
		self.dom.playTestSound.onclick = self.testSound;
		self.dom.settings.onclick = self.toggleSettingsContainer;
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
			growlError("Can't enter fullscreen");
		}
		elem.ondblclick = self.enterFullScreenMode;
		self.dom.fs.enterFullScreen.onclick = self.enterFullScreenMode;
		self.dom.fs.minimize.onclick = self.exitFullScreen;
		self.dom.fs.hangup.title = 'Hang up';
		self.dom.hangUpIcon.title = self.dom.fs.hangup.title;
		self.idleTime = 0;
	};
	self.answerWebRtcCall = function () {
		self.setAudio(true);
		self.setVideo(false);
		self.setDesktopCapture(false);
		self.autoSetLocalVideoVisibility();
		self.accept();
		self.setHeaderText("Answered with audio");
	};
	self.videoAnswerWebRtcCall = function () {
		self.setAudio(true);
		self.setVideo(true);
		self.setDesktopCapture(false);
		self.autoSetLocalVideoVisibility();
		self.accept();
		self.setHeaderText("Answered with video");
	};
	self.renderDom = function () {
		var iwc = document.createElement('DIV');
		self.dom.videoContainerForVideos.appendChild(self.dom.local);
		self.dom.local.setAttribute('muted', true);
		self.dom.local.className = 'localVideo';
		self.dom.videoContainer.appendChild(iwc);
		self.dom.videoContainer.appendChild(self.dom.videoContainerForVideos);
		self.dom.videoContainer.className = 'videoContainer ' + CssUtils.visibilityClass;
		function ap(icon, holder) {
			var row = self.dom.settingsContainer.insertRow(0);
			var el = self.dom[holder];
			self.dom[holder + 'Holder' ] = row;
			var cell1 = row.insertCell(0);
			var i = document.createElement('i');
			i.className = icon;
			cell1.appendChild(i);
			cell1.appendChild(el);
			return cell1;
		}
		ap('icon-mic', 'microphones');
		ap('icon-videocam', 'cameras');
		var speakersCell = ap('icon-volume-2', 'speakers');
		speakersCell.appendChild(self.dom.playTestSound);
		self.dom.playTestSound.className = 'playTestSound';
		ap('icon-quote-left', 'headerText');
		self.dom.headerText.textContent = 'Call info';
		self.dom.headerText.className = 'callInfo';
		self.dom.playTestSound.textContent = "Play test sound";
		self.dom.settingsContainer.className = 'settingsContainer ' + CssUtils.visibilityClass;
		self.dom.callContainerContent.className = 'callContainerContent';
		self.dom.callContainerContent.appendChild(self.dom.videoContainer);
		self.dom.callContainerContent.appendChild(self.dom.settingsContainer);
		self.dom.callContainer.appendChild(self.dom.callContainerContent);
		self.dom.fs.minimize.className = 'icon-webrtc-minimizedscreen';
		self.dom.fs.minimize.title = 'Exit fullscreen';
		self.dom.fs.hangup.className = 'icon-webrtc-hangup';
		iwc.className = 'icon-webrtc-cont';
		iwc.appendChild(self.dom.fs.video);
		iwc.appendChild(self.dom.fs.audio);
		iwc.appendChild(self.dom.fs.minimize);
		iwc.appendChild(self.dom.fs.hangup);
		iwc.appendChild(self.dom.fs.share);
		var callContainerIcons = document.createElement('div');
		callContainerIcons.className = 'callContainerIcons noSelection';
		self.dom.callContainerContent.appendChild(callContainerIcons);
		self.dom.callIcon.onclick = self.offerCall;
		self.dom.callIcon.className = 'icon-phone-circled';
		self.dom.audioStatusIcon.className = 'icon-mic';
		self.dom.videoStatusIcon.className = 'icon-videocam';

		var enterFullScreenHolder = document.createElement('div');
		enterFullScreenHolder.className = 'enterFullScreenHolder';
		self.dom.fs.enterFullScreen.className = 'icon-webrtc-fullscreen';
		self.dom.fs.enterFullScreen.title = 'Fullscreen';
		enterFullScreenHolder.appendChild(self.dom.fs.enterFullScreen);

		self.dom.hangUpHolder.className = 'hangUpHolder ' + CssUtils.visibilityClass;
		self.dom.hangUpHolder.appendChild(self.dom.hangUpIcon);
		self.dom.hangUpIcon.className = 'icon-hang-up callActiveIcon';
		self.dom.hangUpIcon.title = 'Hang Up';
		self.dom.microphoneLevel.setAttribute("max", "15");
		self.dom.microphoneLevel.setAttribute("value", "0");
		self.dom.microphoneLevel.setAttribute("title", "Your microphone level");
		self.dom.microphoneLevel.className = 'microphoneLevel';
		self.dom.shareScreen.className = 'icon-desktop';
		self.dom.settings.className = 'icon-cog';
		callContainerIcons.appendChild(self.dom.callIcon);
		callContainerIcons.appendChild(self.dom.audioStatusIcon);
		callContainerIcons.appendChild(self.dom.videoStatusIcon);
		callContainerIcons.appendChild(self.dom.shareScreen);
		callContainerIcons.appendChild(self.dom.settings);
		callContainerIcons.appendChild(enterFullScreenHolder);
		callContainerIcons.appendChild(self.dom.hangUpHolder);
		callContainerIcons.appendChild(self.dom.microphoneLevel);
		self.setAudio(true);
		self.setVideo(false);
		self.setDesktopCapture(false);
		self.autoSetLocalVideoVisibility();
	};
	self.autoSetLocalVideoVisibility = function() {
		CssUtils.setVisibility(self.dom.local, self.constraints.video || self.constraints.share);
	}
	self.init = function () {
		self.renderDom();
		self.attachDomEvents();
	};
	self.testSound = function () {
		if (chatTestVolume.setSinkId) {
			chatTestVolume.setSinkId(self.dom.speakers.value);
			chatTestVolume.pause();
			chatTestVolume.currentTime = 0;
			chatTestVolume.volume = 1;
			var prom = chatTestVolume.play();
			prom && prom.catch(function (e) {
			});
		} else {
			growlError("Your browser doesn't support changing output channel")
		}
	};
	self.speakerChanged = function() {
		for (var pcName in self.peerConnections) {
			if (!self.peerConnections.hasOwnProperty(pcName)) continue;
			var v = self.peerConnections[pcName].dom.remote;
			if (v.setSinkId) {
				v.setSinkId(self.dom.speakers.value);
			} else {
				growlError('Changing output speaker is unsupported')
				return;
			}
		}
	};
	self.cameraChanged = function(e) {
			self.updateConnection();
	};
	self.microphoneChanged = function(e) {
			self.updateConnection();
	};
	self.updateConnection = function () {
		if (self.localStream && self.localStream.active || self.getCallStatus() == 'running') {
			self.captureInput(function (stream, success) {
				if (success) {
					self.stopLocalStream();
					self.attachLocalStream(stream);
					for (var pcName in self.peerConnections) {
						if (!self.peerConnections.hasOwnProperty(pcName)) continue;
						var abstrPc = self.peerConnections[pcName];
						var pc = abstrPc.pc;
						if (pc) {
							self.localStream && pc.removeStream(self.localStream);
							pc.addStream(stream);
							abstrPc.createOffer();
						}
					}
				} else {
					self.destroyStreamData(stream);
					self.setCallIconsState();
				}
			}, true);
		}
	};
	self.inflateDevices = function (devices) {
		var n, k , c = 0;
		var values = {};
		var types = ['microphones', 'cameras', 'speakers'];
		types.forEach(function(t) {
			values[t] = self.dom[t].value
		});
		CssUtils.deleteChildren(self.dom.microphones);
		CssUtils.deleteChildren(self.dom.speakers);
		CssUtils.deleteChildren(self.dom.cameras);
		if (devices) {
			devices.forEach(function (device) {
				if (["audioinput", "audiooutput", "videoinput"].indexOf(device.kind)>= 0) {
					var option = document.createElement('option');
					option.value = device.deviceId;
				} else {
					self.logErr("Unexpected device {}", device.kind)();
				}
				switch (device.kind) {
					case "audioinput":
						option.textContent = device.label || 'Microphone ' + (++n);
						self.dom.microphones.appendChild(option);
						break;
					case "audiooutput":
						option.textContent = device.label || 'Speaker ' + (++k);
						self.dom.speakers.appendChild(option);
						break;
					case "videoinput":
						option.textContent = device.label || 'Camera ' + (++c);
						self.dom.cameras.appendChild(option);
						break;
				}
			})
		}
		['microphones', 'cameras', 'speakers'].forEach(function (d) {
			var el = self.dom[d];
			var holder = self.dom[d+'Holder'];
			if (values[d]) {
					el.value = values[d];
			}
			CssUtils.setVisibility(holder, el.children.length > 0);
		})
	};
	self.getDesktopShareFromExtension = function() {
		return new Promise(function (res, rej) {
			var message;
			if (!isChrome) {
				rej("ScreenCast feature is only available from chrome atm")
			} else if (isMobile) {
				rej("ScreenCast is not available for mobile phones yet")
			} else {
				Utils.pingExtension(function (success) {
					self.log("Ping to extension succeeded")();
					if (success) {
						Utils.getDesktopCapture(function (response) {
							if (response && response.data === 'success') {
								self.log("Getting desktop share succeeded")();
								self.constraints.share = {
									audio: false,
									video: {
										mandatory: {
											chromeMediaSource: 'desktop',
											chromeMediaSourceId: response.streamId,
											maxWidth: window.screen.width,
											maxHeight: window.screen.height
										}
									}
								}
								res();
							} else {
								rej("Failed to capture desktop stream");
							}
						})
					} else {
						rej({rawError: 'To share your screen you need chrome extension.<b> <a href="' + CHROME_EXTENSION_URL + '" target="_blank">Click to install</a></b>'});
					}
				})
			}
			return true;
		});
	};
	self.destroyStreamData = function (endStream) {
		if (endStream) {
			var tracks = endStream.getTracks();
			for (var i = 0; i < tracks.length; i++) {
				tracks[i].stop()
			}
		}
	}
	self.captureInput = function (callback) {
		var prom = Promise.resolve(false);
		var endStream;
		if (self.constraints.audio || self.constraints.video) {
			var audio = !!self.constraints.audio
			if (self.dom.microphones.value && audio) {
				audio = {deviceId: self.dom.microphones.value};
			}
			var video = !!self.constraints.video; // convert null to bolean, if we pass null to getUserMedia it tries to capture
			if (self.dom.cameras.value && video) {
				video = {deviceId: self.dom.cameras.value};
			}
			prom = prom.then(function() {
				return navigator.mediaDevices.getUserMedia({audio: audio, video: video});
			}).then(function(stream) {
				endStream = stream;
				if (navigator.mediaDevices.enumerateDevices) {
					return navigator.mediaDevices.enumerateDevices();
				} else {
					return false;
				}
			}).then(self.inflateDevices);
		}
		if (self.constraints.share) {
			prom = prom.then(self.getDesktopShareFromExtension).then(function () {
				self.log("Resolving userMedia from dekstopShare")();
				return navigator.mediaDevices.getUserMedia(self.constraints.share)
			}).then(function (stream) {
				var tracks = stream.getVideoTracks();
				if (!(tracks && tracks.length > 0)) {
					throw "No video tracks from captured screen";
				}
				tracks[0].isShare = true;
				if (endStream) {
						endStream.addTrack(tracks[0]);
				} else {
					endStream = stream;
				}
			})
		}
		prom.then(function () {
			callback(endStream, true);
		}).catch(function (e) {
			self.onFailedCaptureSource.apply(self, arguments);
			callback(endStream, false);
		});
	};
	self.attachLocalStream = function (stream) {
		if (stream) {
			self.log("Local stream has been attached")();
			self.localStream = stream;
			Utils.setVideoSource(self.dom.local, stream);
			self.audioProcessor = Utils.createMicrophoneLevelVoice(stream, self.processAudio);
		}
		self.setCallIconsState();
	};
	self.setCallIconsState = function () {
		var videoTrack = self.getTrack('video');
		self.setVideo(videoTrack && videoTrack.enabled);
		var audioTrack = self.getTrack('audio');
		self.setAudio(audioTrack && audioTrack.enabled);
			self.setDesktopCapture(self.getTrack('share') != null);
			self.autoSetLocalVideoVisibility();
		}
	self.processAudio = function (audioProc) {
		return function () {
			if (!self.constraints.audio) {
				return;
			}
			var value = Utils.getAverageAudioLevel(audioProc);
			audioProc.prevVolumeValues += value;
			audioProc.volumeValuesCount++;
			if (audioProc.volumeValuesCount == 100 && audioProc.prevVolumeValues == 0) {
				self.showNoMicError();
			}
			self.dom.microphoneLevel.value = Math.sqrt(value);
		}
	};
	self.onFailedCaptureSource = function () {
		var what = [];
		if (self.constraints.audio) {
			what.push('audio');
		}
		if (self.constraints.audio) {
			what.push('video');
		}
		if (self.constraints.share) {
			what.push('screenshare');
		}
		var message = "<span>Failed to capture {} source, because {}</span>".format(what.join(', '), Utils.extractError(arguments));
		growlError(message);
		self.logErr(message)();
	};
	self.setHeaderText = function (text) {
		self.dom.headerText.innerHTML = text;
	};
	self.offerCall = function () {
		self.setHeaderText("Confirm browser to use your input devices for call");
		self.captureInput(function (stream, success) {
			if (success) {
				self.attachLocalStream(stream);
				self.setIconState(true);
				self.setCallStatus('sent_offer');
				self.setHeaderText("Establishing connection with room #{}".format(self.roomId));
				var id = webRtcApi.addCallHandler(self);
				self.sendOffer(id);
				self.setTimeout();
				self.setNoAnswerTimeout();
			} else if (stream) {
				self.destroyStreamData(stream);
			}
		});
	};
	self.show = function () {
		self.visible = true;
		CssUtils.showElement(self.dom.callContainerContent);
	};
	self.hide = function () {
		CssUtils.hideElement(self.dom.callContainerContent);
	};
	self.toggle = function () {
		self.visible = !CssUtils.toggleVisibility(self.dom.callContainerContent);
	};
	self.restoreState = function () {
		CssUtils.setVisibility(self.dom.callContainerContent, self.visible);
	};
	self.showOffer = function (message, channelName) {
		var chatHandler = channelsHandler.channels[message.channel];

		self.callPopup = new CallPopup(self.answerWebRtcCall, self.videoAnswerWebRtcCall, self.hangUp, message.user, channelName, chatHandler.volume);
		if (chatHandler.notifications) {
			notifier.notify(message.user, {body: "Calls you", icon: NOTIFICATION_ICON_URL});
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
	self.getTrack = function (kind) {
		var track = null;
		var tracks = [];
		if (self.localStream) {
			if (kind == 'video' || kind == 'share') {
				tracks = self.localStream.getVideoTracks();
			} else if (kind == 'audio') {
				tracks = self.localStream.getAudioTracks();
			} else {
				throw 'invalid track name';
			}
			if (tracks.length > 0) {
				var isShare = tracks[0].isShare;
				if (isShare && kind == 'share') {
					track = tracks[0]
				} else if (!isShare && kind == 'video') {
					track = tracks[0]
				} else if (kind == 'audio') {
					track = tracks[0];
				}
			}
		}
		return track;
	};
	self.toggleInput = function (kind) {
		var track = self.getTrack(kind);
		var newValue = !self.constraints[kind];
		if (kind == 'video') {
			self.setVideo(newValue);
			if (newValue) {
				self.setDesktopCapture(false);
			}
		} else if (kind == 'audio') {
			self.setAudio(newValue);
		} else if (kind == 'share') {
			if (newValue) {
				self.setVideo(false);
			}
			self.setDesktopCapture(newValue);
		}
		if (track && track.readyState === 'live') {
			track.enabled = self.constraints[kind];
		} else {
			self.updateConnection();
		}
		self.autoSetLocalVideoVisibility();
	};
	self.toggleSettingsContainer = function () {
		CssUtils.toggleVisibility(self.dom.settingsContainer);
	};
	self.toggleVideo = function () {
		self.toggleInput('video');
	};
	self.toggleMic = function () {
		self.toggleInput('audio');
	};
	self.toggleShare = function() {
		self.toggleInput('share');
	};
	self.getSpeakerId = function() {
		return self.dom.speakers.value;
	}
	self.createCallPeerConnection = function (message) {
		var videoContainer = document.createElement('div');
		videoContainer.className = 'micVideoWrapper';
		self.dom.videoContainerForVideos.insertBefore(videoContainer, self.dom.videoContainerForVideos.firstChild);
		var PeerConnectionClass = message.opponentWsId > wsHandler.wsConnectionFullId ? CallSenderPeerConnection : CallReceiverPeerConnection;
		self.peerConnections[message.opponentWsId] = new PeerConnectionClass(
				message.connId,
				message.opponentWsId,
				self.removeChildPeerReference,
				videoContainer,
				self.onStreamAttached,
				message.user,
				self.getSpeakerId
		);
	};
	self.superRemoveChildPeerReference = self.removeChildPeerReference;
	self.removeChildPeerReference = function (id, reason) {
		self.superRemoveChildPeerReference(id);
		var index = self.acceptedPeers.indexOf(id);
		if (index > -1) { // remove
			self.acceptedPeers.splice(index, 1);
			self.log("Removed {} from acceptedPeers, current acceptedPeers are {}", id, self.acceptedPeers.toString())();
		}
		if (self.getCallStatus() == 'accepted') {
			if (self.callPopupTable[id]) {
				self.callPopupTable[id].textContent = 'Declined';
			}
		}
		if (Object.keys(self.peerConnections).length === 0) {
			self.log("All peer connections are gone, destroying CallHandler")();
			self.closeEvents(reason);
		}
	};
	self.onStreamAttached = function (opponentWsId) { // TODO this is called multiple times for each peer connection
		self.setHeaderText("Talking");
		self.setIconState(true);
		self.setCallStatus('in_proggress');
	};
	self.onreplyCall = function (message) {
		self.clearNoAnswerTimeout()
		self.createCallPeerConnection(message);
		if (self.callPopup) { // if we're not call initiator
			self.callPopupTable[message.opponentWsId] = self.callPopup.inserRow("To:", message.user);
		}
	};
	self.oncancelCallConnection = function (message) {
		if (self.callPopup) { // if we're not call initiator
			self.callPopupTable[message.opponentWsId] = self.callPopup.inserRow("Busy:", message.user);
		}
	};
	self.sendOffer = function (newId) {
		var messageRequest = {
			action: 'offerCall',
			channel: self.roomId,
			content: {browser: browserVersion},
			id: newId
		};
		wsHandler.sendToServer(messageRequest);
	};
	self.accept = function () {
		self.clearTimeout();
		self.callPopup.hide();
		self.setCallStatus('accepted');
		self.captureInput(function (stream) {
			self.attachLocalStream(stream);
			wsHandler.sendToServer({
				action: 'acceptCall',
				connId: self.connectionId
			})
			self.acceptedPeers.forEach(function (e) {
				if (self.peerConnections[e]) {
					self.peerConnections[e].connectToRemote(self.localStream);
					CssUtils.addClass(self.peerConnections[e].dom.remote, 'connected');
				} else {
					self.logErr("Unable to get pc with id {}, available peer connections are {}, accepted peers are {}",
							e, Object.keys(self.peerConnections), self.acceptedPeers.toString())();
				}
			});
		}, true);
		self.setIconState(true);
		channelsHandler.setActiveChannel(self.roomId);
		self.show(true);
		self.timeoutFunctionNoUsers = setTimeout(function () {
			if (self.getCallStatus() != 'running') {
				self.hangUp(null, "No call opponents found");
			}
		}, self.CALL_TIMEOUT_NO_USERS);
	};
	self.setTimeout = function () {
		self.log("Created no answers timeout")();
		self.timeoutFunnction = setTimeout(function () {
			self.log("Closing CallHandler by timeout")();
			self.hangUp(null, "Finishing the call because no one picked the phone");
		}, self.CALL_TIMEOUT_NO_ANSWER);
	};
	self.setNoAnswerTimeout = function () {
		self.log("Created no users timeout")();
		self.timeoutFunctionNoUsers = setTimeout(function () {
			self.log("Closing CallHandler because no users found")();
			self.hangUp(null, "Finishing the call because no one is online in this channel");
		}, self.CALL_TIMEOUT_NO_USERS);
	};
	self.clearTimeout = function () {
		if (self.timeoutFunnction) {
			self.log("Removed no answers timeout")();
			clearTimeout(self.timeoutFunnction);
			self.timeoutFunnction = null;
		}
		self.clearNoAnswerTimeout();
	};
	self.clearNoAnswerTimeout = function() {
		if (self.timeoutFunctionNoUsers) {
			self.log("Removed no users timeout")();
			clearTimeout(self.timeoutFunctionNoUsers);
			self.timeoutFunctionNoUsers = null;
		}
	}
	self.initAndDisplayOffer = function (message, channelName) {
		self.setCallStatus('received_offer');
		self.setTimeout();
		self.connectionId = message.connId;
		self.log("CallHandler initialized")();
		wsHandler.sendToServer({
			action: 'replyCall',
			connId: message.connId,
			content: {browser: browserVersion}
		});
		self.acceptedPeers.push(message.opponentWsId);
		self.createCallPeerConnection(message);
		self.showOffer(message, channelName);
	};
	self.onacceptCall = function (message) {
		if (self.getCallStatus() != 'received_offer') {
			self.clearTimeout(); // if we're call initiator
			var pc = self.peerConnections[message.opponentWsId];
			CssUtils.addClass(pc.dom.remote, 'connected');
			pc.connectToRemote(self.localStream);
			if (pc.sendRtcDataQueue.length > 0) {
				self.log("Connection accepted, consuming sendRtcDataQueue")();
				var queue = pc.sendRtcDataQueue;
				pc.sendRtcDataQueue = [];
				queue.forEach(pc.onsendRtcData);
			}
		} else {
			self.callPopupTable[message.opponentWsId].textContent = 'Talking:';
			self.acceptedPeers.push(message.opponentWsId);
		}
	};
	self.hangUp = function (e, reason) {
		self.clearTimeout();
		reason = reason || "Call is finished.";
		var wereConn = self.closeAllPeerConnections(reason);
		if (!wereConn) { // last peerConnection will call self.closeEvents
			// if there were no any - we call it manually
			self.closeEvents(reason)
		}
	};

	self.stopLocalStream = function() {
		self.destroyAudioProcessor();
		if (self.localStream) {
			var tracks = self.localStream.getTracks();
			for (var i = 0; i < tracks.length; i++) {
				tracks[i].stop()
			}
		}
		Utils.stopDesktopCapture();
	};
	self.closeEvents = function (text) {
		if (text) {
			growlInfo(text)
		}
		if (self.callPopup) {
			self.callPopup.closeEvents();
			self.callPopup.hide();
		}
		// if somebody sent us destroyConnection event, b4 timeout fired
		self.clearTimeout();
		self.setIconState(false);
		self.setCallStatus('closed');
		self.callPopupTable = {};
		webRtcApi.removeChildReference(self.connectionId);
		self.dom.microphoneLevel.value = 0;
		self.exitFullScreen();
		Utils.detachVideoSource(self.dom.local);
		self.setHeaderText("Call finished");
		self.stopLocalStream();
		self.decline();
	};
	self.destroyAudioProcessor = function() {
		if (self.audioProcessor && self.audioProcessor.javascriptNode && self.audioProcessor.javascriptNode.onaudioprocess) {
			self.log("Removing local audioproc")();
			self.audioProcessor.javascriptNode.onaudioprocess = null;
		}
	};
	self.onExitFullScreen = function () {
		if (!(document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement)) {
			CssUtils.removeClass(self.dom.videoContainer, 'fullscreen');
			document.removeEventListener('mousemove', self.fsMouseMove, false);
			clearInterval(self.hideContainerTimeoutRes);
			self.dom.videoContainer.ondblclick = self.enterFullScreenMode;
		}
	};
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
		self.dom.videoContainer.removeEventListener('dblclick', self.enterFullScreenMode);
		self.dom.videoContainer.requestFullscreen();
		CssUtils.addClass(self.dom.videoContainer, 'fullscreen');
		document.addEventListener('mousemove', self.fsMouseMove, false);
		if (!isMobile) {
			self.hideContainerTimeoutRes = setInterval(self.hideContainerTimeout, 1000);
		}
		/*to clear only function from resultOf setInterval should be passed, otherwise doesn't work*/
	};
	self.fsMouseMove = function () {
		if (self.idleTime > 0) {
			CssUtils.removeClass(self.dom.videoContainer, 'inactive');
		}
		self.idleTime = 0;
	};
	self.decline = function () {
		wsHandler.sendToServer({
			content: 'decline',
			action: 'destroyCallConnection',
			connId: self.connectionId
		});
	};
	self.init();
}

function FileTransferHandler(removeReferenceFn) {
	var self = this;
	BaseTransferHandler.call(self, removeReferenceFn);
	Draggable.call(self, document.createElement('DIV'), "File transfer");
	self.closeWindowClick = function () {
		self.decline();
		self.closeAllPeerConnections();
		self.removeReference();
	};
	self.dom.fileInfo = document.createElement('table');
	self.init = function () {
		self.dom.fileInfo.className = 'table';
		document.querySelector('body').appendChild(self.dom.container);
		CssUtils.addClass(self.dom.body, 'transferFile');
		self.dom.iconCancel.onclick = self.noAction;
		self.insertData('Name:', self.fileName);
		self.insertData('Size:', bytesToSize(self.fileSize));
		self.dom.body.appendChild(self.dom.fileInfo);
	};
	self.insertData = function (name, value) {
		var raw = self.dom.fileInfo.insertRow();
		var th = document.createElement('th');
		raw.appendChild(th);
		th.textContent = name;
		var valueField = raw.insertCell();
		valueField.textContent = value;
		return valueField;
	};
	self.noAction = function () {
		self.closeWindowClick();
		self.destroy();
	};
	self.decline = function () {
		wsHandler.sendToServer({
			content: 'decline',
			action: 'destroyFileConnection',
			connId: self.connectionId
		});
	};
}


function FileReceiver(removeReferenceFn) {
	var self = this;
	FileTransferHandler.call(self, removeReferenceFn);
	self.showOffer = function (message) {
		self.fileSize = parseInt(message.content.size);
		self.fileName = message.content.name;
		self.opponentName = message.user;
		var chatHanlder = channelsHandler.channels[message.channel];
		if (chatHanlder.notifications) {
			notifier.notify(message.user, {
				body: "Sends file {}".format(self.fileName),
				icon: NOTIFICATION_ICON_URL,
				requireInteraction: true
			});
		}
		if (window.incomingFileCallSound) {
				Utils.checkAndPlay(chatFileAudio, chatHanlder.volume);
		}
		self.init();
		self.insertData("From:", self.opponentName);
		self.setHeaderText("{} sends {}".format(self.opponentName, self.fileName));
		self.dom.connectionStatus = self.insertData('Status:', 'Received an offer');
		self.addYesNo();
	};
	self.yesAction = function () {
		self.hideButtons();
		self.acceptFileReply();
	};
	self.hideButtons = function () {
		if (self.dom.yesNoHolder) {
			CssUtils.hideElement(self.dom.yesNoHolder)
		}
	};
	self.addYesNo = function () {
		self.dom.yesNoHolder = document.createElement('DIV');
		self.dom.yes = document.createElement('INPUT');
		self.dom.no = document.createElement('INPUT');
		self.dom.body.appendChild(self.dom.yesNoHolder);
		self.dom.yesNoHolder.appendChild(self.dom.yes);
		self.dom.yesNoHolder.appendChild(self.dom.no);
		self.dom.yesNoHolder.className = 'yesNo';
		self.dom.yes.onclick = self.yesAction;
		self.dom.no.onclick = self.noAction;
		self.dom.yes.setAttribute('type', 'button');
		self.dom.no.setAttribute('type', 'button');
		self.dom.yes.setAttribute('value', 'Accept');
		self.dom.no.setAttribute('value', 'Decline');
		self.fixInputs();
	};
	self.sendErrorFSApi = function () {
		var bsize = bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API);
		wsHandler.sendToServer({
			action: 'destroyFileConnection',
			connId: self.connectionId,
			content: "User's browser doesn't support accepting files over {}"
					.format(bsize)
		});
	};
	self.acceptFileReply = function () {
		if (self.fileSize > MAX_ACCEPT_FILE_SIZE_WO_FS_API && !requestFileSystem) {
			self.sendErrorFSApi();
			growlError("Your browser doesn't support receiving files over {}".format(bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)))
		} else {
			self.peerConnections[self.offerOpponentWsId] = new FileReceiverPeerConnection(
					self.connectionId,
					self.offerOpponentWsId,
					self.fileName,
					self.fileSize,
					self.removeChildPeerReference
			);
			var div = document.createElement("DIV");
			self.dom.body.appendChild(div);
			var db = new DownloadBar(div, self.fileSize, self.dom.connectionStatus);
			self.peerConnections[self.offerOpponentWsId].setDownloadBar(db); // should be before initFileSystemApi
			self.peerConnections[self.offerOpponentWsId].initFileSystemApi(self.sendAccessFileSuccess);
		}
	};
	self.sendAccessFileSuccess = function (fileSystemSucess) {
		if (fileSystemSucess || self.fileSize < MAX_ACCEPT_FILE_SIZE_WO_FS_API) {
			self.peerConnections[self.offerOpponentWsId].waitForAnswer();
			wsHandler.sendToServer({
				action: 'acceptFile',
				connId: self.connectionId,
				content: {received: 0}
			});
		} else {
			self.sendErrorFSApi();
			self.peerConnections[self.offerOpponentWsId].ondestroyFileConnection("Browser doesn't support acepting file sizes over {}".format(bytesToSize(MAX_ACCEPT_FILE_SIZE_WO_FS_API)));
		}
	};
	self.ondestroyFileConnection = function (message) {
		if (self.peerConnections[message.opponentWsId]) {
			self.peerConnections[message.opponentWsId].ondestroyFileConnection(message);
		} else {
			self.hideButtons();
			self.dom.connectionStatus.textContent = "Opponent declined sending";
		}
	};

	self.initAndDisplayOffer = function (message) {
		self.connectionId = message.connId;
		self.log("initAndDisplayOffer file")();
		self.offerOpponentWsId = message.opponentWsId;
		wsHandler.sendToServer({
			action: 'replyFile',
			connId: message.connId,
			content: {browser: browserVersion}
		});
		self.showOffer(message);
	};
}

function FileSender(removeReferenceFn, file) {
	var self = this;
	self.file = file;
	FileTransferHandler.call(self, removeReferenceFn);
	self.sendOffer = function (quedId, currentActiveChannel) {
		//self.dom.fileInput.disabled = true;
		self.fileName = self.file.name;
		self.fileSize = self.file.size;
		self.setHeaderText("Sending {}".format(self.fileName));
		var messageRequest = {
			action: 'offerFile',
			channel: currentActiveChannel,
			id: quedId,
			content: {
				browser: browserVersion,
				name: self.fileName,
				size: self.fileSize
			}
		};
		wsHandler.sendToServer(messageRequest);
		self.init();
	};
	self.onreplyFile = function (message) {
		self.peerConnections[message.opponentWsId] = new FileSenderPeerConnection(message.connId, message.opponentWsId, self.file, self.removeChildPeerReference);
		var retry = document.createElement('i');
		retry.className = 'icon-repeat ' + CssUtils.visibilityClass;
		var div = document.createElement("DIV");
		var status = self.insertData('To {}:'.format(message.user), 'Waiting to accept');
		var raw = self.dom.fileInfo.insertRow();
		var valueField = raw.insertCell();
		valueField.setAttribute('colspan', 2);
		var holder = document.createElement('div');
		holder.appendChild(retry);
		holder.appendChild(div);
		valueField.appendChild(holder);
		holder.className = 'dbRetrHolder';
		retry.title = 'Try to restore download'
		var downloadBar = new DownloadBar(div, self.fileSize, status);
		self.peerConnections[message.opponentWsId].setDownloadBar(downloadBar);
		self.peerConnections[message.opponentWsId].setRetryBtn(retry);
	};
	self.ondestroyFileConnection = function (message) {
		self.peerConnections[message.opponentWsId].ondestroyFileConnection(message);
	};
}


function FilePeerConnection() {
	var self = this;
	self.SEND_CHUNK_SIZE = 16384;
	self.READ_CHUNK_SIZE = self.SEND_CHUNK_SIZE * 64; // 1MB per file chunk
	self.MAX_BUFFER_SIZE = 256;
	self.receivedSize = 0;
	self.sdpConstraints = {};
	self.oniceconnectionstatechange = function () {
		if (self.pc.iceConnectionState === 'disconnected') {
			self.closeEvents();
			self.downloadBar.setStatus("Error: Connection has been lost")
		}
	};
	self.setDownloadBar = function (db) {
		self.downloadBar = db;
	};
	self.ondestroyFileConnection = function () {
		self.removeChildPeerReference(self.opponentWsId);
		self.closeEvents();
	};
	self.onsetError = function (message) {
		if (self.downloadBar) {
			self.downloadBar.setStatus(message.content);
			self.downloadBar.setError();
		} else {
			self.log("Setting status to '{}' failed", message.content)();
		}
	};
	self.setTranseferdAmount = function (value) {
		var now = Date.now();
		var timeDiff = now - self.lastMonitored;
		if (timeDiff > 1000) {
			var speed = (value - self.lastMonitoredValue) / timeDiff * 1000
			self.lastMonitoredValue = value;
			self.lastMonitored = now;
			self.downloadBar.setStatus('{}/{} ({}/s)'.format(
					bytesToSize(value),
					bytesToSize(self.fileSize),
					bytesToSize(speed)
			));
		}

		self.downloadBar.setValue(value);
	};
	self.closeEvents = function () {
		self.closePeerConnection();
		if (self.sendChannel && self.sendChannel.readyState !== 'closed') {
			self.log("Closing chanel")();
			self.sendChannel.close();
		} else {
			self.log("No channels to close")();
		}
	}
}

function FileReceiverPeerConnection(connectionId, opponentWsId, fileName, fileSize, removeChildPeerReferenceFn) {
	var self = this;
	self.connectedToRemote = true;
	self.fileSize = fileSize;
	self.fileName = fileName;
	self.blobsQueue = [];
	self.recevedUsingFile = false;
	self.receiveBuffer = [];
	FilePeerConnection.call(self);
	ReceiverPeerConnection.call(self, connectionId, opponentWsId, removeChildPeerReferenceFn);
	self.log("Created FileReceiverPeerConnection")();
	self.superGotReceiveChannel = self.gotReceiveChannel;
	self.gotReceiveChannel = function (event) {
		self.superGotReceiveChannel(event);
	};
	self.superOnDestroyFileConnection = self.ondestroyFileConnection;
	self.ondestroyFileConnection = function (data) {
		self.superOnDestroyFileConnection(data);
		self.downloadBar.setStatus(typeof data == 'string' ? data : "Error: Opponent closed connection");
		self.downloadBar.setError();
	};
	self.onretryFile = function() {
		self.waitForAnswer();
		wsHandler.sendToServer({
			action: 'acceptFile',
			connId: self.connectionId,
			content: {received: self.receivedSize}
		});
	}
	self.assembleFileIfDone = function () {
		if (self.isDone()) {
			var received = self.recevedUsingFile ? self.fileEntry.toURL() : URL.createObjectURL(new window.Blob(self.receiveBuffer));
			self.log("File is received")();
			wsHandler.sendToServer({
				content: 'success',
				action: 'destroyFileConnection',
				connId: self.connectionId,
				opponentWsId: self.opponentWsId
			});
			self.receiveBuffer = []; //clear buffer
			self.receivedSize = 0;
			self.downloadBar.getAnchor().href = received;
			self.downloadBar.getAnchor().download = self.fileName;
			self.downloadBar.setStatus("Received");
			self.downloadBar.setSuccess();
			self.downloadBar.getAnchor().textContent = 'Save';
			self.closeEvents();
		}
	};
	self.isDone = function () {
		return self.receivedSize === self.fileSize;
	};
	self.initFileSystemApi = function (cb) {
		self.log("Creating temp location {}", bytesToSize(self.fileSize))();
		if (requestFileSystem) {
			requestFileSystem(window.TEMPORARY, self.fileSize, function (fs) {
				fs.root.getFile(self.connectionId, {create: true}, function (fileEntry) {
					self.fileEntry = fileEntry;
					self.fileEntry.createWriter(function (fileWriter) {
						self.fileWriter = fileWriter;
						self.fileWriter.WRITING = 1;
						self.fileWriter.onwriteend = self.onWriteEnd;
						self.log("FileWriter is created")();
						cb(true);
					}, self.fileSystemErr(1, cb, fs));

				}, self.fileSystemErr(2, cb, fs))
			}, self.fileSystemErr(3, cb));
		} else {
			cb(false);
		}
	};
	self.onExceededQuota = function(fs) {
		var growl = new Growl("Can't accept file, because no space left on storage quota, click on this message to clear it. If you're accepting other files (even in other tabs) that will break their downloads", function () {
			fs.root.createReader().readEntries(function (entries) {
				entries.forEach(function (e) {
					function onRemove() {
						self.log("Removed {}", e.fullPath)();
					}
					if (e.isFile) {
						e.remove(onRemove);
					} else {
						e.removeRecursively(onRemove);
					}
				})
				growlInfo("Storage has been cleared");
			})
		});
		growl.showInfinity('col-error');
	}
	self.fileSystemErr = function (errN, cb, fs) {
		return function (e) {
			self.logErr("FileSystemApi Error {}: {}, code {}", errN, e.message || e, e.code)();
			if (fs && e.code == 22) {
				self.onExceededQuota(fs);
			} else {
				growlError("FileSystemApi Error: " + e.message || e.code || e);
			}
			cb(false);
		};
	};
	self.channelOpen = function () {
		self.lastMonitored = 0;
		self.lastMonitoredValue = 0;
		self.downloadBar.setStatus("Receiving file...");
	};
	self.superOnChannelMessage = self.onChannelMessage;
	self.onChannelMessage = function (event) {
		self.superOnChannelMessage(event);
		self.receiveBuffer.push(event.data);
		// chrome accepts bufferArray (.byteLength). firefox accepts blob (.size)
		var receivedSize = event.data.byteLength ? event.data.byteLength : event.data.size;
		self.receivedSize += receivedSize;
		self.syncBufferWithFs();
		self.setTranseferdAmount(self.receivedSize);
		self.assembleFileIfDone();
	};
	self.onWriteEnd = function () {
		if (self.blobsQueue.length > 0) {
			self.fileWriter.write(self.blobsQueue.shift());
		} else {
			self.assembleFileIfDone();
		}
	};
	self.syncBufferWithFs = function () {
		if (self.fileWriter && (self.receiveBuffer.length > self.MAX_BUFFER_SIZE || self.isDone())) {
			self.recevedUsingFile = true;
			var blob = new window.Blob(self.receiveBuffer);
			self.receiveBuffer = [];
			if (self.fileWriter.readyState == self.fileWriter.WRITING) {
				self.blobsQueue.push(blob);
			} else {
				self.fileWriter.write(blob);
			}
		}
	};
	self.waitForAnswer = function () {
		self.createPeerConnection();
		self.log("Waiting for rtc datachannels.")();
		self.pc.ondatachannel = self.gotReceiveChannel;
		self.downloadBar.setStatus("Establishing connection");
	};
	self.gotReceiveChannel = function (event) {
		self.log('Received new channel')();
		self.sendChannel = event.channel;
		self.sendChannel.onmessage = self.onChannelMessage;
		self.sendChannel.onopen = self.channelOpen;
		//self.sendChannel.onclose = self.print;
	};
}

function FileSenderPeerConnection(connectionId, opponentWsId, file, removeChildPeerReferenceFn) {
	var self = this;
	FilePeerConnection.call(self);
	self.file = file;
	self.connectedToRemote = true;
	self.fileName = file.name;
	self.fileSize = file.size;
	self.offset = 0;
	SenderPeerConnection.call(self, connectionId, opponentWsId, removeChildPeerReferenceFn);
	self.sendChannel = null;
	self.log("Created FileSenderPeerConnection")();
	self.onfileAccepted = function (message) {
		self.log("Transfer file {} result : {}", self.fileName, message.content)();
		self.downloadBar.setStatus("Transferred");
		self.downloadBar.setSuccess();
		self.closeEvents();
	};
	self.setRetryBtn = function(btn) {
		self.retryBtn = btn;
		self.retryBtn.onclick = self.retrySend;
	}
	self.retrySend = function() {
		wsHandler.sendPreventDuplicates({
			action: 'retryFile',
			connId: self.connectionId,
			opponentWsId: self.opponentWsId
		});
	};
	self.superOnDestroyFileConnection = self.ondestroyFileConnection;
	self.ondestroyFileConnection = function (data) {
		self.superOnDestroyFileConnection();
		if (data.content === 'success') {
			self.downloadBar.setValue(self.fileSize); // we set value last time
			self.downloadBar.setStatus("File transferred");
			self.downloadBar.setSuccess();

		} else {
			var errorMessage;
			if (data.content == 'decline') {
				errorMessage = "Declined by opponent";
			} else if (data.content) {
				errorMessage = data.content
			} else {
				errorMessage = "Connection error";
			}
			self.downloadBar.setStatus(errorMessage);
			self.downloadBar.setError();
		}
	};
	self.onreceiveChannelOpen = function () {
		self.log('Channel is open, slicing file: {} {} {} {}', self.fileName, bytesToSize(self.fileSize), self.file.type, getDay(self.file.lastModifiedDate))();
		if (self.fileSize === 0) {
			self.downloadBar.setStatus("Can't send empty file");
			self.downloadBar.setError();
			self.closeEvents("Can't send empty file");
		} else {
			self.downloadBar.setStatus("Sending file...");
			self.reader = new window.FileReader();
			self.reader.onload = self.onFileReaderLoad;
			self.sendCurrentSlice();
			self.lastPrinted = 0;
			self.lastMonitored = 0;
			self.lastMonitoredValue = 0;
		}
	};
	self.sendCurrentSlice = function () {
		var currentSlice = self.file.slice(self.offset, self.offset + self.READ_CHUNK_SIZE);
		self.reader.readAsArrayBuffer(currentSlice);
	};
	self.logTransferProgress = function () {
		var now = Date.now();
		if (now - self.lastPrinted > 1000) {
			self.lastPrinted = now;
			return self.log.apply(self, arguments);
		} else {
			return function () {
			};
		}
	};
	self.onFileReaderLoad = function (e) {
		if (e.target.result.byteLength > 0 ) {
			self.sendData(e.target.result, 0, function() {
				self.offset += e.target.result.byteLength;
				self.sendCurrentSlice();
			});
		} else {
			function trackTransfer() {
				if (self.sendChannel.readyState === 'open' && self.sendChannel.bufferedAmount > 0) {
					self.downloadBar.setValue(self.offset - self.sendChannel.bufferedAmount);
					setTimeout(trackTransfer, 500);
				} else if (self.sendChannel.bufferedAmount == 0) {
						self.downloadBar.setValue(self.offset);
				}
			}
			trackTransfer();
			self.log("Exiting, offset is {} now, fs: {}", self.offset, self.fileSize)();
		}
	}
	self.sendData = function(data, offset, cb) {
		try {
			if (self.sendChannel.readyState === 'open') {
				if (self.sendChannel.bufferedAmount > 10000000) { // prevent chrome buffer overfill
					// if it happens chrome will just close the datachannel
					self.logTransferProgress("Buffer overflow by {}bytes, waiting to flush...",
							bytesToSize(self.sendChannel.bufferedAmount))();
					return window.setTimeout(self.sendData, 100, data, offset, cb);
				} else {
					var buffer = data.slice(offset, offset + self.SEND_CHUNK_SIZE);
					self.sendChannel.send(buffer);
					var chunkOffset = offset + buffer.byteLength;
					self.setTranseferdAmount(self.offset + chunkOffset - self.sendChannel.bufferedAmount);
					if (data.byteLength > chunkOffset) {
						self.sendData(data, chunkOffset, cb);
					} else {
						cb();
					}
				}
			} else {
				throw 'sendChannel status is {} which is not equals to "open"'.format(self.sendChannel.readyState);
			}
		} catch (error) {
			CssUtils.showElement(self.retryBtn);
			self.downloadBar.setStatus("Error: Connection has been lost");
			self.downloadBar.setError();
			self.closeEvents("SendChannel is in status {} which is not opened".format(self.sendChannel.readyState));
			self.logErr(error)();
			growlError("Connection loss while sending file {} to user {}".format(self.fileName, self.receiverName));
		}
	};
	self.channelOpen = function () {
		self.downloadBar.setStatus("Sending a file");
	};
	self.onacceptFile = function (message) {
		self.offset = message.content.received;
		self.createPeerConnection();
		CssUtils.hideElement(self.retryBtn);
		self.downloadBar.start()
		try {
			// Reliable data channels not supported by Chrome
			self.sendChannel = self.pc.createDataChannel("sendDataChannel", {reliable: false});
			self.sendChannel.onopen = self.onreceiveChannelOpen;
			self.log("Created send data channel.")();
		} catch (e) {
			var error = "Failed to create data channel because {} ".format(e.message || e);
			growlError(error);
			self.logErr(error)();
		}
		self.createOffer();
	};
}


function CallSenderPeerConnection(connectionId,
											 wsOpponentId,
											 removeFromParentFn,
											 remoteVideo,
											 onStreamAttached,
											 userName,
											 getSpeakerId) {
	var self = this;
 self.connectedToRemote = false;
	SenderPeerConnection.call(self, connectionId, wsOpponentId, removeFromParentFn);
	CallPeerConnection.call(self, remoteVideo, userName, onStreamAttached, getSpeakerId);
	self.log("Created CallSenderPeerConnection")();
	self.connectToRemote = function (stream) {
   self.connectedToRemote = true;
		self.createPeerConnection(stream);
		self.createOffer();
	}
}


function CallReceiverPeerConnection(connectionId,
												wsOpponentId,
												removeFromParentFn,
												videoContainer,
												onStreamAttached,
												userName,
												getSpeakerId) {
	var self = this;
 self.connectedToRemote = false;
	ReceiverPeerConnection.call(self, connectionId, wsOpponentId, removeFromParentFn);
	CallPeerConnection.call(self, videoContainer, userName, onStreamAttached, getSpeakerId);
	self.log("Created CallReceiverPeerConnection")();
	self.connectToRemote = function (stream) {
   self.connectedToRemote = true;
		self.createPeerConnection(stream);
	}
}

function CallPeerConnection(videoContainer, userName, onStreamAttached, getSpeakerId) {
	var self = this;
	self.dom = {
		userSpan: document.createElement('span'),
		videoContainer: videoContainer,
		remote: document.createElement('video'),
		callVolume: document.createElement('input')
	};
	self.init = function () {
		self.dom.userSpan.textContent = userName;
		self.dom.videoContainer.appendChild(self.dom.remote);
		self.dom.callVolume.addEventListener('input', self.changeVolume);
		var colVolumeWrapper = document.createElement('div');
		self.dom.videoContainer.appendChild(colVolumeWrapper);
		colVolumeWrapper.appendChild(self.dom.callVolume);
		self.dom.videoContainer.appendChild(self.dom.userSpan);
		self.dom.callVolume.setAttribute("type", "range");
		self.dom.callVolume.setAttribute("value", "100");
		self.dom.callVolume.setAttribute("title", "Volume level");
		styleInputRange(self.dom.callVolume);
	};
	self.onsetError = function (message) {
		growlError(message.content)
	};
	self.changeVolume = function () {
		self.dom.remote.volume = self.dom.callVolume.value / 100;
	};
	self.sdpConstraints = {
		'mandatory': {
			'OfferToReceiveAudio': true,
			'OfferToReceiveVideo': true
		}
	};
	self.channelOpen = function () {
		self.log('Opened a new chanel')();
	};
	self.oniceconnectionstatechange = function () {
		if (self.pc.iceConnectionState === 'disconnected') {
			self.log("Created connection lost timeout")();
			self.timeoutedPeerConnectionDisconnected = setTimeout(function() {
				// give a chance destroyEvent to close connection first
				self.closeEvents('Connection has been lost');
			}, 1000)
		} else if (['completed', 'connected'].indexOf(self.pc.iceConnectionState) >= 0) {
			self.setConnectionStatus('running');
		}
	};
	self.createPeerConnectionParent = self.createPeerConnection;
	self.createPeerConnection = function (stream) {
		self.createPeerConnectionParent();
		self.pc.onaddstream = function (event) {
			self.log("onaddstream")();
			var p = Utils.setVideoSource(self.dom.remote, event.stream)
			if (p) { //firefox video.play doesn't return promise
				// chrome returns promise, if it's on mobile devices video sound would be muted
				// coz it initialized from network instead of user gesture
				p.catch(Utils.clickToPlay(self.dom.remote))
			}
			var speakerId = getSpeakerId();
			if (speakerId && self.dom.remote.setSinkId) {
				self.dom.remote.setSinkId(speakerId);
			}
			self.removeAudioProcessor();
			self.audioProcessor = Utils.createMicrophoneLevelVoice(event.stream, self.processAudio);
			onStreamAttached(self.opponentWsId);
		};
		stream && self.pc.addStream(stream);
	};
	self.processAudio = function (audioProc) {
		return function () {
			var level = Utils.getAverageAudioLevel(audioProc); //256 max
			var clasNu;
			if (level < 0.5) {
				clasNu = 0
			} else if (level < 5) {
				clasNu = 1;
			} else if (level < 12) {
				clasNu = 2;
			} else if (level < 25) {
				clasNu = 3;
			} else if (level < 50) {
				clasNu = 4;
			} else if (level < 90) {
				clasNu = 5
			} else if (level < 110) {
				clasNu = 6
			} else if (level < 140) {
				clasNu = 7
			} else if (level < 180) {
				clasNu = 8
			} else {
				clasNu = 9
			}
			self.dom.callVolume.className = 'vol-level-{}'.format(clasNu);
		};
	};
	self.removeAudioProcessor = function () {
		if (self.audioProcessor && self.audioProcessor.javascriptNode && self.audioProcessor.javascriptNode.onaudioprocess) {
			self.audioProcessor.javascriptNode.onaudioprocess = null;
			self.log("Removed remote audioProcessor")();
		}
	};
	self.closeEvents = function (reason) {
		if (self.timeoutedPeerConnectionDisconnected) {
			clearTimeout(self.timeoutedPeerConnectionDisconnected);
			self.timeoutedPeerConnectionDisconnected = null;
			self.log("Removing connections lost timeout")();
		}
		self.log('Destroying CallPeerConnection because', reason)();
		self.closePeerConnection();
		self.removeAudioProcessor();
		Utils.detachVideoSource(self.dom.remote);
		CssUtils.deleteElement(self.dom.videoContainer);
		self.removeChildPeerReference(self.opponentWsId, reason);
	};
	self.ondestroyCallConnection = function (message) {
		self.closeEvents("Opponent hang up");
	};
	self.init();
}

function WebRtcApi() {
	var self = this;
	self.dom = {
		webRtcFileIcon: webRtcFileIcon,
		fileInput: $('webRtcFileInput')
	};
	self.connections = {};
	self.quedConnections = {};
	var logger = {
		warn: loggerFactory.getLogger("WEBRTC", console.warn, 'color: #960055; font-weight: bold'),
		info: loggerFactory.getLogger("WEBRTC", console.log, 'color: #960055; font-weight: bold'),
		error: loggerFactory.getLogger("WEBRTC", console.error, 'color: #960055; font-weight: bold')
	}
	self.quedId = 0;
	self.clickFile = function () {
		self.dom.fileInput.value = null;
		self.dom.fileInput.click();
	};
	self.createQuedId = function () {
		return self.quedId++;
	};
	self.proxyHandler = function (data) {
		self.connections[data.connId]['on' + data.type](data);
	};
	self.onsetConnectionId = function (message) {
		var el = self.quedConnections[message.id];
		delete self.quedConnections[message.id];
		self.connections[message.connId] = el;
		el.setConnectionId(message.connId);
	};
	self.onofferFile = function (message) {
		var handler = new FileReceiver(self.removeChildReference);
		self.connections[message.connId] = handler;
		handler.initAndDisplayOffer(message);
	};
	self.onofferCall = function (message) {
		var chatHandler = channelsHandler.channels[message.channel];
		if (!chatHandler) {
			throw "Somebody tried to call you to nonexisted channel";
		}
		var handler = chatHandler.createCallHandler();
		if (handler) {
			self.connections[message.connId] = handler;
			handler.initAndDisplayOffer(message, chatHandler.roomName);
		} else {
			wsHandler.sendToServer({
				action: 'cancelCallConnection',
				connId: message.connId
			});
			growlInfo("User {} tried to call.".format(message.user));
		}
	};
	self.handle = function (data) {
		if (data.handler === 'webrtc') {
			self['on' + data.action](data);
		} else if (self.connections[data.connId]) {
			self.connections[data.connId].handle(data);
		} else {
			logger.error('Unable to handle "{}" because connection "{}" is unknown.' +
					' Available connections: "{}". Skipping message:',
					data.action, data.connId, Object.keys(self.connections))();
		}
	};
	self.addCallHandler = function (callHandler) {
		var newId = self.createQuedId();
		self.quedConnections[newId] = callHandler;
		return newId;
	};
	self.offerFile = function (file, channel) {
		var newId = self.createQuedId();
		self.quedConnections[newId] = new FileSender(self.removeChildReference, file);
		self.quedConnections[newId].sendOffer(newId, channel);
		return self.quedConnections[newId];
	};
	self.removeChildReference = function (id) {
		logger.info("Removing transferHandler with id {}", id)();
		delete self.connections[id];
	};
	self.attachEvents = function () {
		self.dom.webRtcFileIcon.onclick = self.clickFile;
		self.dom.fileInput.onchange = function () {
			self.offerFile(self.dom.fileInput.files[0], channelsHandler.activeChannel);
		};
	};
	self.attachEvents();
}


function WsHandler() {
	var self = this;
	self.messageId = 0;
	self.wsState = 0; // 0 - not inited, 1 - tried to connect but failed; 9 - connected;
	self.duplicates = {};
	self.log = loggerFactory.getLogger('WS', console.log, "color: green;");
	self.logWarn = loggerFactory.getLogger('WS', console.warn, "color: green;");
	self.logError = loggerFactory.getLogger('WS', console.error, "color: green;");
	self.logData = function(tag, obj, raw) {
		if (raw.length > 1000) {
			raw = ""
		}
		return loggerFactory.getLogger(tag, console.log, "color: green; font-weight: bold")("{} {}", raw, obj);
	};
	self.dom = {
		onlineStatus: $('onlineStatus'),
		onlineClass: 'online',
		offlineClass: OFFLINE_CLASS
	};
	self.progressInterval = {};
	self.wsConnectionId = '';
	self.handlers = {
		channels: channelsHandler,
		chat: channelsHandler,
		ws: self,
		webrtc: webRtcApi,
		webrtcTransfer: webRtcApi,
		peerConnection: webRtcApi,
		growl: {
			handle: function (message) {
				growlError(message.content);
			}
		}
	};
	self.handle = function (message) {
		self['on'+message.action](message);
	};
	self.onsetWsId = function(message) {
		self.wsConnectionId = message.content;
		self.wsConnectionFullId = message.opponentWsId;
		self.log("CONNECTION ID HAS BEEN SET TO {}, (full id is {})", self.wsConnectionId, self.wsConnectionFullId)();
	};
	self.onping = function(message) {
		self.log("Connection updated")();
	};
	self.onTimeout = function() {
		self.sendToServer({action: 'ping'}, true);
		self.intervalFunctionCalled++
		if (self.intervalFunctionCalled > 20) {
			self.startPing();
		}
	};
	self.onWsMessage = function (message) {
		var jsonData = message.data;
		var data;
		try {
			data = JSON.parse(jsonData);
			self.logData("WS_IN", data, jsonData)();
		} catch (e) {
			self.logError('Unable to parse incomming message {}', jsonData)();
			growlError("Unable to parse incoming message {}", e);
			return;
		}
		self.hideGrowlProgress(data.messageId);
		self.handleMessage(data);
		//cache some messages to localStorage save only after handle, in case of errors +  it changes the message,
	};
	self.handleMessage = function (data) {
		self.handlers[data.handler].handle(data);
	};
	self.sendToServer = function (messageRequest, skipGrowl) {
		self.messageId++;
		messageRequest.messageId = self.messageId;
		var jsonRequest = JSON.stringify(messageRequest);
		return self.sendRawTextToServer(jsonRequest, skipGrowl, messageRequest);
	};
	self.hideGrowlProgress = function (key) {
		var progInter = self.progressInterval[key];
		if (progInter) {
			self.log("Removing progressInterval {}", key)();
			progInter.growl.hide();
			if (progInter.interval) {
				clearInterval(progInter.interval);
			}
			delete self.progressInterval[key];
		}
	};
	self.displayProgress = function (length, messageId) {
		for (var k in self.progressInterval) {
			self.progressInterval[k].anotherAmount += length;
		}
		if (length > 300000) {
			var progressInterval = {};
			progressInterval.length = length;
			progressInterval.anotherAmount = 0;
			var div = document.createElement("DIV");
			progressInterval.text = document.createElement("span");
			var holder = document.createElement("holder");
			holder.appendChild(progressInterval.text);
			holder.appendChild(div);
			progressInterval.text.innerText = "Uploading message #{}...".format(messageId);
			var db = new DownloadBar(div, progressInterval.length);
			progressInterval.growl = new Growl(null, null, holder);
			var handler = function () {
				var ba = self.ws.bufferedAmount;
				var transferred = progressInterval.length - ba + progressInterval.anotherAmount;
				if (transferred < progressInterval.length) {
					db.setValue(transferred);
				} else {
					db.setValue(progressInterval.length);
					db.dom.text.textContent = "Message #{} is transferred".format(messageId);
					progressInterval.text.innerText = "Server is processing message #{}...".format(messageId);
					clearInterval(progressInterval.interval);
					progressInterval.interval = null;
				}
			};
			progressInterval.growl.showInfinity('');
			self.progressInterval[messageId] = progressInterval;
			progressInterval.interval = setInterval(handler, 200);
		}
	};
	self.isWsOpen = function() {
		return self.ws && self.ws.readyState === WebSocket.OPEN;
	};
	self.sendRawTextToServer = function(jsonRequest, skipGrowl, objData) {
		var logEntry = jsonRequest.substring(0, 500);
		if (!self.isWsOpen()) {
			if (!skipGrowl){
				growlError("Can't send message, because connection is lost :(");
			}
			self.logError("Web socket is closed. Can't send {}", logEntry)();
			return false;
		} else {
			self.logData("WS_OUT", objData, jsonRequest)();
			self.ws.send(jsonRequest);
			self.displayProgress(jsonRequest.length, objData.messageId);
			return true;
		}
	};
	self.sendPreventDuplicates = function (data, skipGrowl) {
		self.messageId++;
		data.messageId = self.messageId;
		var jsonRequest = JSON.stringify(data);
		if (!self.duplicates[jsonRequest]) {
			self.duplicates[jsonRequest] = Date.now();
			self.sendRawTextToServer(jsonRequest, skipGrowl, data)
			setTimeout(function () {
				delete self.duplicates[jsonRequest];
			}, 5000);
		} else {
			self.logWarn("blocked duplicate from sending: {}", jsonRequest)();
		}
	}
	self.setStatus = function (isOnline) {
		var statusClass = isOnline ? self.dom.onlineClass : self.dom.offlineClass;
		CssUtils.setOnOf(self.dom.onlineStatus, statusClass, [self.dom.onlineClass, self.dom.offlineClass]);
		self.dom.onlineStatus.title = isOnline ? "Websocket connection established. You are online" : "You are offline. Connecting to server..."
	};
	self.onWsClose = function (e) {
		self.setStatus(false);
		for (var k in self.progressInterval) {
			self.hideGrowlProgress(k);
		}
		var reason = e.reason || e;
		if (e.code === 403) {
			var message = "Server has forbidden request because '{}'".format(reason);
			growlError(message);
			self.logError('{}', message)();
		} else if (self.wsState === 0) {
			growlError("Can't establish connection with server");
			self.logError("Chat server is down because {}", reason)();
		} else if (self.wsState === 9) {
			growlError("Connection to chat server has been lost, because {}".format(reason));
			self.logError(
					'Connection to WebSocket has failed because "{}". Trying to reconnect every {}ms',
					e.reason, CONNECTION_RETRY_TIME)();
		}
		self.wsState = 1;
		// Try to reconnect in 10 seconds
		setTimeout(self.listenWS, CONNECTION_RETRY_TIME);
	};
	self.listenWS = function () {
		if (!window.WebSocket) {
			growlError(getText("Your browser ({}) doesn't support webSockets. Supported browsers: " +
					"Android, Chrome, Opera, Safari, IE11, Edge, Firefox", window.browserVersion));
			return;
		}
		self.ws = new WebSocket(API_URL + self.wsConnectionId);
		self.ws.onmessage = self.onWsMessage;
		self.ws.onclose = self.onWsClose;
		self.startPing = function () {
			if (self.intervalFunction) {
				clearInterval(self.intervalFunction);
				self.log("Clearead old ping interval and scheduled new one")();
			} else {
				self.log("Started ping interval")();
			}
			self.intervalFunctionCalled = 0;
			self.intervalFunction = setInterval(self.onTimeout, 60000); // Chrome timeout stops working afer some period of time
		}
		self.ws.onopen = function () {
			self.setStatus(true);
			var message = "Connection to server has been established";
			if (self.wsState === 1) { // if not inited don't growl message on page load
				growlSuccess(message);
			} else {
				//self.startPing();
			}
			self.wsState = 9;
			self.log(message)();
		};
	};

}

function Storage() {
	var self = this;
	self.STORAGE_NAME = 'main';
	self.cache = {}
	self.clearStorage = function () {
		localStorage.clear()
		var cookies = readCookie();
		for (var c in cookies) {
			if (!cookies.hasOwnProperty(c)) continue;
			if (!isNaN(c)) {
				Utils.deleteCookie(c);
			}
		}
		self.cache = readCookie();
	};
	self.getRoomHeaderId = function(roomId) {
		return self.cache[roomId];
	}
	self.setRoomHeaderId = function (roomId, value) {
		if (!self.cache[roomId] || value < self.cache[roomId]) {
			self.cache[roomId] = value;
			document.cookie = roomId + '=' + value;
		}
	}
}

var Utils = {
	videoFiles: {

	},
	previewFiles: {

	},
	imagesFiles: {

	},
	patterns: [
		{
			search: /(https?:&#x2F;&#x2F;.+?(?=\s+|<br>|&quot;|$))/g, /*http://anycharacter except end of text, <br> or space*/
			replace: '<a href="$1" target="_blank">$1</a>',
			name: "links"
		}, {
			search: /<a href="http(?:s?):&#x2F;&#x2F;(?:www\.)?youtu(?:be\.com&#x2F;watch\?v=|\.be\/)([\w\-\_]*)(?:[^"]*?\&amp\;t=([\w\-\_]*))?[^"]*" target="_blank">[^<]+<\/a>/g,
			replace: '<div class="youtube-player" data-id="$1" data-time="$2"><div><img src="https://i.ytimg.com/vi/$1/hqdefault.jpg"><div class="icon-youtube-play"></div></div></div>',
			name: 'youtube'
		},
		{
			search: /```(.+?)(?=```)```/g,
			replace: '<pre>$1</pre>',
			name: 'code'},
		{
			search: /(^\(\d\d:\d\d:\d\d\)\s[a-zA-Z-_0-9]{1,16}:)(.*)&gt;&gt;&gt;<br>/,
			replace: '<div class="quote"><span>$1</span>$2</div>',
			name: 'quote'
		}
	],
	volumeProportion: {
		0: 0,
		1: 0.15,
		2: 0.4,
		3: 1
	},
	volumeIcons: {
		0: 'icon-volume-off',
		1: 'icon-volume-1',
		2: 'icon-volume-2',
		3: 'icon-volume-3'
	},
	yotubeTimeRegex: /(?:(\d*)h)?(?:(\d*)m)?(?:(\d*)s)?(\d)?/,
	encodeP: function(p) {
		var content = p.getAttribute('content');
		var files = p.getAttribute('files');
		if (files) {
			files = JSON.parse(files);
		}
		var html = encodeHTML(content);
		html = Utils.encodeFiles(html, files);
		return smileyUtil.encodeSmileys(html);
	},
	encodeFiles: function (html, files) {
		if (files && Object.keys(files).length) {
			html = html.replace(imageUnicodeRegex, function (s) {
				var v = files[s];
				if (v) {
					if (v.type == 'i') {
						return "<img src=\'{}\' symbol=\'{}\' class=\'{}\'/>".format(v.url, s, PASTED_IMG_CLASS);
					} else if (v.type == 'v') {
						return "<div class='video-player' associatedVideo='{}'><div><img src='{}' symbol='{}' class='{}'/><div class=\"icon-youtube-play\"></div></div></div>".format(v.url, v.preview, s, PASTED_IMG_CLASS);
					} else {
						logger.error('Invalid type {}', v.type)();
					}
				}
				return s;
			});
		}
		return html;
	},
	encodeMessage: function (data) {
		if (data.giphy) {
			return '<div class="giphy"><img src="{0}" /><a class="giphy_hover" href="https://giphy.com/" target="_blank"/></div>'.formatPos(data.giphy);
		} else {
			var html = encodeHTML(data.content);
			var replaceElements = [];
			Utils.patterns.forEach(function (pattern) {
				var res = html.replace(pattern.search, pattern.replace);
				if (res !== html) {
					replaceElements.push(pattern.name);
					html = res;
				}
			});
			if (replaceElements.length) {
				logger.info("Replaced {} in message #{}", replaceElements.join(", "), data.id)();
			}
			html = Utils.encodeFiles(html, data.files);
			return smileyUtil.encodeSmileys(html);
		}
	},
	// dataURItoBlob: function (dataURI) {
	// 	// convert base64/URLEncoded data component to raw binary data held in a string
	// 	var byteString = dataURI.split(',')[0].indexOf('base64') >= 0 ? atob(dataURI.split(',')[1]) :unescape(dataURI.split(',')[1]);
	// 	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	// 	var ia = new Uint8Array(byteString.length);
	// 	for (var i = 0; i < byteString.length; i++) {
	// 		ia[i] = byteString.charCodeAt(i);
	// 	}
	// 	return new Blob([ia], {type: mimeString});
	// },
	placeCaretAtEnd: function () {
		var range = document.createRange();
		range.selectNodeContents(userMessage);
		range.collapse(false);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	},
	getTime: function (time) {
		var start = 0;
		if (time) {
			var res = Utils.yotubeTimeRegex.exec(time);
			if (res) {
				if (res[1]) {
					start += res[1] * 3600;
				}
				if (res[2]) {
					start += res[2] * 60;
				}
				if (res[3]) {
					start += parseInt(res[3]);
				}
				if (res[4]) {
					start += parseInt(res[4]);
				}
			}
		}
		return start;
	},
	setVideoEvent: function (e) {
		var r = e.querySelectorAll('.video-player');
		for (var i = 0; i < r.length; i++) {
			(function (e) {
				var querySelector = e.querySelector('.icon-youtube-play');
				var url = e.getAttribute('associatedVideo');
				logger.info("Embedding video url {}", url)();
				querySelector.onclick = function (event) {
					var video = document.createElement("video");
					video.setAttribute('controls', '');
					video.className = 'video-player-ready';
					logger.info("Replacing video url {}", url)();
					video.src = url;
					e.parentNode.replaceChild(video, e);
					video.play();
				}
			})(r[i]);
		}
	},
	setYoutubeEvent: function (e) {
		if (window.embeddedYoutube) {
			var r = e.querySelectorAll('.youtube-player')
			for (var i = 0; i < r.length; i++) {
				var querySelector = r[i].querySelector('.icon-youtube-play');
				var id = r[i].getAttribute('data-id');
				logger.info("Embedding youtube view {}", id)();
				querySelector.onclick = (function (e) {
					return function (event) {
						var iframe = document.createElement("iframe");
						var time = Utils.getTime(e.getAttribute('data-time'));
						if (time) {
							time = '&start=' + time;
						} else {
							time = ""
						}
						var src = "https://www.youtube.com/embed/{}?autoplay=1{}".format(id, time);
						iframe.setAttribute("src", src);
						iframe.setAttribute("frameborder", "0");
						iframe.className = 'video-player-ready';
						logger.info("Replacing youtube url {}", src)();
						iframe.setAttribute("allowfullscreen", "1");
						e.parentNode.replaceChild(iframe, e);
					}
				})(r[i]);
			}
		}
	},
	highlightCode: function (element) {
		if (window.highlightCode && window.hljs) {
			var s = element.querySelectorAll('pre');
			for (var i = 0; i < s.length; i++) {
				hljs.highlightBlock(s[i]);
			}
		}
	},
	setMediaBitrate: function (sdp, bitrate) {
		var lines = sdp.split("\n");
		var line = -1;
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].indexOf("m=") === 0) {
				line = i+1;
				break;
			}
		}
		if (line === -1) {
			logger.info("Could not find the m line for {}", sdp)();
			return sdp;
		}
		// Skip i and c lines
		while (lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
			line++;
		}
		if (lines[line].indexOf("b") === 0) {
			logger.info("Replaced b line at line", line)();
			lines[line] = "b=AS:" + bitrate;
			return lines.join("\n");
		} else {
			// Add a new b line
			logger.info("Adding new b line before line", line)();
			var newLines = lines.slice(0, line)
			newLines.push("b=AS:" + bitrate)
			newLines = newLines.concat(lines.slice(line, lines.length))
			return newLines.join("\n")
		}
	},
	detachVideoSource: function (video) {
		video.pause();
		video.src = "";
		video.load()
	},
	clickToPlay: function (video) {
		return function () {
			new Growl("Your browser has blocked remote video sound, please click on this message to enable it", function () {
				video.play().then(function () {
					growlInfo("Sound has been enabled");
				})
			}).showInfinity('col-info');
		}
	},
	pingExtension: function (cb) {
		if (chrome.runtime && chrome.runtime.sendMessage) {
			var triggered = false;
			var timedCB = setTimeout(function () {
				!triggered && cb(false);
				triggered = true;
			}, 500);

			chrome.runtime.sendMessage(CHROME_EXTENSION_ID, {
				type: 'PYCHAT_SCREEN_SHARE_PING'
			}, function (response) {
				!triggered && cb(response && response.data === 'success');
				clearTimeout(timedCB);
			});
		} else {
			cb(false)
		}
	},
	stopDesktopCapture: function () {
		if (typeof chrome != 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
			chrome.runtime.sendMessage(CHROME_EXTENSION_ID, {
				type: 'PYCHAT_SCREEN_SHARE_CANCEL'
			}, function (response) {

			});
		}
	},
	getDesktopCapture: function(cb) {
		chrome.runtime.sendMessage(CHROME_EXTENSION_ID, {
			type: 'PYCHAT_SCREEN_SHARE_REQUEST'
		}, cb);
	},
	createUserLi: function (userId, gender, username) {
		var icon;
		icon = document.createElement('i');
		icon.className = GENDER_ICONS[gender];
		var li = document.createElement('li');
		li.appendChild(icon);
		li.innerHTML += username;
		li.setAttribute(USER_ID_ATTR, userId);
		li.setAttribute(USER_NAME_ATTR, username);
		return li;
	},
	setVideoSource: function (domEl, stream) {
		domEl.src = URL.createObjectURL(stream);
		return domEl.play();
	},
	checkAndPlay: function (element, volume) {
		if (volume && notifier.isTabMain()) {
			try {
				element.pause();
				element.currentTime = 0;
				element.volume = Utils.volumeProportion[volume];
				var prom = element.play();
				prom && prom.catch(function (e) {
				});
			} catch (e) {
				logger.error("Skipping playing message, because {}", e.message || e)();
			}
		}
	},
	extractError: function (arguments) {
		try {
			if (typeof arguments === 'string') {
				return arguments;
			} else if (arguments.length > 1) {
				return Array.prototype.join.call(arguments, ' ');
			} else if (arguments.length === 1) {
				arguments = arguments[0];
			}
			if (arguments && (arguments.name || arguments.message) ) {
				return "{}: {}".format(arguments.name, arguments.message);
			} else if (arguments.rawError) {
				return arguments.rawError;
			} else {
				return JSON.stringify(arguments);
			}
		} catch (e) {
			return "Error during parsing error, :("
		}
	},
	createMicrophoneLevelVoice: function (stream, onaudioprocess) {
		try {
			if (isMobile) {
				logger.info("Current phone is mobile, audio processor won't be created")();
				return;
			}
			var audioTracks = stream && stream.getAudioTracks();
			audioTracks = audioTracks.length > 0 ? audioTracks[0] : false;
			if (!audioTracks) {
				throw "Stream has no audio tracks";
			}
			var audioProc = {};
			if (!window.audioContext) {
				window.audioContext = new AudioContext()
			}
			audioProc.analyser = window.audioContext.createAnalyser();
			var microphone = window.audioContext.createMediaStreamSource(stream);
			audioProc.javascriptNode = window.audioContext.createScriptProcessor(2048, 1, 1);
			audioProc.analyser.smoothingTimeConstant = 0.3;
			audioProc.analyser.fftSize = 1024;
			microphone.connect(audioProc.analyser);
			audioProc.analyser.connect(audioProc.javascriptNode);
			audioProc.javascriptNode.connect(window.audioContext.destination);
			audioProc.prevVolumeValues = 0;
			audioProc.volumeValuesCount = 0;
			audioProc.javascriptNode.onaudioprocess = onaudioprocess(audioProc);
			audioProcesssors.push(audioProc);
			logger.info("Created new audioProcessor")();
			return audioProc;
		} catch (err) {
			logger.error("Unable to use microphone level because {}", Utils.extractError(err))();
		}
	},
	getAverageAudioLevel: function (audioProc) {
		var array = new Uint8Array(audioProc.analyser.frequencyBinCount);
		audioProc.analyser.getByteFrequencyData(array);
		var values = 0;
		var length = array.length;
		for (var i = 0; i < length; i++) {
			values += array[i];
		}
		return values / length;
	},
	pasteHtmlAtCaret: function (img) {
		userMessage.focus();
		var sel = window.getSelection();
		var range = sel.getRangeAt(0);
		range.deleteContents();
		// Range.createContextualFragment() would be useful here but is
		// non-standard and not supported in all browsers (IE9, for one)
		var frag = document.createDocumentFragment();
		frag.appendChild(img);
		range.insertNode(frag);
		// Preserve the selection
		range = range.cloneRange();
		range.setStartAfter(img);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	},
	pasteBlobImgToTextArea: function(blob) {
		var img = document.createElement('img');
		img.className = PASTED_IMG_CLASS;
		var src = URL.createObjectURL(blob);
		img.src = src;
		Utils.imagesFiles[src] = blob;
		Utils.pasteHtmlAtCaret(img);
		return img;
	},
	pasteBlobVideoToTextArea: function (file) {
		var video = document.createElement('video');
		if (video.canPlayType(file.type)) {
			video.autoplay = false;
			var src = URL.createObjectURL(file);
			video.loop = false;
			video.addEventListener("loadeddata", function () {
				tmpCanvasContext.canvas.width = video.videoWidth;
				tmpCanvasContext.canvas.height = video.videoHeight;
				tmpCanvasContext.drawImage(video, 0, 0);
				tmpCanvasContext.canvas.toBlob(function(blob) {
					var url = URL.createObjectURL(blob);
					var img = document.createElement('img');
					img.className = PASTED_IMG_CLASS;
					img.src = url;
					img.setAttribute('associatedVideo', src);
					Utils.videoFiles[src] = file;
					Utils.previewFiles[url] = blob;
					Utils.pasteHtmlAtCaret(img);
				});
			}, false);
			video.src = src;
		} else {
			growlError("Browser doesn't support playing " + file.type);
		}
	}, pasteImgToTextArea: function (file) {
		if (file.type.indexOf("image") >= 0) {
			Utils.pasteBlobImgToTextArea(file);
		} else if (file.type.indexOf("video") >= 0) {
			Utils.pasteBlobVideoToTextArea(file);
		} else {
			growlError("Pasted file type {}, which is not an image".format(file.type));
		}

	},
	getWindowParams: function () {
		var w = window,
				d = document,
				e = d.documentElement,
				g = d.getElementsByTagName('body')[0],
				x = w.innerWidth || e.clientWidth || g.clientWidth,
				y = w.innerHeight || e.clientHeight || g.clientHeight;
		return {x: x, y: y};
	},
	deleteCookie: function (name, path, domain) {
		document.cookie = name + "=" +
				((path) ? ";path=" + path : "") +
				((domain) ? ";domain=" + domain : "") +
				";expires=Thu, 01 Jan 1970 00:00:01 GMT";
	},
	showHelp: function () {
		if (!suggestions) {
			return
		}
		var infoMessages = [
			"<span>Every time you join chat those help messages will be shown to you. " +
			"You can disable them in you profile settings (<i class='icon-wrench'></i> icon). Simply click on popup to hide them</span>",
			"You can add giphy by typing /giphy example",
			"<span>Browser will notify you on incoming message every time when chat tab is not active. " +
			"You can disable this option in your profile(<i class='icon-wrench'></i> icon).</span>",
			"<span>You can create a new room by clicking on <i class='icon-plus-squared'></i> icon." +
			" To delete created room hover mouse on its name and click on <i class='icon-cancel-circled-outline'></i> icon.</span>",
			"<span>You can make an audio/video call." +
			" Calls are only allowed for rooms you're in. If you want to call single person you need to create direct room to him. To make a call in room open call dialog by pressing <i class='icon-phone '></i> and click on phone <i class='icon-phone-circled'></i> All people in current channel are gonna be called</span>",
			"<span>You can change chat appearance in your profile. To open profile click on <i class='icon-wrench'></i> icon in top right corner</span>",
			"<span>You can write multiline message by pressing <b>shift+Enter</b></span>",
			"<span>You can add smileys by clicking on bottom right <i class='icon-smile'></i> icon." +
			" To close appeared smile container click outside of it or press <b>Esc</b></span>",
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
			"<span>You can send images to to chat by pasting them in bottom textarea by pressing <B>Ctrl + V</b></span>",
			"<span>You can highlight programming language code using <pre>```console.log('hello world')```</pre>. To enable this feature check <b>Highlight code</b> toggle in <a href='/#/profile'>profile</a></span>",
			"<span>You can edit/delete message that you have sent during 10 minutes. Focus input text, delete its content " +
			"and press <b>Up Arrow</b>. The edited message should become highlighted with outline. If you apply blank text the" +
			" message will be removed.To exit the mode press <b>Esc</b></span>"
		];
		var index = localStorage.getItem('HelpIndex');
		if (index == null) {
			index = 0;
		} else {
			index = parseInt(index);
		}
		if (index < infoMessages.length) {
			var growl = new Growl(infoMessages[index], function (e) {
				if (e.target != growl.growlClose) {
					growl.remove();
					Utils.showHelp();
				}
			})
			growl.info();
			localStorage.setItem('HelpIndex', index + 1);
		}
	}
};
