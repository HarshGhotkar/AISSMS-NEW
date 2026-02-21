"""SWOT analysis router."""
from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth_router import get_current_user_id
from db import supabase

router = APIRouter(prefix="/swot", tags=["swot"])


# SWOT structure per spec
class SWOTPayload(BaseModel):
    strengths: dict[str, list[str]] | None = None  # technical, soft, subjects
    weaknesses: dict[str, list[str]] | None = None  # subjects, habits, gaps
    opportunities: dict[str, list[str]] | None = None  # internships, certs, projects, competitions
    threats: dict[str, list[str]] | None = None  # time, resources, distractions, confidence


DEFAULT_STRENGTHS = {"technical": [], "soft": [], "subjects": []}
DEFAULT_WEAKNESSES = {"subjects": [], "habits": [], "gaps": []}
DEFAULT_OPPORTUNITIES = {"internships": [], "certs": [], "projects": [], "competitions": []}
DEFAULT_THREATS = {"time": [], "resources": [], "distractions": [], "confidence": []}


@router.get("")
def get_swot(user_id: str = Depends(get_current_user_id)):
    """Get current user's SWOT analysis."""
    res = supabase.table("swot_analysis").select("*").eq("user_id", user_id).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]
    return {
        "user_id": user_id,
        "strengths": DEFAULT_STRENGTHS,
        "weaknesses": DEFAULT_WEAKNESSES,
        "opportunities": DEFAULT_OPPORTUNITIES,
        "threats": DEFAULT_THREATS,
    }


@router.put("")
def upsert_swot(
    payload: SWOTPayload,
    user_id: str = Depends(get_current_user_id),
):
    """Create or update SWOT analysis for the current user."""
    res = supabase.table("swot_analysis").select("id").eq("user_id", user_id).execute()
    strengths = payload.strengths or DEFAULT_STRENGTHS
    weaknesses = payload.weaknesses or DEFAULT_WEAKNESSES
    opportunities = payload.opportunities or DEFAULT_OPPORTUNITIES
    threats = payload.threats or DEFAULT_THREATS

    row = {
        "user_id": user_id,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "opportunities": opportunities,
        "threats": threats,
        "updated_at": datetime.utcnow().isoformat(),
    }

    if res.data and len(res.data) > 0:
        supabase.table("swot_analysis").update(row).eq("user_id", user_id).execute()
    else:
        del row["updated_at"]
        supabase.table("swot_analysis").insert(row).execute()

    return {"message": "SWOT analysis saved", "status": "success"}
