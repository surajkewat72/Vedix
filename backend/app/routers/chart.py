from fastapi import APIRouter, Depends
from app.routers.auth import get_current_user
from app.models import BirthDetailsRequest, BirthDetailsResponse
from app.services.astrology import calculate_chart
from app.supabase_client import get_supabase_admin
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chart", tags=["Chart"])


@router.post("/calculate", response_model=BirthDetailsResponse)
async def calculate_birth_chart(
    body: BirthDetailsRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Calculate a birth chart and save it to Supabase.
    """
    user_id = current_user["id"]

    name = body.name or current_user.get("user_metadata", {}).get("full_name") or current_user.get("email", "User")
    chart = calculate_chart(
        name=name,
        birth_date=body.birth_date,
        birth_time=body.birth_time or "12:00",
        city=body.birth_city,
        lat=body.birth_lat,
        lng=body.birth_lng,
    )

    if not chart:
        return BirthDetailsResponse(
            success=False,
            message="Failed to calculate chart. Please check birth details.",
        )

    # Save to Supabase
    try:
        supabase = get_supabase_admin()
        chart_dict = chart.model_dump()

        supabase.table("birth_details").upsert({
            "user_id": user_id,
            "birth_date": body.birth_date,
            "birth_time": body.birth_time,
            "birth_city": body.birth_city,
            "birth_lat": chart_dict["houses"][0]["position"] if body.birth_lat is None else body.birth_lat,
            "birth_lng": body.birth_lng,
            "chart_data": chart_dict,
        }, on_conflict="user_id").execute()

    except Exception as e:
        logger.warning(f"Failed to save chart to Supabase: {e}")
        # Still return the chart even if save fails

    return BirthDetailsResponse(success=True, chart=chart)


@router.get("/me")
async def get_my_chart(current_user: dict = Depends(get_current_user)):
    """Fetch the saved birth chart for the current user."""
    user_id = current_user["id"]

    try:
        supabase = get_supabase_admin()
        result = supabase.table("birth_details").select("*").eq("user_id", user_id).single().execute()

        if result.data:
            return {"success": True, "data": result.data}
        else:
            return {"success": False, "message": "No birth details found"}

    except Exception as e:
        logger.error(f"Error fetching chart: {e}")
        return {"success": False, "message": "Could not retrieve chart data"}
