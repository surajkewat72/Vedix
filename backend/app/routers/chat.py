from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.routers.auth import get_current_user
from app.models import ChatRequest, ChatResponse
from app.services.huggingface import stream_chat_response
from app.supabase_client import get_supabase_admin
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat"])


async def _get_user_chart_summary(user_id: str) -> str | None:
    """Fetch chart summary from Supabase for AI context."""
    try:
        supabase = get_supabase_admin()
        result = supabase.table("birth_details").select("chart_data").eq("user_id", user_id).single().execute()
        if result.data and result.data.get("chart_data"):
            return result.data["chart_data"].get("chart_summary")
    except Exception as e:
        logger.warning(f"Could not fetch chart for user {user_id}: {e}")
    return None


@router.post("/send")
async def send_message(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """Send a message and get streaming AI response."""
    user_id = current_user["id"]
    chart_summary = await _get_user_chart_summary(user_id)

    history = [msg.model_dump() for msg in (body.history or [])]

    async def generate():
        full_response = []
        async for chunk in stream_chat_response(body.message, chart_summary, history):
            full_response.append(chunk)
            yield f"data: {json.dumps({'content': chunk})}\n\n"

        # Save messages to Supabase
        try:
            supabase = get_supabase_admin()
            complete_text = "".join(full_response)
            supabase.table("chat_messages").insert([
                {"user_id": user_id, "role": "user", "content": body.message},
                {"user_id": user_id, "role": "assistant", "content": complete_text},
            ]).execute()
        except Exception as e:
            logger.warning(f"Failed to save chat messages: {e}")

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/history")
async def get_chat_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve past chat messages for the current user."""
    user_id = current_user["id"]
    try:
        supabase = get_supabase_admin()
        result = (
            supabase.table("chat_messages")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=False)
            .limit(limit)
            .execute()
        )
        return {"success": True, "messages": result.data or []}
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return {"success": False, "messages": []}


@router.delete("/history")
async def clear_chat_history(current_user: dict = Depends(get_current_user)):
    """Clear all chat history for the current user."""
    user_id = current_user["id"]
    try:
        supabase = get_supabase_admin()
        supabase.table("chat_messages").delete().eq("user_id", user_id).execute()
        return {"success": True, "message": "Chat history cleared"}
    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        return {"success": False, "message": "Failed to clear history"}
