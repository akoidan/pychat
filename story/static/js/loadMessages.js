/**
 * Created by andrew on 12/24/14.
 */


$.ajax({
	beforeSend: function (xhr, settings) {
		xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
	},
	type: 'POST',
	url: "/get_messages",
	success: function (data) {
		var result = eval (data);
		result.forEach(function(message) {
			printMessage(eval('('+message+')'), $("#chatbox"));
		});
		$("#chatbox").scrollTop($('#chatbox')[0].scrollHeight);
	},
	failure: function (data) {
		alert('Got an error dude');
	}
});
