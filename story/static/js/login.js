function login() {
	var d = new Date();
	var credentials = {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value
	};
	console.log(d + "Attempting to login, credentials: " + credentials);
	$.ajax({
		url: 'auth',
		type: 'POST',
		data: credentials,
		success: function (data) {
			var d = new Date();
			console.log(d + "Server response success:" + data);
			if (data === 'update') {
				window.location.href = '/';
			} else {
				alert(data);
			}
		},
		failure: function (data) {
			var d = new Date();
			console.log(d + "can't login into system, response: " + data);
		}
	});

}

$(document).ready(function () {
	//Handles menu drop down
	var loginForm = $('#login-form');
	loginForm.click(function (e) {
		e.stopPropagation();
	});
	// login by enter
	loginForm.keypress(function (event) {
		if (event.keyCode === 13) {
			login();
		}
	});

	var editUserName = function (label) {
		label.hide();
		var oldUsername = label.text();
		label.after("<input type='text' maxlength='16' class='userNameInput' value='" + oldUsername + "' />");
		var input = label.next();
		input.focus();
		var sendChangeNickname = function () {
			var newUsername = input.val();
			input.remove();
			label.show();
			if (!userRegex.test(newUsername)) {
				alert('Wrong username, only letters, -_');
				label.text(oldUsername);
				return;
			}
			if (newUsername !== oldUsername) {
				var jsonRequest = JSON.stringify({me: newUsername, action: 'me'});
				console.log(new Date + "Sending change username request from " + oldUsername + " to " + newUsername);
				ws.send(jsonRequest);
			}
		};
		input.focusout(sendChangeNickname);
		input.keypress(function (e) {
			if (e.which == 13) {
				sendChangeNickname();
			}
		});
	};

	$("#userNameLabel").click(function () {
		editUserName($(this));
	});

});