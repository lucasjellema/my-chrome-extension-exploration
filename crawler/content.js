// This script will be injected on demand
let scrapeThem

scrapeThem = () => {
    const scrapedLinks = Array.from(document.getElementsByTagName('a'))
    .map(a => a.href)
//    .filter(href => href.includes('specific-criteria')); // Replace with your specific criteria

    chrome.runtime.sendMessage({ action: 'scrapeLinks', links: scrapedLinks });
}

scrapeThem()