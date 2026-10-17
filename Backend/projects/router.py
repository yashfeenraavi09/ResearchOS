from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from core.auth import get_current_user
from core.database import db_get, db_get_one, db_post, log_activity

router = APIRouter(prefix="/api/projects", tags=["Projects"])

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    status: Optional[str] = "active"
    visibility: Optional[str] = "team"
    tags: Optional[List[str]] = []

@router.get("")
async def list_projects(user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    return await db_get("projects", token, {
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
    })

@router.post("")
async def create_project(data: ProjectCreate, user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]

    payload = {
        "user_id": user_id,
        "name": data.name,
        "description": data.description,
        "status": data.status,
        "visibility": data.visibility,
        "tags": data.tags or [],
    }
    created = await db_post("projects", token, payload)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create project")

    await log_activity(
        token, user_id,
        f"Created research project {data.name}",
        icon="proj",
        activity_type="project",
    )
    return created

@router.get("/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]

    proj = await db_get_one("projects", token, {
        "id": f"eq.{project_id}",
        "user_id": f"eq.{user_id}",
    })
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch associated datasets and experiments
    proj["datasets"] = await db_get("datasets", token, {
        "project_id": f"eq.{project_id}",
        "user_id": f"eq.{user_id}",
    })
    proj["experiments"] = await db_get("experiments", token, {
        "project_id": f"eq.{project_id}",
        "user_id": f"eq.{user_id}",
    })
    return proj
