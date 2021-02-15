
var insideUpdate = false;
var insideRouteChange = false;

var firstSection = null;

function prepEditingAllCategories()
{
	firstSection = settings.sections.shift();

	firstSection.style = 'border-color:#fc6719;border-width:2px';

	var worldId = null;

	var mapId = $j(firstSection).find('select[name=mapId]');
	mapId.change(function() {
		if (worldId != null) {
			worldId = null;
			return;
		}

		worldId = this.value;
		updateWorld(this.value);

		var evnt = document.createEvent('HTMLEvents');
		evnt.initEvent('change', true, true);
		this.value = worldId;
		this.dispatchEvent(evnt);
	});

	var routeDiv = $j(firstSection).find('div.route-select-area');
	routeDivInput = $j(routeDiv).find('input');
	routeDivInput.blur(function() {
		setTimeout(function() {
			updateCourse(routeDivInput[0].placeholder);
			routeDivInput[0].scrollIntoView();
		}, 1000, routeDivInput[0].placeholder);
	});

	durationTypeInputs = $j(firstSection).find('input[name=durationType]');
	durationTypeInputs.change(function() {
		updateDurationType(this.value, this.checked);

		// re-attach events
		attachDurationEvents();
	});

	// these need to get re-attached, so extract into separate function
	attachDurationEvents();
}

function attachDurationEvents() {
	var lapsInput = $j(firstSection).find('input[name=laps]');
	lapsInput.change(function() {
		updateDuration(2, null, this.value, null);
	});

	var kiloInput = $j(firstSection).find('input[name=distanceInMeters]');
	kiloInput.change(function() {
		updateDuration(0, this.value, null, null);
	});

	// also need one for time...
}
