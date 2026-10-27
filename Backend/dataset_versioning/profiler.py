import io
import json
from pathlib import Path
from typing import Dict, Any, Union, Optional
import pandas as pd
import numpy as np

def load_dataframe(file_input: Union[str, Path, bytes], original_filename: str = "") -> pd.DataFrame:
    """
    Robust dataset loader supporting:
    - CSV, TSV, PSV, semicolon-delimited tabular files
    - Parquet (.parquet, .pq)
    - JSON / JSONL / NDJSON
    - Excel (.xlsx, .xls, .xlsm)
    - NumPy (.npy, .npz)
    - Text / NLP corpora (.txt, .log, .md)
    - Safe fallback: wraps arbitrary binary or unstructured assets into a valid DataFrame
    """
    ext = Path(original_filename).suffix.lower() if original_filename else ".csv"

    # Normalize bytes into buffer
    if isinstance(file_input, bytes):
        raw_bytes = file_input
    else:
        try:
            with open(file_input, "rb") as f:
                raw_bytes = f.read()
        except Exception:
            raw_bytes = b""

    buffer = io.BytesIO(raw_bytes)

    # 1. Parquet
    if ext in (".parquet", ".pq"):
        try:
            return pd.read_parquet(buffer)
        except Exception:
            buffer.seek(0)

    # 2. Excel Spreadsheets
    if ext in (".xlsx", ".xls", ".xlsm"):
        try:
            return pd.read_excel(buffer)
        except Exception:
            buffer.seek(0)

    # 3. JSON / JSONL / NDJSON
    if ext in (".json", ".jsonl", ".ndjson"):
        try:
            return pd.read_json(buffer)
        except Exception:
            buffer.seek(0)
            try:
                return pd.read_json(buffer, lines=True)
            except Exception:
                buffer.seek(0)
                try:
                    data = json.loads(raw_bytes.decode("utf-8", errors="replace"))
                    if isinstance(data, list):
                        return pd.DataFrame(data)
                    elif isinstance(data, dict):
                        return pd.DataFrame([data])
                except Exception:
                    buffer.seek(0)

    # 4. TSV / Tab-separated
    if ext in (".tsv", ".tab"):
        try:
            return pd.read_csv(buffer, sep="\t")
        except Exception:
            buffer.seek(0)

    # 5. NumPy Arrays
    if ext in (".npy", ".npz"):
        try:
            arr = np.load(buffer, allow_pickle=False)
            if hasattr(arr, "files"): # npz archive
                first_key = arr.files[0]
                arr = arr[first_key]
            if arr.ndim == 1:
                return pd.DataFrame({"value": arr})
            elif arr.ndim == 2:
                return pd.DataFrame(arr, columns=[f"dim_{i}" for i in range(arr.shape[1])])
        except Exception:
            buffer.seek(0)

    # 6. Text / NLP documents
    if ext in (".txt", ".text", ".log", ".md", ".corpus", ".rtf"):
        try:
            text_str = raw_bytes.decode("utf-8", errors="replace")
            lines = [l.strip() for l in text_str.splitlines() if l.strip()]
            if lines:
                return pd.DataFrame({"line": range(1, len(lines) + 1), "text": lines})
        except Exception:
            buffer.seek(0)

    # 7. Standard CSV with automatic delimiter detection
    try:
        buffer.seek(0)
        return pd.read_csv(buffer)
    except Exception:
        buffer.seek(0)
        try:
            return pd.read_csv(buffer, sep=None, engine="python")
        except Exception:
            pass

    # 8. Try reading as plain text lines
    try:
        text_str = raw_bytes.decode("utf-8", errors="replace")
        lines = [l.strip() for l in text_str.splitlines() if l.strip()]
        if lines:
            return pd.DataFrame({"line_number": range(1, len(lines) + 1), "content": lines})
    except Exception:
        pass

    # 9. Resilient fallback for binary/media files (e.g., images, zip, weights)
    # Allows the system to catalog and version ANY file without throwing a 400 or 500 error!
    return pd.DataFrame([{
        "file_name": original_filename or "asset",
        "file_extension": ext.lstrip(".").upper() or "BINARY",
        "size_bytes": len(raw_bytes),
        "status": "cataloged_and_versioned"
    }])

