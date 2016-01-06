var lastEditUserNameTime = 0;
const MIN_CHANGE_USERNAME_PERIOD = 2000;
onDocLoad(function() {
	hideElement($("hideableDropDown"));
	hideElement($('inputName'));
});

function login() {
	var callback = function (data) {
		if (data === RESPONSE_SUCCESS) {
			window.location.href = '/';
		} else {
			growlError(data);
		}
	};
	doPost('/auth', null, callback, $('loginForm'));
}
function showLoginDropdown(e) {
	showElement($("hideableDropDown"));
	e.stopPropagation();
}

onDocLoad(function () {

	document.addEventListener("click", function () {
		hideElement($("hideableDropDown"));
	});

	//Handles menu drop down
	var loginForm = $('hideableDropDown');
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
		var currentMillis = new Date().getTime();
		// 0 if locked, or last request was sent earlier than 3 seconds ago
		var timeToWait = lastEditUserNameTime + MIN_CHANGE_USERNAME_PERIOD - currentMillis;
		if (timeToWait > 0) {
			growlError(getText("Please wait {}ms to be able to change username again!", timeToWait));
			return;
		}
		hideElement(label);
		var oldUsername = label.textContent;
		var input = $('inputName');
		input.focus();
		input.value = oldUsername;
		showElement(input);
		var sendChangeNickname = function (event) {
			var newUsername = input.value;
			hideElement(input);
			showElement(label);
			if (!USER_REGEX.test(newUsername)) {
				growlError('Wrong username, only letters, -_');
				label.textContent = oldUsername;
			} else  if (newUsername !== oldUsername) {
				lastEditUserNameTime = new Date().getTime();
				sendToServer({content: newUsername, action: 'me'});
			}
		};
		input.onblur = sendChangeNickname;
		input.onkeypress = function (e) {
			if (e.which === 13) {
				sendChangeNickname();
			}
		};
	};

	$("userNameLabel").onclick = function () {
		editUserName(this);
	};

});
