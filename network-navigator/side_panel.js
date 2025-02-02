import { createEdge, createNode, findNodeByProperty } from './utils.js';
import {processLinkedInProfile} from './processLinkedInProfile.js';
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === 'linkInfo') {
//     const contentDiv = document.getElementById('content');
//     contentDiv.textContent = `
//         Link Text: ${message.linkText}
//         Title: ${message.title}
//         Source URL: ${message.sourceUrl}
//         Link Href: ${message.href}
//         Element ID: ${message.id}
//       `;
//   }
// });

let cy

document.addEventListener("cyInitialized", (event) => {
  cy = event.detail;
  console.log("Cytoscape instance injected into the module!", cy);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === 'linkedInProfile') {

    processLinkedInProfile(cy, message);

  }

  if (message.type === 'linkInfo') {
    console.log("Received linkInfoForNetwork message:", message);
    addLink(cy, {
      targetUrl: message.href,
      targetLabel: message.linkText,
      sourceUrl: message.sourceUrl,
      sourceTitle: message.title

    })

    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.textContent = `
        Link Text: ${message.linkText}
        Title: ${message.title}
        Source URL: ${message.sourceUrl}
        Link Href: ${message.href}
        Element ID: ${message.id}
      `;
    }
  }
});



const addLink = (cy, link) => {
  const { targetUrl, targetLabel, sourceUrl, sourceTitle } = link;
  let sourceNode = findNodeByProperty(cy, 'url', sourceUrl);
  if (!sourceNode) {
    sourceNode = createNode(cy, sourceTitle);
    sourceNode.data('url', sourceUrl);
    sourceNode.data('type', 'webpage');
  }

  let targetNode = findNodeByProperty(cy, 'url', targetUrl);
  if (!targetNode) {
    targetNode = createNode(cy, targetLabel);
    targetNode.data('url', targetUrl);
    targetNode.data('type', 'webpage');
  }
  // add edge for hyperlink
  const edge = createEdge(cy, sourceNode, targetNode)
  edge.data('label', targetLabel);
  edge.data('type', 'hyperlink');
};

