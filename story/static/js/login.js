function login() {
	var d = new Date();
	var credentials = {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value
	};
	console.log(d + "Attempting to login, credentials: " + credentials);
	doPost('auth', credentials, function (data) {
		var d = new Date();
		console.log(d + "Server response success:" + data);
		if (data === 'update') {
			window.location.href = '/';
		} else {
			alert(data);
		}
	});
}

document.addEventListener("DOMContentLoaded", function() {
	//Handles menu drop down
	var loginForm = document.getElementById('login-form');
	loginForm.onclick = function (e) { // TODO prevent login dropdown from closing
		e.stopPropagation();
	};
	// login by enter
	loginForm.onkeypress = function (event) {
		if (event.keyCode === 13) {
			login();
		}
	};

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

	document.getElementById("userNameLabel").onclick = function () {
		editUserName(this);
	};

});