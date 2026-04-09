import httpx
import json
import logging
from typing import AsyncGenerator, List, Optional
from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a highly experienced Indian Vedic astrologer.
You are having a casual, face-to-face voice conversation with a client. 
Speak with empathy, use natural conversational tone, and respond exactly like a compassionate human being talking to a friend.
Keep your responses natural and relatively short.
Do NOT use bullet points, numbered lists, or markdown formatting like bold/italics.
Do NOT sound robotic or start sentences with "As an AI".
Give practical, comforting, and spiritual life advice.
"""

async def stream_chat_response(
    user_message: str,
    chart_summary: Optional[str],
    history: Optional[List[dict]] = None,
    language: str = "English",
) -> AsyncGenerator[str, None]:
    """
    Streams a chat response from Hugging Face Inference API.
    Yields text chunks as they arrive.
    """
    settings = get_settings()
    
    if not settings.huggingface_api_key:
        yield "⚠️ Missing Hugging Face API Key. Please add HUGGINGFACE_API_KEY to your backend .env file."
        return

    # Build message list (OpenAI-compatible format supported by HF Router API)
    system_instruction = SYSTEM_PROMPT

    messages = [
        {"role": "system", "content": system_instruction}
    ]

    # Add chart context as part of the system instructions
    if chart_summary:
        messages[0]["content"] += f"\n\nUSER'S BIRTH CHART:\n{chart_summary}\n\nCombine the user question and the astrology data to give an insightful reading."

    if language.lower() == "hinglish":
        messages[0]["content"] += "\n\nCRITICAL REQUIREMENT: You MUST respond entirely in Hinglish (Hindi language using English alphabet). Do NOT reply in English."
    elif language.lower() != "english":
        messages[0]["content"] += f"\n\nCRITICAL REQUIREMENT: You MUST respond fluently in {language} and using its native script. Under no circumstances should you reply in English."

    # Add conversation history
    if history:
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current message
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct",
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.6,
        "stream": True
    }

    headers = {
        "Authorization": f"Bearer {settings.huggingface_api_key}",
        "Content-Type": "application/json"
    }
    
    API_URL = "https://router.huggingface.co/v1/chat/completions"

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", API_URL, json=payload, headers=headers) as response:
                if response.status_code == 401:
                    yield "⚠️ Hugging Face API key is invalid or unauthorized."
                    return
                elif response.status_code != 200:
                    yield f"⚠️ API Error ({response.status_code}): Could not fetch AI response."
                    return
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        
                        try:
                            data = json.loads(data_str)
                            delta = data.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue

    except httpx.ConnectError:
        yield "⚠️ Unable to connect to Hugging Face API. Please check your internet connection."
    except Exception as e:
        logger.error(f"Hugging Face streaming error: {e}", exc_info=True)
        yield f"⚠️ An error occurred: {str(e)}"


async def generate_life_areas(chart_summary: str) -> List[dict]:
    """
    Generates structured JSON insights for 5 Life Areas based on the birth chart.
    """
    settings = get_settings()
    
    if not settings.huggingface_api_key:
        logger.warning("No Hugging Face key available for life areas generation.")
        return []

    system_instruction = """You are an expert Vedic Astrologer. Analyze the provided birth chart and give a reading for the following 5 life areas:
1. Love & Relationships
2. Money & Career
3. Personality
4. Family
5. Spirituality

For each area, provide a score from 1 to 10, a short Insight (1-2 sentences), and practical Advice (1-2 sentences).
You MUST output ONLY a valid JSON object with the following structure exactly, no other text:
{
  "areas": [
    {
      "name": "Love & Relationships",
      "emoji": "❤️",
      "score": 8,
      "insight": "...",
      "advice": "..."
    },
    ...
  ]
}
"""

    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": f"USER'S BIRTH CHART:\n{chart_summary}\n\nPlease generate the JSON."}
    ]

    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct",
        "messages": messages,
        "max_tokens": 800,
        "temperature": 0.5,
        "response_format": {"type": "json_object"}
    }

    headers = {
        "Authorization": f"Bearer {settings.huggingface_api_key}",
        "Content-Type": "application/json"
    }

    API_URL = "https://router.huggingface.co/v1/chat/completions"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(API_URL, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # sometimes model includes markdown block
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            parsed = json.loads(content)
            return parsed.get("areas", [])
            
    except Exception as e:
        logger.error(f"Failed to generate life areas: {e}", exc_info=True)
        return []
