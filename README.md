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
3. Go to **chrome://extensions** in your address bar to open the Extensions page
4. Click the **Load unpacked** button
5. Navigate to the folder you downloaded and extracted, and **Select Folder**
6. Enjoy!

Now when you edit an event, the extension will automatically fetch your published Google Sheet, update all categories, and hit Publish! for you.

If there is no match, you'll get an alert, and you should be able to edit the event as normal.

You can have as many events in the sheet as you want, and shuffle them around as needed, e.g. delete the past month to update with new data. It will
iterate over all rows to find a matching entry.

Some courses, such as Bologna TT, if you want to do multiple laps, you'll need to enter a distance. This is a limitation with Zwift's event editing UI.
In any case, you can always make further edits if needed.
