chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'linkInfo') {
      const contentDiv = document.getElementById('content');
      contentDiv.textContent = `
        Link Text: ${message.linkText}
        Title: ${message.title}
        Source URL: ${message.sourceUrl}
        Link Href: ${message.href}
        Element ID: ${message.id}
      `;
    }
  });
  