# 📝 Text Summariser - Chrome Extension

A powerful Chrome extension that uses OpenAI's GPT API to generate concise summaries of highlighted text on any webpage.

![Extension Icon](icons/icon128.png)

## ✨ Features

- 🎯 **Highlight & Summarize**: Select any text on a webpage and get an instant AI-powered summary
- 🔒 **Secure API Key Storage**: Your OpenAI API key is stored securely using Chrome's sync storage
- 📋 **Copy to Clipboard**: Easily copy generated summaries with one click
- 🎨 **Modern UI**: Beautiful, gradient-themed popup interface
- ⚡ **Fast & Efficient**: Lightweight extension with minimal dependencies
- 🧪 **Well-Tested**: Comprehensive test suite with sample data

## 🚀 Installation

### Prerequisites

- Google Chrome browser
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Steps

1. **Clone or download this repository**:
   ```bash
   git clone https://github.com/qhaydar/chrome-extension-summariser.git
   cd chrome-extension-summariser
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `chrome-extension-summariser` folder

3. **Verify installation**:
   - The extension icon should appear in your Chrome toolbar
   - Click the icon to open the popup

## 🔑 Setup

### Getting Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to API Keys section
4. Click **Create new secret key**
5. Copy the key (it starts with `sk-`)

### Configuring the Extension

1. Click the extension icon in your Chrome toolbar
2. Paste your OpenAI API key in the input field
3. Click **Save**
4. You're ready to go! 🎉

## 📖 Usage

### Basic Usage

1. **Navigate to any webpage** with text content
2. **Highlight/select** the text you want to summarize
3. **Click the extension icon** in your toolbar
4. **Wait a moment** while the AI generates your summary
5. **Read the summary** in the popup
6. **Copy to clipboard** if needed using the copy button

### Example

Visit a news article, blog post, or research paper, highlight a paragraph or section, and click the extension icon. Within seconds, you'll receive a concise 2-3 sentence summary!

### Demo Mode

Try the extension with sample texts:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the Jupyter notebook demo
jupyter notebook notebooks/demo.ipynb
```

The notebook demonstrates the summarization API with various text samples.

## 🧪 Testing

### Run Automated Tests

```bash
node tests/test_extension.js
```

The test suite covers:
- ✅ Text validation (length, format)
- ✅ API key validation
- ✅ Text sanitization
- ✅ Error message formatting
- ✅ Sample data processing
- ✅ Prompt creation

### Expected Output

```
🧪 Chrome Summarizer Extension - Test Suite
============================================================
✅ PASS: Empty text should be invalid
✅ PASS: Very short text should be invalid
✅ PASS: Valid text should pass validation
...
📊 Test Summary
============================================================
✅ Passed: 25
❌ Failed: 0
📈 Total: 25
🎯 Success Rate: 100.0%
```

## 📁 Project Structure

```
chrome-extension-summariser/
├── manifest.json           # Extension configuration
├── popup.html             # Extension popup UI
├── popup.css              # Popup styling
├── src/
│   ├── background.js      # Background service worker (API calls)
│   ├── content.js         # Content script (text selection)
│   ├── popup.js           # Popup logic
│   └── utils.js           # Shared utilities
├── icons/
│   ├── icon16.png         # 16x16 icon
│   ├── icon48.png         # 48x48 icon
│   └── icon128.png        # 128x128 icon
├── data/
│   └── sample_texts.json  # Sample data for testing
├── notebooks/
│   └── demo.ipynb         # Jupyter demo notebook
├── tests/
│   └── test_extension.js  # End-to-end tests
├── README.md              # This file
├── walkthrough.md         # Detailed walkthrough
└── requirements.txt       # Python dependencies
```

## 🔧 Configuration

### API Settings

The extension uses the following OpenAI API configuration:

- **Model**: `gpt-3.5-turbo`
- **Max Tokens**: 150
- **Temperature**: 0.7
- **System Prompt**: "You are a helpful assistant that creates concise summaries of text."

You can modify these settings in `src/background.js`.

### Text Limits

- **Minimum**: 10 characters
- **Maximum**: 10,000 characters

## 🛠️ Development

### Making Changes

1. Edit the relevant files in the `src/` directory
2. Go to `chrome://extensions/`
3. Click the **Reload** button on the extension card
4. Test your changes

### Adding New Features

1. Update the appropriate files (`content.js`, `background.js`, `popup.js`)
2. Add tests in `tests/test_extension.js`
3. Update documentation in `README.md` and `walkthrough.md`
4. Run tests to ensure everything works

## 🐛 Troubleshooting

### Extension Not Loading

- Make sure Developer mode is enabled in `chrome://extensions/`
- Check the console for error messages
- Verify all files are present in the directory

### API Key Issues

- Ensure your API key starts with `sk-`
- Verify the key is valid on the OpenAI platform
- Check that you have available API credits

### No Summary Generated

- Make sure you've selected text on the page before clicking the extension
- Check that the selected text is between 10-10,000 characters
- Verify your internet connection
- Check the browser console for error messages

### Rate Limit Errors

- OpenAI has rate limits based on your account tier
- Wait a moment and try again
- Consider upgrading your OpenAI account for higher limits

## 📊 Sample Data

The extension includes sample texts in `data/sample_texts.json`:

1. **Short Article** - Climate Change (400 chars)
2. **Medium Article** - Artificial Intelligence (1,200 chars)
3. **Long Article** - Space Exploration (2,500 chars)
4. **Technical Documentation** - API Usage (600 chars)
5. **News Article** - Technology Breakthrough (700 chars)
6. **Short Story Excerpt** - Fiction (500 chars)

## 🔐 Privacy & Security

- Your API key is stored locally using Chrome's `storage.sync` API
- No data is sent to any server except OpenAI's API
- Selected text is only sent to OpenAI for summarization
- No browsing history or personal data is collected

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [walkthrough.md](walkthrough.md) for detailed explanations
3. Open an issue on GitHub

## 🙏 Acknowledgments

- Built with [OpenAI's GPT API](https://openai.com/api/)
- Icons generated with AI
- Inspired by the need for quick text summarization while browsing

---

**Made with ❤️ for productive reading**
