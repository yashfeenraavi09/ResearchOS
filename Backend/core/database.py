import httpx
from typing import Dict, Any, List, Optional
from core.config import SUPABASE_URL, SUPABASE_ANON_KEY

def get_db_headers(token: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

async def db_get(table: str, token: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=get_db_headers(token),
            params=params or {},
        )
        if resp.status_code not in (200, 206):
            return []
        return resp.json()

async def db_get_one(table: str, token: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    res = await db_get(table, token, params)
    return res[0] if res else None

async def db_post(table: str, token: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=get_db_headers(token),
            json=data,
        )
        if resp.status_code in (200, 201):
            res = resp.json()
            return res[0] if isinstance(res, list) and res else res
        return None

async def db_patch(table: str, token: str, params: Dict[str, Any], data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        resp = await client.patch(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=get_db_headers(token),
            params=params,
            json=data,
        )
        if resp.status_code in (200, 204):
            res = resp.json() if resp.content else {}
            return res[0] if isinstance(res, list) and res else res
        return None

async def log_activity(token: str, user_id: str, text: str, icon: str = "exp", activity_type: str = "general"):
    await db_post(
        "activities",
        token,
        {
            "user_id": user_id,
            "text": text,
            "icon": icon,
            "activity_type": activity_type,
        },
    )
