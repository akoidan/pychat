function login() {
	var username = document.getElementById("lusername").value;
	var password = document.getElementById("password").value;
	$.ajax({
		url: 'auth',
		type: 'POST',
		data: {
			username: username,
			password: password
		},
		success: function (data) {
			if (data == 'update') {
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