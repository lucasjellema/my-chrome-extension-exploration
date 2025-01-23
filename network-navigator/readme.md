# Chrome Extension - Network Navigator

This Chrome Extension adds a menu item to the context menu in case the menu is opened in the context of a link (an <a> element). When the item is activated, the properties of the link (text, url, title, ..) are captured from the DOM in the current document and communucated to the Side Panel. The Side Panel contains a graph data collection consisting of nodes (for pages) and edges (for links from a page to another page); this collection is visualized using the CytoscapeJS library.

The following mechanisms are at play:
* define permissions for contextMenus, sidePanel, activeTab and scripting in manifest.json
* define the context menu item in `background.js`
  * define the action to take when the item is cLicked: send message (to content.js), ask for link details, send response as message (to side_panel.js); the asynchronous single message-response is used with the active tab (where content.js listens for the message)
* in `content.js`: when a message of type *linkInfoRequest* is received, locate an `a` element in the DOM that has the same url as was passed from the link for which the context menu was clicked (or for which the link is within the local page itself and the combination of page source and local path is equal to the url from the context menu event); get the relevant details from that `a` element. NoteL: multiple elements can have that same `href` (url); the first one encountered in the DOM will be used. When the `<a>` is found and its properties are captured, a response message is sent (to `background.js`)
* the message is received in `background.js`. From it, a new message of type *linkInfo* is created and sent (to `side_panel.js`)
* in `side_panel.js` - the message is received and its contents is rendered in the `DIV` element (a little clunky but effective); the graphdata collection is extended and the Cytoscape instance is updated


## Network Graph

The Network Graph is visualized using Cytoscape JS - a JavaScript Library. 

The graph is stored in the browser local storage (after each change) and is reloaded when the extension is opened afresh. The graph data is used across instances of the browser on the same machine.

Nodes can be added from the context menu on the graph pane.
Edges can be added (in edit mode) by clicking on two different nodes
Edges can be removed (from the context menu on the edge)
(to be added) Nodes can be removed (from the context menu on the node)

Nodes can be filtered by label prefix. Nodes whose label fit with the filter are shown as well as edges between these nodes. Depending on the checkbox, all nodes referenced from these nodes are shown as well including the edged between all nodes. 

When a link is selected in the current web page and the option Add Link to Network Navigator is selected in the browser context menu, a node is added in the graph for both the current page and the referenced page with an edge between the two.