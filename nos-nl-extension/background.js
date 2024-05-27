chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log(`message received: ${message}`, message);
  if (message.type === 'optionsRequest') {
    if (!options.loaded) restoreOptions();
    sendResponse({ status: 'success', options });
  }
});

const options = {
  loaded: false
}


const listenForOptionChanges = () => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
    }
    restoreOptions()
    sendOptionsToContent()
  });
}


const sendOptionsToContent = () => {
  (async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'optionsUpdate',options: options});
    } catch (error) {
      console.error('failed to send options',error); // probably because the tab is not active because the options page is active?! perhaps have content.js ask for current options every X seconds??
    }
    console.log('reported options to content.js',response);

  })();
}

chrome.runtime.onInstalled.addListener(() => {
  restoreOptions()
  listenForOptionChanges()
})

const restoreOptions = () => {
  chrome.storage.sync.get(['highlightKeywords', 'hideNumbers'], (items) => {
    console.log(`background restore options`, items)
    options.highlightKeywords = items.highlightKeywords || ''
    options.hideNumbers = items.hideNumbers || ''
    options.loaded = true
  });
}

