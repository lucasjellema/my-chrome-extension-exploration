chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scrapedTitle") {
    console.log(`Title: ${message.title} (URL: ${message.url})`);
  }
});
