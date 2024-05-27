// Save options to chrome.storage
function saveOptions() {
    const highlightKeywords = document.getElementById('highlightKeywords').value;
    const hideNumbers = document.getElementById('hideNumbers').value;

    chrome.storage.sync.set({
        highlightKeywords: highlightKeywords,
        hideNumbers: hideNumbers
    }, () => {
        // Update status to let user know options were saved.
        alert('Options saved.');
    });


}

// Restore options from chrome.storage
function restoreOptions() {
    chrome.storage.sync.get(['highlightKeywords', 'hideNumbers'], (items) => {
        console.log(`restore options`, items)
        document.getElementById('highlightKeywords').value = items.highlightKeywords || '';
        document.getElementById('hideNumbers').value = items.hideNumbers || '';
    });
}

document.getElementById('save').addEventListener('click', saveOptions);
document.addEventListener('DOMContentLoaded', restoreOptions);
