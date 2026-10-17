from fastapi import FastAPI, HTTPException, Depends, Security, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ResearchOS API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",           # Vite dev server
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", ""),     # Production frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

security = HTTPBearer()

# ── Auth helper ───────────────────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    """
    Validates the Supabase JWT sent from the React frontend.
    """
    token = credentials.credentials

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = resp.json()
    user["_token"] = token
    return user


def get_db_headers(token: str):
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


# ── Schemas ───────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    status: Optional[str] = "active"
    visibility: Optional[str] = "team"
    tags: Optional[List[str]] = []

class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    type: Optional[str] = "Tabular"
    project_id: Optional[str] = None
    tags: Optional[List[str]] = []
    rows_count: Optional[int] = 0
    columns_count: Optional[int] = 0
    size_str: Optional[str] = "0 MB"

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


# ── Base Routes ───────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ResearchOS API is running", "database": "Supabase Connected"}


@app.get("/api/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user.get("email"),
        "name": user.get("user_metadata", {}).get("full_name") or user.get("user_metadata", {}).get("name"),
        "org": user.get("user_metadata", {}).get("org"),
    }


# ── Dashboard Route ───────────────────────────────────────────────────────────

@app.get("/api/dashboard")
async def get_dashboard(user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    recent_experiments = []
    recent_datasets = []
    projects = []
    activities = []

    async with httpx.AsyncClient() as client:
        # Fetch experiments
        try:
            r_exp = await client.get(
                f"{SUPABASE_URL}/rest/v1/experiments?user_id=eq.{user_id}&order=created_at.desc&limit=5",
                headers=headers
            )
            if r_exp.status_code == 200:
                recent_experiments = r_exp.json()
        except Exception:
            pass

        # Fetch datasets
        try:
            r_ds = await client.get(
                f"{SUPABASE_URL}/rest/v1/datasets?user_id=eq.{user_id}&order=created_at.desc&limit=5",
                headers=headers
            )
            if r_ds.status_code == 200:
                recent_datasets = r_ds.json()
        except Exception:
            pass

        # Fetch projects count
        try:
            r_proj = await client.get(
                f"{SUPABASE_URL}/rest/v1/projects?user_id=eq.{user_id}",
                headers=headers
            )
            if r_proj.status_code == 200:
                projects = r_proj.json()
        except Exception:
            pass

        # Fetch activities
        try:
            r_act = await client.get(
                f"{SUPABASE_URL}/rest/v1/activities?user_id=eq.{user_id}&order=created_at.desc&limit=10",
                headers=headers
            )
            if r_act.status_code == 200:
                activities = r_act.json()
        except Exception:
            pass

    # Calculate real dynamic stats
    best_acc = 0.0
    for exp in recent_experiments:
        acc = exp.get("accuracy")
        if acc and float(acc) > best_acc:
            best_acc = float(acc)

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


# ── Projects Routes ───────────────────────────────────────────────────────────

@app.get("/api/projects")
async def list_projects(user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/projects?user_id=eq.{user_id}&order=created_at.desc",
            headers=headers
        )
        if resp.status_code != 200:
            return []
        return resp.json()


@app.post("/api/projects")
async def create_project(data: ProjectCreate, user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    payload = {
        "user_id": user_id,
        "name": data.name,
        "description": data.description,
        "status": data.status,
        "visibility": data.visibility,
        "tags": data.tags,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/rest/v1/projects",
            headers=headers,
            json=payload
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        created = resp.json()
        return created[0] if isinstance(created, list) and created else created


@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/projects?id=eq.{project_id}&user_id=eq.{user_id}",
            headers=headers
        )
        data = resp.json() if resp.status_code == 200 else []
        if not data:
            raise HTTPException(status_code=404, detail="Project not found")
        proj = data[0]

        # Fetch associated datasets
        try:
            r_ds = await client.get(
                f"{SUPABASE_URL}/rest/v1/datasets?project_id=eq.{project_id}&user_id=eq.{user_id}",
                headers=headers
            )
            proj["datasets"] = r_ds.json() if r_ds.status_code == 200 else []
        except Exception:
            proj["datasets"] = []

        # Fetch associated experiments
        try:
            r_exp = await client.get(
                f"{SUPABASE_URL}/rest/v1/experiments?project_id=eq.{project_id}&user_id=eq.{user_id}",
                headers=headers
            )
            proj["experiments"] = r_exp.json() if r_exp.status_code == 200 else []
        except Exception:
            proj["experiments"] = []

        return proj


# ── Datasets Routes ───────────────────────────────────────────────────────────

@app.get("/api/datasets")
async def list_datasets(user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/datasets?user_id=eq.{user_id}&order=created_at.desc",
            headers=headers
        )
        if resp.status_code != 200:
            return []
        return resp.json()


@app.post("/api/datasets")
async def create_dataset(data: DatasetCreate, user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    payload = {
        "user_id": user_id,
        "name": data.name,
        "description": data.description,
        "type": data.type,
        "project_id": data.project_id,
        "tags": data.tags,
        "rows_count": data.rows_count,
        "columns_count": data.columns_count,
        "size_str": data.size_str,
        "quality_score": 100,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/rest/v1/datasets",
            headers=headers,
            json=payload
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        created = resp.json()
        return created[0] if isinstance(created, list) and created else created


@app.get("/api/datasets/{dataset_id}")
async def get_dataset(dataset_id: str, user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/datasets?id=eq.{dataset_id}&user_id=eq.{user_id}",
            headers=headers
        )
        data = resp.json() if resp.status_code == 200 else []
        if not data:
            raise HTTPException(status_code=404, detail="Dataset not found")
        ds = data[0]

        # Fetch versions
        v_resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/dataset_versions?dataset_id=eq.{dataset_id}&order=created_at.desc",
            headers=headers
        )
        ds["versions"] = v_resp.json() if v_resp.status_code == 200 else []
        return ds


# ── Experiments Routes ────────────────────────────────────────────────────────

@app.get("/api/experiments")
async def list_experiments(user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/experiments?user_id=eq.{user_id}&order=created_at.desc",
            headers=headers
        )
        if resp.status_code != 200:
            return []
        return resp.json()


@app.post("/api/experiments")
async def create_experiment(data: ExperimentCreate, user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    payload = {
        "user_id": user_id,
        "name": data.name,
        "model": data.model,
        "project_id": data.project_id,
        "dataset_id": data.dataset_id,
        "dataset_version": data.dataset_version,
        "framework": data.framework,
        "gpu": data.gpu,
        "epochs": data.epochs,
        "batch_size": data.batch_size,
        "learning_rate": data.learning_rate,
        "hyperparams": data.hyperparams,
        "status": "running",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/rest/v1/experiments",
            headers=headers,
            json=payload
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        created = resp.json()
        return created[0] if isinstance(created, list) and created else created


@app.get("/api/experiments/{experiment_id}")
async def get_experiment(experiment_id: str, user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/experiments?id=eq.{experiment_id}&user_id=eq.{user_id}",
            headers=headers
        )
        data = resp.json() if resp.status_code == 200 else []
        if not data:
            raise HTTPException(status_code=404, detail="Experiment not found")
        return data[0]


# ── Lineage Routes ────────────────────────────────────────────────────────────

@app.get("/api/lineage")
async def get_lineage(user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    nodes = []
    edges = []

    async with httpx.AsyncClient() as client:
        r_nodes = await client.get(
            f"{SUPABASE_URL}/rest/v1/lineage_nodes?user_id=eq.{user_id}",
            headers=headers
        )
        if r_nodes.status_code == 200:
            nodes = r_nodes.json()

        r_edges = await client.get(
            f"{SUPABASE_URL}/rest/v1/lineage_edges?user_id=eq.{user_id}",
            headers=headers
        )
        if r_edges.status_code == 200:
            edges = r_edges.json()

    return {"nodes": nodes, "edges": edges}


# ── Results & Benchmarks Route ────────────────────────────────────────────────

@app.get("/api/results")
async def get_results(user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/experiments?user_id=eq.{user_id}&status=eq.completed&order=accuracy.desc",
            headers=headers
        )
        if resp.status_code != 200:
            return []
        return resp.json()


# ── Tracking SDK Route ────────────────────────────────────────────────────────

@app.get("/api/tracking")
async def get_tracking_sessions(user=Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    headers = get_db_headers(token)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/rest/v1/tracking_sessions?user_id=eq.{user_id}&order=created_at.desc",
            headers=headers
        )
        if resp.status_code != 200:
            return []
        return resp.json()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
