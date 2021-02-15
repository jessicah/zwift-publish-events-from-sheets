function saveOptions()
{
	var sheetsUrl = document.getElementById('sheetsUrl').value;
	var clubName = document.getElementById('clubName').value
	var dateFormat = document.getElementById('dateFormat').value;
	var ownerEmail = document.getElementById('ownerEmail').value;

	chrome.storage.sync.set({
		sheetsUrl: sheetsUrl,
		clubName: clubName,
		dateFormat: dateFormat,
		ownerEmail: ownerEmail
	}, function() {
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		status.style.display = '';
		setTimeout(function() {
			status.textContent = '';
			status.style.display = 'none';
		}, 1000);
	});
}

function restoreOptions() {
	chrome.storage.sync.get({
		sheetsUrl: null,
		clubName: null,
		dateFormat: 'd/m/y',
		ownerEmail: null
	}, function(items) {
		document.getElementById('sheetsUrl').value = items.sheetsUrl;
		document.getElementById('clubName').value = items.clubName;
		document.getElementById('dateFormat').value = items.dateFormat;
		document.getElementById('ownerEmail').value = items.ownerEmail;
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
