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
