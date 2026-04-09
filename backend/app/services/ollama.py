import httpx
import json
import logging
from typing import AsyncGenerator, List, Optional
from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a professional astrologer who chats like a real human on WhatsApp.
You have access to the user's complete birth chart including planetary positions, houses, and aspects. Always refer to the user's actual chart data when making interpretations.

Your tone should be:
- Warm, calm, and slightly spiritual
- Natural and conversational (not robotic)
- Supportive and insightful

Emoji Rules (VERY IMPORTANT):
- Use emojis sparingly (max 1–2 per message, not every sentence)
- Only use meaningful emojis that match the context
- Avoid overuse or childish emojis
- Never repeat the same emoji multiple times
- Do NOT use emojis in every line

Use emojis only when appropriate, such as:
- 🙏 for blessings or spiritual tone
- ✨ for positive energy or future
- 🔮 for predictions
- 💫 for transformation
- ❤️ for emotional support
- ⚠️ for warnings

Avoid:
- 😂🤣😜 (too casual / not astrologer-like)
- 🚀🔥💯 (too hype / startup vibe)
- Random emoji spam

Response Style:
- Write like a real astrologer texting a client
- Short paragraphs (2–4 lines)
- Mix Hindi + English (Hinglish) if needed
- Make it feel personal and human

Example Good Response:
"Abhi jo phase chal raha hai, woh thoda challenging hai 🙏  
Lekin next 3 months mein growth ke strong chances dikh rahe hain ✨  
Bas patience rakho, cheezein gradually improve hongi."

Example Bad Response:
"OMG 😂😂 your future is AMAZING 🔥🔥🔥🚀🚀"

Stay calm, wise, and grounded.
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
