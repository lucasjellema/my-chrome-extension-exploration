let scrapeThem

scrapeThem = () => {
    const scrapedLinks = Array.from(document.getElementsByTagName('a'))
    .map(a => a.href)
    chrome.runtime.sendMessage({ action: 'scrapeLinks', links: scrapedLinks });
}

scrapeThem()