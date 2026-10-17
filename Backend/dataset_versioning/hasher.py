import hashlib
from pathlib import Path
from typing import Union

def compute_file_sha256(file_input: Union[str, Path, bytes]) -> str:
    """
    Computes a deterministic SHA-256 fingerprint for a dataset file.
    Works for file paths and raw byte buffers.
    """
    hasher = hashlib.sha256()

    if isinstance(file_input, bytes):
        hasher.update(file_input)
        return hasher.hexdigest()

    file_path = Path(file_input)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)

    return hasher.hexdigest()
