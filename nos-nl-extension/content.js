const restoreOptions = (callforward) => {
  chrome.storage.sync.get(['highlightKeywords', 'hideNumbers'], (items) => {
    extensionOptions.highlightKeywords = items.highlightKeywords || ''
    extensionOptions.hideNumbers = items.hideNumbers || ''
    callforward()
  });
}

const extensionOptions = {}
const NEWS_ITEM_LI_CLASS = "sc-27eaedb2-0" //BRITTLE! This class name can change

const processNewsItems = async () => {
  const newsItems = document.getElementsByClassName(NEWS_ITEM_LI_CLASS)

  // highlight all items with one of the keywords in the title
  for (let i = 0; i < newsItems.length; i++) {
    const newsItemElement = newsItems[i]
    addButtonToNewsItem(newsItemElement)
    highlightItem(newsItemElement)
    if (extensionOptions.hideNumbers)  hideNumbers(newsItemElement)
  }
}

const highlightItem = (newsItemElement) => {
if (!extensionOptions.highlightKeywords) return
  const link = newsItemElement.getElementsByTagName('a')[0]
  // link has two direct div children; first one contains image  , the second the heading  (h2) and body (p)
  const keywords = extensionOptions.highlightKeywords.toLowerCase().split(',')
  if (link) {
    const headingElement = link.children[1].getElementsByTagName('h2')[0]
    if (!headingElement) return
    const headingText = headingElement.textContent
    // if heading text contains one of the keywords
    for (let i = 0; i < keywords.length; i++) {
      if (headingText.toLowerCase().includes(keywords[i])) {
        headingElement.style.backgroundColor = 'yellow'
      }
    }
  }
}


const hideNumbers = (newsItemElement) => {
  const link = newsItemElement.getElementsByTagName('a')[0]
  // link has two direct div children; first one contains image  , the second the heading  (h2) and body (p)
  if (link) {
    const headingElement = link.children[1].getElementsByTagName('h2')[0]
    if (!headingElement) return
    const headingText = headingElement.textContent
    // replace every digit in heading text with *
    headingElement.textContent = headingText.replace(/\d/g, '*')

    const bodyElement = link.children[1].getElementsByTagName('p')[0]
    const bodyText = bodyElement.textContent
    bodyElement.textContent = bodyText.replace(/\d/g, '*')
  }
}

const addButtonToNewsItem = (newsItemElement) => {

  const button = document.createElement('button');
  button.textContent = 'Save Item For Me';
  button.className = 'save-email-button';
  button.style.marginLeft = '10px';
  button.onclick = function () {

    const link = newsItemElement.getElementsByTagName('a')[0]
    // link has two direct div children; first one contains image  , the second the heading  (h2) and body (p)

    if (link) {
      const heading = link.children[1].getElementsByTagName('h2')[0].textContent
      const body = link.children[1].getElementsByTagName('p')[0].textContent
      const item = { heading, body, itemUrl: link.href }
      console.log(link, item)
      // send news item to background
      chrome.runtime.sendMessage({ type: 'saveNewsItem', data: item });
    }
  };
  newsItemElement.appendChild(button);
}

console.log(`content.js nos.nl extension loaded, go process news items`)

restoreOptions(processNewsItems)


const listenForOptionChanges = () => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(`listener in CONTENT>JS for storage changes has fired`)
    let relevantChange = false
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
      if (key === 'highlightKeywords' || key === 'hideNumbers') {
        extensionOptions[key] = newValue
        relevantChange = true
      }
    }
    if (relevantChange) processNewsItems()
  });
}

listenForOptionChanges()