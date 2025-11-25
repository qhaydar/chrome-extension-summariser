/**
 * Background Service Worker
 * Handles API calls to OpenAI and communication between content script and popup
 */

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'summarizeText') {
        handleSummarization(request.text, request.apiKey)
            .then(summary => {
                sendResponse({ success: true, summary });
            })
            .catch(error => {
                sendResponse({
                    success: false,
                    error: formatErrorMessage(error)
                });
            });

        return true; // Keep message channel open for async response
    }
});

/**
 * Handles the text summarization process
 * @param {string} text - Text to summarize
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} - Summary text
 */
async function handleSummarization(text, apiKey) {
    // Validate inputs
    if (!apiKey || !apiKey.startsWith('sk-')) {
        throw new Error('Invalid API key');
    }

    const validation = validateText(text);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Sanitize text
    const sanitizedText = sanitizeText(text);

    // Create prompt
    const prompt = createSummaryPrompt(sanitizedText);

    // Call OpenAI API
    try {
        const summary = await callOpenAI(prompt, apiKey);

        // Store last summary
        await chrome.storage.local.set({
            last_summary: summary,
            last_summary_time: Date.now()
        });

        return summary;
    } catch (error) {
        console.error('Summarization error:', error);
        throw error;
    }
}

/**
 * Calls OpenAI API to generate summary
 * @param {string} prompt - Prompt for summarization
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} - Summary text
 */
async function callOpenAI(prompt, apiKey) {
    const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that creates concise summaries of text.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 150,
        temperature: 0.7
    };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenAI API key.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (response.status === 500) {
                throw new Error('OpenAI service error. Please try again later.');
            } else {
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }
        }

        const data = await response.json();
        return parseApiResponse(data);

    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

/**
 * Validates text for summarization
 * @param {string} text - Text to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
function validateText(text) {
    if (!text || typeof text !== 'string') {
        return { valid: false, error: 'No text provided' };
    }

    const trimmedText = text.trim();

    if (trimmedText.length < 10) {
        return { valid: false, error: 'Selected text is too short. Please select at least 10 characters.' };
    }

    if (trimmedText.length > 10000) {
        return { valid: false, error: 'Selected text is too long. Please select less than 10,000 characters.' };
    }

    return { valid: true, error: null };
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
        .replace(/[^\S\n]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n');
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
            throw new Error('Invalid response from API');
        }

        const summary = response.choices[0].message?.content;

        if (!summary) {
            throw new Error('Invalid response from API');
        }

        return summary.trim();
    } catch (error) {
        console.error('Error parsing API response:', error);
        throw new Error('Invalid response from API');
    }
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
        return error.message || 'An error occurred while generating the summary.';
    }

    return 'An error occurred while generating the summary.';
}

console.log('Text Summarizer background service worker loaded');
