	var password;
	var userName;
	var repeatPassword;
	var passwordCheck;
	var userNameCheck;
	var emailCheck;
	var email;
	var repeatPasswordCheck;
   var passRegex = /^\S.+\S$/;
	var userRegex = /^\w+$/;

$(document).ready(function () {
	password = document.getElementById("password");
	userName = document.getElementById("username");
	repeatPassword = document.getElementById("repeatpassword");
	passwordCheck = document.getElementById("password_check");
	userNameCheck = document.getElementById("username_check");
	emailCheck = document.getElementById("email_check");
	email =  document.getElementById("email");
	repeatPasswordCheck = document.getElementById("repeatpassword_check");
});

function register() {
	if (password.value != repeatPassword.value) {
		alert("Passwords don't match");
		return;
	}
	var datad = $('form').serialize();
	console.log(new Date() + "Sending registering request to server, data:" + datad);
	$.ajax({
		type: 'POST',
		url: '/register',
		data: datad,
		success: function (data) {
			var datad = $('form').serialize();
			console.log(new Date() + "Register server response:" + data);
			if (data == 'Account created') {
				window.location.href = '/';
			} else {
				alert(data);
			}
		},
		failure: function (data) {
			var d = new Date();
			console.log(d + "Register server has failed, response: " + data);
		}
	});
}


function validatePassword() {
	var pswd = password.value;
	if (pswd.length === 0) {
		setError(passwordCheck, "Password can't be empty");
	} else if (!passRegex.test(pswd)) {
		setError(passwordCheck, "Password should be at least 3 character");
	} else {
		setSuccess(passwordCheck);
	}
}


function validateUser() {
	userName.value = userName.value.trim();
	var username = userName.value;
	if(username == "") {
		setError(userNameCheck, "Error: Username cannot be blank!");
		return;
	}

	if (!userRegex.test(username)) {
		setError(userNameCheck, "only letters, numbers and underscores!");
		return;
	}

	var d = new Date();
	console.log(d + "Sending validate user request: " + username);
	$.ajax({
		type: 'POST',
		url: "/validate_user",
		data: {
			username: username
		},
		success: function (data) {
			console.log(d + "Validate user response: " + data);
			// hardcoded ok
			if (data === 'ok') {
				setSuccess(userNameCheck);
			} else {
				setError(userNameCheck, data)

			}
		},
		failure: function (data) {
			console.log(new Date() + "can't validate user, response: " + data);
		}
	});
}

function setError(element, errorText) {
	element.style.color = "#dd4b39";
	element.innerHTML = errorText;
}

function setSuccess(element, errorText) {
	element.style.color = "Green";
	element.innerHTML = "ok!";
}

function validateEmail() {
	var mail = email.value;
	console.log(new Date() + "Sending validate email request: " + mail);
	$.ajax({
		type: 'POST',
		url: "/validate_email",
		data: {
			email: mail
		},
		success: function (data) {
			console.log(new Date() + "Validate email response: " + data);
			if (data === 'ok') {
				setSuccess(emailCheck);
			} else {
				setError(emailCheck, data);
				if (!$("#mailbox").prop('checked')) {
					emailCheck.style.color = "";
				}
			}
		},
		failure: function (data) {
			var d = new Date();
			console.log(d + "can't validate email, response: " + data);
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