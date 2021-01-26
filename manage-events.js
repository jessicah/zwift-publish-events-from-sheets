
var clubName = null;
var eventIds = [];
var newTab = null;

function manageEvents()
{
	chrome.storage.sync.get(['clubName', 'sheetsUrl'], function(items) {
		errors = [];
		if (items.clubName == null || items.clubName == "") {
			errors.push('The club name has not been set');
		}
		if (items.sheetsUrl == null || items.sheetsUrl == "") {
			errors.push('A URL to a published Google Sheet document has not been set')
		}

		if (errors.length > 0) {
			console.log('Aborting auto-publishing script');

			errors.splice(0, 0, "Auto-publishing with Google Sheets has been disabled: use the extension options to configure");
			showErrorBanner(errors);

			return;
		}
	
		clubName = items.clubName;

		waitForEventsLink();
	});	
}

function waitForEventsLink()
{
	// we're on the events page, wait until manage events has been click, load our events, then open each one in a new tab...
	var manageLink = $j('a:contains(Back to all events)');

	if (manageLink.length == 0) {
		// page is still loading...
		window.setTimeout(waitForEventsLink, 1000);

		return;
	}

	window.setTimeout(openEventPages, 1000);
}

function openEventPages()
{
	var images = $j('div.listing-image > img');

	console.log(images);

	for (var ix = 0; ix < images.length; ++ix) {
		var eventId = images[ix].dataset.id;
		console.log('Event id', eventId);

		eventIds.push(eventId);
	}

	if (eventIds.length > 25) {
		window.alert(`Script wants to open ${eventIds.length}, do you really have this many events? Aborting.`);
		return;
	}

	window.alert(`About to open ${eventIds.length} tabs, one at a time, to publish events where possible.`);

	openTabs();
}

function openTabs()
{
	if (eventIds.length == 0)
	{
		console.log('Finished opening all event pages');

		window.alert('Finished processing all events');

		return;
	}

	var nextEvent = eventIds.shift();

	newTab = window.open(`https://www.zwift.com/clubs/${clubName}/event/${nextEvent}/edit`, '_blank');

	setTimeout(waitWindowClosed, 1000);
}

function waitWindowClosed()
{
	if (newTab.closed == false) {
		setTimeout(waitWindowClosed, 1000);
		return;
	}

	openTabs();
}