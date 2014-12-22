function register() {

	var password = document.getElementById("password").value;
	var repeatpassword = document.getElementById("repeatpassword").value;
	if (password != repeatpassword) {
		alert('Password doesnt match')
		return;
	}

	var datad = $('form').serialize();
	$.ajax({
		type: 'POST',
		url: document.URL,
		data: datad,
		success: function (data) {
			if (data == 'account created') {
				window.location.href = '/';
			} else {
				alert(data);
			}
		},
		failure: function (data) {
			alert('Got an error dude');
		}
	});
}

function validatePassword() {
	var password = document.getElementById("password").value;
	if (password.length < 3) {
		document.getElementById("password_check").style.color = "Red";
		document.getElementById("password_check").innerHTML = "Password should be at least 3 character";
	} else {
		document.getElementById("password_check").style.color = "Green";
		document.getElementById("password_check").innerHTML = "Password is fine";
	}
}


function validateUser() {
	var username = document.getElementById("username").value;
	$.ajax({
		type: 'POST',
		url: "/validate_user",
		data: {
			username: username
		},
		success: function (data) {
			if (data == 'False') {
				document.getElementById("username_check").style.color = "Green";
				document.getElementById("username_check").innerHTML = "Username is fine";
			} else {
				document.getElementById("username_check").style.color = "Red";
				document.getElementById("username_check").innerHTML = data;
			}
		},
		failure: function (data) {
			alert('Got an error dude');
		}
	});
}

function validateEmail() {
	var email = document.getElementById("email").value;
	$.ajax({
		type: 'POST',
		url: "/validate_email",
		data: {
			email: email
		},
		success: function (data) {
			if (data == 'False') {
				document.getElementById("email_check").style.color = "Green";
				document.getElementById("email_check").innerHTML = "Email is fine";
			} else {
				document.getElementById("email_check").style.color = "Red";
				document.getElementById("email_check").innerHTML = data;
			}
		},
		failure: function (data) {
			alert('Got an error dude');
		}
	});
}

function passwordsMatch() {
	var password = document.getElementById("password").value;
	var repeatpassword = document.getElementById("repeatpassword").value;
	if (repeatpassword != password ) {
		document.getElementById("repeatpassword_check").style.color = "Red";
		document.getElementById("repeatpassword_check").innerHTML = "Passwords don't match";
	} else {
		document.getElementById("repeatpassword_check").style.color = "Green";
		document.getElementById("repeatpassword_check").innerHTML = "Passwords match";
	}
}
