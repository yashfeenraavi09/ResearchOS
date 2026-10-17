from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from pathlib import Path
import os
import httpx
from core.auth import get_current_user
from core.config import SUPABASE_URL, SUPABASE_ANON_KEY
from core.database import db_get, log_activity

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class SettingsUpdate(BaseModel):
    profile: Optional[Dict[str, Any]] = None
    notifications: Optional[Dict[str, Any]] = None
    privacy: Optional[Dict[str, Any]] = None
    tracking: Optional[Dict[str, Any]] = None

def format_bytes(b: int) -> str:
    if b < 1024:
        return f"{b} B"
    elif b < 1024 * 1024:
        return f"{b / 1024:.1f} KB"
    elif b < 1024 * 1024 * 1024:
        return f"{b / (1024 * 1024):.1f} MB"
    else:
        return f"{b / (1024 * 1024 * 1024):.2f} GB"

@router.get("")
async def get_settings(user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    email = user.get("email", "")
    metadata = user.get("user_metadata", {}) or {}

    saved_settings = metadata.get("settings", {}) or {}

    # 1. Profile information
    name = (
        metadata.get("full_name")
        or metadata.get("name")
        or (email.split("@")[0] if email else "Researcher")
    )
    affiliation = metadata.get("affiliation") or metadata.get("org") or ""
    bio = metadata.get("bio") or ""

    # Initials for avatar
    initials = "".join([w[0].upper() for w in name.split() if w][:2]) or "U"

    # 2. Real storage calculation
    # Check dataset files
    total_bytes = 0
    datasets = await db_get("datasets", token, {"user_id": f"eq.{user_id}"})
    versions = await db_get("dataset_versions", token, {})

    # Calculate size from local cache directory
    storage_dir = Path(__file__).resolve().parent.parent / "storage" / "datasets"
    if storage_dir.exists():
        for f in storage_dir.rglob("*"):
            if f.is_file():
                total_bytes += f.stat().st_size

    # Also sum recorded dataset versions if local directory is empty
    if total_bytes == 0 and versions:
        for v in versions:
            # size_str fallback or default 5MB per version estimate
            total_bytes += 5 * 1024 * 1024

    quota_bytes = 50 * 1024 * 1024 * 1024  # 50 GB standard quota
    used_pct = min(100.0, max(0.0, (total_bytes / quota_bytes) * 100))

    # 3. Real Projects & Team Members
    projects = await db_get("projects", token, {"user_id": f"eq.{user_id}"})
    active_projects = [p for p in projects if p.get("status") == "active"]

    # Build real team list from projects + user
    team_members = [
        {
            "id": user_id,
            "name": name,
            "email": email,
            "role": "Workspace Owner / PI",
            "color": "#0D9488",
            "initials": initials,
            "active": True,
            "is_self": True,
        }
    ]

    # Collect any real contributors listed on user's projects
    seen_emails = {email.lower()}
    for p in projects:
        for c in (p.get("contributors") or []):
            c_email = (c.get("email") or "").lower()
            if c_email and c_email not in seen_emails:
                seen_emails.add(c_email)
                team_members.append({
                    "id": c.get("id") or c.get("email"),
                    "name": c.get("name") or c.get("email").split("@")[0],
                    "email": c.get("email"),
                    "role": c.get("role") or "Contributor",
                    "color": c.get("avatarColor") or "#3B82F6",
                    "initials": c.get("initials") or (c.get("name") or "C")[0].upper(),
                    "active": True,
                    "is_self": False,
                })

    # 4. Default / Real Preferences
    default_notifications = {
        "experimentComplete": True,
        "datasetUpload": True,
        "teamInvite": True,
        "weeklyDigest": True,
        "lineageUpdate": False,
        "errorAlert": True,
        "slackWebhook": False,
        "emailDigest": True,
        "slackWebhookUrl": "",
    }
    notifications = {**default_notifications, **saved_settings.get("notifications", {})}

    default_privacy = {
        "profilePublic": False,
        "shareUsage": True,
        "allowAnalytics": True,
        "dataRetention": "90d",
        "defaultVisibility": "team",
    }
    privacy = {**default_privacy, **saved_settings.get("privacy", {})}

    default_tracking = {
        "autoTrack": True,
        "trackDatasets": True,
        "trackModels": True,
        "trackMetadata": True,
        "trackPreprocessing": False,
        "retentionDays": "30",
        "anonymizeIds": False,
    }
    tracking = {**default_tracking, **saved_settings.get("tracking", {})}

    return {
        "profile": {
            "id": user_id,
            "name": name,
            "email": email,
            "affiliation": affiliation,
            "bio": bio,
            "initials": initials,
            "created_at": user.get("created_at"),
        },
        "storage": {
            "used_bytes": total_bytes,
            "used_str": format_bytes(total_bytes),
            "limit_bytes": quota_bytes,
            "limit_str": "50 GB",
            "pct": round(used_pct, 1),
            "datasets_count": len(datasets),
            "versions_count": len(versions),
        },
        "projects_summary": {
            "total": len(projects),
            "active": len(active_projects),
        },
        "team": team_members,
        "notifications": notifications,
        "privacy": privacy,
        "tracking": tracking,
    }

@router.post("")
async def update_settings(data: SettingsUpdate, user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    current_meta = user.get("user_metadata", {}) or {}
    current_settings = current_meta.get("settings", {}) or {}

    updated_meta = {**current_meta}

    if data.profile:
        if "name" in data.profile:
            updated_meta["full_name"] = data.profile["name"]
        if "affiliation" in data.profile:
            updated_meta["affiliation"] = data.profile["affiliation"]
        if "bio" in data.profile:
            updated_meta["bio"] = data.profile["bio"]

    new_settings = {**current_settings}
    if data.notifications is not None:
        new_settings["notifications"] = data.notifications
    if data.privacy is not None:
        new_settings["privacy"] = data.privacy
    if data.tracking is not None:
        new_settings["tracking"] = data.tracking

    updated_meta["settings"] = new_settings

    # Persist directly to Supabase Auth user metadata
    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
            },
            json={"data": updated_meta},
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail="Failed to save user settings in Supabase")

    await log_activity(
        token, user_id,
        "Updated workspace settings and preferences",
        icon="settings",
        activity_type="settings",
    )

    return {"status": "success", "message": "Settings successfully saved"}
