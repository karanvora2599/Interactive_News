# Interactive News Portal 🗺️📰

An interactive web application that displays random news articles when you click on US states on a map.

![Demo](./demo.gif)

## Features

- 🗺️ Interactive US map powered by Mapbox GL JS
- 📰 Real-time news fetching from NewsAPI
- 🎨 Modern dark theme with glassmorphism design
- ⚡ Fast React frontend with Vite
- 🐍 Python FastAPI backend

## Prerequisites

- Node.js 18+
- Python 3.10+
- Free API keys from:
  - [Mapbox](https://mapbox.com) - for the interactive map
  - [NewsAPI](https://newsapi.org) - for news articles

## Quick Start

### 1. Clone and Setup

```bash
cd Interactive_News
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
copy .env.example .env
# Edit .env and add your NewsAPI key
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with your Mapbox token
copy .env.example .env
# Edit .env and add your Mapbox token
```

### 4. Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 5. Open in Browser

Navigate to [http://localhost:5173](http://localhost:5173) and click on any US state!

## Project Structure

```
Interactive_News/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── news_service.py   # NewsAPI integration
│   ├── states.py         # US state data
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment template
│
└── frontend/
    ├── src/
    │   ├── App.jsx              # Main app component
    │   ├── index.css            # Global styles
    │   └── components/
    │       ├── USMap.jsx        # Mapbox map component
    │       └── NewsPopup.jsx    # News display popup
    ├── .env.example             # Environment template
    └── package.json
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/states` | GET | List all US states |
| `/api/news/{state}` | GET | Get random news for a state |
| `/health` | GET | Health check |

## Tech Stack

- **Frontend**: React, Vite, Mapbox GL JS
- **Backend**: Python, FastAPI, httpx
- **APIs**: Mapbox, NewsAPI
