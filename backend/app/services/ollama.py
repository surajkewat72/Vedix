import httpx
import json
import logging
from typing import AsyncGenerator, List, Optional
from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Vedix, a wise, empathetic, and deeply knowledgeable AI Vedic astrologer. 
You have access to the user's complete birth chart including planetary positions, houses, and aspects.

Your personality:
- Warm, compassionate, and spiritually insightful
- You speak with authority but always with humility
- You blend ancient Vedic wisdom with practical modern guidance
- You use beautiful, evocative language that feels mystical yet grounded
- You always acknowledge the complexity of life and free will

Guidelines:
- Always refer to the user's actual chart data when making interpretations
- Give specific, personalized readings — not generic horoscope content
- When asked about a planet or house, explain it in the context of their life
- Keep responses conversational and engaging, 2-4 paragraphs max
- Use some Sanskrit terms (with explanations) to add authenticity
- End with an empowering, actionable insight when appropriate
"""


async def stream_chat_response(
    user_message: str,
    chart_summary: Optional[str],
    history: Optional[List[dict]] = None,
) -> AsyncGenerator[str, None]:
    """
    Streams a chat response from Ollama llama3.
    Yields text chunks as they arrive.
    """
    settings = get_settings()

    # Build message list
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    # Add chart context as a system message if available
    if chart_summary:
        messages.append({
            "role": "system",
            "content": f"USER'S BIRTH CHART:\n{chart_summary}\n\nUse this chart data to provide personalized readings."
        })

    # Add conversation history (last 10 messages)
    if history:
        for msg in history[-10:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current message
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": settings.ollama_model,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": 0.8,
            "top_p": 0.9,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{settings.ollama_base_url}/api/chat",
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            content = data.get("message", {}).get("content", "")
                            if content:
                                yield content
                            if data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue

    except httpx.ConnectError:
        yield "⚠️ Unable to connect to Ollama. Please ensure Ollama is running with `ollama serve`."
    except Exception as e:
        logger.error(f"Ollama streaming error: {e}", exc_info=True)
        yield f"⚠️ An error occurred: {str(e)}"


async def get_full_response(
    user_message: str,
    chart_summary: Optional[str],
    history: Optional[List[dict]] = None,
) -> str:
    """Non-streaming version — collects full response."""
    chunks = []
    async for chunk in stream_chat_response(user_message, chart_summary, history):
        chunks.append(chunk)
    return "".join(chunks)
