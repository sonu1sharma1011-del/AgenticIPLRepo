# CricketPulse AI: Haala Bol! 🏏🔥

CricketPulse AI is a high-energy, agentic second-screen fan engagement platform redesigned with the electric "Haala Bol!" energy of IPL Season 1 (2008). It transforms live match telemetry into immersive fan interactions, powered by **Gemini 1.5 Flash**.

## 🌟 Key Features

- **Retro-Aggressive Design**: A full-website experience inspired by the 2008 IPL "Haala Bol!" aesthetic—grainy textures, bold stadium typography, and deep orange/gold vibes.
- **Harsha AI Hub**: An agentic interaction center that provides real-time commentary, match analysis, and fan engagement tasks (polls, predictions) using a specialized "Harsha Bhogle" persona.
- **Live Match Center**: Real-time scores, detailed batting/bowling scorecards, and ball-by-ball commentary that auto-refreshes every 30 seconds.
- **Interactive Quiz**: A randomized 15-question trivia pool with instant feedback (Green/Red) and performance tracking.
- **IPL Points Table**: Dynamic standings with form guides and NRR tracking.
- **Multi-Team Links**: An official link grid where each card reflects the specific brand colors of IPL teams (MI, CSK, RCB, KKR, etc.).
- **Multilingual Support**: Toggle between English and Hindi for a truly localized experience.

## 🏗️ Project Structure

- `backend/`: Python FastAPI backend.
  - `agent/`: The "Brain" of the app, integrating Gemini for match processing and commentary generation.
  - `api/`: RESTful routes for live scores and points table (integrates with CricAPI).
- `frontend/`: React + Vite frontend.
  - `src/App.jsx`: Main interaction logic and multi-section website structure.
  - `src/App.css`: Custom vanilla CSS for the retro IPL design system.

## 🚀 Deployment

The application is containerized using Docker and deployed on **Google Cloud Run**.

### Google Cloud Deploy
```bash
gcloud run deploy cricketpulse-ai --source . --region asia-south1 --allow-unauthenticated
```

## 🛠️ Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- Gemini API Key
- CricAPI Key (Optional, mock data fallback included)

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Set GEMINI_API_KEY and CRIC_API_KEY in your env
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📜 License
Built for the IPL Fan Experience. **Haala Bol!**
