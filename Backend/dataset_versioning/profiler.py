import io
from pathlib import Path
from typing import Dict, Any, Union, Optional
import pandas as pd
import numpy as np

def load_dataframe(file_input: Union[str, Path, bytes], original_filename: str = "") -> pd.DataFrame:
    """
    Loads a dataset into a pandas DataFrame from bytes or file path.
    Supports CSV, TSV, Parquet, and JSON.
    """
    ext = Path(original_filename).suffix.lower() if original_filename else ".csv"

    if isinstance(file_input, bytes):
        buffer = io.BytesIO(file_input)
        if ext in (".parquet", ".pq"):
            return pd.read_parquet(buffer)
        elif ext in (".json", ".jsonl"):
            return pd.read_json(buffer)
        elif ext in (".tsv", ".tab"):
            return pd.read_csv(buffer, sep="\t")
        else:
            # Default to CSV
            try:
                return pd.read_csv(buffer)
            except Exception:
                buffer.seek(0)
                return pd.read_csv(buffer, sep=None, engine="python")
    else:
        path = Path(file_input)
        ext = path.suffix.lower()
        if ext in (".parquet", ".pq"):
            return pd.read_parquet(path)
        elif ext in (".json", ".jsonl"):
            return pd.read_json(path)
        elif ext in (".tsv", ".tab"):
            return pd.read_csv(path, sep="\t")
        else:
            try:
                return pd.read_csv(path)
            except Exception:
                return pd.read_csv(path, sep=None, engine="python")

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
