var issue;
onDocLoad(function () {
	$("version").value = getBrowserVersion();
	issue = $('issue');
	issue.addEventListener('input', function () {
		issue.style.height = 'auto';
		var textAreaHeight = issue.scrollHeight;
		issue.style.height = textAreaHeight + 'px';
	});
});


function sendIssue() {
	var form = $('issueForm');
	var params = {};
	if ($('history').checked) {
		var logs = localStorage.getItem(HISTORY_STORAGE_NAME);
		if (logs != null) {
			params['log'] = logs
		}
	}
	doPost('', params, alert, form);
}