def format_size(bytes_len: int) -> str:
    if bytes_len < 1024:
        return f"{bytes_len} B"
    elif bytes_len < 1024 * 1024:
        return f"{bytes_len / 1024:.1f} KB"
    elif bytes_len < 1024 * 1024 * 1024:
        return f"{bytes_len / (1024 * 1024):.1f} MB"
    else:
        return f"{bytes_len / (1024 * 1024 * 1024):.2f} GB"

def profile_dataset(df: pd.DataFrame, file_size_bytes: int = 0) -> Dict[str, Any]:
    """
    Comprehensive dataset profiler using Pandas.
    Extracts row/col counts, schemas, missing values, duplicates, and quality score.
    """
    total_rows = len(df)
    total_cols = len(df.columns)

    # Missing values
    total_cells = total_rows * total_cols if total_rows > 0 and total_cols > 0 else 1
    total_nulls = int(df.isnull().sum().sum())
    missing_pct = round((total_nulls / total_cells) * 100, 2)

    # Duplicates
    dup_rows = int(df.duplicated().sum())
    dup_pct = round((dup_rows / total_rows * 100), 2) if total_rows > 0 else 0.0

    # Column Schema
    schema = []
    for col in df.columns:
        col_series = df[col]
        dtype_str = str(col_series.dtype)
        # Friendly type name
        if "int" in dtype_str:
            friendly_type = "Integer"
        elif "float" in dtype_str:
            friendly_type = "Float"
        elif "bool" in dtype_str:
            friendly_type = "Boolean"
        elif "datetime" in dtype_str:
            friendly_type = "DateTime"
        else:
            friendly_type = "String / Categorical"

        null_cnt = int(col_series.isnull().sum())
        null_col_pct = round((null_cnt / total_rows * 100), 1) if total_rows > 0 else 0.0
        unique_cnt = int(col_series.nunique(dropna=True))

        # Sample values (up to 3 non-null converted to strings)
        samples = [str(v) for v in col_series.dropna().head(3).tolist()]

        schema.append({
            "name": str(col),
            "type": friendly_type,
            "raw_type": dtype_str,
            "null_count": null_cnt,
            "null_pct": null_col_pct,
            "unique_count": unique_cnt,
            "samples": samples,
        })

    # Quality score (0-100)
    # Deductions: missing values up to 40 pts, duplicates up to 30 pts, empty columns up to 30 pts
    empty_cols = sum(1 for c in schema if c["null_pct"] >= 95.0)
    empty_col_pct = (empty_cols / total_cols * 100) if total_cols > 0 else 0.0

    deduction = (missing_pct * 0.4) + (dup_pct * 0.3) + (empty_col_pct * 0.3)
    quality_score = max(5, int(round(100 - deduction)))

    # Quality breakdown metrics
    completeness = max(0, round(100 - missing_pct, 1))
    uniqueness = max(0, round(100 - dup_pct, 1))
    validity = max(0, round(100 - empty_col_pct, 1))

    quality_breakdown = [
        {"metric": "Completeness", "score": completeness, "status": "Good" if completeness >= 85 else "Review"},
        {"metric": "Uniqueness", "score": uniqueness, "status": "Good" if uniqueness >= 90 else "Warning"},
        {"metric": "Schema Validity", "score": validity, "status": "Good" if validity >= 90 else "Warning"},
    ]

    size_str = format_size(file_size_bytes) if file_size_bytes > 0 else format_size(df.memory_usage(deep=True).sum())

    return {
        "rows_count": total_rows,
        "columns_count": total_cols,
        "size_str": size_str,
        "size_bytes": file_size_bytes or int(df.memory_usage(deep=True).sum()),
        "missing_values_count": total_nulls,
        "missing_values_pct": missing_pct,
        "duplicates_count": dup_rows,
        "duplicates_pct": dup_pct,
        "quality_score": quality_score,
        "quality_breakdown": quality_breakdown,
        "column_schema": schema,
    }
