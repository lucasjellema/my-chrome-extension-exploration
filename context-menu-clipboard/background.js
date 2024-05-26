// function getLinkInfo(linkUrl) {
//   const linkElements = document.querySelectorAll(`a[href='${linkUrl}']`);
//   if (linkElements.length > 0) {
//     const linkElement = linkElements[0];
//     const linkText = linkElement.innerText || linkElement.textContent;
//     const pageTitle = document.title;
//     const sourceUrl = window.location.href;
//     const id = linkElement.id;

//     chrome.runtime.sendMessage({
//       linkText: linkText,
//       title: pageTitle,
//       sourceUrl: sourceUrl,
//       href: linkUrl,
//       id: id
//     });
//   }
// }


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "linkInfo",
    title: "Get Link Info",
    contexts: ["link"]
  });
});



chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "linkInfo") {
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



    // chrome.scripting.executeScript({
    //   target: { tabId: tab.id },
    //   func: getLinkInfo,
    //   args: [info.linkUrl]
    // });
  }
});

