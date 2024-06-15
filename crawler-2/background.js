chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processLinks") {
    processLinks(message.links);
  } else if (message.action === "scrapedTitle") {
    console.log(`Title: ${message.title} (URL: ${message.url})`);
  }
});

function processLinks(links) {
  let index = 0;

  function processNextLink() {
    if (index >= links.length) {
      return;
    }

    const url = links[index];
    index++;

    chrome.tabs.create({ url: url, active: false }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              files: ["scraper.js"]
            },
            () => {
              chrome.tabs.remove(tab.id);
              processNextLink();
            }
          );
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }

  processNextLink();
}
