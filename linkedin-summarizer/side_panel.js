chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'linkedInInfo') {
      const contentDiv = document.getElementById('content');
      contentDiv.textContent = JSON.stringify(message);
    }
  });
  