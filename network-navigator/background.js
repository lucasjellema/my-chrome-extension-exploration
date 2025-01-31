chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "linkInfoForNetwork",
    title: "Add Link to Network Navigator",
    contexts: ["link"]
  });
  chrome.contextMenus.create({
    id: "linkedInInfoForNetwork",
    title: "Add LinkedIn Details to Network Navigator",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.linkedin.com/*"] 
  });
});


chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "togglePageType") {
    chrome.contextMenus.update("linkedInInfoForNetwork", {
      visible: message.personPage||message.companyPage,
      title: message.personPage ? "Add LinkedIn Person Details to Network Navigator" : "Add LinkedIn Company Details to Network Navigator"
    });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "linkInfoForNetwork") {
    await handleLinkInfo(info, tab);  
  }
  if (info.menuItemId === "linkedInInfoForNetwork") {
    await handleLinkedInInfo(info, tab);
  }
});

async function handleLinkedInInfo(info, tab) {
  console.log('linkedIn person info clicked ', info);
  //await chrome.sidePanel.open({ tabId: tab.id });
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'linkedInInfoRequest'});
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'linkedInProfile',
      profile: response.data,
      linkedInUrl: response.linkedInUrl
    });
  })()
}


async function handleLinkInfo(info, tab) {
  console.log('link info clicked ', info);
  //await chrome.sidePanel.open({ tabId: tab.id });

  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'linkInfoRequest', href: info.linkUrl });
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
