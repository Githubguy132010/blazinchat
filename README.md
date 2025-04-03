# BlazinChat 🔥

A lightning-fast web interface for chatting with Language Models (LLMs) from various providers. Just add your API key and start chatting!

## Features

- 🚀 **Fast and Lightweight**: Minimal design with focus on performance
- 🔄 **Multi-Provider Support**: Works with OpenAI, Anthropic, Google AI, Mistral AI, or any custom endpoint
- 🔐 **Client-Side Only**: Your API keys never leave your browser (stored in localStorage)
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎮 **Customizable Settings**: Control temperature, max tokens, and more
- 📝 **Markdown Support**: AI responses support markdown formatting
- 🌐 **GitHub Pages Ready**: Deploy with zero configuration

## Usage

1. Open the web app in your browser
2. Select your preferred LLM provider from the dropdown
3. Enter your API key (securely stored in your browser only)
4. Select the model you want to use
5. Start chatting!

## Advanced Settings

- **Temperature**: Controls randomness (0.0 = deterministic, 1.0 = creative)
- **Max Tokens**: Maximum length of the generated response

## API Providers Supported

- **OpenAI**: GPT-4, GPT-3.5-Turbo and more
- **Anthropic**: Claude 3 models (Opus, Sonnet, Haiku), Claude 2
- **Google AI**: Gemini Pro and Gemini Ultra
- **Mistral AI**: Mistral models (Large, Medium, Small)
- **Custom**: Use any API provider that follows a similar format

## Deploy to GitHub Pages

1. Fork this repository
2. Go to your fork's Settings > Pages
3. Set the source to "main" branch and save
4. Your app will be available at `https://[your-username].github.io/blazinchat/`

## Security

- **No Server**: This app runs entirely in your browser
- **No Data Collection**: Your conversations and API keys are stored only in your browser's localStorage
- **Open Source**: Review the code to ensure it meets your security requirements

## Development

Want to modify or enhance BlazinChat? Clone the repository and open the files in any code editor. The project uses vanilla HTML, CSS, and JavaScript with no build steps required.

## License

MIT - Feel free to use, modify, and distribute as you wish!