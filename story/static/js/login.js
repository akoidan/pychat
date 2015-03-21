function login() {
	var d = new Date();
	var credentials = {
			username: document.getElementById("lusername").value,
			password: document.getElementById("lpassword").value
	};
	console.log(d + "Attempting to login, credentials: " + credentials);
	$.ajax({
		url: 'auth',
		type: 'POST',
		data: credentials,
		success: function (data) {
			var d = new Date();
			console.log(d + "Server response success:" + data);
			if (data == 'update') {
				window.location.href = '/';
			} else {
				alert(data);
			}
		},
		failure: function (data) {
			var d = new Date();
			console.log(d + "can't login into system, response: " + data);
		}
	});

}

$(document).ready(function () {
		//Handles menu drop down
	$('#login-form').click(function (e) {
		e.stopPropagation();
	});
});
