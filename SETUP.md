# Setup Guide - AI Assistant Pro

This guide will help you set up and run the AI Assistant Pro application with single model mode only.

## Prerequisites

Before you begin, make sure you have the following installed:

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/)

### API Keys
- **OpenRouter API Keys** - [Get them here](https://openrouter.ai/)

## Step-by-Step Setup

### 1. Clone and Navigate to Project
```bash
git clone <your-repo-url>
cd model-verse-chain-main
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure API Keys
Edit `backend/main.py` and replace the API keys with your own:
```python
API_KEYS = [
    "sk-or-v1-your-actual-api-key-1",
    "sk-or-v1-your-actual-api-key-2",
    "sk-or-v1-your-actual-api-key-3",
    "sk-or-v1-your-actual-api-key-4"
]
```

#### Start Backend Server
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
# Navigate back to project root
cd ..
npm install
```

#### Start Frontend Development Server
```bash
npm run dev
# or
npm start
```

The frontend will start on `http://localhost:3000`

### 4. Verify Setup

1. **Backend Health Check**: Visit `http://localhost:8000/health` - should return `{"status": "healthy", "message": "Backend is running"}`

2. **Frontend**: Visit `http://localhost:3000` - should show the AI Assistant Pro interface

3. **Connection Status**: Look for the "Backend Connected" badge in the top-right corner of the frontend

## Quick Start Scripts

### Windows
```bash
# Terminal 1 - Backend
start-backend.bat

# Terminal 2 - Frontend
npm start
```

### Linux/Mac
```bash
# Terminal 1 - Backend
./start-backend.sh

# Terminal 2 - Frontend
npm start
```

## Testing the Application

### Single Mode Test
1. Select a model (e.g., "mistralai/mistral-7b-instruct")
2. Type: "Hello, how are you?"
3. Press Enter or click Send
4. You should receive a response from the AI model

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Kill the process
taskkill /PID <process_id>    # Windows
kill <process_id>             # Linux/Mac
```

**Python dependencies not found:**
```bash
# Ensure you're in the backend directory
cd backend
pip install -r requirements.txt
```

**API key errors:**
- Verify your OpenRouter API keys are correct
- Check your OpenRouter account for sufficient credits
- Ensure the API keys have the necessary permissions

### Frontend Issues

**Backend connection failed:**
- Ensure the backend server is running on port 8000
- Check the browser console for CORS errors
- Verify the API URL in `src/lib/api.ts`

**Dependencies not installed:**
```bash
npm install
```

**Port 3000 already in use:**
```bash
# The frontend will automatically try the next available port
# Or manually specify a port:
npm run dev -- --port 3001
```

### General Issues

**CORS errors:**
- Ensure the frontend URL is in the backend CORS configuration
- Check that both servers are running on the expected ports

**Network connectivity:**
- Ensure both servers can communicate on localhost
- Check firewall settings if using a different network configuration

## Configuration Options

### Backend Configuration

**Change Port:**
Edit `backend/main.py`:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Change port here
```

**Add More API Keys:**
```python
API_KEYS = [
    "key1",
    "key2",
    "key3",
    # Add more keys for better load balancing
]
```

### Frontend Configuration

**Change Backend URL:**
Edit `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8001'; // Change port here
```

**Add New Models:**
Edit the `ModelSelector` component to include new model options.

## Production Deployment

### Backend Deployment
- Use a production WSGI server like Gunicorn
- Set up proper environment variables for API keys
- Configure reverse proxy (nginx/Apache)

### Frontend Deployment
- Build the project: `npm run build`
- Serve the `dist` folder with a web server
- Configure environment variables for API endpoints

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review the main README.md
3. Check the OpenRouter documentation
4. Open an issue on GitHub with detailed error information 