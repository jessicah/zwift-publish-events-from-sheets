
var settings = {
	clubName: null,
	sheetsUrl: null,
	dateFormat: null,
	eventData: [],
	loadedSettings: false,
	loadedTSV: false
}

var clubName = null;
var sheetsUrl = null;
var dateFormat = null;
var eventData = [];

chrome.storage.sync.get(['clubName', 'sheetsUrl', 'dateFormat'], function(items) {
	errors = [];
	loadData = true;
	bail = false;

	if (items.sheetsUrl == null || items.sheetsUrl == "") {
		errors.push('Warning: A URL to a published Google Sheet document has not been set');

		loadData = false;
	}

	if (window.location.pathname == '/events' && (items.clubName == null || items.clubName == "")) {
		errors.push('Error: The club name has not been set');
		bail = true;
	}

	if (errors.length > 0) {
		errors.splice(0, 0, "Auto-publishing with TSV document has been disabled: use the extension options to configure");
		showErrorBanner(errors);

		if (bail) return;
	}

	settings.clubName = items.clubName;
	settings.sheetsUrl = items.sheetsUrl;
	settings.dateFormat = items.dateFormat;

	if (loadData) {
		var fetchedData = null;
		var promises = [];
		
		promises.push($j.ajax({
			url: items.sheetsUrl,
			success: function(data, status, xhr) {
				fetchedData = data;
			},
			error: function (xhr, status, error) {
				showErrorBanner(['Failed to retrieve data from TSV document']);
			}
		}));

		$j.when.apply(null, promises).done(function() {
			if (fetchedData == null) return;

			tsvToJson(fetchedData);
		});
	} else {
		settings.loadedTSV = false;
		settings.loadedSettings = true;
	}
});

function tsvToJson(tsv){
 
	var lines = tsv.split("\n");
	var headers = lines[0].split("\t");

	console.log('Parsing TSV output from Google Sheets:', sheetsUrl);
	
	for (var i = 1; i < lines.length; ++i) {   
		var obj = {};
		var currentline=lines[i].split("\t");

		if (currentline.length <= 7) {
			continue;
		}

		if (isValidWorld(currentline[2]) == false)
		{
			console.log(`Skipping line, valid world not found: ${currentline[2]}`);
			continue;
		}

		if (isValidDate(currentline[1]) == false)
		{
			console.log(`Skipping line, valid date not found: '${currentline[1]}'`);
			continue;
		}
		
		for (var j = 0; j < 7; ++j) {
			obj[headers[j]] = currentline[j];
			console.log(`${headers[j]}:  ${currentline[j]}`);
		}
   
		settings.eventData.push(obj);
		console.log('');
	}

	settings.loadedTSV = true;
	settings.loadedSettings = true;
}
