document.getElementById('scrape').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ["content2.js"]
        },
        () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'scrapeLinks' });
        }
      );
    });
  });
  