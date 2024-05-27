console.log(`content.js loaded`)

const NEWS_ITEM_LI_CLASS = "sc-27eaedb2-0"

const processNewsItems = () => {
  const newsItems = document.getElementsByClassName(NEWS_ITEM_LI_CLASS)
  console.log(`Found ${newsItems.length} news items`)
  for (let i = 0; i < newsItems.length; i++) {
    const newsItemElement = newsItems[i]
    addButtonToNewsItem(newsItemElement)
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
      const divs = link.getElementsByTagName('div')

      
      const heading = link.children[1].getElementsByTagName('h2')[0].textContent   
      const body = link.children[1].getElementsByTagName('p')[0].textContent   
      const item = { heading, body, itemUrl: link.href }
      console.log(link, item)
      chrome.runtime.sendMessage({ action: 'saveNewsItem', data: item });
    }
    console.log(`save news item `, newsItemElement)
  };
  newsItemElement.appendChild(button);
}
processNewsItems()