/**
 * Utility functions for the Chrome Summarizer Extension
 */

// Constants
const STORAGE_KEYS = {
    API_KEY: 'openai_api_key',
    SELECTED_TEXT: 'selected_text',
    LAST_SUMMARY: 'last_summary'
};

const API_CONFIG = {
    ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.7
};

const ERROR_MESSAGES = {
    NO_API_KEY: 'Please set your OpenAI API key first.',
    NO_TEXT_SELECTED: 'Please highlight some text on the webpage first.',
    API_ERROR: 'Failed to generate summary. Please check your API key and try again.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    INVALID_RESPONSE: 'Received invalid response from API.',
    TEXT_TOO_SHORT: 'Selected text is too short. Please select at least 10 characters.',
    TEXT_TOO_LONG: 'Selected text is too long. Please select less than 10,000 characters.'
};

/**
 * Validates text for summarization
 * @param {string} text - Text to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
function validateText(text) {
    if (!text || typeof text !== 'string') {
        return { valid: false, error: ERROR_MESSAGES.NO_TEXT_SELECTED };
    }

    const trimmedText = text.trim();

    if (trimmedText.length < 10) {
        return { valid: false, error: ERROR_MESSAGES.TEXT_TOO_SHORT };
    }

    if (trimmedText.length > 10000) {
        return { valid: false, error: ERROR_MESSAGES.TEXT_TOO_LONG };
    }

    return { valid: true, error: null };
}

/**
 * Validates OpenAI API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean}
 */
function validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }

    // OpenAI API keys start with 'sk-' and are at least 20 characters
    return apiKey.startsWith('sk-') && apiKey.length > 20;
}

/**
 * Sanitizes text by removing excessive whitespace
 * @param {string} text - Text to sanitize
 * @returns {string}
 */
function sanitizeText(text) {
    if (!text) return '';

    return text
        .trim()
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n{3,}/g, '\n\n');  // Replace multiple newlines with double newline
}

/**
 * Formats error messages for display
 * @param {Error|string} error - Error object or message
 * @returns {string}
 */
function formatErrorMessage(error) {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('401')) {
            return 'Invalid API key. Please check your OpenAI API key.';
        }
        if (error.message.includes('429')) {
            return 'Rate limit exceeded. Please try again later.';
        }
        if (error.message.includes('500')) {
            return 'OpenAI service error. Please try again later.';
        }

        return error.message || ERROR_MESSAGES.API_ERROR;
    }

    return ERROR_MESSAGES.API_ERROR;
}

/**
 * Creates a prompt for text summarization
 * @param {string} text - Text to summarize
 * @returns {string}
 */
function createSummaryPrompt(text) {
    return `Please provide a concise summary of the following text in 2-3 sentences:\n\n${text}`;
}

/**
 * Parses OpenAI API response
 * @param {Object} response - API response object
 * @returns {string} - Extracted summary text
 */
function parseApiResponse(response) {
    try {
        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
        }

        const summary = response.choices[0].message?.content;

        if (!summary) {
            throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
        }

        return summary.trim();
    } catch (error) {
        console.error('Error parsing API response:', error);
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
    }
}

/**
 * Storage helper: Save data to Chrome storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<void>}
 */
async function saveToStorage(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Storage helper: Get data from Chrome storage
 * @param {string} key - Storage key
 * @returns {Promise<any>}
 */
async function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    });
}

/**
 * Storage helper: Remove data from Chrome storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
async function removeFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.remove([key], () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Truncates text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength) + '...';
}

// Export for use in other scripts (if using modules)
// For non-module scripts, these are available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STORAGE_KEYS,
        API_CONFIG,
        ERROR_MESSAGES,
        validateText,
        validateApiKey,
        sanitizeText,
        formatErrorMessage,
        createSummaryPrompt,
        parseApiResponse,
        saveToStorage,
        getFromStorage,
        removeFromStorage,
        truncateText
    };
}
