from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agent.brain import brain
import os
import httpx
import json

router = APIRouter()

CRIC_API_KEY = os.getenv("CRIC_API_KEY", "")
IPL_SERIES_ID = "760d6943-3b10-410a-9d95-8882582b9983"

class MatchEventRequest(BaseModel):
    event_text: str

@router.post("/process-event")
async def process_event(request: MatchEventRequest):
    if not request.event_text:
        raise HTTPException(status_code=400, detail="Event text is required")
    result = await brain.process_match_event(request.event_text)
    return result

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/live-scores")
async def get_live_scores():
    if not CRIC_API_KEY:
        return get_mock_live_scores()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.cricapi.com/v1/currentMatches?apikey={CRIC_API_KEY}&offset=0")
            data = response.json()
            if data.get("status") != "success":
                return get_mock_live_scores()
            return data.get("data", [])
    except Exception:
        return get_mock_live_scores()

@router.get("/match-scorecard/{match_id}")
async def get_match_scorecard(match_id: str):
    if not CRIC_API_KEY or match_id.startswith("mock_"):
        return get_mock_scorecard(match_id)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.cricapi.com/v1/match_info?apikey={CRIC_API_KEY}&id={match_id}")
            data = response.json()
            if data.get("status") != "success":
                return get_mock_scorecard(match_id)
            return data.get("data", {})
    except Exception:
        return get_mock_scorecard(match_id)

@router.get("/points-table")
async def get_points_table():
    if not CRIC_API_KEY:
        return get_mock_points_table()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://api.cricapi.com/v1/series_points_table?apikey={CRIC_API_KEY}&id={IPL_SERIES_ID}")
            data = response.json()
            if data.get("status") != "success":
                return get_mock_points_table()
            return data.get("data", [])
    except Exception:
        return get_mock_points_table()

def get_mock_live_scores():
    return [
        {
            "id": "mock_match_1",
            "name": "KKR vs SRH",
            "status": "KKR won by 8 wickets",
            "venue": "Ahmedabad",
            "teams": ["KKR", "SRH"],
            "score": [
                {"r": 114, "w": 2, "o": 10.3, "inning": "KKR Inning 1"},
                {"r": 113, "w": 10, "o": 18.3, "inning": "SRH Inning 1"}
            ]
        },
        {
            "id": "mock_match_2",
            "name": "MI vs CSK",
            "status": "MI won by 7 wickets",
            "venue": "Mumbai",
            "teams": ["MI", "CSK"],
            "score": [
                {"r": 182, "w": 3, "o": 18.2, "inning": "MI Inning 1"},
                {"r": 181, "w": 8, "o": 20, "inning": "CSK Inning 1"}
            ]
        }
    ]

def get_mock_scorecard(match_id):
    return {
        "id": match_id,
        "name": "KKR vs SRH",
        "scorecard": [
            {
                "inning": "KKR Inning 1",
                "batting": [
                    {"name": "Venkatesh Iyer", "r": 52, "b": 26, "4s": 4, "6s": 3, "sr": 200},
                    {"name": "Rahmanullah Gurbaz", "r": 39, "b": 32, "4s": 5, "6s": 2, "sr": 121},
                    {"name": "Shreyas Iyer", "r": 6, "b": 3, "4s": 1, "6s": 0, "sr": 200}
                ],
                "bowling": [
                    {"name": "Pat Cummins", "o": 2, "m": 0, "r": 18, "w": 1, "eco": 9},
                    {"name": "Shahbaz Ahmed", "o": 2.3, "m": 0, "r": 22, "w": 1, "eco": 8.8}
                ]
            }
        ]
    }

def get_mock_points_table():
    return [
        {"team": "KKR", "matches": 14, "wins": 9, "losses": 3, "nrr": "+1.428", "pts": 20, "form": ["W", "W", "W", "L", "W"]},
        {"team": "SRH", "matches": 14, "wins": 8, "losses": 5, "nrr": "+0.414", "pts": 17, "form": ["W", "L", "W", "W", "L"]},
        {"team": "RR", "matches": 14, "wins": 8, "losses": 5, "nrr": "+0.273", "pts": 17, "form": ["L", "L", "W", "L", "L"]},
        {"team": "RCB", "matches": 14, "wins": 7, "losses": 7, "nrr": "+0.459", "pts": 14, "form": ["W", "W", "W", "W", "W"]},
        {"team": "CSK", "matches": 14, "wins": 7, "losses": 7, "nrr": "+0.428", "pts": 14, "form": ["L", "W", "L", "W", "L"]},
        {"team": "DC", "matches": 14, "wins": 7, "losses": 7, "nrr": "-0.377", "pts": 14, "form": ["W", "L", "W", "W", "L"]},
        {"team": "LSG", "matches": 14, "wins": 7, "losses": 7, "nrr": "-0.667", "pts": 14, "form": ["L", "W", "L", "L", "W"]},
        {"team": "GT", "matches": 14, "wins": 5, "losses": 7, "nrr": "-0.064", "pts": 12, "form": ["L", "L", "W", "L", "W"]},
        {"team": "PBKS", "matches": 14, "wins": 5, "losses": 9, "nrr": "-0.353", "pts": 10, "form": ["L", "L", "L", "W", "L"]},
        {"team": "MI", "matches": 14, "wins": 4, "losses": 10, "nrr": "-0.318", "pts": 8, "form": ["L", "W", "L", "L", "L"]}
    ]
