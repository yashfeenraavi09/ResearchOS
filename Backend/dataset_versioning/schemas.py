from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DatasetUploadMeta(BaseModel):
    name: str
    description: Optional[str] = ""
    project_id: Optional[str] = None
    type: Optional[str] = "Tabular"
    version_label: Optional[str] = "V1"
    note: Optional[str] = "Initial upload"

class DatasetVersionCreate(BaseModel):
    version: str
    label: Optional[str] = None
    note: Optional[str] = None
    rows_count: Optional[int] = 0
    columns_count: Optional[int] = 0
    size_str: Optional[str] = "0 MB"
    missing_values: Optional[float] = 0.0
    duplicates: Optional[float] = 0.0
    quality_score: Optional[int] = 100
    storage_path: Optional[str] = None

class VersionComparisonResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    base_version: str
    head_version: str
    row_diff: int
    col_diff: int
    quality_diff: int
    missing_diff: float
    dup_diff: float
    added_columns: List[str]
    removed_columns: List[str]
    type_changes: List[Dict[str, Any]]
    pca_drift: List[Dict[str, Any]]
    drift_metadata: Optional[Dict[str, Any]] = None
