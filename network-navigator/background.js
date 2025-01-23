chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "linkInfoForNetwork",
    title: "Add Link to Network Navigator",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "linkInfoForNetwork") {
    console.log('link info clicked ', info);
    await chrome.sidePanel.open({ tabId: tab.id });

    (async () => {
      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'linkInfoRequest',href: info.linkUrl});
      console.log(response);
      // publish link details for use in side_panel.js
      chrome.runtime.sendMessage({
        type: 'linkInfo',
        linkText: response.link.linkText,
        title: response.link.title,
        sourceUrl: response.link.sourceUrl,
        href: response.link.href,
        id: response.link.id || null
      });
  
    })();

  }
});

