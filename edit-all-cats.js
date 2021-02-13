
var sections = null;

$j(document).ready(function() {
	window.setTimeout(initOptions, 1000);
});

function initOptions()
{
	if (window.location.pathname == '/events') {
		manageEvents();
		return;
	}

	prepAllCats();
}

function prepAllCats() {
	var buttons = $j("button:contains(Edit category)");

	if (buttons.length == 0 || settings.loaded == false) {
		// page is still loading...
		window.setTimeout(prepAllCats, 1000);

		return;
	}

	sections = $j("section.club-form-section").toArray();
	// first section is Event Info, drop it
	sections.shift();

	// hide the description so there's less to scroll through
	var description = $j("label:contains(Event Description)").parent();
	description.attr('style', 'display:none');

	var eventTitle = $j("span[data-testid=event-title]").text();
	var eventDateParts = $j("p[data-testid=event-date]").text().split('/');
	var eventTimeParts = $j("p[data-testid=event-time]").text().split(' ');

	var params = {
		title: eventTitle,
		date: parseDate(eventDateParts),
		time: parseTime(eventDateParts, eventTimeParts),
		description: $j(description[0]).children('span').children('div').first()[0].innerText,
		url: `https://www.zwift.com/events/view/${window.location.pathname.match('/([0-9]+)/')[1]}`
	}

	// add a button for creating a change request
	var publishButton = $j('button:contains(Publish event)');
	var changeButton = $j('<button type="button" class="btn btn-secondary text-uppercase">Create change request</button>');
	publishButton.after(changeButton).after('&nbsp;');
	changeButton.on('click', null, params, createChangeRequest);

	// look for the item for updating the categories
	var item = findEvent(eventTitle, parseDate(eventDateParts));

	if (item == null) {
		window.alert(`Unable to locate an event with title '${eventTitle}' on date ${parseDate(eventDateParts)}`);

		return;
	}

	// expand all the categories
	for (var ix = 0; ix < buttons.length; ++ix) {
		buttons[ix].click();
	}

	updateCategories({
		world: getWorld(item.World),
		course: item.Course,
		laps: item.Laps == "" ? null : item.Laps,
		distance: item.Distance == "" ? null : item.Distance,
		duration: item.Duration == "" ? null : item.Duration
	});
}

function createChangeRequest(evnt)
{
	console.log('create change request', evnt.data);
	var items = evnt.data;
	chrome.storage.local.set({
		changeTitle: items.title,
		changeDescription: items.description,
		changeDate: items.date,
		changeTime: items.time,
		changeUrl: items.url
	}, function() {
		window.open("https://gozwift.kustomer.help/contact/event-change-request-HkA34mv5H", '_blank');
	});
}

function updateWorld(world)
{
	console.log('Updating world...');
	for (var ix = 0; ix < sections.length; ++ix) {
		var section = sections[ix];
		
		var select = $j(section).find(`select[name=mapId]`);

		if (select[0].disabled) {
			showErrorBanner(['Event editing has been disabled.']);
			return false;
		}

		var evnt = document.createEvent('HTMLEvents');
		evnt.initEvent('change', true, true);
		select[0].value = world;
		select[0].dispatchEvent(evnt);
	}

	return true;
}

function updateCourse(course)
{
	console.log('Updating course...');
	var routes = $j(sections).find("div.route-select-area");
	
	for (var ix = 0; ix < routes.length; ++ix)
	{
		var route = routes[ix];

		var input = $j(route).find('input');
		var span = $j(input).next('span');

		var clickEvent = document.createEvent('HTMLEvents');
		clickEvent.initEvent('click', true, true);
		
		// open the menu
		span[0].dispatchEvent(clickEvent);

		var div = $j(route).find(`div.ml-2 > div:contains(${course})`);
		var parentDiv = $j(div).parent().parent().parent();

		// click the item
		parentDiv[0].dispatchEvent(clickEvent);
	}
}

function updateDurationType(durationType)
{
	console.log('Updating duration type...');
	
	for (var ix = 0; ix < sections.length; ++ix) {
		var section = sections[ix];

		var input = $j(section).find(`input[name=durationType][value=${durationType}]`);
		var evnt = document.createEvent('HTMLEvents');
		evnt.initEvent('click', true, true);
		input[0].checked = true;
		input[0].dispatchEvent(evnt);
	}
}

