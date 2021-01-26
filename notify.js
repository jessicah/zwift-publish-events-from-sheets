function showErrorBanner(messages)
{
	var message = messages.shift();		
	waitForElement("div.znv-reset", message);
	
	for (var ix = 0; ix < messages.length; ++ix) {
		console.log(messages[ix]);
	}

	setTimeout(function() {
		$j('div#extn-message').remove();
	}, 10000);
}

function waitForElement(selector, message)
{
	var element = $j(selector);
	if (element.length == 0) {
		setTimeout(waitForElement, 1000, selector, message);
		return;
	}

	$j(element[0]).prepend(`<div id='extn-message' style='text-align:center;background-color:bisque;line-height:200%;z-index:1001'>${message}</div>`);

	setTimeout(function() {
		$j('div#extn-message').remove();
	}, 30000);
}
