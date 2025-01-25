const STORAGE_KEY = 'networknavigator-cytoscape-graphs';   // LocalStorage key for the graph data
// 
export function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Get all saved graphs from local storage
export function getSavedGraphs() {
    const graphs = localStorage.getItem(STORAGE_KEY);
    return graphs ? JSON.parse(graphs) : [];
}

// Save a graph to local storage
export function saveGraph(id, title, description, elements) {
    const graphs = getSavedGraphs();
    const graphIndex = graphs.findIndex((graph) => graph.id === id);

    const newGraph = { id, title, description, elements };

    if (graphIndex > -1) {
        graphs[graphIndex] = newGraph; // Update existing graph
    } else {
        graphs.push(newGraph); // Add new graph
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(graphs));
}

// Get a graph by ID
export function getGraphById(id) {
    const graphs = getSavedGraphs();
    return graphs.find((graph) => graph.id === id) || null;
}