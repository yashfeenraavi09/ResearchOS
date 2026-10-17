from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from core.auth import get_current_user
from core.database import db_get, db_get_one, db_post, log_activity

router = APIRouter(prefix="/api/experiments", tags=["Experiments"])

class ExperimentCreate(BaseModel):
    name: str
    model: str
    project_id: Optional[str] = None
    dataset_id: Optional[str] = None
    dataset_version: Optional[str] = "V1"
    framework: Optional[str] = "PyTorch"
    gpu: Optional[str] = "CPU"
    epochs: Optional[int] = 10
    batch_size: Optional[int] = 32
    learning_rate: Optional[float] = 0.001
    hyperparams: Optional[List[Dict[str, Any]]] = []

@router.get("")
async def list_experiments(user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    return await db_get("experiments", token, {
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
    })

@router.post("")
async def create_experiment(data: ExperimentCreate, user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]

    payload = {
        "user_id": user_id,
        "name": data.name,
        "model": data.model,
        "project_id": data.project_id if data.project_id != "null" else None,
        "dataset_id": data.dataset_id if data.dataset_id != "null" else None,
        "dataset_version": data.dataset_version,
        "framework": data.framework,
        "gpu": data.gpu,
        "epochs": data.epochs,
        "batch_size": data.batch_size,
        "learning_rate": data.learning_rate,
        "hyperparams": data.hyperparams or [],
        "status": "running",
    }
    created = await db_post("experiments", token, payload)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create experiment")

    await log_activity(
        token, user_id,
        f"Launched experiment {data.name} using {data.model}",
        icon="exp",
        activity_type="experiment",
    )
    return created

@router.get("/{experiment_id}")
async def get_experiment(experiment_id: str, user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]

    exp = await db_get_one("experiments", token, {
        "id": f"eq.{experiment_id}",
        "user_id": f"eq.{user_id}",
    })
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp
