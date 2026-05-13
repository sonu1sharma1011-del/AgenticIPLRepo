from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agent.brain import brain

router = APIRouter()

class MatchEventRequest(BaseModel):
    event_text: str

@router.post("/process-event")
async def process_event(request: MatchEventRequest):
    """
    Endpoint to receive a match event and return the AI agent's response.
    """
    if not request.event_text:
        raise HTTPException(status_code=400, detail="Event text is required")
    
    result = await brain.process_match_event(request.event_text)
    return result

@router.get("/health")
async def health_check():
    return {"status": "healthy"}
