
$j(document).ready(function() {
	window.setTimeout(initChangeForm, 1000);
});

var keys = ['changeTitle', 'changeDescription', 'changeDate', 'changeTime', 'changeUrl'];

function initChangeForm() {
	chrome.storage.local.get(keys,
	function(items) {
		chrome.storage.local.remove(keys);
		if (items.changeTitle == null) {
			console.log('No change title, nothing to do');
			return;
		}

		applyFormFields(items);
	});
}

function applyFormFields(items) {
	if (window.location == "https://gozwift.kustomer.help/contact/event-change-request-HkA34mv5H")
	{
		var title = $j('input#name');
		if (title.length == 0) {
			window.setTimeout(applyFormFields, 1000, items);
			return;
		}

		$j('input#email')[0].value = settings.ownerEmail || '';
		$j('input#name')[0].value = items.changeTitle.trim();
		$j('input#eventUrl')[0].value = items.changeUrl.trim();
		$j('input#eventStartDate')[0].value = items.changeDate.replaceAll('/', '-');
		$j('input#eventStartTime')[0].value = items.changeTime;
		$j('textarea#changeNeeded')[0].value =
			`ENTER CHANGES NEEDED\nDescription:\n${items.changeDescription}`;
	} else {
		console.log('Not change request form:', window.location);
	}
}