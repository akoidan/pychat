var issue;
onDocLoad(function () {
	$("version").value = window.browserVersion;
	issue = $('issue');
	issue.addEventListener('input', function () {
		issue.style.height = 'auto';
		var textAreaHeight = issue.scrollHeight;
		issue.style.height = textAreaHeight + 'px';
	});
});


function sendIssue(event) {
	event.preventDefault();
	var form = $('issueForm');
	var params = {};
	if ($('history').checked) {
		var logs = localStorage.getItem(HISTORY_STORAGE_NAME);
		if (logs != null) {
			params['log'] = logs
		}
	}
	doPost('', params, function(response) {
		if (response === RESPONSE_SUCCESS) {
			growlSuccess("Your issue has been successfully submitted");
		} else {
			growlError(response);
		}
	}, form);
}