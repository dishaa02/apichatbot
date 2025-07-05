# AI Assistant Pro - Model Verse

A modern AI chat interface that supports single model interactions with a beautiful UI.

## Features

- 🤖 **Multiple AI Models**: Support for various OpenRouter models including Mistral, DeepSeek, Qwen, and more
- 🎨 **Modern UI**: Beautiful, responsive interface built with React, TypeScript, and Tailwind CSS
- 📁 **File Upload**: Support for uploading images and documents
- 🔄 **Real-time API**: FastAPI backend with automatic API key rotation
- 📱 **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- OpenRouter API keys (get them from [OpenRouter](https://openrouter.ai/))

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Update API keys:**
   Edit `main.py` and replace the API keys with your own OpenRouter API keys:
   ```python
   API_KEYS = [
       "your-api-key-1",
       "your-api-key-2",
       # Add more keys for load balancing
   ]
   ```

4. **Start the backend server:**
   ```bash
   python main.py
   ```
   
   The server will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to the project root:**
   ```bash
   cd model-verse-chain-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:3000`

## Usage

### Single Mode
1. Select a model from the dropdown
2. Type your message and press Enter or click Send
3. Get a response from the selected AI model

### File Upload
1. Click the paperclip icon to attach files
2. Supported formats: images, PDFs, documents, text files
3. Files will be included in your message context

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /ask` - Send a prompt to a specific model
  ```json
  {
    "prompt": "Your message here",
    "model": "mistralai/mistral-7b-instruct"
  }
  ```

## Supported Models

### Chat/QA Models
- `mistralai/mistral-7b-instruct` - Fast and efficient instruction-tuned model
- `mistralai/mistral-small-3.2-24b-instruct` - Higher performance
- `openrouter/cypher-alpha` - Designed for reasoning
- `moonshotai/kimi-dev-72b` - Very good reasoning model
- `qwen/qwen3-14b` - Balanced reasoning
- `qwen/qwen3-30b-a3b` - Large, high-quality
- `qwen/qwen3-32b` - Very high capability
- `qwen/qwen3-235b-a22b` - Huge, SOTA-level

### Coding Models
- `deepseek/deepseek-chat` - Specialized coding assistance
- `deepseek/deepseek-chat-v3-0324` - Coding model
- `qwen/qwen3-8b` - Efficient coding solutions
- `tngtech/deepseek-r1t-chimera` - Coding model
- `cognitivecomputations/dolphin3.0-r1-mistral-24b` - Code generation expert

### Multilingual Models
- `sarvamai/sarvam-m` - Indian language support with cultural context
- `thudm/glm-z1-32b` - Cross-language understanding

### Experimental Models
- `meta-llama/llama-4-maverick` - Cutting-edge experimental features
- `microsoft/mai-ds-r1` - Research and experimental insights
- `featherless/qwerky-72b` - Good performance for free
- `mistralai/devstral-small` - Experimental model
- `deepseek/deepseek-r1` - Experimental model
- `deepseek/deepseek-v3-base` - Experimental model

## Configuration

### Backend Configuration
- **Port**: Default is 8000, change in `main.py`
- **CORS**: Configured for localhost:3000 and localhost:3001
- **API Keys**: Add your OpenRouter API keys in the `API_KEYS` list

### Frontend Configuration
- **API URL**: Update `API_BASE_URL` in `src/lib/api.ts` if your backend runs on a different port
- **Models**: Add new models in the `ModelSelector` component

## Troubleshooting

### Backend Issues
- **Connection refused**: Ensure the backend server is running on port 8000
- **API key errors**: Check your OpenRouter API keys and ensure they have sufficient credits
- **CORS errors**: Verify the frontend URL is in the allowed origins list

### Frontend Issues
- **Backend offline**: Check the backend status indicator in the header
- **Model not responding**: Try a different model or check API key limits

## Development

### Project Structure
```
model-verse-chain-main/
├── backend/
│   ├── main.py              # FastAPI server
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── components/          # React components
│   ├── lib/
│   │   └── api.ts          # API service
│   └── pages/              # Page components
└── package.json            # Node.js dependencies
```

### Adding New Models
1. Add the model identifier to the `ModelSelector` component
2. Ensure the model is available on OpenRouter
3. Test with single mode

## License

MIT License - feel free to use this project for your own applications.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the OpenRouter documentation
3. Open an issue on GitHub
