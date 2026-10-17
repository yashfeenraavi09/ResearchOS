from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TrackingConsent(BaseModel):
    upload_dataset_file: bool = False
    log_metadata: bool = True
    sync_lineage: bool = True
    log_version_hashes: bool = True

class SyncBatchPayload(BaseModel):
    session_id: str
    project_id: Optional[str] = None
    started_at: Optional[str] = None
    consent: Optional[TrackingConsent] = None
    datasets: Optional[List[Dict[str, Any]]] = []
    experiments: Optional[List[Dict[str, Any]]] = []
    preprocessing: Optional[List[Dict[str, Any]]] = []

class TrackingSessionLog(BaseModel):
    type: str # dataset, experiment, model
    time: str
    title: str
    desc: str
    meta: Optional[Dict[str, Any]] = None
