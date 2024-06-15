# Chrome Extension - NOS.NL

This Chrome Extension work for site [nos.nl](https://nos.nl/).

It adds a button to all news items. The button, when pressed, sends a message to the background.js service worker with details for the news item (URL, title, body/summary). The service worker currently simply writes it to the console. It could also show in side panel, write to file, submit to REST API or (using a second extension in a second tab for WhatsApp) send it as WhatsApp message.

An options page is available for the extension. Options can be retrieved, changed and saved and are used in background.js and retrieved from there by content.js. Next step: apply options in content.js 


Manifest.json specifies een options page (options.html that loads options.js ); the storage permission is required to read and write options for an extension
Options are stored in Chrome per extension and are accessed through chrome.storage.sync get and set operations
Options can be read in background js and content.js using that same API. 
Content.js fetches the options from chrome.storage and uses the values for highlight keywords and hide numbers (yes/no) for manipulating the headers and body text for the news items (highlight all headers that contain any of the keywords; replace any digit with an * when the option to hide numbers is enabled). Buttons are added to every news item - to allow the user to "save" the news item (when pressed, the news item details are sent as message to background js) 


# Resources

Options for Extensions - https://developer.chrome.com/docs/extensions/develop/ui/options-page 
Chrome Storage API - https://developer.chrome.com/docs/extensions/reference/api/storage


