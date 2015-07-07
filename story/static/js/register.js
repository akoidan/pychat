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

document.addEventListener("DOMContentLoaded", function () {
	password = document.getElementById("rpassword");
	userName = document.getElementById("rusername");
	repeatPassword = document.getElementById("repeatpassword");
	passwordCheck = document.getElementById("password_check");
	userNameCheck = document.getElementById("username_check");
	emailCheck = document.getElementById("email_check");
	email = document.getElementById("email");
	repeatPasswordCheck = document.getElementById("repeatpassword_check");
	mailbox = document.getElementById("mailbox");
});

function register() {
	if (password.value !== repeatPassword.value) {
		alert("Passwords don't match");
		return;
	}
	var sex;
	if (document.getElementById("rmale").checked) {
		sex = 'Male';
	} else if (document.getElementById("rfemale").checked) {
		sex = 'Female';
	} else {
		sex = 'Alien';
	}
	var datad = {
		username: userName.value,
		password: password.value,
		email: email.value,
		mailbox: mailbox.checked ? 'Y' : 'N',
		sex: sex
	};
	doPost('/register', datad, function (data) {
		if (data === 'ok') {
			window.location.href = '/';
		} else {
			alert(data);
		}
	});
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
	} else if (!userRegex.test(username)) {
		setError(userNameCheck, "only letters, numbers and underscores!");
	} else {
		doPost('/validate_user', {username: username}, function (data) {
			// hardcoded ok
			if (data === 'ok') {
				setSuccess(userNameCheck);
			} else {
				setError(userNameCheck, data)
			}
		});
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
		doPost('/validate_email', {email: mail} , function (data) {
			if (data === 'ok') {
				setSuccess(emailCheck);
			} else {
				setError(emailCheck, data);
				if (!mailbox.checked) {
					emailCheck.style.color = "";
				}
			}
		});
	}


function passwordsMatch() {
	if (password.value !== repeatPassword.value) {
		setError(repeatPasswordCheck, "Passwords don't match");
	} else {
		setSuccess(repeatPasswordCheck);
	}
}