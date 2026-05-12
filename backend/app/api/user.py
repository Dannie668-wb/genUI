from fastapi import APIRouter
from pydantic import BaseModel
from app.memory.long_term import get_user_profile, update_user_profile

router = APIRouter(prefix="/user", tags=["user"])


class PreferencesUpdate(BaseModel):
    user_id: str
    preferences: dict


@router.get("/{user_id}/preferences")
async def get_preferences(user_id: str):
    profile = await get_user_profile(user_id)
    return {"user_id": user_id, "preferences": profile}


@router.put("/preferences")
async def update_preferences(body: PreferencesUpdate):
    await update_user_profile(body.user_id, body.preferences)
    return {"ok": True}
