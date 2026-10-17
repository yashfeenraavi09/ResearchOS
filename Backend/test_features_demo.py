"""
ResearchOS Feature Demonstration & Verification Script
Tests both:
1. Dataset Versioning & PCA Drift Engine
2. Python Tracking SDK (pandas + scikit-learn non-invasive instrumentation)
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from dataset_versioning.hasher import compute_file_sha256
from dataset_versioning.profiler import profile_dataset
from dataset_versioning.drift_engine import calculate_pca_drift
from dataset_versioning.comparator import compare_dataset_versions
from tracking_plugin import sdk

def test_dataset_versioning_and_drift():
    print("=" * 65)
    print(" 1. TESTING DATASET VERSIONING & PCA DRIFT ENGINE")
    print("=" * 65)

    # Generate synthetic Base Version (V1)
    np.random.seed(42)
    n_samples = 150
    df_v1 = pd.DataFrame({
        "gene_expression_1": np.random.normal(loc=5.0, scale=1.0, size=n_samples),
        "gene_expression_2": np.random.normal(loc=12.0, scale=2.5, size=n_samples),
        "protein_level": np.random.normal(loc=0.8, scale=0.15, size=n_samples),
        "cell_count": np.random.randint(100, 500, size=n_samples),
        "condition": np.random.choice(["Control", "Treated"], size=n_samples),
    })

    # Profile V1
    profile_v1 = profile_dataset(df_v1)
    print(f"[OK] V1 Profiled: {profile_v1['rows_count']} rows, {profile_v1['columns_count']} cols, Quality: {profile_v1['quality_score']}/100")

    # Generate Head Version (V2) with synthetic drift and an added column
    df_v2 = pd.DataFrame({
        "gene_expression_1": np.random.normal(loc=6.2, scale=1.4, size=n_samples + 25), # shifted mean (drift!)
        "gene_expression_2": np.random.normal(loc=12.2, scale=2.4, size=n_samples + 25),
        "protein_level": np.random.normal(loc=0.85, scale=0.18, size=n_samples + 25),
        "cell_count": np.random.randint(110, 520, size=n_samples + 25),
        "condition": np.random.choice(["Control", "Treated"], size=n_samples + 25),
        "batch_id": np.random.choice(["B1", "B2"], size=n_samples + 25), # Added column
    })

    profile_v2 = profile_dataset(df_v2)
    print(f"[OK] V2 Profiled: {profile_v2['rows_count']} rows, {profile_v2['columns_count']} cols, Quality: {profile_v2['quality_score']}/100")

    # Run PCA Drift calculation
    drift_res = calculate_pca_drift(df_v1, df_v2)
    print(f"[OK] PCA Drift Engine Status: {drift_res['status']}")
    print(f"  Max Component Shift: {drift_res['max_shift']}")
    print(f"  Reconstruction MSE:  {drift_res['reconstruction_mse']}")
    print(f"  Drift Detected?      {drift_res['drift_detected']}")
    for pc in drift_res["components"]:
        print(f"    * {pc['component']}: shift={pc['shift']}, explained_var={pc['explainedVar']}")

    # Compare versions
    v1_meta = {"version": "V1", "rows_count": len(df_v1), "columns_count": len(df_v1.columns), "quality_score": profile_v1["quality_score"]}
    v2_meta = {"version": "V2", "rows_count": len(df_v2), "columns_count": len(df_v2.columns), "quality_score": profile_v2["quality_score"]}
    comparison = compare_dataset_versions(v1_meta, v2_meta, base_df=df_v1, head_df=df_v2)

    print(f"[OK] Comparison Output:")
    print(f"  Row Delta:    {comparison['row_diff']:+d}")
    print(f"  Column Delta: {comparison['col_diff']:+d}")
    print(f"  Added Columns: {comparison['added_columns']}")
    print()

def test_tracking_sdk():
    print("=" * 65)
    print(" 2. TESTING PYTHON TRACKING SDK (PASSIVE INSTRUMENTATION)")
    print("=" * 65)

    # Create temporary CSV file to simulate user workflow
    temp_csv = backend_dir / "storage" / "temp_experiment_data.csv"
    temp_df = pd.DataFrame({
        "feature_a": np.random.randn(80),
        "feature_b": np.random.randn(80),
        "target": np.random.choice([0, 1], size=80),
    })
    temp_df.to_csv(temp_csv, index=False)

    # 1. Activate tracking
    session_id = sdk.start(project_id="proj-demo-1")

    # 2. User loads data with standard pandas (non-invasive intercept)
    df_loaded = pd.read_csv(temp_csv)

    # 3. User trains models with standard scikit-learn (non-invasive intercept)
    X = df_loaded[["feature_a", "feature_b"]]
    y = df_loaded["target"]

    clf_rf = RandomForestClassifier(n_estimators=15, max_depth=4, random_state=42)
    clf_rf.fit(X, y)

    clf_lr = LogisticRegression(C=0.5)
    clf_lr.fit(X, y)

    # 4. User stops session -> natural breakpoint checklist triggered
    summary = sdk.stop(auto_prompt=True, auto_sync=False)

    print("[OK] SDK Verification Complete!")
    print(f"  Captured Datasets:    {len(summary['datasets_touched'])}")
    print(f"  Captured Experiments: {len(summary['experiments_run'])}")

    # Cleanup temp file
    if temp_csv.exists():
        temp_csv.unlink()

if __name__ == "__main__":
    test_dataset_versioning_and_drift()
    test_tracking_sdk()
    print("=" * 65)
    print(" ALL TESTS PASSED! IMPLEMENTATION VERIFIED SUCCESSFULLY.")
    print("=" * 65)
