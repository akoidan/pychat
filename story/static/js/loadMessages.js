/**
 * Created by andrew on 12/24/14.
 */

loadMessages(5, false);

function loadMessages(count, isTop) {
	var d = new Date();
	var t = d.getTime();
	console.log(d + ': Requesting ' + count + ' messages from server');
	$.ajax({
		beforeSend: function (xhr, settings) {
			xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
		},
		type: 'POST',
		data: {
			headerId: headerId,
			count: count
		},
		url: "/get_messages",
		success: function (data) {
			var result = eval(data);
			console.log(d + ': Fetched ' + result.length + ' messages from server');
			firstMessage = result[0];
			if (firstMessage != null) {
				headerId = eval('(' + firstMessage + ')').id;
			}
			if (isTop) {
				// appending to top last message first, so it goes down with every iteraction
				result = result.reverse();
			}
			result.forEach(function (message) {
				realMessage = eval('(' + message + ')');
				printMessage(realMessage, $("#chatbox"), isTop);
			});

			if (!isTop) {
				//scroll to bottom if new messages have been already sent
				$("#chatbox").scrollTop($('#chatbox')[0].scrollHeight);
			}
		},
		failure: function (data) {
			alert('Got an error dude');
		}
	});
}