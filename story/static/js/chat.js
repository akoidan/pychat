var headerId;
var selfHeader = '<font class="message_header_self">';
var privateHeader = '<font class="message_header_private">';
var othersHeader = '<font class="message_header_others">';
var endHeader = '</font>';
var contentStyle = '<font class="message_text_style">';
var chatBoxDiv;
var chatIncoming;
var chatOutgoing;
var loggedUser;
var chatRoomsDiv;


$(document).ready(function () {
	//use .on() to add a listener. you can add as many listeners as you want.
	ishout.on('notifications', appendMessage);
	ishout.on('refresh_users', loadUsers);
	// .init() will authenticate against the ishout.js server, and open the
	// WebSocket connection.
	ishout.init();
	ishout.joinRoom('main');
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
		if (event.keyCode == 13) {
			$("#sendButton").click();
		}
	});
	loadMessages(10, false);
});


function encodeHTML(html) {
	return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}


function loadUsers(usernames) {
	console.log(new Date() + "Load usernames :" + usernames);
	chatRoomsDiv.empty();
	var allUsers = '<ul class="message_header_others">';
	for (index in usernames) {
		allUsers += '<li onclick="showUserSendMess($(this).text());">'
		+ usernames[index] + '</li>';
	}
	allUsers += ('</ul>');
		chatRoomsDiv.append(allUsers);
}

function showUserSendMess(username) {
	userSendMessageTo.show();
	// Empty sets display to none
	userSendMessageTo.css("display","flex");
	receiverId.empty();
	receiverId.append(username);
}


function printMessage(data, isTopDirection) {
	var headerStyle;
	var private = data.private;
	if (typeof private == 'string') {
		headerStyle = privateHeader + private + '>>';
	} else if (typeof private == 'boolean' ) {
		headerStyle = privateHeader;
	} else if (data.user == username.value) {
		headerStyle = selfHeader;
	} else {
		headerStyle = othersHeader;
	}
	messageHeader = headerStyle + ' (' + data.time + ') <b>' + data.user + '</b>: ' + endHeader;
	messageContent = contentStyle + encodeHTML(data.content) + endHeader;
	message = '<p>' + messageHeader + messageContent + "</p>";
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
	if (usermsg == null || usermsg == '') {
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
			console.log(new Date() + "Response: " + data);
			userMessage.val("");
		},
		failure: function (data) {
			console.log(new Date() + "can't send message, response: " + data);
		}
	});
}


$(function () {
	chatBoxDiv.bind('mousewheel DOMMouseScroll', function (event) {
		if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) { // Scroll top
			loadUpHistory(5);
		}
	});

	$(document).keydown(function (e) {
		if (e.which == 33) {    // page up
			loadUpHistory(15);
		} else if (e.which == 38) { // up
			loadUpHistory(3);
		} else if (e.ctrlKey && e.which == 36) {
			loadUpHistory(25);
		}
	});
});


function loadUpHistory(elements) {
	if (chatBoxDiv.scrollTop() == 0) {
		loadMessages(elements, true);
	}
}


function loadMessages(count, isTop) {
	console.log(new Date() + ': Requesting ' + count + ' messages from server');
	$.ajax({
		type: 'POST',
		data: {
			headerId: headerId,
			count: count
		},
		url: "/get_messages",
		success: function (data) {
			console.log(new Date() + ': Response ' + data);
			var result = eval(data);
			firstMessage = result[0];
			if (firstMessage != null) {
				headerId = eval(firstMessage).id;
			}
			if (!isTop) {
				// appending to top last message first, so it goes down with every iteraction
				result = result.reverse();
			}
			result.forEach(function (message) {
				realMessage = eval(message);
				printMessage(realMessage, isTop);
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

function refreshUserList(){
	$.ajax({
		type: 'POST',
		url: "/refresh_user_list"
	});
}

function hideUserSendToName() {
	receiverId.empty();
	userSendMessageTo.hide();
}