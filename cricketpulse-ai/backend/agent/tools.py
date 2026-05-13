from pydantic import BaseModel, Field
from typing import List, Optional
import uuid

class ToolContent(BaseModel):
    question: str
    options: List[str]
    correct_answer: Optional[str] = None
    interaction_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class CricketAction(BaseModel):
    tool_to_call: str
    content: ToolContent

def get_prediction_challenge(question: str, options: List[str]):
    return {
        "tool_to_call": "PREDICTION",
        "content": {
            "question": question,
            "options": options,
            "correct_answer": None,
            "interaction_id": str(uuid.uuid4())
        }
    }

def get_sentiment_poll(question: str, options: List[str]):
    return {
        "tool_to_call": "POLL",
        "content": {
            "question": question,
            "options": options,
            "correct_answer": None,
            "interaction_id": str(uuid.uuid4())
        }
    }

def get_trivia_burst(question: str, options: List[str], correct_answer: str):
    return {
        "tool_to_call": "TRIVIA",
        "content": {
            "question": question,
            "options": options,
            "correct_answer": correct_answer,
            "interaction_id": str(uuid.uuid4())
        }
    }

def get_reaction_storm(question: str, emojis: List[str]):
    return {
        "tool_to_call": "REACTION",
        "content": {
            "question": question,
            "options": emojis,
            "correct_answer": None,
            "interaction_id": str(uuid.uuid4())
        }
    }
