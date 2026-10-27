from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
import json
from core.auth import get_current_user
from core.database import db_get, db_get_one, db_post, db_patch, log_activity
from dataset_versioning.hasher import compute_file_sha256
from dataset_versioning.profiler import load_dataframe, profile_dataset
from dataset_versioning.storage import save_dataset_file, get_dataset_file_path
from dataset_versioning.comparator import compare_dataset_versions

router = APIRouter(prefix="/api/datasets", tags=["Dataset Versioning"])

@router.get("")
async def list_datasets(user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]
    datasets = await db_get("datasets", token, {
        "user_id": f"eq.{user_id}",
        "order": "updated_at.desc",
    })
    return datasets

@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str, user: dict = Depends(get_current_user)):
    token = user["_token"]
    user_id = user["id"]

    ds = await db_get_one("datasets", token, {
        "id": f"eq.{dataset_id}",
        "user_id": f"eq.{user_id}",
    })
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    versions = await db_get("dataset_versions", token, {
        "dataset_id": f"eq.{dataset_id}",
        "order": "created_at.desc",
    })

    # Format versions array for frontend
    formatted_versions = []
    for v in versions:
        formatted_versions.append({
            "id": v.get("id"),
            "version": v.get("version"),
            "label": v.get("label") or v.get("version"),
            "rows": v.get("rows_count", 0),
            "columns": v.get("columns_count", 0),
            "size": v.get("size_str", "0 MB"),
            "qualityScore": v.get("quality_score", 100),
            "missingValues": float(v.get("missing_values") or 0.0),
            "duplicates": float(v.get("duplicates") or 0.0),
            "author": v.get("author") or "You",
            "date": v.get("created_at")[:10] if v.get("created_at") else "Recent",
            "note": v.get("note") or "",
            "storage_path": v.get("storage_path"),
        })

    ds["versions"] = formatted_versions
    return ds

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(""),
    project_id: Optional[str] = Form(None),
    dataset_type: Optional[str] = Form("Tabular"),
    version_label: Optional[str] = Form("V1"),
    version_note: Optional[str] = Form("Initial upload"),
    user: dict = Depends(get_current_user),
):
    """
    Core Dataset Versioning Upload Endpoint.
    1. Reads uploaded file bytes.
    2. Computes SHA-256 fingerprint.
    3. Profiles dataset with Pandas (rows, cols, schema, missing, duplicates, quality).
    4. Saves file to versioned storage.
    5. Creates dataset and dataset_version records in PostgreSQL.
    """
    token = user["_token"]
    user_id = user["id"]
    author_name = user.get("user_metadata", {}).get("full_name") or user.get("email", "").split("@")[0] or "You"

    # 1. Read bytes & compute SHA-256
    file_bytes = await file.read()
    file_size = len(file_bytes)
    sha256_hash = compute_file_sha256(file_bytes)

    # 2. Profile with Pandas
    try:
        df = load_dataframe(file_bytes, file.filename)
        profile = profile_dataset(df, file_size)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse and profile dataset: {str(e)}")

    # 3. Create Dataset record
    dataset_payload = {
        "user_id": user_id,
        "name": name,
        "description": description,
        "type": dataset_type,
        "current_version": version_label or "V1",
        "rows_count": profile["rows_count"],
        "columns_count": profile["columns_count"],
        "size_str": profile["size_str"],
        "quality_score": profile["quality_score"],
        "column_schema": profile["column_schema"],
        "quality_breakdown": profile["quality_breakdown"],
    }
    if project_id and project_id != "null" and project_id != "":
        dataset_payload["project_id"] = project_id

    created_ds = await db_post("datasets", token, dataset_payload)
    if not created_ds:
        raise HTTPException(
            status_code=500,
            detail="Failed to save dataset in Supabase. Please ensure supabase_schema.sql has been run in your Supabase SQL Editor.",
        )

    dataset_id = created_ds["id"]

    # 4. Save file to storage (MinIO primary, Supabase storage fallback, local cache)
    _, rel_storage_path = save_dataset_file(
        dataset_id, version_label or "V1", file_bytes, file.filename, user_token=token
    )

    # 5. Create Dataset Version record
    version_payload = {
        "dataset_id": dataset_id,
        "version": version_label or "V1",
        "label": f"{version_label} — {version_note}" if version_note else version_label,
        "rows_count": profile["rows_count"],
        "columns_count": profile["columns_count"],
        "size_str": profile["size_str"],
        "author": author_name,
        "note": version_note,
        "missing_values": profile["missing_values_pct"],
        "duplicates": profile["duplicates_pct"],
        "quality_score": profile["quality_score"],
        "storage_path": rel_storage_path,
    }
    created_ver = await db_post("dataset_versions", token, version_payload)
    if not created_ver:
        raise HTTPException(
            status_code=500,
            detail="Failed to record dataset version in Supabase. Please verify the dataset_versions table exists.",
        )

    await log_activity(
        token, user_id,
        f"Uploaded dataset {name} ({version_label}) with {profile['rows_count']} rows",
        icon="ds",
        activity_type="dataset",
    )

    return {
        "status": "success",
        "dataset": created_ds,
        "version": created_ver,
        "profile": profile,
        "sha256": sha256_hash,
    }

