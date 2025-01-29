chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`message received: ${message}`, message);
  if (message.action === 'sendEmail') {
    console.log('Request to send email received');    
    (async () => {
      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'sendEmail'});
      console.log(response);
      sendResponse({ status: 'success' });
    })();    
  }
  if (message.action === 'newEmail') {
    console.log('Request to create new email received');    
    (async () => {
      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'newEmail'});
      console.log(response);
      sendResponse({ status: 'success' });
    })();    
  }

  });


  chrome.runtime.onInstalled.addListener(() => {
    //chrome.sidePanel.open({ tabId: tab.id });

  });
  