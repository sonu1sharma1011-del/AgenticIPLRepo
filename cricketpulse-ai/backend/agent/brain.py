import os
import json
import google.generativeai as genai
from agent.prompts import SYSTEM_PROMPT
from dotenv import load_dotenv

load_dotenv()

class CricketBrain:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        
        # Define Tools for Gemini
        def open_points_table():
            """Opens the IPL 2024 Points Table modal for the user."""
            return {"action": "OPEN_TABLE"}

        def open_scorecard():
            """Opens the detailed match scorecard modal."""
            return {"action": "OPEN_SCORECARD"}

        def start_game():
            """Launches the mini cricket game for the user to play."""
            return {"action": "START_GAME"}

        def trigger_emoji_storm():
            """Triggers a celebratory emoji rain on the user's screen."""
            return {"action": "EMOJI_STORM"}

        self.tools = [open_points_table, open_scorecard, start_game, trigger_emoji_storm]

        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            tools=self.tools,
            generation_config={
                "temperature": 0.7,
                "response_mime_type": "application/json",
            },
            system_instruction=SYSTEM_PROMPT + "\n\nCRITICAL: If the user wants to see stats, play a game, or see the table, CALL THE CORRESPONDING TOOL. You must still provide a JSON response as specified."
        )
        self.chat_session = self.model.start_chat(enable_automatic_function_calling=True)

    async def process_match_event(self, match_event: str):
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key or api_key == "your_api_key_here":
                return self.get_fallback_response("API Key missing.")

            response = self.chat_session.send_message(match_event)
            
            # Extract tool calls from the parts
            tool_calls = []
            if response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if part.function_call:
                        tool_calls.append(part.function_call.name)

            # Sanitize response text (remove markdown if present)
            raw_text = response.text
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].split("```")[0].strip()

            agent_output = json.loads(raw_text)
            
            # Map tool calls to UI actions
            if "open_points_table" in tool_calls:
                agent_output["action"]["tool_to_call"] = "TABLE_OPEN"
            elif "start_game" in tool_calls:
                agent_output["action"]["tool_to_call"] = "GAME_START"
            elif "open_scorecard" in tool_calls:
                agent_output["action"]["tool_to_call"] = "SCORECARD_OPEN"
            
            return agent_output
            
        except Exception as e:
            print(f"Agent Logic Error: {e}")
            return self.get_fallback_response(str(e))

    def get_fallback_response(self, error_msg):
        return {
            "agent_reasoning": f"Fallback due to: {error_msg}",
            "event_classification": {"type": "GENERAL", "emotional_gravity": 5},
            "commentary": {"headline": "Match Update!", "body": "The game is heating up. Stay tuned!"},
            "action": {
                "tool_to_call": "POLL",
                "content": {
                    "question": "What do you think of the current match pace?",
                    "options": ["Fast & Intense", "Slow & Strategic"],
                    "correct_answer": None,
                    "interaction_id": "fallback"
                }
            },
            "metadata": {"trigger_animation": False, "vibration_pattern": "NONE"}
        }

brain = CricketBrain()
