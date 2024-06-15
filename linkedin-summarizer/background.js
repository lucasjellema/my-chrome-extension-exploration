chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`message received: ${message}`, message);
  if (message.type === 'linkedinProfile') {
    // TODO process profile (show in sidepane)
// publish link details for use in side_panel.js
chrome.runtime.sendMessage({
  type: 'linkedInInfo',
  data: message.data
});

    sendResponse({ status: 'success' });
  }
});


chrome.runtime.onInstalled.addListener(() => {
  console.log('background.js loaded - linkedin-summarizer extension');
})
