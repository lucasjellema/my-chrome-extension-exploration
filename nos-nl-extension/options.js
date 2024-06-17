// Save options to chrome.storage
function saveOptions() {
    const highlightKeywords = document.getElementById('highlightKeywords');
    const hideNumbers = document.getElementById('hideNumbers');
    const optionsToUpdate = {
        highlightKeywords: highlightKeywords.value,
        hideNumbers: hideNumbers.checked
    }
    console.log(`optionsToUpdate`, optionsToUpdate)
    chrome.storage.sync.set(optionsToUpdate, () => {
        // Update status to let user know options were saved.
        alert('Options saved.');
    });
}

// Restore options from chrome.storage
function restoreOptions() {
    chrome.storage.sync.get(['highlightKeywords', 'hideNumbers'], (items) => {
        console.log(`restore options`, items)
        document.getElementById('highlightKeywords').value = items.highlightKeywords || '';
        document.getElementById('hideNumbers').checked = items.hideNumbers || '';
    });
}

document.getElementById('save').addEventListener('click', saveOptions);
document.addEventListener('DOMContentLoaded', restoreOptions);
