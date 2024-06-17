chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {  
  if (message.type === 'saveNewsItem') {
    console.log(`News Item report received: ${message}`, message);
    sendResponse({ status: 'success' });
  }
});