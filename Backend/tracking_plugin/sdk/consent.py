import httpx
import os
from typing import Dict, Any, Optional

class ConsentConfig:
    def __init__(
        self,
        upload_dataset_file: bool = False,
        log_metadata: bool = True,
        sync_lineage: bool = True,
        log_version_hashes: bool = True,
    ):
        self.upload_dataset_file = upload_dataset_file
        self.log_metadata = log_metadata
        self.sync_lineage = sync_lineage
        self.log_version_hashes = log_version_hashes

    def to_dict(self) -> Dict[str, bool]:
        return {
            "upload_dataset_file": self.upload_dataset_file,
            "log_metadata": self.log_metadata,
            "sync_lineage": self.sync_lineage,
            "log_version_hashes": self.log_version_hashes,
        }

def format_session_checklist(summary: Dict[str, Any]) -> str:
    """
    Renders the natural breakpoint session checklist for terminal / console display.
    """
    ds_count = len(summary.get("datasets_touched", []))
    exp_count = len(summary.get("experiments_run", []))

    lines = [
        "================================================================",
        "         ResearchOS Tracking SDK - Session Checklist           ",
        "================================================================",
        f" Session ID:  {summary.get('session_id')}",
        f" Datasets:    {ds_count} captured",
        f" Experiments: {exp_count} runs recorded",
        "----------------------------------------------------------------",
    ]

    for d in summary.get("datasets_touched", []):
        lines.append(f"  * [Dataset] {d.get('name')} ({d.get('rows_count')} rows x {d.get('columns_count')} cols)")

    for e in summary.get("experiments_run", []):
        lines.append(f"  * [Model]   {e.get('model_name')} (trained in {e.get('duration_str')}, N={e.get('sample_size')})")

    lines.extend([
        "----------------------------------------------------------------",
        " Privacy & Consent:",
        "  [X] Log experiment metadata & parameters",
        "  [X] Sync pipeline lineage graph",
        "  [X] Log SHA-256 fingerprint hashes",
        "  [ ] Upload raw dataset files (requires explicit consent)",
        "================================================================",
    ])
    return "\n".join(lines)

def sync_batch_to_backend(
    api_url: str,
    token: str,
    summary: Dict[str, Any],
    consent: Optional[ConsentConfig] = None,
) -> Dict[str, Any]:
    """
    Transmits the confirmed tracking batch to the ResearchOS FastAPI backend.
    """
    if consent is None:
        consent = ConsentConfig()

    payload = {
        "session_id": summary.get("session_id"),
        "project_id": summary.get("project_id"),
        "started_at": summary.get("started_at"),
        "consent": consent.to_dict(),
        "datasets": summary.get("datasets_touched", []),
        "experiments": summary.get("experiments_run", []),
        "preprocessing": summary.get("preprocessing_steps", []),
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(f"{api_url.rstrip('/')}/api/tracking/sync", json=payload, headers=headers)
            if resp.status_code in (200, 201):
                return resp.json()
            else:
                return {
                    "status": "error",
                    "code": resp.status_code,
                    "message": resp.text,
                }
    except Exception as e:
        return {"status": "error", "message": str(e)}
