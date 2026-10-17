import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
from core.config import FRONTEND_URL, SUPABASE_URL, SUPABASE_ANON_KEY
from core.auth import get_current_user
from core.database import db_get
from dataset_versioning.router import router as dataset_router
from tracking_plugin.router import router as tracking_router
from experiments.router import router as experiments_router
from projects.router import router as projects_router
from lineage.router import router as lineage_router
from settings.router import router as settings_router

app = FastAPI(
    title="ResearchOS API",
    description="Backend API for Dataset Versioning, Tracking SDK, ML Experiments & Research Lineage",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
cors_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8443",
]
if FRONTEND_URL:
    cors_origins.append(FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Feature Routers ─────────────────────────────────────────────────────
app.include_router(dataset_router)
app.include_router(tracking_router)
app.include_router(experiments_router)
app.include_router(projects_router)
app.include_router(lineage_router)
app.include_router(settings_router)

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "ResearchOS API",
        "features": ["dataset_versioning", "tracking_sdk", "experiments", "lineage", "projects"],
    }

# ── User Profile ──────────────────────────────────────────────────────────────
@app.get("/api/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "name": (
            user.get("user_metadata", {}).get("full_name")
            or user.get("user_metadata", {}).get("name")
            or user.get("email", "").split("@")[0]
        ),
        "avatar_url": user.get("user_metadata", {}).get("avatar_url"),
        "created_at": user.get("created_at"),
    }

# ── Dashboard Analytics ───────────────────────────────────────────────────────
@app.get("/api/dashboard")
async def get_dashboard(user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]

    recent_experiments = await db_get("experiments", token, {
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
        "limit": 10,
    })

    recent_datasets = await db_get("datasets", token, {
        "user_id": f"eq.{user_id}",
        "order": "updated_at.desc",
        "limit": 6,
    })

    projects = await db_get("projects", token, {
        "user_id": f"eq.{user_id}",
    })

    activities = await db_get("activities", token, {
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
        "limit": 10,
    })

    # Best accuracy metric
    best_acc = 0.0
    for exp in recent_experiments:
        acc = exp.get("accuracy")
        if acc:
            try:
                acc_val = float(acc)
                if acc_val > best_acc:
                    best_acc = acc_val
            except ValueError:
                pass

    return {
        "stats": {
            "total_datasets": len(recent_datasets),
            "total_experiments": len(recent_experiments),
            "active_experiments": len([e for e in recent_experiments if e.get("status") == "running"]),
            "best_accuracy": f"{best_acc}%" if best_acc > 0 else "—",
            "total_projects": len(projects),
        },
        "recent_experiments": recent_experiments,
        "recent_datasets": recent_datasets,
        "activities": activities,
    }

# ── Results & Benchmarks ──────────────────────────────────────────────────────
@app.get("/api/results")
async def get_results(user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    return await db_get("experiments", token, {
        "user_id": f"eq.{user_id}",
        "status": "eq.completed",
        "order": "accuracy.desc",
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
