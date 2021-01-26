var googleSheetsTsvUrl = null;

$j(document).ready(function() {
	window.setTimeout(initOptions, 1000);
});

function initOptions()
{
	if (window.location.href == "https://www.zwift.com/events") {
		manageEvents();
		return;
	}
	
	chrome.storage.sync.get(['sheetsUrl'], function(items) {
		errors = [];
		if (items.sheetsUrl == null || items.sheetsUrl == "") {
			errors.push('A URL to a published Google Sheet document has not been set')
		}

		if (errors.length > 0) {
			console.log('Aborting auto-publishing script');

			errors.splice(0, 0, "Auto-publishing with Google Sheets has been disabled: use the extension options to configure");
			showErrorBanner(errors);

			return;
		}
	
		googleSheetsTsvUrl = items.sheetsUrl;

		prepAllCats();
	});
}

var sections = null;

function updateWorld(world)
{
	console.log('Updating world...');
	for (var ix = 0; ix < sections.length; ++ix) {
		var section = sections[ix];
		
		var select = $j(section).find(`select[name=mapId]`);

		var evnt = document.createEvent('HTMLEvents');
		evnt.initEvent('change', true, true);
		select[0].value = world;
		select[0].dispatchEvent(evnt);
	}
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
	updateWorld(data.world);
	
	updateCourse(data.course);

	var durationType = determineDurationType(data);

	updateDurationType(durationType);

	updateDuration(durationType, data.distance, data.laps, data.duration);

	console.log('Finished updates');

	var publishButton = $j("button.btn-primary:contains(Publish event)");

	publishButton.click();
}

function prepAllCats() {
	var buttons = $j("button:contains(Edit category)");

	if (buttons.length == 0) {
		// page is still loading...
		window.setTimeout(prepAllCats, 1000);

		return;
	}

	sections = $j("section.club-form-section").toArray();
	// first section is Event Info, drop it
	sections.shift();

	// hide the description so there's less to scroll through
	$j("label:contains(Event Description)").parent().attr('style', 'display:none');

	// expand all the categories
	for (var ix = 0; ix < buttons.length; ++ix) {
		buttons[ix].click();
	}

	var eventTitle = $j("span[data-testid=event-title]").text();
	var eventDateParts = $j("p[data-testid=event-date]").text().split('/');
	
	$j.ajax({
		url: googleSheetsTsvUrl,
		success: function(data, status, xhr) {
			fetchDataFromTsv(data, eventTitle, eventDateParts);
		},
		error: function (xhr, status, error) {
			window.alert('Failed to retrieve data from Google Sheets');
		}
	});

}

function fetchDataFromTsv(tsv, title, dateParts)
{
	var json = tsvJSON(tsv);

	console.log(json);

	var date = new Date(`${dateParts[2]}/${dateParts[0]}/${dateParts[1]}`);
	var utcDate = `${date.getUTCFullYear()}/${date.getUTCMonth()+1}/${date.getUTCDate()}`;

	console.log('Searching for item with title', title, 'on date', utcDate);

	for (var ix = 0; ix < json.length; ++ix) {
		var item = json[ix];

		if (item["Event Title"] == title && item["Event Date"] == utcDate) {
			console.log('Found item', item);

			updateCategories({
				world: getWorld(item.World),
				course: item.Course,
				laps: item.Laps == "" ? null : item.Laps,
				distance: item.Distance == "" ? null : item.Distance,
				duration: item.Duration == "" ? null : item.Duration
			});

			return;
		}
	}

	window.alert(`Unable to locate an event with title '${title}' on date ${utcDate}`);
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

function tsvJSON(tsv){
 
	var lines=tsv.split("\n");
   
	var result = [];
   
	var headers=lines[0].split("\t");
   
	for(var i=1;i<lines.length;i++){
   
		var obj = {};
		var currentline=lines[i].split("\t");

		if (currentline.length <= 6) continue;
		
		for(var j=0;j<7;j++){
			obj[headers[j]] = currentline[j];
		}
   
		result.push(obj);
   
	}
	
	return result;
  }
