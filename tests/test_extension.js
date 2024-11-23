/**
 * End-to-End Tests for Chrome Summarizer Extension
 * Tests core functionality using sample data
 */

// Load sample data
const fs = require('fs');
const path = require('path');

// Test results tracking
let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

/**
 * Simple test assertion
 */
function assert(condition, testName, errorMessage) {
    if (condition) {
        testsPassed++;
        console.log(`✅ PASS: ${testName}`);
        return true;
    } else {
        testsFailed++;
        failedTests.push({ test: testName, error: errorMessage });
        console.log(`❌ FAIL: ${testName}`);
        console.log(`   Error: ${errorMessage}`);
        return false;
    }
}

/**
 * Test Suite: Text Validation
 */
function testTextValidation() {
    console.log('\n📋 Testing Text Validation...\n');

    // Mock validateText function (from utils.js)
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

    // Test 1: Empty text
    const result1 = validateText('');
    assert(
        !result1.valid,
        'Empty text should be invalid',
        `Expected invalid, got valid=${result1.valid}`
    );

    // Test 2: Very short text
    const result2 = validateText('Hi');
    assert(
        !result2.valid && result2.error.includes('too short'),
        'Very short text should be invalid',
        `Expected "too short" error, got: ${result2.error}`
    );

    // Test 3: Valid text
    const result3 = validateText('This is a valid text that is long enough to be processed.');
    assert(
        result3.valid,
        'Valid text should pass validation',
        `Expected valid, got valid=${result3.valid}, error=${result3.error}`
    );

    // Test 4: Very long text
    const longText = 'a'.repeat(10001);
    const result4 = validateText(longText);
    assert(
        !result4.valid && result4.error.includes('too long'),
        'Very long text should be invalid',
        `Expected "too long" error, got: ${result4.error}`
    );

    // Test 5: Null text
    const result5 = validateText(null);
    assert(
        !result5.valid,
        'Null text should be invalid',
        `Expected invalid, got valid=${result5.valid}`
    );
}

/**
 * Test Suite: API Key Validation
 */
function testApiKeyValidation() {
    console.log('\n🔑 Testing API Key Validation...\n');

    // Mock validateApiKey function (from utils.js)
    function validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }
        return apiKey.startsWith('sk-') && apiKey.length > 20;
    }

    // Test 1: Valid API key format
    assert(
        validateApiKey('sk-1234567890abcdefghijklmnop'),
        'Valid API key should pass',
        'Valid format was rejected'
    );

    // Test 2: Invalid prefix
    assert(
        !validateApiKey('pk-1234567890abcdefghijklmnop'),
        'Invalid prefix should fail',
        'Invalid prefix was accepted'
    );

    // Test 3: Too short
    assert(
        !validateApiKey('sk-short'),
        'Too short API key should fail',
        'Short key was accepted'
    );

    // Test 4: Empty string
    assert(
        !validateApiKey(''),
        'Empty string should fail',
        'Empty string was accepted'
    );

    // Test 5: Null value
    assert(
        !validateApiKey(null),
        'Null value should fail',
        'Null was accepted'
    );
}

/**
 * Test Suite: Text Sanitization
 */
function testTextSanitization() {
    console.log('\n🧹 Testing Text Sanitization...\n');

    // Mock sanitizeText function (from utils.js)
    function sanitizeText(text) {
        if (!text) return '';

        return text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\n{3,}/g, '\n\n');
    }

    // Test 1: Multiple spaces
    const result1 = sanitizeText('Hello    world');
    assert(
        result1 === 'Hello world',
        'Multiple spaces should be collapsed',
        `Expected "Hello world", got "${result1}"`
    );

    // Test 2: Leading/trailing whitespace
    const result2 = sanitizeText('  Hello world  ');
    assert(
        result2 === 'Hello world',
        'Leading/trailing whitespace should be removed',
        `Expected "Hello world", got "${result2}"`
    );

    // Test 3: Multiple newlines
    const result3 = sanitizeText('Line 1\n\n\n\nLine 2');
    assert(
        result3 === 'Line 1\n\nLine 2',
        'Multiple newlines should be collapsed to double',
        `Expected "Line 1\\n\\nLine 2", got "${result3}"`
    );

    // Test 4: Empty string
    const result4 = sanitizeText('');
    assert(
        result4 === '',
        'Empty string should return empty',
        `Expected "", got "${result4}"`
    );

    // Test 5: Null value
    const result5 = sanitizeText(null);
    assert(
        result5 === '',
        'Null should return empty string',
        `Expected "", got "${result5}"`
    );
}

/**
 * Test Suite: Sample Data Processing
 */
