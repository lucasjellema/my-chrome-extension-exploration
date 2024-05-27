# Chrome Extension - NOS.NL

This Chrome Extension work for site [nos.nl](https://nos.nl/).

It adds a button to all news items. The button, when pressed, sends a message to the background.js service worker with details for the news item (URL, title, body/summary). The service worker currently simply writes it to the console. It could also show in side panel, write to file, submit to REST API or (using a second extension in a second tab for WhatsApp) send it as WhatsApp message.

TODO:
* add highlighting for keywords
* replace numbers with # (to not spoil the surprise with football scores)
* ...
