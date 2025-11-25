/**
 * Content Script - Runs on all web pages
 * Handles text selection and communication with background script
 */

let selectedText = '';

/**
 * Captures text selection from the page
 */
function captureTextSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text) {
        selectedText = text;
        // Store selected text for popup to access
        chrome.storage.local.set({ selected_text: text }, () => {
            console.log('Text selected:', truncateText(text, 50));
        });
    }
}

/**
 * Listen for text selection events
 */
document.addEventListener('mouseup', () => {
    // Small delay to ensure selection is complete
    setTimeout(captureTextSelection, 100);
});

document.addEventListener('keyup', (event) => {
    // Capture selection on keyboard shortcuts (Ctrl+A, Shift+Arrow, etc.)
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
        setTimeout(captureTextSelection, 100);
    }
});

/**
 * Listen for messages from popup or background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        sendResponse({
            success: true,
            text: text || selectedText
        });
    }

    return true; // Keep message channel open for async response
});

/**
 * Helper function to truncate text for logging
 */
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

console.log('Text Summarizer content script loaded');