function testSampleDataProcessing() {
    console.log('\n📊 Testing Sample Data Processing...\n');

    try {
        // Load sample data
        const dataPath = path.join(__dirname, '../data/sample_texts.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);

        // Test 1: Data structure
        assert(
            data.samples && Array.isArray(data.samples),
            'Sample data should have samples array',
            'samples array not found or not an array'
        );

        // Test 2: Sample count
        assert(
            data.samples.length >= 5,
            'Should have at least 5 samples',
            `Expected at least 5 samples, got ${data.samples.length}`
        );

        // Test 3: Sample structure
        const sample = data.samples[0];
        assert(
            sample.id && sample.title && sample.text && sample.expected_summary,
            'Each sample should have required fields',
            `Missing fields in sample: ${JSON.stringify(Object.keys(sample))}`
        );

        // Test 4: Test cases structure
        assert(
            data.test_cases && Array.isArray(data.test_cases),
            'Should have test_cases array',
            'test_cases array not found or not an array'
        );

        // Test 5: Validate sample text lengths
        const allValidLengths = data.samples.every(s => s.text.length >= 10);
        assert(
            allValidLengths,
            'All sample texts should be valid length',
            'Some samples have invalid text length'
        );

    } catch (error) {
        assert(
            false,
            'Sample data should be loadable',
            `Error loading sample data: ${error.message}`
        );
    }
}

/**
 * Test Suite: Error Message Formatting
 */
function testErrorFormatting() {
    console.log('\n⚠️  Testing Error Formatting...\n');

    // Mock formatErrorMessage function (from utils.js)
    function formatErrorMessage(error) {
        if (typeof error === 'string') {
            return error;
        }

        if (error instanceof Error) {
            if (error.message.includes('401')) {
                return 'Invalid API key. Please check your OpenAI API key.';
            }
            if (error.message.includes('429')) {
                return 'Rate limit exceeded. Please try again later.';
            }
            if (error.message.includes('500')) {
                return 'OpenAI service error. Please try again later.';
            }

            return error.message || 'An error occurred while generating the summary.';
        }

        return 'An error occurred while generating the summary.';
    }

    // Test 1: String error
    assert(
        formatErrorMessage('Custom error') === 'Custom error',
        'String errors should be returned as-is',
        'String error was modified'
    );

    // Test 2: 401 error
    const error401 = new Error('Request failed with status 401');
    assert(
        formatErrorMessage(error401).includes('Invalid API key'),
        '401 errors should mention invalid API key',
        `Got: ${formatErrorMessage(error401)}`
    );

    // Test 3: 429 error
    const error429 = new Error('Request failed with status 429');
    assert(
        formatErrorMessage(error429).includes('Rate limit'),
        '429 errors should mention rate limit',
        `Got: ${formatErrorMessage(error429)}`
    );

    // Test 4: 500 error
    const error500 = new Error('Request failed with status 500');
    assert(
        formatErrorMessage(error500).includes('service error'),
        '500 errors should mention service error',
        `Got: ${formatErrorMessage(error500)}`
    );

    // Test 5: Generic error
    const genericError = new Error('Something went wrong');
    assert(
        formatErrorMessage(genericError) === 'Something went wrong',
        'Generic errors should return message',
        `Got: ${formatErrorMessage(genericError)}`
    );
}

/**
 * Test Suite: Prompt Creation
 */
function testPromptCreation() {
    console.log('\n💬 Testing Prompt Creation...\n');

    // Mock createSummaryPrompt function (from utils.js)
    function createSummaryPrompt(text) {
        return `Please provide a concise summary of the following text in 2-3 sentences:\n\n${text}`;
    }

    // Test 1: Prompt structure
    const prompt = createSummaryPrompt('Sample text');
    assert(
        prompt.includes('concise summary') && prompt.includes('Sample text'),
        'Prompt should include instructions and text',
        `Got: ${prompt}`
    );

    // Test 2: Prompt format
    assert(
        prompt.startsWith('Please provide'),
        'Prompt should start with instruction',
        `Got: ${prompt.substring(0, 20)}`
    );

    // Test 3: Text inclusion
    const testText = 'This is my test text for summarization';
    const prompt2 = createSummaryPrompt(testText);
    assert(
        prompt2.includes(testText),
        'Prompt should include the original text',
        'Original text not found in prompt'
    );
}

/**
 * Run all tests
 */
function runAllTests() {
    console.log('🧪 Chrome Summarizer Extension - Test Suite');
    console.log('='.repeat(60));

    testTextValidation();
    testApiKeyValidation();
    testTextSanitization();
    testSampleDataProcessing();
    testErrorFormatting();
    testPromptCreation();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Total: ${testsPassed + testsFailed}`);
    console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

    if (failedTests.length > 0) {
        console.log('\n❌ Failed Tests:');
        failedTests.forEach((failure, index) => {
            console.log(`\n${index + 1}. ${failure.test}`);
            console.log(`   ${failure.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));

    // Exit with appropriate code
    process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
