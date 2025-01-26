import { generateGUID } from './utils.js';
import { getSavedGraphs, saveGraph, getGraphById } from './utils.js';
const links = [
    { url: "https://example.com", label: "Example" },
    { url: "https://google.com", label: "Google" },
    { url: "https://github.com", label: "GitHub" },
];

let editMode = false
let hoverTimeout = null; // Track the timeout for hover
let sourceNode = null; // Track the source node for edge creation
let selectedEdge = null;
let selectedNode = null;
let changed = false;

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
    const nodeContextMenu = document.getElementById('node-context-menu');

    const deleteButton = document.getElementById('delete-edge');
    const addNodeButton = document.getElementById('add-node');
    const createGraphButton = document.getElementById('create-new-graph');
    const viewGraphsButton = document.getElementById('view-saved-graphs');
    let clickedPosition = null;

    edgeContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
        event.preventDefault();
    }); nodeContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
        event.preventDefault();
    });
    contextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
        event.preventDefault();
    });

    // Save graph button
    document.getElementById('save-graph').addEventListener('click', () => {
        saveCurrentGraph(cy);
    });



    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

    //add click listener to edit button
    document.getElementById("editModeToggler").addEventListener("click", toggleEditMode);
    let currentGraphId = localStorage.getItem('currentGraphId');
    const existingGraph = getGraphById(currentGraphId);
    setTitle(existingGraph?.title);
    // Initialize Cytoscape
    const cy = cytoscape({
        container: document.getElementById("cy"), // Reference to the container div

        elements: existingGraph?.elements

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
            name: "grid",
        },
    });

    // Track current graph ID

    if (!currentGraphId) {
        createNewGraph(cy)
    } else {
        // Load existing graph if available
        const existingGraph = getGraphById(currentGraphId);
        if (existingGraph) {
            cy.add(existingGraph.elements);
            document.getElementById('graph-title').value = existingGraph.title;
            document.getElementById('graph-description').value = existingGraph.description;
        }
    }

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
            selectedNode = null; // Clear selection
            nodeContextMenu.style.display = 'none'; // Hide menu
            selectedEdge = null; // Clear selection
            contextMenu.style.display = 'none';
            clickedPosition = null;

        }
    });

    // Show tooltip on mouseover
    // TODO do not show tooltip when context menu is open
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
            tooltip.style.left = `${event.renderedPosition.x + 15}px`;
            tooltip.style.top = `${event.renderedPosition.y + 15}px`;
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
            const newNodeId = generateGUID();

            cy.add({
                group: 'nodes',
                data: { id: newNodeId, label: `New Node` },
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

    createGraphButton.addEventListener('click', () => {
        createNewGraph(cy);
        contextMenu.style.display = 'none';
    });

    viewGraphsButton.addEventListener('click', (event) => {
        contextMenu.style.display = 'none';
        const savedGraphs = getSavedGraphs();
        const graphList = savedGraphs
            .map((graph) => `<div class="graph-item" data-id="${graph.id}">${graph.title} - ${graph.description}</div>`)
            .join('');

        const graphListModal = document.getElementById('graphs-overview');
        graphListModal.innerHTML = `
          <div style="background: white; padding: 20px; border: 1px solid #ccc;">
            <h3>Saved Graphs</h3>
            ${graphList || '<p>No graphs saved.</p>'}
            <button id="close-modal">Close</button>
          </div>
        `;
        graphListModal.style.left = `${event.x + 15}px`;
        graphListModal.style.top = `${event.y + 15}px`;
        graphListModal.style.display = "block";
        // Handle graph selection
        document.querySelectorAll('.graph-item').forEach((item) => {
            item.addEventListener('click', (event) => {
                const graphId = event.target.getAttribute('data-id');
                const selectedGraph = getGraphById(graphId);
                if (selectedGraph) {
                    localStorage.setItem('currentGraphId', graphId);
                    cy.elements().remove();
                    cy.add(selectedGraph.elements); // Load graph elements
                    // Reapply the layout to organize the graph
                    cy.layout({ name: 'grid' }).run();

                    document.getElementById("graph-title").value = selectedGraph.title;
                    document.getElementById("graph-description").value = selectedGraph.description;
                    setTitle(selectedGraph.title);
                }
                graphListModal.style.display = 'none';
            });
        });

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            graphListModal.style.display = 'none';
        });

       
    });

    cy.on('cxttap', 'node', (event) => {
        event.originalEvent.preventDefault(); // Prevent default browser context menu
        selectedNode = event.target; // Get the clicked node

        // Position the context menu near the mouse pointer
        const { clientX, clientY } = event.originalEvent;
        nodeContextMenu.style.left = `${clientX}px`;
        nodeContextMenu.style.top = `${clientY}px`;
        nodeContextMenu.style.display = 'block';
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


    // Handle context menu item click
    document.getElementById('delete-node').addEventListener('click', () => {
        if (selectedNode) {
            selectedNode.remove(); // Remove the node and its connected edges
            nodeContextMenu.style.display = 'none'; // Hide the context menu
            selectedNode = null; // Clear the selected node
        }
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


    // Load the graph from localStorage
    function loadGraph() {
        const savedGraph = localStorage.getItem(STORAGE_KEY);
        if (savedGraph) {
            return JSON.parse(savedGraph).elements; // Load the saved elements
        }
        // Default graph elements if nothing is saved
        const id = generateGUID();

        return [
            // Add a central node representing the current page

            { data: { id: id, label: "Current Page" } },

            // Add nodes and edges for each outgoing link
            ...links.map((link, index) => ({
                data: { id: `node-${index}`, label: link.label, href: link.url },
            })),
            ...links.map((link, index) => ({
                data: { source: id, target: `node-${index}`, label: link.label },
            })),
        ];
    }


    // Automatically save graph on changes
    cy.on('add remove data', () => {
        changed = true
//        saveCurrentGraph(cy)
    });

  // create peiodic timeout to save the graph if there are changes
    setInterval(() => {
        if (changed) {
            changed = false
            saveCurrentGraph(cy);            
        }
    }, 5000); // check every 5 seconds for a change

    // Clear localStorage
    document.getElementById('clear-storage').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        alert('Local storage cleared!');
    });



    const findNodeId = (property, value) => {
        const currentNodes = cy.nodes().filter((node) => node.data(property) === value);
        return currentNodes[0]?.id();
    };




    /**
     * Add a link to the graph. If the source or target do not yet exist in the graph, they will be created.
     * @param {Object} link - an object with properties targetUrl, targetLabel, sourceUrl, sourceTitle
     * @example
     * addLink({
     *     targetUrl: 'https://example.com',
     *     targetLabel: 'Example',
     *     sourceUrl: 'https://google.com',
     *     sourceTitle: 'Google',
     * });
     */
    const addLink = (link) => {
        const { targetUrl, targetLabel, sourceUrl, sourceTitle } = link;
        let sourceNodeId = findNodeId('href', sourceUrl);
        if (!sourceNodeId) {
            sourceNodeId = generateGUID();
            cy.add({
                data: { id: sourceNodeId, href: sourceUrl, label: sourceTitle, type: 'webpage' },
            });
        }

        let targetNodeId = findNodeId('href', targetUrl);
        if (!targetNodeId) {
            targetNodeId = generateGUID();
            cy.add({
                data: { id: targetNodeId, href: targetUrl, label: targetLabel, type: 'webpage' },
            });
        }
        // add link
        cy.add({
            data: { source: sourceNodeId, target: targetNodeId, label: targetLabel, type: 'weblink' },
        });
        // Reapply the layout to organize the graph
        cy.layout({ name: 'grid' }).run();

    };


});

function createNewGraph(cy) {
    console.log('creating new graph');
    const newId = generateGUID();
    localStorage.setItem('currentGraphId', newId); // Track the new graph ID
    console.log("new id and remove");
    cy.elements().remove(); // Clear the existing graph
    document.getElementById('graph-title').value = "New Graph";
    document.getElementById('graph-description').value = '';
    console.log("save new graph");
    setTitle('New Graph');
    saveCurrentGraph(cy);

}

function saveCurrentGraph(cy) {
    const currentGraphId = localStorage.getItem('currentGraphId');
    const title = document.getElementById('graph-title').value;
    const description = document.getElementById('graph-description').value;
    const elements = cy.json().elements;
    saveGraph(currentGraphId, title, description, elements);
}

const setTitle = (title) => {
    document.getElementById('graphTitle').textContent = title;
}