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
    if language.lower() == "hinglish":
        system_instruction += "\nIMPORTANT: You MUST respond entirely in Hinglish (Hindi language written with the English alphabet). Keep it natural, conversational, and spiritual."
    elif language.lower() != "english":
        system_instruction += f"\nIMPORTANT: You MUST respond fluently in {language} using its native script. Do not respond in English."

    messages = [
        {"role": "system", "content": system_instruction}
    ]

    # Add chart context as part of the system instructions
    if chart_summary:
        messages[0]["content"] += f"\n\nUSER'S BIRTH CHART:\n{chart_summary}\n\nCombine the user question and the astrology data to give an insightful reading."

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
