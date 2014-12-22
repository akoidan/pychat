function login() {
	var credentials = $('form').serialize();
	$.ajax({
		url: 'auth',
		type: 'POST',
		data: credentials,
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