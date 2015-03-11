	var password;
	var userName;
	var repeatPassword;
	var passwordCheck;
	var userNameCheck;
	var emailCheck;
	var email;
	var repeatPasswordCheck;


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
		url: document.URL,
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
	if (pswd.length == 0) {
		passwordCheck.style.color = "#dd4b39";
		passwordCheck.innerHTML = "Password can't be empty";
	} else if (pswd.length < 3) {
		passwordCheck.style.color = "#dd4b39";
		passwordCheck.innerHTML = "Password should be at least 3 character";
	} else {
		passwordCheck.style.color = "Green";
		passwordCheck.innerHTML = "Password is fine";
	}
}


function validateUser() {
	var username = userName.value;
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
			if (data == 'ok') {
				userNameCheck.style.color = "Green";
				userNameCheck.innerHTML = "Username is fine";
			} else {
				userNameCheck.style.color = "#dd4b39";
				userNameCheck.innerHTML = data;
			}
		},
		failure: function (data) {
			console.log(new Date() + "can't validate user, response: " + data);
		}
	});
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
			if (data == 'ok') {
				emailCheck.style.color = "Green";
				emailCheck.innerHTML = "Email is fine";
				return true;
			} else {
				if ($("#mailbox").prop('checked')) {
					emailCheck.style.color = "#dd4b39";
				} else {
					emailCheck.style.color = "black";
				}
				emailCheck.innerHTML = data;
				return false;
			}
		},
		failure: function (data) {
			var d = new Date();
			console.log(d + "can't validate email, response: " + data);
		}
	});
}


function passwordsMatch() {
	var pswd = password.value;
	var repeatpassword = repeatPassword.value;
	if (repeatpassword != pswd) {
		repeatPasswordCheck.style.color = "#dd4b39";
		repeatPasswordCheck.innerHTML = "Passwords don't match";
	} else {
		repeatPasswordCheck.style.color = "Green";
		repeatPasswordCheck.innerHTML = "Passwords match";
	}
}
