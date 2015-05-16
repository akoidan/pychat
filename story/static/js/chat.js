var headerId;
var selfHeader = '<font class="message-header-self">';
var privateHeader = '<font class="message-header-private">';
var othersHeader = '<font class="message-header-others">';
var endHeader = '</font>';
var contentStyle = '<font class="message-text-style">';
var chatBoxDiv;
var chatIncoming;
var chatOutgoing;
var loggedUser;
var chatRoomsDiv;
var userMessage;
var userSendMessageTo;
var receiverId;


$(document).ready(function () {

	chatBoxDiv = $('#chatbox');
	userMessage = $("#usermsg");
	chatRoomsDiv = $('#chatrooms');
	userSendMessageTo = $('#userSendMessageTo');
	chatIncoming = document.getElementById("chatIncoming");
	chatOutgoing = document.getElementById("chatOutgoing");
	loggedUser = $("input#username").val();
	userSendMessageTo.hide();
	receiverId = $('#receiverId');
	userMessage.keypress(function (event) {
		if (event.keyCode === 13) {
			$("#sendButton").click();
		}
	});
	chatBoxDiv.bind('mousewheel DOMMouseScroll', function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { // Scroll top
			loadUpHistory(5);
		}
	});

	$(document).keydown(function (e) {
		if (e.which === 33) {    // page up
			loadUpHistory(15);
		} else if (e.which === 38) { // up
			loadUpHistory(3);
		} else if (e.ctrlKey && e.which === 36) {
			loadUpHistory(25);
		}
	});
	loadMessages(10, false);
});

function getNumEnding(iNumber, aEndings) {
	var sEnding, i;
	iNumber = iNumber % 100;
	if (iNumber >= 11 && iNumber <= 19) {
		sEnding = aEndings[2];
	}
	else {
		i = iNumber % 10;
		switch (i) {
			case (1):
				sEnding = aEndings[0];
				break;
			case (2):
			case (3):
			case (4):
				sEnding = aEndings[1];
				break;
			default:
				sEnding = aEndings[2];
		}
	}
	return sEnding;
}

var timezone = getCookie('timezone');

if (timezone == null) {
	setCookie("timezone", jstz.determine().name());
}

