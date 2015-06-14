function login() {
	var credentials = {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value
	};
	doPost('auth', credentials, function (data) {
		if (data === 'update') {
			window.location.href = '/';
		} else {
			alert(data);
		}
	});
}
function showLoginDropdown(e) {
	document.getElementById("hideableDropDown").style.display = 'block';
	e.stopPropagation();
}

document.addEventListener("DOMContentLoaded", function () {

	document.onclick = function () {
		document.getElementById("hideableDropDown").style.display = 'none';
	};

	//Handles menu drop down
	var loginForm = document.getElementById('hideableDropDown');
	loginForm.onclick = function (e) {
		e.stopPropagation(); // don't fire parent event when clicking on loginForm
	};

	// login by enter
	loginForm.onkeypress = function (event) {
		if (event.keyCode === 13) {
			login();
		}
	};

	var editUserName = function (label) {
		label.style.display = 'none';
		var oldUsername = label.textContent;
		label.insertAdjacentHTML('afterend', "<input type='text' id='inputName' maxlength='16' class='userNameInput' value='" + oldUsername + "' />");
		var input = document.getElementById('inputName');
		input.focus();
		var sendChangeNickname = function (event) {
			var newUsername = input.value;
			input.remove();
			label.style.display = 'inline';
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
		input.onblur = sendChangeNickname;
		input.onkeypress = function (e) {
			if (e.which == 13) {
				sendChangeNickname();
			}
		};
	};

	document.getElementById("userNameLabel").onclick = function () {
		editUserName(this);
	};

});