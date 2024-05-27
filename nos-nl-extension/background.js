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

chrome.runtime.onInstalled.addListener(() => {
  restoreOptions()
})

const restoreOptions = () => {
  chrome.storage.sync.get(['highlightKeywords', 'hideNumbers'], (items) => {
    console.log(`background restore options`, items)
    options.highlightKeywords = items.highlightKeywords || ''
    options.hideNumbers = items.hideNumbers || ''
    options.loaded = true
  });
}

