/**
 * Popup Script
 * Manages the extension popup UI and user interactions
 */

// DOM Elements
let apiKeyInput;
let saveApiKeyBtn;
let apiKeySection;
let summarySection;
let statusText;
let clearApiKeyBtn;
let loadingState;
let summaryContent;
let summaryText;
let copyButton;
let errorState;
let errorText;
let instructionState;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    apiKeyInput = document.getElementById('apiKey');
    saveApiKeyBtn = document.getElementById('saveApiKey');
    apiKeySection = document.getElementById('apiKeySection');
    summarySection = document.getElementById('summarySection');
    statusText = document.getElementById('statusText');
    clearApiKeyBtn = document.getElementById('clearApiKey');
    loadingState = document.getElementById('loadingState');
    summaryContent = document.getElementById('summaryContent');
    summaryText = document.getElementById('summaryText');
    copyButton = document.getElementById('copyButton');
    errorState = document.getElementById('errorState');
    errorText = document.getElementById('errorText');
    instructionState = document.getElementById('instructionState');

    // Set up event listeners
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    clearApiKeyBtn.addEventListener('click', handleClearApiKey);
    copyButton.addEventListener('click', handleCopyToClipboard);

    // Allow Enter key to save API key
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSaveApiKey();
        }
    });

    // Check if API key exists
    await checkApiKey();
});

/**
 * Checks if API key is stored and shows appropriate section
 */
async function checkApiKey() {
    try {
        const apiKey = await getFromStorage(STORAGE_KEYS.API_KEY);

        if (apiKey && validateApiKey(apiKey)) {
            // Show summary section
            showSummarySection();
            // Try to get selected text and summarize
            await attemptSummarization(apiKey);
        } else {
            // Show API key input section
            showApiKeySection();
        }
    } catch (error) {
        console.error('Error checking API key:', error);
        showApiKeySection();
    }
}

/**
 * Handles saving the API key
 */
async function handleSaveApiKey() {
    const apiKey = apiKeyInput.value.trim();

    if (!validateApiKey(apiKey)) {
        showError('Please enter a valid OpenAI API key (starts with "sk-")');
        return;
    }

    try {
        await saveToStorage(STORAGE_KEYS.API_KEY, apiKey);
        apiKeyInput.value = '';
        showSummarySection();
        await attemptSummarization(apiKey);
    } catch (error) {
        showError('Failed to save API key. Please try again.');
        console.error('Error saving API key:', error);
    }
}

/**
 * Handles clearing the API key
 */
async function handleClearApiKey() {
    try {
        await removeFromStorage(STORAGE_KEYS.API_KEY);
        showApiKeySection();
    } catch (error) {
        showError('Failed to clear API key. Please try again.');
        console.error('Error clearing API key:', error);
    }
}

/**
 * Attempts to get selected text and generate summary
 */
async function attemptSummarization(apiKey) {
    try {
        // Show loading state
        showLoading();

        // Get selected text from storage (set by content script)
        const selectedText = await getFromStorage('selected_text');

        if (!selectedText || selectedText.trim().length === 0) {
            // No text selected, show instruction
            showInstruction();
            return;
        }

        // Validate text
        const validation = validateText(selectedText);
        if (!validation.valid) {
            showError(validation.error);
            return;
        }

        // Send message to background script to summarize
        chrome.runtime.sendMessage(
            {
                action: 'summarizeText',
                text: selectedText,
                apiKey: apiKey
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    showError('Extension error: ' + chrome.runtime.lastError.message);
                    return;
                }

                if (response.success) {
                    showSummary(response.summary);
                } else {
                    showError(response.error || 'Failed to generate summary');
                }
            }
        );

    } catch (error) {
        showError(formatErrorMessage(error));
        console.error('Summarization error:', error);
    }
}

/**
 * Handles copying summary to clipboard
 */
async function handleCopyToClipboard() {
    const text = summaryText.textContent;

    try {
        await navigator.clipboard.writeText(text);

        // Show feedback
        const originalText = copyButton.textContent;
        copyButton.textContent = '✓ Copied!';
        copyButton.style.background = '#4caf50';
        copyButton.style.color = 'white';

        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.background = '';
            copyButton.style.color = '';
        }, 2000);

    } catch (error) {
        showError('Failed to copy to clipboard');
        console.error('Copy error:', error);
    }
}

/**
 * Shows the API key input section
 */
function showApiKeySection() {
    apiKeySection.style.display = 'block';
    summarySection.style.display = 'none';
}

/**
 * Shows the summary section
 */
function showSummarySection() {
    apiKeySection.style.display = 'none';
    summarySection.style.display = 'block';
}

/**
 * Shows loading state
 */
function showLoading() {
    loadingState.style.display = 'flex';
    summaryContent.style.display = 'none';
    errorState.style.display = 'none';
    instructionState.style.display = 'none';
    statusText.textContent = 'Generating...';
}

/**
 * Shows summary
 */
function showSummary(summary) {
    loadingState.style.display = 'none';
    summaryContent.style.display = 'block';
    errorState.style.display = 'none';
    instructionState.style.display = 'none';

    summaryText.textContent = summary;
    statusText.textContent = 'Summary generated';
}

/**
 * Shows error message
 */
function showError(message) {
    loadingState.style.display = 'none';
    summaryContent.style.display = 'none';
    errorState.style.display = 'block';
    instructionState.style.display = 'none';

    errorText.textContent = message;
    statusText.textContent = 'Error';
}

/**
 * Shows instruction message
 */
function showInstruction() {
    loadingState.style.display = 'none';
    summaryContent.style.display = 'none';
    errorState.style.display = 'none';
    instructionState.style.display = 'block';

    statusText.textContent = 'Ready';
}

console.log('Popup script loaded');
