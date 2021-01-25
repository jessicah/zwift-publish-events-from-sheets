
var clubName = 'brt';
var eventIds = [];
var newTab = null;

function manageEvents()
{
	// we're on the events page, wait until manage events has been click, load our events, then open each one in a new tab...
	var manageLink = $j('a:contains(Back to all events)');

	if (manageLink.length == 0) {
		// page is still loading...
		window.setTimeout(manageEvents, 1000);

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