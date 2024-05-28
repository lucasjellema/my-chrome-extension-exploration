# Scrape Crawler

* for current tab - scrape all the links (a elements)
  * popup.js executes script content.js in the context of the current tab
  * script content.js collects the links and communicates them to background.js
* visit all the pages linked to and collect their page titles
  * background.js receives the message with all links in a page
  * it processes these links navigate tab to each link
  * execute scraper.js in context of page when the page has loaded