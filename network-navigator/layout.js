const layoutButton = document.getElementById('layoutButton');
const applyLayoutButton = document.getElementById('applyLayout');
const layoutPanel = document.getElementById('layoutPanel');
const closePanelButton = document.getElementById('closeLayoutPanelButton');
const layoutValueInput = document.getElementById('layoutValue'); // .value.toLowerCase();
const onlyVisibleCheckBox = document.getElementById('onlyVisible'); //.checked
const onlySelectedCheckBox = document.getElementById('onlySelected'); //.checked


export const initializeLayout = (cy) => {
    layoutButton.addEventListener('click', () => {
        layoutPanel.style.display = 'block';
    });

    applyLayoutButton.addEventListener('click', () => {
        applyLayout(cy);
    })

    closePanelButton.addEventListener('click', () => {
        closeLayoutPanel();
    });
}


const closeLayoutPanel = () => {
    layoutPanel.style.display = 'none';
}


const applyLayout = (cy) => {
    const layoutValue = layoutValueInput.value.trim();
    const onlySelected = onlySelectedCheckBox.checked;
    if (layoutValue) {

        const newLayout = {
            name: layoutValue
        };
        if (layoutValue === 'concentric') {
            newLayout.concentric = function (node) {
                const weight = node.data('type') === 'company' ? 100 : (node.data('type') == 'person' ? 20 : 1);
                console.log(node.data('label'), weight);
                return weight;  // Nodes with higher weight go closer to center
            }
            newLayout.minNodeSpacing = 100;
        };
        if (layoutValue === 'concentric') {
            newLayout.rows = 3
            newLayout.sort = (a, b) => {
                // Define custom sorting based on node type
                const order = { 'company': 1, 'person': 2, 'education': 3 };
                return order[a.data('type')] - order[b.data('type')];
            }
        }
        const theElements = cy.collection();
        // add currently selected elements
        if (onlySelected) {
            theElements.merge(cy.$(':selected'));
            const layout = theElements.layout(newLayout);
            layout.run();
        }
        //https://js.cytoscape.org/#layouts

        else {
            const layout = cy.layout(newLayout);
            layout.run();

        }
    }
}