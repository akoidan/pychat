function register() {
	var password = document.getElementById("password").value;
	var repeatpassword = document.getElementById("repeatpassword").value;
	if (password != repeatpassword) {
		alert("Passwords don't match")
		return;
	}
	var d = new Date();
	var datad = $('form').serialize();
	console.log(d + "Sending registering request to server, data:" + datad);
	$.ajax({
		type: 'POST',
		url: document.URL,
		data: datad,
		success: function (data) {
			var datad = $('form').serialize();
			console.log(d + "Register server response:" + data);
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
	var password = document.getElementById("password").value;
	if (password.length < 3) {
		document.getElementById("password_check").style.color = "black";
		document.getElementById("password_check").innerHTML = "Password should be at least 3 character";
		return false;
	} else {
		document.getElementById("password_check").style.color = "Green";
		document.getElementById("password_check").innerHTML = "Password is fine";
		return true;
	}
}


function validateUser() {
	var username = document.getElementById("username").value;
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
			if (data == 'False') {
				document.getElementById("username_check").style.color = "Green";
				document.getElementById("username_check").innerHTML = "Username is fine";
				return true;
			} else {
				document.getElementById("username_check").style.color = "#dd4b39";
				document.getElementById("username_check").innerHTML = data;
				return false;
			}
		},
		failure: function (data) {
			var d = new Date();
			console.log(d + "can't validate user, response: " + data);
		}
	});
}


function validateEmail() {
	var email = document.getElementById("email").value;
	var d = new Date();
	console.log(d + "Sending validate email request: " + email);
	$.ajax({
		type: 'POST',
		url: "/validate_email",
		data: {
			email: email
		},
		success: function (data) {
			console.log(d + "Validate email response: " + data);
			if (data == 'False') {
				document.getElementById("email_check").style.color = "Green";
				document.getElementById("email_check").innerHTML = "Email is fine";
				return true;
			} else {
				if ($("#mailbox").prop('checked')) {
					document.getElementById("email_check").style.color = "#dd4b39";
				} else {
					document.getElementById("email_check").style.color = "black";
				}
				document.getElementById("email_check").innerHTML = data;
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
	var password = document.getElementById("password").value;
	var repeatpassword = document.getElementById("repeatpassword").value;
	if (repeatpassword != password) {
		document.getElementById("repeatpassword_check").style.color = "#dd4b39";
		document.getElementById("repeatpassword_check").innerHTML = "Passwords don't match";
	} else {
		document.getElementById("repeatpassword_check").style.color = "Green";
		document.getElementById("repeatpassword_check").innerHTML = "Passwords match";
	}
}