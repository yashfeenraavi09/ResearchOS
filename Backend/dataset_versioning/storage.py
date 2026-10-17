import io
import os
from pathlib import Path
from typing import Optional, Tuple
import httpx
from core.config import (
    DATASETS_STORAGE_DIR,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
)

# ── MinIO Configuration ───────────────────────────────────────────────────────
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "researchos-datasets")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"

# ── Supabase Storage Configuration ────────────────────────────────────────────
SUPABASE_STORAGE_BUCKET = "datasets"

_minio_client = None

def get_minio_client():
    """
    Returns an active MinIO client if MinIO is running on localhost:9000.
    """
    global _minio_client
    if _minio_client is not None:
        return _minio_client

    try:
        from minio import Minio
        client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=MINIO_SECURE,
        )
        if not client.bucket_exists(MINIO_BUCKET):
            client.make_bucket(MINIO_BUCKET)
        _minio_client = client
        return _minio_client
    except Exception:
        return None

def upload_to_supabase_storage(object_path: str, file_bytes: bytes, user_token: Optional[str] = None) -> bool:
    """
    Uploads dataset bytes to the Supabase Cloud Storage 'datasets' bucket.
    """
    auth_header = f"Bearer {user_token or SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY}"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": auth_header,
        "Content-Type": "application/octet-stream",
        "x-upsert": "true",
    }
    url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_STORAGE_BUCKET}/{object_path}"

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, headers=headers, content=file_bytes)
            return resp.status_code in (200, 201)
    except Exception as e:
        print(f"[Storage] Supabase storage upload failed: {e}")
        return False

def download_from_supabase_storage(object_path: str, user_token: Optional[str] = None) -> Optional[bytes]:
    """
    Downloads dataset bytes from the Supabase Cloud Storage 'datasets' bucket.
    """
    auth_header = f"Bearer {user_token or SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY}"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": auth_header,
    }
    url = f"{SUPABASE_URL}/storage/v1/object/authenticated/{SUPABASE_STORAGE_BUCKET}/{object_path}"

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.content
    except Exception as e:
        print(f"[Storage] Supabase storage download failed: {e}")
    return None

def save_dataset_file(
    dataset_id: str,
    version_label: str,
    file_bytes: bytes,
    original_filename: str,
    user_token: Optional[str] = None,
) -> Tuple[Path, str]:
    """
    Multi-tier storage strategy:
    1. Local Disk Cache: Saves in Backend/storage/datasets/ for zero-latency pandas operations.
    2. Primary Remote Storage: Uploads to Local MinIO S3 bucket if running.
    3. Fallback Remote Storage: If MinIO is offline, uploads to Supabase Cloud Storage ('datasets' bucket).
    """
    ext = Path(original_filename).suffix.lower() or ".csv"
    sanitized_version = version_label.replace(".", "_").replace(" ", "_")
    filename = f"{dataset_id}_{sanitized_version}{ext}"
    object_key = f"{dataset_id}/{sanitized_version}{ext}"

    # 1. Local Cache
    local_path = DATASETS_STORAGE_DIR / filename
    with open(local_path, "wb") as f:
        f.write(file_bytes)

    # 2. Try Primary: Local MinIO S3
    minio = get_minio_client()
    if minio:
        try:
            data_stream = io.BytesIO(file_bytes)
            minio.put_object(
                bucket_name=MINIO_BUCKET,
                object_name=object_key,
                data=data_stream,
                length=len(file_bytes),
                content_type="application/octet-stream",
            )
            storage_identifier = f"minio://{MINIO_BUCKET}/{object_key}"
            print(f"[Storage] Dataset stored in Local MinIO: {storage_identifier}")
            return local_path, storage_identifier
        except Exception as e:
            print(f"[Storage] MinIO upload error, falling back to Supabase: {e}")

    # 3. Try Fallback: Supabase Cloud Storage Bucket
    if upload_to_supabase_storage(object_key, file_bytes, user_token):
        storage_identifier = f"supabase://{SUPABASE_STORAGE_BUCKET}/{object_key}"
        print(f"[Storage] Dataset stored in Supabase Cloud Storage: {storage_identifier}")
        return local_path, storage_identifier

    # 4. Local disk fallback
    rel_path = f"storage/datasets/{filename}"
    print(f"[Storage] Stored on local disk: {rel_path}")
    return local_path, rel_path

def get_dataset_file_path(storage_path_or_filename: str, user_token: Optional[str] = None) -> Optional[Path]:
    """
    Resolves the local path for a dataset file.
    If only in MinIO or Supabase Cloud Storage, downloads to local cache.
    """
    if not storage_path_or_filename:
        return None

    # Check local cache directly first
    p = Path(storage_path_or_filename)
    if p.is_absolute() and p.exists():
        return p

    target = DATASETS_STORAGE_DIR / p.name
    if target.exists():
        return target

    # Handle MinIO URI: minio://researchos-datasets/...
    if storage_path_or_filename.startswith("minio://"):
        parts = storage_path_or_filename.replace("minio://", "").split("/", 1)
        if len(parts) == 2:
            bucket, object_name = parts
            cached_filename = object_name.replace("/", "_")
            cached_path = DATASETS_STORAGE_DIR / cached_filename
            if cached_path.exists():
                return cached_path

            minio = get_minio_client()
            if minio:
                try:
                    minio.fget_object(bucket, object_name, str(cached_path))
                    return cached_path
                except Exception as e:
                    print(f"[Storage] Could not fetch from MinIO: {e}")

    # Handle Supabase Storage URI: supabase://datasets/...
    if storage_path_or_filename.startswith("supabase://"):
        object_key = storage_path_or_filename.replace(f"supabase://{SUPABASE_STORAGE_BUCKET}/", "")
        cached_filename = object_key.replace("/", "_")
        cached_path = DATASETS_STORAGE_DIR / cached_filename
        if cached_path.exists():
            return cached_path

        data = download_from_supabase_storage(object_key, user_token)
        if data:
            with open(cached_path, "wb") as f:
                f.write(data)
            return cached_path

    return None
