import hashlib
from pathlib import Path
from typing import Union

def compute_sha256(file_input: Union[str, Path, bytes]) -> str:
    """
    Computes a deterministic SHA-256 fingerprint matching the ResearchOS backend.
    """
    hasher = hashlib.sha256()

    if isinstance(file_input, bytes):
        hasher.update(file_input)
        return hasher.hexdigest()

    path = Path(file_input)
    if not path.exists():
        return ""

    with open(path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)

    return hasher.hexdigest()
