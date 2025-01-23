const links = [
    { url: "https://example.com", label: "Example" },
    { url: "https://google.com", label: "Google" },
    { url: "https://github.com", label: "GitHub" },
];

let editMode = false
let hoverTimeout = null; // Track the timeout for hover
let sourceNode = null; // Track the source node for edge creation
let selectedEdge = null;

const STORAGE_KEY = 'cytoscape-graph'; // LocalStorage key for the graph data

const toggleEditMode = () => {
    editMode = !editMode
    document.getElementById("editModeToggler").textContent = editMode ? "Disable Edit Mode" : "Enable Edit Mode"

    if (sourceNode) { // Clear the source node
        sourceNode.removeClass('selected');
        sourceNode = null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const tooltip = document.getElementById("node-tooltip");
    const contextMenu = document.getElementById('context-menu');
    const edgeContextMenu = document.getElementById('edge-context-menu');
    const deleteButton = document.getElementById('delete-edge');
    const addNodeButton = document.getElementById('add-node');
    let clickedPosition = null;

    edgeContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
        event.preventDefault();
    });
    contextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
        event.preventDefault();
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'linkInfo') {
            console.log("Received linkInfoForNetwork message:", message);
            addLink({
                url: message.href,
                label: message.linkText
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

    //add click listener to edit button
    document.getElementById("editModeToggler").addEventListener("click", toggleEditMode);

    // Initialize Cytoscape
    const cy = cytoscape({
        container: document.getElementById("cy"), // Reference to the container div

        elements: loadGraph()

        ,

        style: [
            {
                selector: "node",
                style: {
                    "background-color": "#0074D9",
                    label: "data(label)",
                    "text-valign": "bottom", //text-valign: top, center, bottom
                    "text-halign": "center",
                    color: "gold",
                    "font-size": "12px",
                },
            },
            {
                selector: "edge",
                style: {
                    width: 2,
                    "line-color": "#0074D9",
                    "target-arrow-color": "#0074D9",
                    "target-arrow-shape": "triangle",
                    "curve-style": "bezier",
                    label: 'data(label)', // Use the 'label' data attribute for the edge
                    'font-size': '10px',
                    'color': '#555',
                    'text-rotation': 'autorotate', // Align the label with the edge
                    'text-margin-y': -10, // Adjust the label's vertical position relative to the edge
                },
            },
            {
                selector: '.selected',
                style: {
                    'background-color': '#2ECC40', // Highlight the selected node
                    'border-width': 2,
                    'border-color': '#2ECC40',
                },
            },
            {
                selector: '.red-node',
                style: {
                    'background-color': 'red',
                },
            },

        ],

        layout: {
            name: "circle",
        },
    });

    // Prevent the browser's default context menu
    cy.container().addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
    // Make nodes clickable to open URLs in a new tab
    cy.on("tap", "node", (event) => {
        const node = event.target;
        if (editMode) {
            if (!sourceNode) {
                // Select the source node
                sourceNode = node;
                node.addClass('selected'); // Highlight the node
            } else {
                // Create an edge from the source to the target
                const targetNode = node;
                if (sourceNode.id() !== targetNode.id()) {
                    cy.add({
                        data: {
                            source: sourceNode.id(),
                            target: targetNode.id(),
                            label: `Edge: ${sourceNode.id()} → ${targetNode.id()}`,
                        },
                    });
                }

                // Reset selection
                sourceNode.removeClass('selected');
                sourceNode = null;

            }
        } else {
            clearTimeout(hoverTimeout)

            const href = node.data("href");
            if (href) {
                window.open(href, "_blank");
            }
        }
    });

    cy.on('tap', (event) => {
        if (event.target === cy) {
            if (sourceNode) {
                sourceNode.removeClass('selected');
                sourceNode = null;
            }
            // Hide the context menu for a click outside of it
            edgeContextMenu.style.display = 'none'; // Hide menu
            selectedEdge = null; // Clear selection
            contextMenu.style.display = 'none';
            clickedPosition = null;

        }
    });

    // Show tooltip on mouseover
    cy.on("mouseover", "node", (event) => {
        hoverTimeout = setTimeout(() => {
            const node = event.target;
            const label = node.data("label");
            const additionalInfo = node.data("href");

            // Set tooltip content
            tooltip.innerHTML = `
            <strong>${label}</strong><br>
            ${additionalInfo}
          `;

            // Position the tooltip near the mouse pointer
            tooltip.style.left = `${event.renderedPosition.x + 10}px`;
            tooltip.style.top = `${event.renderedPosition.y + 10}px`;
            tooltip.style.display = "block";
        }, 500)
    });

    // Move tooltip on mouse move
    cy.on("mousemove", "node", (event) => {
        tooltip.style.left = `${event.renderedPosition.x + 10}px`;
        tooltip.style.top = `${event.renderedPosition.y + 10}px`;
    });

    cy.on("grab", "node", () => clearTimeout(hoverTimeout));

    // Hide tooltip on mouseout
    cy.on("mouseout", "node", () => {
        tooltip.style.display = "none";
        clearTimeout(hoverTimeout); // Cancel hover action
    });

    // Show custom context menu
    cy.on('cxttap', (event) => {
        // Check if the click was on the background (not a node or edge)
        if (event.target === cy) {
            const pos = event.renderedPosition;
            contextMenu.style.left = `${pos.x}px`;
            contextMenu.style.top = `${pos.y}px`;
            contextMenu.style.display = 'block';

            // Save clicked position for adding the node
            clickedPosition = event.position;
        }
    });

    // Add a new red node
    addNodeButton.addEventListener('click', () => {
        if (clickedPosition) {
            const newNodeId = `node${cy.nodes().length + 1}`;
            cy.add({
                group: 'nodes',
                data: { id: newNodeId, label: `Node ${cy.nodes().length + 1}` },
                position: clickedPosition,
                classes: 'red-node', // Add the red-node class for styling
            });

            // Re-center layout to include new node
            cy.fit();

            // Hide context menu
            contextMenu.style.display = 'none';
            clickedPosition = null;
        }
    });

    // Show context menu on edge right-click
    cy.on('cxttap', 'edge', (event) => {
        event.preventDefault();

        selectedEdge = event.target; // Track the clicked edge

        // Position the context menu
        const pos = event.renderedPosition;
        edgeContextMenu.style.left = `${pos.x}px`;
        edgeContextMenu.style.top = `${pos.y}px`;
        edgeContextMenu.style.display = 'block';
    });

    // Handle edge deletion
    deleteButton.addEventListener('click', () => {
        if (selectedEdge) {
            selectedEdge.remove(); // Remove the selected edge
        }
        edgeContextMenu.style.display = 'none'; // Hide context menu
        selectedEdge = null; // Clear selection
    });


    const filterInput = document.getElementById('filter-input');
    const applyFilterButton = document.getElementById('apply-filter');
    const resetFilterButton = document.getElementById('reset-filter');
    const showReferencedNodesCheckbox = document.getElementById('show-referenced-nodes');

    // Apply filter
    applyFilterButton.addEventListener('click', () => {
        const prefix = filterInput.value.trim();
        if (prefix) {
            // cy.nodes().forEach((node) => {
            //   const label = node.data('label');
            //   if (label.startsWith(prefix)) {
            //     node.show(); // Show matching nodes
            //   } else {
            //     node.hide(); // Hide non-matching nodes
            //   }
            // });

            // // Hide edges that are connected to hidden nodes
            // cy.edges().forEach((edge) => {
            //   const sourceVisible = edge.source().visible();
            //   const targetVisible = edge.target().visible();
            //   if (sourceVisible && targetVisible) {
            //     edge.show();
            //   } else {
            //     edge.hide();
            //   }
            // });

            // Reset all elements to hidden first
            cy.elements().hide();
            // https://js.cytoscape.org/#collection/traversing 
            // Select nodes with the matching prefix
            const matchedNodes = cy.nodes().filter((node) =>
                node.data('label').startsWith(prefix)
            );

            // Show matched nodes
            matchedNodes.show();

            if (showReferencedNodesCheckbox.checked) {
                // Show nodes referenced from the matched nodes (through the edges connected to the matched nodes)
                matchedNodes.connectedEdges().targets().show();
            }
            // Show edges connected to the matched nodes
            matchedNodes.connectedEdges().show();

        }
    });

    // Reset filter
    resetFilterButton.addEventListener('click', () => {
        cy.elements().show(); // Show all nodes and edges
        filterInput.value = ''; // Clear input
    });




    // Save the graph to localStorage
    function saveGraph() {
        const graphData = cy.json(); // Get the current graph state
        localStorage.setItem(STORAGE_KEY, JSON.stringify(graphData));
    }

    // Load the graph from localStorage
    function loadGraph() {
        const savedGraph = localStorage.getItem(STORAGE_KEY);
        if (savedGraph) {
            return JSON.parse(savedGraph).elements; // Load the saved elements
        }
        // Default graph elements if nothing is saved
        return [
            // Add a central node representing the current page
            { data: { id: "current", label: "Current Page" } },

            // Add nodes and edges for each outgoing link
            ...links.map((link, index) => ({
                data: { id: `node-${index}`, label: link.label, href: link.url },
            })),
            ...links.map((link, index) => ({
                data: { source: "current", target: `node-${index}`, label: link.label },
            })),
        ];
    }

    function reloadGraph() {
        const savedGraph = localStorage.getItem(STORAGE_KEY);
        if (savedGraph) {
            const graphData = JSON.parse(savedGraph).elements;

            // Clear existing elements
            cy.elements().remove();

            // Add new elements
            cy.add(graphData);

            // Reapply layout
            cy.layout({ name: 'grid' }).run();


        } else {
            alert('No graph data found in localStorage!');
        }
    }

    // Save graph on button click
    document.getElementById('save-graph').addEventListener('click', saveGraph);
    document.getElementById('reload-graph').addEventListener('click', reloadGraph);

    // Automatically save graph on changes
    cy.on('add remove data', () => {
        saveGraph(); // Persist graph automatically on every modification
    });

    // Clear localStorage
    document.getElementById('clear-storage').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        alert('Local storage cleared!');
    });


    /**
     * Adds a new link to the graph visualization.
     * 
     * This function takes a link object containing a URL and a label, 
     * adds it to the existing list of links, and incorporates the new link 
     * into the Cytoscape graph as a node. An edge is also created from the 
     * central "current" node to the new node representing the link. 
     * The graph layout is then reapplied to organize the nodes.
     * 
     * @param {Object} link - The link object to add.
     * @param {string} link.url - The URL of the link.
     * @param {string} link.label - The label for the link.
     */

    const addLink = (link) => {

        const { url, label } = link;
        links.push({ url, label });
        cy.add({
            data: { id: `node-${links.length - 1}`, label, href: url },
        });
        cy.add({
            data: { source: "current", target: `node-${links.length - 1}`, label: label },
        });
        // Reapply the layout to organize the graph
        cy.layout({ name: 'circle' }).run();

    };


});

