import { createEdge, createNode, findNodeByProperty } from './utils.js';

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === 'linkedInProfile') {

    processLinkedInProfile(message);

  }

  if (message.type === 'linkInfo') {
    console.log("Received linkInfoForNetwork message:", message);
    addLink({
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

let cy

document.addEventListener("cyInitialized", (event) => {
  cy = event.detail;
  console.log("Cytoscape instance injected into the module!", cy);
});

const addLink = (link) => {
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

const processLinkedInProfile = (message) => {
  const contentDiv = document.getElementById('content');
  contentDiv.textContent = `
        Profile Type: ${JSON.stringify(message.profile.type)} \n
        Profile: ${JSON.stringify(message.profile)}
        LinkedIn URL: ${message.linkedInUrl}
      `;

  const profile = message.profile;
  if (profile.type === 'person') {
    let personNode = findNodeByProperty(cy, 'label', profile.name);
    if (!personNode) {
      personNode = createNode(cy, profile.name);
      personNode.data('url', message.linkedInUrl);
      personNode.data('type', profile.type);
      personNode.data('subtype', `linkedIn${profile.type}`);      
    }
    if (profile.image) personNode.data('image', profile.image);
    personNode.data('about', profile.about);
    if (profile.location) personNode.data('location', profile.location);

    if (profile.currentCompany) {
      let companyNode = findNodeByProperty(cy, 'label', profile.currentCompany);
      if (!companyNode) {
        companyNode = createNode(cy, profile.currentCompany);
        companyNode.data('image', profile.currentCompanyLogo);
        companyNode.data('type', 'company');
        companyNode.data('shape', 'square');
      }
      const edge = createEdge(cy, personNode, companyNode);
      edge.data('label', 'works at');
      edge.data('type', 'workAt');
      edge.data('currentRole', profile.currentRole);
    }
    if (profile.latestEducation) {
      let educationNode = findNodeByProperty(cy, 'label', profile.latestEducation);
      if (!educationNode) {
        educationNode = createNode(cy, profile.latestEducation);
        educationNode.data('image', profile.latestEducationLogo);
        educationNode.data('type', 'education');
        educationNode.data('shape', 'diamond');
      }
      const edge = createEdge(cy, personNode, educationNode);
      edge.data('label', 'educated at');
      edge.data('type', 'educatedAt');
    }
  }
}

