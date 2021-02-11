
var newTab = null;
var eventIds = [];

function manageEvents()
{
	waitForManageLink();
}

function waitForManageLink()
{
	var manageLink = $j('a:contains(Manage my events)');

	if (manageLink.length == 0 || settings.loaded == false) {
		// page is still loading, or not logged in...
		window.setTimeout(waitForManageLink, 1000);

		return;
	}

	// have the link, now add a new link for auto-managing
	var autoUpload = $j('<a style="color:#fc6719">Auto-upload Events</a>');
	var container = $j('div.tab-navigation');
	container[0].style.fontSize = '20px';
	$j(container[0]).append(" &mdash; ");
	$j(container[0]).append(autoUpload);

	autoUpload[0].addEventListener('click', prepareOpenEventPages);
}

function prepareOpenEventPages()
{
	var evnt = document.createEvent('HTMLEvents');
	evnt.initEvent('click', true, true);
	var elem = $j('a:contains(Manage my events)');
	
	if (elem.length == 1) {
		elem[0].dispatchEvent(evnt);
	}

	window.setTimeout(openEventPages, 1000);
}

function openEventPages()
{
	var images = $j('div.listing-image > img');

	console.log(images);

	eventIds = [];

	for (var ix = 0; ix < images.length; ++ix) {
		var eventId = images[ix].dataset.id;
		console.log('Event id', eventId);

		var header = $j(images[ix]).parent('div.listing-image').prev('div.listing-header');
		var title = $j(header).children('div.header-title');

		var titleText = title[0].innerText;

		console.log(titleText);

		if (hasTitle(titleText) == false) {
			title[0].style.fontStyle = 'italic';
			continue;
		}

		eventIds.push(eventId);
	}

	if (eventIds.length > 25) {
		window.alert(`Script wants to open ${eventIds.length}, do you really have this many events? Aborting.`);
		return;
	}

	window.alert(`About to open ${eventIds.length} tabs, one at a time, to publish events where possible.`);

	openTabs();
}

function hasTitle(title) {
	if (settings.eventData == null) return;

	for (var ix = 0; ix < settings.eventData.length; ++ix) {
		var item = settings.eventData[ix];

		if (item["Event Title"] == title) {
			console.log('Found item', item);

			return true;
		}
	}

	return false;
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

	newTab = window.open(`https://www.zwift.com/clubs/${settings.clubName}/event/${nextEvent}/edit`, '_blank');

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