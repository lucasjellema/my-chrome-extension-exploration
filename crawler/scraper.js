const title = document.title;
chrome.runtime.sendMessage({ action: 'scrapedTitle', title: title, url: window.location.href });
