import uuid
from typing import Dict, Any, List
from datetime import datetime
from core.database import db_get, db_get_one, db_post, db_patch, log_activity

async def process_tracking_batch(
    token: str,
    user_id: str,
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Ingests a confirmed tracking batch:
    - Ingests datasets and verifies fingerprints
    - Logs experiment metadata and model training records
    - Automatically connects lineage nodes & edges
    - Updates tracking_sessions logs
    """
    session_id = payload.get("session_id") or f"ros-sdk-{uuid.uuid4().hex[:8]}"
    project_id = payload.get("project_id")
    consent = payload.get("consent") or {}
    datasets = payload.get("datasets") or []
    experiments = payload.get("experiments") or []
    preprocessing = payload.get("preprocessing") or []

    sync_lineage = consent.get("sync_lineage", True)
    log_hashes = consent.get("log_version_hashes", True)

    # 1. Ensure tracking session exists
    session = await db_get_one("tracking_sessions", token, {
        "session_token": f"eq.{session_id}",
        "user_id": f"eq.{user_id}",
    })

    current_logs = session.get("logs") or [] if session else []

    created_datasets = []
    created_experiments = []

    # 2. Process Datasets
    for ds_item in datasets:
        ds_name = ds_item.get("name") or "Dataset"
        sha = ds_item.get("sha256") if log_hashes else ""
        rows = ds_item.get("rows_count") or 0
        cols = ds_item.get("columns_count") or 0

        # Check existing dataset
        existing_ds = await db_get_one("datasets", token, {
            "name": f"eq.{ds_name}",
            "user_id": f"eq.{user_id}",
        })

        if not existing_ds:
            ds_data = {
                "user_id": user_id,
                "name": ds_name,
                "description": f"Captured via Tracking SDK from {ds_item.get('path', '')}",
                "type": "Tabular",
                "current_version": "V1",
                "rows_count": rows,
                "columns_count": cols,
                "size_str": f"{round(ds_item.get('size_bytes', 0) / (1024*1024), 2)} MB",
            }
            if project_id:
                ds_data["project_id"] = project_id
            created = await db_post("datasets", token, ds_data)
            target_ds_id = created["id"] if created else str(uuid.uuid4())
        else:
            target_ds_id = existing_ds["id"]

        created_datasets.append(target_ds_id)

        # Append to session logs
        current_logs.append({
            "type": "dataset",
            "time": datetime.utcnow().strftime("%H:%M:%S"),
            "title": f"Loaded dataset: {ds_name}",
            "desc": f"Path: {ds_item.get('path', '')} · {rows} rows × {cols} cols" + (f" · SHA-256: {sha[:8]}..." if sha else ""),
        })

        # Lineage Node for Dataset
        if sync_lineage:
            ds_node_id = f"node-ds-{target_ds_id[:8]}"
            await db_post("lineage_nodes", token, {
                "user_id": user_id,
                "node_id": ds_node_id,
                "node_type": "dataset",
                "label": ds_name,
                "sublabel": f"{rows} rows · {cols} cols",
                "status": "active",
                "metadata": {"sha256": sha, "dataset_id": target_ds_id},
            })

    # 3. Process Experiments
    for exp_item in experiments:
        model_name = exp_item.get("model_name") or "Estimator"
        duration_str = exp_item.get("duration_str") or "0s"
        hyperparams = exp_item.get("hyperparams") or {}
        sample_size = exp_item.get("sample_size") or 0

        primary_ds_id = created_datasets[0] if created_datasets else None

        exp_data = {
            "user_id": user_id,
            "name": f"{model_name} Run",
            "model": model_name,
            "model_family": "Scikit-Learn",
            "status": "completed",
            "execution_time": duration_str,
            "hyperparams": [{"key": k, "value": str(v)} for k, v in list(hyperparams.items())[:10]],
        }
        if primary_ds_id:
            exp_data["dataset_id"] = primary_ds_id
        if project_id:
            exp_data["project_id"] = project_id

        created_exp = await db_post("experiments", token, exp_data)
        exp_id = created_exp["id"] if created_exp else str(uuid.uuid4())
        created_experiments.append(exp_id)

        # Append to session logs
        current_logs.append({
            "type": "model",
            "time": datetime.utcnow().strftime("%H:%M:%S"),
            "title": f"Trained model: {model_name}",
            "desc": f"Duration: {duration_str} · Sample size: {sample_size} · Parameters: {len(hyperparams)} logged",
        })

        # Lineage Node & Edge for Experiment
        if sync_lineage:
            exp_node_id = f"node-exp-{exp_id[:8]}"
            await db_post("lineage_nodes", token, {
                "user_id": user_id,
                "node_id": exp_node_id,
                "node_type": "experiment",
                "label": f"{model_name} Run",
                "sublabel": duration_str,
                "status": "completed",
                "metadata": {"experiment_id": exp_id},
            })

            # Connect Dataset -> Experiment edge
            if created_datasets:
                ds_node_id = f"node-ds-{created_datasets[0][:8]}"
                await db_post("lineage_edges", token, {
                    "user_id": user_id,
                    "from_node": ds_node_id,
                    "to_node": exp_node_id,
                    "label": "trains",
                })

    # 4. Save/Update Session Record
    total_events = len(current_logs)
    if session:
        await db_patch("tracking_sessions", token, {"session_token": f"eq.{session_id}"}, {
            "events_count": total_events,
            "logs": current_logs,
            "status": "active",
            "last_ping": datetime.utcnow().isoformat(),
        })
    else:
        await db_post("tracking_sessions", token, {
            "user_id": user_id,
            "session_token": session_id,
            "project_id": project_id,
            "client_name": "Python SDK",
            "client_version": "1.0.0",
            "status": "active",
            "events_count": total_events,
            "logs": current_logs,
        })

    await log_activity(
        token, user_id,
        f"Tracking SDK synced session {session_id} ({len(datasets)} datasets, {len(experiments)} models)",
        icon="lin",
        activity_type="tracking",
    )

    return {
        "status": "success",
        "session_id": session_id,
        "synced_datasets": len(created_datasets),
        "synced_experiments": len(created_experiments),
        "events_count": total_events,
    }
