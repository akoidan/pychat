var password;
var userName;
var repeatPassword;
var passwordCheck;
var userNameCheck;
var emailCheck;
var email;
var repeatPasswordCheck;
var passRegex = /^\S.+\S$/;

onDocLoad(function () {
	password = $("rpassword");
	userName = $("rusername");
	repeatPassword = $("repeatpassword");
	passwordCheck = $("password_check");
	userNameCheck = $("username_check");
	emailCheck = $("email_check");
	email = $("email");
	repeatPasswordCheck = $("repeatpassword_check");
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
	doPost('', null, callback, form);
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
		doPost('/validate_user', {username: username}, function (data) {
			if (data === RESPONSE_SUCCESS) {
				setSuccess(userNameCheck);
			} else {
				setError(userNameCheck, data)
			}
		}, null);
	}
}

function setError(element, errorText) {
	element.style.color = "#dd4b39";
	element.textContent = errorText;
}

function setSuccess(element) {
	element.style.color = "Green";
	element.textContent = "ok!";
}

function validateEmail() {
	var mail = email.value;
	if (blankRegex.test(mail)) {
		emailCheck.style.color = '';
		emailCheck.textContent = "Enter an email for extra features"
	} else {
		doPost('/validate_email', {'email': mail}, function (data) {
			if (data === RESPONSE_SUCCESS) {
				setSuccess(emailCheck);
			} else {
				setError(emailCheck, data);
			}
		}, null);
	}
}


function passwordsMatch() {
	if (password.value !== repeatPassword.value) {
		setError(repeatPasswordCheck, "Passwords don't match");
	} else {
		setSuccess(repeatPasswordCheck);
	}
}