function updateDuration(durationType, distance, laps, duration)
{
	console.log('Updating distance / laps / duration... durationType [', durationType, '] distance [', distance, '] laps [', laps, '] duration [', duration, ']');
	if (durationType == 0) {
		// distance
		for (var ix = 0; ix < sections.length; ++ix) {
			var section = sections[ix];

			var input = $j(section).find("input[name=distanceInMeters]");
			var evnt = document.createEvent('HTMLEvents');
			evnt.initEvent('change', true, true);
			input[0].value = distance;
			input[0].dispatchEvent(evnt);
		}
	} else if (durationType == 1) {
		// duration in minutes (convert to hours/minutes for input)
		var durationHours = Math.floor(duration/60);
		var durationMinutes = duration % 60;
		for (var ix = 0; ix < sections.length; ++ix) {
			var section = sections[ix];

			var input = $j(section).find("input[name=durationHours]");
			var evnt = document.createEvent('HTMLEvents');
			evnt.initEvent('change', true, true);
			input[0].value = durationHours;
			input[0].dispatchEvent(evnt);

			var input2 = $j(section).find("input[name=durationMinutes]");
			var evnt2 = document.createEvent('HTMLEvents');
			evnt2.initEvent('change', true, true);
			input2[0].value = durationMinutes;
			input2[0].dispatchEvent(evnt2);
		}
	} else {
		// laps
		for (var ix = 0; ix < sections.length; ++ix) {
			var section = sections[ix];

			var input = $j(section).find("input[name=laps]");
			if (input.length == 0) {
				if (laps != 1) {
					window.alert(`Error, route only supports 1 lap, you have asked for ${laps} laps, if you need multiple laps for this course, use distance instead.`);
					return;
				}

				continue;
			}

			var evnt = document.createEvent('HTMLEvents');
			evnt.initEvent('change', true, true);
			input[0].value = laps;
			input[0].dispatchEvent(evnt);
		}
	}
}

function determineDurationType(data)
{
	if (data.distance != null) {
		return 0;
	} else if (data.laps != null) {
		return 2;
	} else if (data.duration != null) {
		return 1;
	} else {
		window.alert('Unable to properly determine the Duration Type!!!');
		console.log('Unable to properly determine the Duration Type!!!');
		return 0;
	}
}

function updateCategories(data)
{
	if (updateWorld(data.world) == false)
	{
		return;
	}
	
	updateCourse(data.course);

	var durationType = determineDurationType(data);

	updateDurationType(durationType);

	updateDuration(durationType, data.distance, data.laps, data.duration);

	console.log('Finished updates');

	var publishButton = $j("button.btn-primary:contains(Publish event)");

	publishButton.click();
}

function parseDate(dateParts)
{
	console.log(`Date format: ${settings.dateFormat}`);

	var date = null;

	switch (settings.dateFormat) {
		case 'd/m/y':
			date = new Date(`${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`);
			break;
		case 'm/d/y':
			date = new Date(`${dateParts[2]}/${dateParts[0]}/${dateParts[1]}`);
			break;
		case 'y/m/d':
			date = new Date(`${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`);
			break;
		default:
			showErrorBanner(['Missing date format setting, unable to parse event date']);
			return null;
	}

	return `${date.getUTCFullYear()}/${date.getUTCMonth()+1}/${date.getUTCDate()}`;
}

function parseTime(dateParts, timeParts)
{
	var hourMinute = timeParts[0].split(':');
	var isPM = timeParts[1] == "PM" || timeParts[1] == "pm";
	var offset = isPM ? 12 : 0;
	
	var timeString = `${+hourMinute[0] + offset}:${hourMinute[1]}`;
	
	var date = null;

	switch (settings.dateFormat) {
		case 'd/m/y':
			date = new Date(`${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${timeString}`);
			break;
		case 'm/d/y':
			date = new Date(`${dateParts[2]}/${dateParts[0]}/${dateParts[1]} ${timeString}`);
			break;
		case 'y/m/d':
			date = new Date(`${dateParts[0]}/${dateParts[1]}/${dateParts[2]} ${timeString}`);
			break;
		default:
			showErrorBanner(['Missing date format setting, unable to parse event date']);
			return null;
	}
	
	return `${date.getUTCHours()}:${date.getUTCMinutes()} UTC`;
}

function cleanDate(dateString)
{
	// converts a string like '2021/02/03' to '2021/2/3' for clean comparisons
	var date = new Date(dateString);
	return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
}

function findEvent(title, utcDate)
{
	for (var ix = 0; ix < settings.eventData.length; ++ix) {
		var item = settings.eventData[ix];

		if (item["Event Title"] == title && cleanDate(item["Event Date"]) == utcDate) {
			console.log('Found item', item);

			return item;
		}
	}

	return null;
}

function getWorld(world) {
	switch (world) {
		case "Watopia": return 1;
		case "Richmond": return 2;
		case "London": return 3;
		case "New York": return 4;
		case "Innsbruck": return 5;
		case "Bologna": return 6;
		case "Yorkshire": return 7;
		case "Crit City": return 8;
		case "France": return 10;
		case "Paris": return 11;
		default:
			window.alert('Unable to map world');
			return -1;
	}
}

function isValidWorld(item)
{
	return ['Watopia', 'Richmond', 'London', 'New York',
		'Innsbruck', 'Bologna', 'Yorkshire', 'Crit City',
		'France', 'Paris'].includes(item);
}

function isValidDate(item)
{
	return /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(item);
}
