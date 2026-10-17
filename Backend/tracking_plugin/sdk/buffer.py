import threading
from typing import Dict, Any, List
from datetime import datetime

class SessionBuffer:
    """
    Thread-safe in-memory buffer storing captured research events during an active tracking session.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self.session_id: str = ""
        self.project_id: str = ""
        self.started_at: Optional[str] = None
        self.is_active: bool = False
        self.datasets: List[Dict[str, Any]] = []
        self.experiments: List[Dict[str, Any]] = []
        self.preprocessing: List[Dict[str, Any]] = []

    def start_session(self, session_id: str, project_id: str = ""):
        with self._lock:
            self.session_id = session_id
            self.project_id = project_id
            self.started_at = datetime.utcnow().isoformat()
            self.is_active = True
            self.datasets.clear()
            self.experiments.clear()
            self.preprocessing.clear()

    def stop_session(self):
        with self._lock:
            self.is_active = False

    def add_dataset_event(self, event: Dict[str, Any]):
        with self._lock:
            if not self.is_active:
                return
            # Deduplicate by SHA-256 fingerprint if identical file loaded multiple times
            sha = event.get("sha256")
            if sha and any(d.get("sha256") == sha for d in self.datasets):
                return
            event["timestamp"] = datetime.utcnow().isoformat()
            self.datasets.append(event)

    def add_experiment_event(self, event: Dict[str, Any]):
        with self._lock:
            if not self.is_active:
                return
            event["timestamp"] = datetime.utcnow().isoformat()
            self.experiments.append(event)

    def add_preprocessing_event(self, event: Dict[str, Any]):
        with self._lock:
            if not self.is_active:
                return
            event["timestamp"] = datetime.utcnow().isoformat()
            self.preprocessing.append(event)

    def get_summary(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "session_id": self.session_id,
                "project_id": self.project_id,
                "started_at": self.started_at,
                "is_active": self.is_active,
                "datasets_touched": list(self.datasets),
                "experiments_run": list(self.experiments),
                "preprocessing_steps": list(self.preprocessing),
            }

# Global singleton buffer
buffer = SessionBuffer()
