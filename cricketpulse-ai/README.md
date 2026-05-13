# CricketPulse AI

CricketPulse AI is an agentic cricket experience that transforms live match telemetry into engaging fan interactions. Using Gemini 1.5 Flash, it analyzes match momentum and sentiment to trigger predictions, polls, trivia, and reaction storms.

## Project Structure

- `backend/`: FastAPI server with the agentic brain.
- `frontend/`: React application with a premium "Stadium-Atmosphere" UI.

## Getting Started

### 1. Setup the Backend
1. Navigate to the `backend/` directory.
2. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Add your `GEMINI_API_KEY` to the `.env` file.
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the server:
   ```bash
   python main.py
   ```

### 2. Setup the Frontend
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Features
- **Intelligent Commentary**: High-gravity moments analyzed by AI.
- **Dynamic Interactions**: Predictions, Polls, and Trivia based on live context.
- **Explosive Reactions**: Emoji storms for sixes and wickets.
- **Haptic Simulation**: Visual vibration patterns for big events.
- **Premium Design**: Dark mode glassmorphism with vibrant cricket aesthetics.