@router.post("/{dataset_id}/versions")
async def create_new_version(
    dataset_id: str,
    file: UploadFile = File(...),
    version_label: str = Form(...),
    version_note: Optional[str] = Form(""),
    user: dict = Depends(get_current_user),
):
    """
    Uploads a new version for an existing dataset and triggers version profiling.
    """
    token = user["_token"]
    user_id = user["id"]
    author_name = user.get("user_metadata", {}).get("full_name") or user.get("email", "").split("@")[0] or "You"

    ds = await db_get_one("datasets", token, {"id": f"eq.{dataset_id}", "user_id": f"eq.{user_id}"})
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_bytes = await file.read()
    file_size = len(file_bytes)
    sha256_hash = compute_file_sha256(file_bytes)

    df = load_dataframe(file_bytes, file.filename)
    profile = profile_dataset(df, file_size)

    _, rel_storage_path = save_dataset_file(
        dataset_id, version_label, file_bytes, file.filename, user_token=token
    )

    version_payload = {
        "dataset_id": dataset_id,
        "version": version_label,
        "label": f"{version_label} — {version_note}" if version_note else version_label,
        "rows_count": profile["rows_count"],
        "columns_count": profile["columns_count"],
        "size_str": profile["size_str"],
        "author": author_name,
        "note": version_note,
        "missing_values": profile["missing_values_pct"],
        "duplicates": profile["duplicates_pct"],
        "quality_score": profile["quality_score"],
        "storage_path": rel_storage_path,
    }
    created_ver = await db_post("dataset_versions", token, version_payload)

    # Update dataset current stats
    await db_patch(
        "datasets",
        token,
        {"id": f"eq.{dataset_id}"},
        {
            "current_version": version_label,
            "rows_count": profile["rows_count"],
            "columns_count": profile["columns_count"],
            "size_str": profile["size_str"],
            "quality_score": profile["quality_score"],
            "column_schema": profile["column_schema"],
            "quality_breakdown": profile["quality_breakdown"],
        },
    )

    await log_activity(
        token, user_id,
        f"Added version {version_label} to dataset {ds['name']}",
        icon="ds",
        activity_type="dataset",
    )

    return {
        "status": "success",
        "version": created_ver,
        "profile": profile,
        "sha256": sha256_hash,
    }

@router.get("/{dataset_id}/compare")
async def compare_versions(
    dataset_id: str,
    base: Optional[str] = Query(None, description="Base version id or label (e.g. V1)"),
    target: Optional[str] = Query(None, description="Target version id or label (e.g. V2)"),
    user: dict = Depends(get_current_user),
):
    """
    Compares two dataset versions:
    - Calculates row/col/quality/missing/duplicates deltas
    - Identifies added/removed columns and data type changes
    - Runs PCA data drift reconstruction error and component shifts
    """
    token = user["_token"]
    user_id = user["id"]

    ds = await db_get_one("datasets", token, {"id": f"eq.{dataset_id}", "user_id": f"eq.{user_id}"})
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    versions = await db_get("dataset_versions", token, {
        "dataset_id": f"eq.{dataset_id}",
        "order": "created_at.asc",
    })
    if not versions:
        raise HTTPException(status_code=400, detail="No versions available for comparison")

    # Select base version
    base_ver = None
    if base:
        base_ver = next((v for v in versions if v.get("id") == base or v.get("version") == base), None)
    if not base_ver:
        base_ver = versions[0]

    # Select target version
    target_ver = None
    if target:
        target_ver = next((v for v in versions if v.get("id") == target or v.get("version") == target), None)
    if not target_ver:
        target_ver = versions[-1]

    # Perform comparison
    comparison = compare_dataset_versions(base_ver, target_ver)
    comparison["dataset_id"] = dataset_id
    comparison["dataset_name"] = ds["name"]

    return comparison
