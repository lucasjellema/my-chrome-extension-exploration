function loadNextLink(links, index) {
  if (index >= links.length) {
    return;
  }
  const url = links[index];
  let iframe = document.getElementById('scraper-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.id = 'scraper-iframe';
    document.body.appendChild(iframe);
  }
  iframe.src = url;
  iframe.onload = () => {
    try {
      const title = iframe?.contentDocument?.title;
      if (title) chrome.runtime.sendMessage({ action: 'scrapedTitle', title: title, url: url });
    } catch (error) {
    }
    loadNextLink(links, index + 1);
  };
}

// Start the scraping process
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scrapeLinks') {
    const links = Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
    loadNextLink(links, 0);
  }
});

console.log('content2.js loaded - link crawler extension');