function activate_chat(thread_id, user_name, number_of_messages) {
	$("div.chat form.message_form div.compose textarea").focus();

	function scroll_chat_window() {
		$("div.chat div.conversation").scrollTop($("div.chat div.conversation")[0].scrollHeight);
	}

	scroll_chat_window();

	var ws;

	function start_chat_ws() {
		ws = new WebSocket("ws://127.0.0.1:8888/" + thread_id + "/");
		ws.onmessage = function (event) {
			var message_data = JSON.parse(event.data);
			var date = new Date(message_data.timestamp * 1000);
			var time = $.map([date.getHours(), date.getMinutes(), date.getSeconds()], function (val, i) {
				return (val < 10) ? '0' + val : val;
			});
			$("div.chat div.conversation").append('<div class="message"><p class="author ' + ((message_data.sender == user_name) ? 'we' : 'partner') + '"><span class="datetime">' + time[0] + ':' + time[1] + ':' + time[2] + '</span> ' + message_data.sender + ':</p><p class="message">' + message_data.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />') + '</p></div>');
			scroll_chat_window();
			number_of_messages["total"]++;
			if (message_data.sender == user_name) {
				number_of_messages["sent"]++;
			} else {
				number_of_messages["received"]++;
			}
			$("div.chat p.messages").html('<span class="total">' + number_of_messages["total"] + '</span> ' + getNumEnding(number_of_messages["total"], ["сообщение", "сообщения", "сообщений"]) + ' (<span class="received">' + number_of_messages["received"] + '</span> получено, <span class="sent">' + number_of_messages["sent"] + '</span> отправлено)');
		}
		ws.onclose = function () {
			// Try to reconnect in 5 seconds
			setTimeout(function () {
				start_chat_ws()
			}, 5000);
		};
	}

	if ("WebSocket" in window) {
		start_chat_ws();
	} else {
		$("form.message_form").html('<div class="outdated_browser_message"><p><em>Ой!</em> Вы используете устаревший браузер. Пожалуйста, установите любой из современных:</p><ul><li>Для <em>Android</em>: <a href="http://www.mozilla.org/ru/mobile/">Firefox</a>, <a href="http://www.google.com/intl/en/chrome/browser/mobile/android.html">Google Chrome</a>, <a href="https://play.google.com/store/apps/details?id=com.opera.browser">Opera Mobile</a></li><li>Для <em>Linux</em>, <em>Mac OS X</em> и <em>Windows</em>: <a href="http://www.mozilla.org/ru/firefox/fx/">Firefox</a>, <a href="https://www.google.com/intl/ru/chrome/browser/">Google Chrome</a>, <a href="http://ru.opera.com/browser/download/">Opera</a></li></ul></div>');
		return false;
	}

	function send_message() {
		var textarea = $("textarea#message_textarea");
		if (textarea.val() == "") {
			return false;
		}
		if (ws.readyState != WebSocket.OPEN) {
			return false;
		}
		ws.send(textarea.val());
		textarea.val("");
	}

	$("form.message_form div.send button").click(send_message);

	$("textarea#message_textarea").keydown(function (e) {
		// Ctrl + Enter
		if (e.ctrlKey && e.keyCode == 13) {
			send_message();
		}
	});
}


function encodeHTML(html) {
	return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}


function loadUsers(usernames) {
	console.log(new Date() + "Load usernames :" + usernames);
	chatRoomsDiv.empty();
	var allUsers = '<ul class="message_header_others">';
	var icon;
	for (var username in usernames) {
		if (usernames[username] === "Male") {
			icon = '<span class="glyphicon icon-user green"/>'
		} else if (usernames[username] === "Female") {
			icon = '<span class="glyphicon icon-girl green"/>'
		} else {
			icon = '<span class="glyphicon icon-dog green"/>';
		}
		allUsers += '<li onclick="showUserSendMess($(this).text());">'
		+ username + icon + '</li>';
	}
	allUsers += ('</ul>');
	chatRoomsDiv.append(allUsers);
}

function showUserSendMess(username) {
	userSendMessageTo.show();
	// Empty sets display to none
	userSendMessageTo.css("display", "flex");
	receiverId.empty();
	receiverId.append(username);
}


function printMessage(data, isTopDirection) {
	var headerStyle;
	var private_data = data.private;
	if (typeof private_data === 'string') {
		headerStyle = privateHeader + private_data + '>>';
	} else if (typeof private_data === 'boolean') {
		headerStyle = privateHeader;
	} else if (data.user === username.value) {
		headerStyle = selfHeader;
	} else {
		headerStyle = othersHeader;
	}
	var messageHeader = headerStyle + ' (' + data.time + ') <b>' + data.user + '</b>: ' + endHeader;
	var messageContent = contentStyle + encodeHTML(data.content) + endHeader;
	var message = '<p>' + messageHeader + messageContent + "</p>";
	if (isTopDirection) {
		chatBoxDiv.prepend(message);
	} else {
		var oldscrollHeight = chatBoxDiv[0].scrollHeight;
		chatBoxDiv.append(message);
		var newscrollHeight = chatBoxDiv[0].scrollHeight;
		if (newscrollHeight > oldscrollHeight) {
			chatBoxDiv.animate({
				scrollTop: newscrollHeight
			}, 'normal'); // Autoscroll to bottom of div
		}

	}
}


function appendMessage(data) {
	printMessage(data, false);
	if (sound) {
		chatOutgoing.currentTime = 0;
		if (loggedUser === data.user) {
			chatOutgoing.play();
		} else {
			chatIncoming.play();
		}
	}
}


function sendMessage(usermsg, username) {
	if (usermsg == null || usermsg === '') {
		return;
	}
	$.ajax({
		type: 'POST',
		url: document.URL + 'send_message',
		data: {
			message: usermsg,
			addressee: username
		},
		success: function (data) {
			console.log(new Date() + "Send \"" + usermsg + "\" response: " + data);
			userMessage.val("");
		},
		failure: function (data) {
			console.log(new Date() + "can't send \"" + usermsg + "\", response: " + data);
		}
	});
}


function loadUpHistory(elements) {
	if (chatBoxDiv.scrollTop() === 0) {
		loadMessages(elements, true);
	}
}


function loadMessages(count, isTop) {
	$.ajax({
		async: false,
		type: 'POST',
		data: {
			headerId: headerId,
			count: count
		},
		url: "/get_messages",
		success: function (data) {
			console.log(new Date() + ': Requesting messages response ' + data);
			var result = JSON.parse(data);
			var firstMessage = result[result.length - 1];
			if (firstMessage != null) {
				headerId = firstMessage.id;
			}
			if (!isTop) {
				// appending to top last message first, so it goes down with every iteraction
				result = result.reverse();
			}
			result.forEach(function (message) {
				printMessage(message, isTop);
			});

			if (!isTop) {
				//scroll to bottom if new messages have been already sent
				chatBoxDiv.scrollTop(chatBoxDiv[0].scrollHeight);
			}
		},
		failure: function (data) {
			console.log(new Date() + 'can not load messages, response:', data);
		}
	});
}


function toggleRoom() {
	chatRoomsDiv.toggle();
	$("#refresh").toggle();
}

function refreshUserList() {
	$.ajax({
		type: 'POST',
		url: "/refresh_user_list"
	});
}

function hideUserSendToName() {
	receiverId.empty();
	userSendMessageTo.hide();
}