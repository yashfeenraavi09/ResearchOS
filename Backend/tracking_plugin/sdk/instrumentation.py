import functools
import time
from pathlib import Path
from typing import Dict, Any, Optional
from tracking_plugin.sdk.buffer import buffer
from tracking_plugin.sdk.fingerprint import compute_sha256

# Storage for original unpatched functions
_ORIGINAL_FUNCS: Dict[str, Any] = {}
_IS_INSTRUMENTED = False

def _wrap_pandas_loader(orig_fn, fmt_name: str):
    @functools.wraps(orig_fn)
    def wrapper(*args, **kwargs):
        res = orig_fn(*args, **kwargs)

        try:
            # First positional arg is usually the file path or buffer
            file_arg = args[0] if len(args) > 0 else kwargs.get("filepath_or_buffer")
            if isinstance(file_arg, (str, Path)):
                file_path = Path(file_arg)
                sha = compute_sha256(file_path) if file_path.exists() else ""
                file_size = file_path.stat().st_size if file_path.exists() else 0

                rows = len(res) if hasattr(res, "__len__") else 0
                cols = len(res.columns) if hasattr(res, "columns") else 0
                col_names = [str(c) for c in res.columns] if hasattr(res, "columns") else []

                buffer.add_dataset_event({
                    "name": file_path.name,
                    "path": str(file_path.resolve()),
                    "format": fmt_name,
                    "sha256": sha,
                    "rows_count": rows,
                    "columns_count": cols,
                    "columns": col_names[:50],
                    "size_bytes": file_size,
                })
        except Exception as e:
            # Instrumentation must NEVER break user execution
            pass

        return res
    return wrapper

def _wrap_sklearn_fit(orig_fit):
    @functools.wraps(orig_fit)
    def wrapper(self, *args, **kwargs):
        start_time = time.perf_counter()
        res = orig_fit(self, *args, **kwargs)
        duration = round(time.perf_counter() - start_time, 3)

        try:
            model_name = self.__class__.__name__
            module_name = self.__class__.__module__

            # Extract hyperparams safely
            hyperparams = {}
            if hasattr(self, "get_params"):
                try:
                    raw_params = self.get_params(deep=False)
                    for k, v in raw_params.items():
                        if isinstance(v, (int, float, str, bool)) or v is None:
                            hyperparams[k] = v
                        else:
                            hyperparams[k] = str(v)
                except Exception:
                    pass

            # Extract sample sizes from first arg (X)
            sample_size = None
            feature_count = None
            if len(args) > 0:
                X = args[0]
                if hasattr(X, "shape"):
                    sample_size = int(X.shape[0])
                    feature_count = int(X.shape[1]) if len(X.shape) > 1 else 1
                elif hasattr(X, "__len__"):
                    sample_size = len(X)

            buffer.add_experiment_event({
                "model_name": model_name,
                "module": module_name,
                "hyperparams": hyperparams,
                "sample_size": sample_size,
                "feature_count": feature_count,
                "duration_seconds": duration,
                "duration_str": f"{duration}s",
            })
        except Exception:
            # Passive tracking guarantee
            pass

        return res
    return wrapper

def patch_all():
    global _IS_INSTRUMENTED
    if _IS_INSTRUMENTED:
        return

    # 1. Instrument Pandas
    try:
        import pandas as pd
        if "pandas.read_csv" not in _ORIGINAL_FUNCS:
            _ORIGINAL_FUNCS["pandas.read_csv"] = pd.read_csv
            pd.read_csv = _wrap_pandas_loader(pd.read_csv, "csv")

        if hasattr(pd, "read_parquet") and "pandas.read_parquet" not in _ORIGINAL_FUNCS:
            _ORIGINAL_FUNCS["pandas.read_parquet"] = pd.read_parquet
            pd.read_parquet = _wrap_pandas_loader(pd.read_parquet, "parquet")

        if hasattr(pd, "read_excel") and "pandas.read_excel" not in _ORIGINAL_FUNCS:
            _ORIGINAL_FUNCS["pandas.read_excel"] = pd.read_excel
            pd.read_excel = _wrap_pandas_loader(pd.read_excel, "excel")
    except ImportError:
        pass

    # 2. Instrument Scikit-learn via Estimator Registry
    try:
        from sklearn.utils import all_estimators
        for name, cls in all_estimators():
            if hasattr(cls, "fit") and callable(getattr(cls, "fit")):
                key = f"sklearn.{name}.fit"
                if key not in _ORIGINAL_FUNCS:
                    _ORIGINAL_FUNCS[key] = (cls, getattr(cls, "fit"))
                    setattr(cls, "fit", _wrap_sklearn_fit(getattr(cls, "fit")))
    except ImportError:
        pass

    _IS_INSTRUMENTED = True

def unpatch_all():
    global _IS_INSTRUMENTED
    if not _IS_INSTRUMENTED:
        return

    try:
        import pandas as pd
        if "pandas.read_csv" in _ORIGINAL_FUNCS:
            pd.read_csv = _ORIGINAL_FUNCS.pop("pandas.read_csv")
        if "pandas.read_parquet" in _ORIGINAL_FUNCS:
            pd.read_parquet = _ORIGINAL_FUNCS.pop("pandas.read_parquet")
        if "pandas.read_excel" in _ORIGINAL_FUNCS:
            pd.read_excel = _ORIGINAL_FUNCS.pop("pandas.read_excel")
    except ImportError:
        pass

    # Restore scikit-learn estimators
    for key, val in list(_ORIGINAL_FUNCS.items()):
        if key.startswith("sklearn.") and isinstance(val, tuple):
            cls, orig_fit = val
            setattr(cls, "fit", orig_fit)
            _ORIGINAL_FUNCS.pop(key, None)

    _IS_INSTRUMENTED = False
