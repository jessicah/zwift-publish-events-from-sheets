# Zwift: Publish Events from Google Sheets

This is a new variation on [Zwift: Edit Events Extension](https://github.com/jessicah/zwift-edit-events-extensions), that pulls data from a published Google Sheet document.

An example of an events document: https://docs.google.com/spreadsheets/d/1jlLrcjJK6UdQuqB72RYXUvdHK4zE6JrkLDBjCIFJ2CE/edit?usp=sharing

Important: Event date is in UTC.

To publish Google Sheet:

1. **File**
2. **Publish to the web**
3. Link: **Sheet1**, **Tab-separated values (.tsv)**
4. **Publish**
5. Copy the URL and save it for the install step

The **Automatically republish when changes are made** should also be checked (seems to be on by default).

To install:

1. Download from https://github.com/jessicah/zwift-publish-events-from-sheets, click on the **Code** drop-down > **Download ZIP** and extract contents somewhere useful
2. Open the file `edit-all-cats.js`, and replace the URL for `googleSheetsTsvUrl` with your published sheet URL
3. Open the file `manage-events.js`, and replace the `clubName` with your club's URL fragment
4. Go to **chrome://extensions** in your address bar to open the Extensions page
5. Click the **Load unpacked** button
6. Navigate to the folder you downloaded and extracted, and **Select Folder**
7. Enjoy!

To use:

1. Navigate to [Zwift Events](https://www.zwift.com/events/)
2. Click on **Manage my events**

Upon loading your club events, the extension will go through each event one-by-one, opening a tab and running the `update from sheets` script. Once
you're done, close the tab, and the next event will be opened. This will repeat until finished.

The `update from sheets` will automatically fetch your published Google Sheet, update all categories, and hit Publish! for you.

If there is no match, you'll get an alert, and you should be able to edit the event as normal.

You can have as many events in the sheet as you want, and shuffle them around as needed, e.g. delete the past month to update with new data. It will
iterate over all rows to find a matching entry.

Some courses, such as Bologna TT, if you want to do multiple laps, you'll need to enter a distance. This is a limitation with Zwift's event editing UI.
In any case, you can always make further edits if needed.
