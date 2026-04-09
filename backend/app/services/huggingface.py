import httpx
import json
import logging
from typing import AsyncGenerator, List, Optional
from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a professional astrologer who chats like a real human on WhatsApp.

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

    system_instruction = """You are an authentic, deeply knowledgeable Indian Vedic Astrologer. 
Analyze the provided birth chart and give a highly specific reading for the following 5 life areas:
1. Love & Relationships (7th house, Venus dynamics)
2. Money & Career (2nd, 10th, 11th houses, Jupiter & Saturn)
3. Personality (Ascendant, 1st house lord, Moon sign)
4. Family (2nd, 4th houses, Moon & Jupiter)
5. Spirituality (9th, 12th houses, Ketu, Jupiter)

Use strict astrological terminology. Mention explicit planetary placements, lordships, Yogas (if present), or specific aspects in the chart to justify your reading. The user wants to see EXACTLY what planets/houses cause these effects in their life. Do NOT be vague or generic.

For each area, provide a score from 1 to 10 based on the chart's strength, a deep and technical Insight (2-3 sentences), and practical Vedic Advice corresponding to those specific planets (1-2 sentences).
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


async def generate_chart_reading(chart_summary: str) -> str:
    """
    Generates a deep, holistic, authentic 3-4 paragraph markdown reading based on the chart dataset.
    """
    settings = get_settings()
    
    if not settings.huggingface_api_key:
        logger.warning("No Hugging Face key available for chart reading.")
        return chart_summary

    system_instruction = """You are an authentic, highly revered Indian Vedic Astrologer. 
You must write a comprehensive, deeply technical yet highly engaging birth chart summary for the user.
Your reading should be 3-4 majestic paragraphs long. 
- Use markdown beautifully. Use **bold** for planets and signs. Use `###` for headers if needed.
- Ground your entire reading deeply in the specific chart alignments provided. 
- You MUST explicitly point out their Ascendant (Lagna) and its lord's placement, the Moon sign (Rashi) and mind, and the Sun sign (ego).
- Mention any dominant Yogas, specific conjunctions, exalted/debilitated planets, or striking house placements that stand out.
- NEVER offer a generic reading. If the Sun is in the 8th house, specify exactly what that deeply means for them.
- Conclude with a cosmic truth about their life purpose or karmic direction based on the North Node (Rahu)/South Node (Ketu) or 10th/9th house.
"""

    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": f"USER'S RAW ASTROLOGY DATA:\n{chart_summary}\n\nPlease generate my deep astrological summary."}
    ]

    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct",
        "messages": messages,
        "max_tokens": 1200,
        "temperature": 0.65
    }

    headers = {
        "Authorization": f"Bearer {settings.huggingface_api_key}",
        "Content-Type": "application/json"
    }

    API_URL = "https://router.huggingface.co/v1/chat/completions"

    try:
        async with httpx.AsyncClient(timeout=80.0) as client:
            response = await client.post(API_URL, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return content.strip() if content else chart_summary
            
    except Exception as e:
        logger.error(f"Failed to generate chart reading: {e}", exc_info=True)
        return chart_summary

