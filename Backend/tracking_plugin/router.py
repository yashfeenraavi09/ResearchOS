from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from core.auth import get_current_user
from core.database import db_get, db_get_one, db_post, db_patch
from tracking_plugin.schemas import SyncBatchPayload
from tracking_plugin.service import process_tracking_batch

router = APIRouter(prefix="/api/tracking", tags=["Tracking SDK"])

@router.get("")
@router.get("/sessions")
async def get_tracking_sessions(user: dict = Depends(get_current_user)):
    """
    Returns tracking sessions for the current user.
    """
    token = user["_token"]
    user_id = user["id"]

    sessions = await db_get("tracking_sessions", token, {
        "user_id": f"eq.{user_id}",
        "order": "last_ping.desc",
    })
    return sessions

@router.post("/sync")
async def sync_tracking_batch(
    payload: SyncBatchPayload,
    user: dict = Depends(get_current_user),
):
    """
    Receives confirmed tracking event batch from Python SDK or web UI.
    """
    token = user["_token"]
    user_id = user["id"]

    result = await process_tracking_batch(token, user_id, payload.model_dump())
    return result

@router.post("/session/toggle")
async def toggle_session_status(
    session_id: str,
    status: str, # active, paused, closed
    user: dict = Depends(get_current_user),
):
    token = user["_token"]
    res = await db_patch(
        "tracking_sessions",
        token,
        {"session_token": f"eq.{session_id}"},
        {"status": status},
    )
    return {"status": "success", "session": res}
