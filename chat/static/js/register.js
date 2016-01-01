var password;
var userName;
var repeatPassword;
var passwordCheck;
var userNameCheck;
var emailCheck;
var email;
var repeatPasswordCheck;
var passRegex = /^\S.+\S$/;
var mailbox;

onDocLoad(function () {
	password = $("rpassword");
	userName = $("rusername");
	repeatPassword = $("repeatpassword");
	passwordCheck = $("password_check");
	userNameCheck = $("username_check");
	emailCheck = $("email_check");
	email = $("email");
	repeatPasswordCheck = $("repeatpassword_check");
	mailbox = $("mailbox");
});

function register(event) {
	event.preventDefault();
	if (password.value !== repeatPassword.value) {
		growlError("Passwords don't match");
		return;
	}
	var form = $('register-form');
	var callback = function (data) {
		if (data === RESPONSE_SUCCESS) {
			window.location.href = '/profile';
		} else {
			growlError(data);
		}
	};
	doPost('/register', null, callback, form);
}


function validatePassword() {
	var pswd = password.value;
	if (pswd.length === 0) {
		setError(passwordCheck, "Password can't be empty");
	} else if (!passRegex.test(pswd)) {
		setError(passwordCheck, "Password should be at least 3 character with no spaces");
	} else {
		setSuccess(passwordCheck);
	}
}


function validateUser() {
	userName.value = userName.value.trim();
	var username = userName.value;
	if (username === "") {
		setError(userNameCheck, "Error: Username cannot be blank!");
	} else if (username.length > 16) {
		setError(userNameCheck, "Username shouldn't be longer than 16 symbols");
	} else if (!USER_REGEX.test(username)) {
		setError(userNameCheck, "only letters, numbers and underscores!");
	} else {
		var callback = function (data) {
			if (data === RESPONSE_SUCCESS) {
				setSuccess(userNameCheck);
			} else {
				setError(userNameCheck, data)
			}
		};
		doPost('/validate_user', {username: username}, callback, null);
	}
}

function setError(element, errorText) {
	element.style.color = "#dd4b39";
	element.innerHTML = errorText;
}

function setSuccess(element) {
	element.style.color = "Green";
	element.innerHTML = "ok!";
}

	function validateEmail() {
		var mail = email.value;
		var callback = function (data) {
			if (data === RESPONSE_SUCCESS) {
				setSuccess(emailCheck);
			} else {
				setError(emailCheck, data);
				if (!mailbox.checked) {
					emailCheck.style.color = "";
				}
			}
		};
		doPost('/validate_email', {email: mail} , callback, null);
	}


function passwordsMatch() {
	if (password.value !== repeatPassword.value) {
		setError(repeatPasswordCheck, "Passwords don't match");
	} else {
		setSuccess(repeatPasswordCheck);
	}
}