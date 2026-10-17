"""
ResearchOS Python Tracking SDK
Non-invasive experiment, dataset, and pipeline tracking for Machine Learning research.
"""
import uuid
import os
from contextlib import contextmanager
from typing import Optional, Dict, Any

from tracking_plugin.sdk.buffer import buffer
from tracking_plugin.sdk.instrumentation import patch_all, unpatch_all
from tracking_plugin.sdk.consent import ConsentConfig, format_session_checklist, sync_batch_to_backend

_CURRENT_SESSION_ID = None
_API_URL = os.getenv("RESEARCHOS_API_URL", "http://localhost:8000")
_AUTH_TOKEN = os.getenv("RESEARCHOS_TOKEN", "")

def start(
    project_id: Optional[str] = None,
    session_id: Optional[str] = None,
    api_url: Optional[str] = None,
    token: Optional[str] = None,
):
    """
    Activates passive research tracking for the current Python session.
    Instruments pandas dataset loading and scikit-learn model training.
    """
    global _CURRENT_SESSION_ID, _API_URL, _AUTH_TOKEN

    if api_url:
        _API_URL = api_url
    if token:
        _AUTH_TOKEN = token

    _CURRENT_SESSION_ID = session_id or f"ros-sdk-{uuid.uuid4().hex[:8]}"
    buffer.start_session(_CURRENT_SESSION_ID, project_id or "")
    patch_all()

    print(f"[ResearchOS SDK] Tracking activated. Session: {_CURRENT_SESSION_ID}")
    return _CURRENT_SESSION_ID

def stop(
    auto_prompt: bool = True,
    auto_sync: bool = False,
    consent: Optional[ConsentConfig] = None,
) -> Dict[str, Any]:
    """
    Deactivates research tracking, restores original functions, and presents
    the natural breakpoint session checklist.
    """
    unpatch_all()
    buffer.stop_session()
    summary = buffer.get_summary()

    if auto_prompt:
        checklist = format_session_checklist(summary)
        print("\n" + checklist + "\n")

    if auto_sync and _AUTH_TOKEN:
        res = sync_batch_to_backend(_API_URL, _AUTH_TOKEN, summary, consent)
        print(f"[ResearchOS SDK] Session synced: {res.get('status')}")
        return res

    return summary

def sync(
    token: Optional[str] = None,
    consent: Optional[ConsentConfig] = None,
) -> Dict[str, Any]:
    """
    Explicitly transmits captured session events to the ResearchOS backend.
    """
    t = token or _AUTH_TOKEN
    summary = buffer.get_summary()
    return sync_batch_to_backend(_API_URL, t, summary, consent)

def status() -> Dict[str, Any]:
    """
    Returns current tracking buffer status.
    """
    return buffer.get_summary()

@contextmanager
def track(project_id: Optional[str] = None, auto_sync: bool = False, token: Optional[str] = None):
    """
    Context manager for scoped research tracking:
    with researchos.track():
        df = pd.read_csv('data.csv')
        model.fit(X, y)
    """
    sid = start(project_id=project_id, token=token)
    try:
        yield sid
    finally:
        stop(auto_sync=auto_sync)
