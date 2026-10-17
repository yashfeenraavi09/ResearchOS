from typing import Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

def calculate_pca_drift(
    ref_df: pd.DataFrame,
    curr_df: pd.DataFrame,
    max_components: int = 5,
) -> Dict[str, Any]:
    """
    PCA-Based Data Drift Engine.
    Implements reference-based PCA projection, reconstruction MSE error,
    and principal component centroid shifts.
    """
    # 1. Identify common numerical columns
    ref_numeric = set(ref_df.select_dtypes(include=[np.number]).columns)
    curr_numeric = set(curr_df.select_dtypes(include=[np.number]).columns)
    common_cols = sorted(list(ref_numeric.intersection(curr_numeric)))

    if len(common_cols) < 2 or len(ref_df) < 5 or len(curr_df) < 5:
        # Fallback for datasets without sufficient numerical features
        return {
            "status": "insufficient_numerical_data",
            "message": "PCA drift analysis requires at least 2 common numerical columns and >5 rows.",
            "components": [],
            "max_shift": 0.0,
            "reconstruction_mse": 0.0,
            "drift_detected": False,
        }

    # 2. Extract and impute missing values with median
    X_ref = ref_df[common_cols].copy().fillna(ref_df[common_cols].median()).values
    X_curr = curr_df[common_cols].copy().fillna(ref_df[common_cols].median()).values

    # 3. Fit StandardScaler on reference data
    scaler = StandardScaler()
    X_ref_scaled = scaler.fit_transform(X_ref)
    X_curr_scaled = scaler.transform(X_curr)

    # 4. Fit PCA on reference data
    n_components = min(max_components, len(common_cols), len(ref_df) - 1)
    if n_components < 1:
        n_components = 1

    pca = PCA(n_components=n_components)
    Z_ref = pca.fit_transform(X_ref_scaled)
    Z_curr = pca.transform(X_curr_scaled)

    # 5. Reconstruction Error (MSE) of current data in reference PCA space
    X_curr_reconstructed = pca.inverse_transform(Z_curr)
    reconstruction_mse = float(np.mean((X_curr_scaled - X_curr_reconstructed) ** 2))

    # 6. Component-wise Centroid Shift & Explained Variance
    components = []
    shifts = []
    explained_vars = pca.explained_variance_ratio_

    for i in range(n_components):
        ref_mean = np.mean(Z_ref[:, i])
        ref_std = np.std(Z_ref[:, i]) or 1.0
        curr_mean = np.mean(Z_curr[:, i])

        # Normalized shift along component axis
        shift_val = abs(float((curr_mean - ref_mean) / ref_std))
        shifts.append(shift_val)

        components.append({
            "component": f"PC{i + 1}",
            "shift": round(shift_val, 3),
            "explainedVar": round(float(explained_vars[i]), 2),
        })

    max_shift = round(float(max(shifts)), 3) if shifts else 0.0
    drift_detected = max_shift > 0.3 or reconstruction_mse > 0.5

    return {
        "status": "success",
        "components": components,
        "max_shift": max_shift,
        "reconstruction_mse": round(reconstruction_mse, 4),
        "drift_detected": drift_detected,
        "features_analyzed": common_cols,
    }
