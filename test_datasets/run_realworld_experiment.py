"""
ResearchOS Real-World Experiment Simulation
===========================================
This script simulates a real-world Machine Learning researcher workflow:
1. Initializes the ResearchOS Tracking SDK
2. Reads dataset with standard Pandas (non-invasively fingerprinted)
3. Trains multiple Scikit-Learn models (hyperparameters & timing tracked)
4. Evaluates performance metrics (Accuracy, F1, Precision, Recall)
5. Synchronizes the session to the ResearchOS Live Dashboard!

HOW TO RUN:
1. Make sure your ResearchOS backend is running (default: http://localhost:8000)
2. Log in to the web app -> Go to 'Settings' -> Copy your 'SDK Token'
3. Set your token below or set the environment variable RESEARCHOS_TOKEN
4. Run: python test_datasets/run_realworld_experiment.py
"""

import os
import sys
from pathlib import Path

# Add Backend directory to path so SDK can be imported
workspace_root = Path(__file__).resolve().parent.parent
backend_dir = workspace_root / "Backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

# Import ResearchOS SDK
try:
    from Backend.tracking_plugin import sdk
except ImportError:
    from tracking_plugin import sdk

# Configuration
API_URL = os.getenv("RESEARCHOS_API_URL", "http://localhost:8000")
TOKEN = os.getenv("RESEARCHOS_TOKEN", "") # Paste your JWT or SDK token here if not set in env
PROJECT_ID = "Cancer-Biomarkers-Study"

def run_experiment():
    print("=" * 70)
    print("  RESEARCHOS: REAL-WORLD RESEARCHER EXPERIMENT TEST RUN")
    print("=" * 70)
    print(f" Target Backend: {API_URL}")
    print(f" Project ID:     {PROJECT_ID}")
    
    # Check token
    active_token = TOKEN
    if not active_token:
        print("\n[NOTE] No SDK Token provided in code or environment.")
        print("  You can test tracking buffer offline, or enter your token from")
        print("  ResearchOS Dashboard -> Settings -> 'Copy SDK Token'.")
        token_input = input("  Paste SDK Token (or press ENTER to run offline test): ").strip()
        if token_input:
            active_token = token_input

    # Step 1: Initialize passive tracking
    print("\n[1/5] Initializing ResearchOS Tracking SDK...")
    session_id = sdk.start(
        project_id=PROJECT_ID,
        api_url=API_URL,
        token=active_token,
    )
    print(f"  -> Tracking session active: {session_id}")

    # Step 2: Load dataset using standard pandas (auto-intercepted!)
    csv_path = Path(__file__).resolve().parent / "cancer_biomarkers_v1_baseline.csv"
    print(f"\n[2/5] Loading data via standard pandas.read_csv('{csv_path.name}')...")
    df = pd.read_csv(csv_path)
    print(f"  -> Loaded {len(df)} samples, {len(df.columns)} columns.")

    # Prepare features and target
    feature_cols = ["age", "gene_tp53", "gene_brca1", "gene_egfr", "protein_her2", "tumor_size_cm"]
    X = df[feature_cols]
    y = df["outcome"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    # Step 3: Train Model A - Random Forest (auto-intercepted!)
    print("\n[3/5] Training Model A: RandomForestClassifier...")
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_f1 = f1_score(y_test, rf_preds, zero_division=0)
    print(f"  -> Random Forest Accuracy: {rf_acc:.3f} | F1: {rf_f1:.3f}")

    # Step 4: Train Model B - Logistic Regression (auto-intercepted!)
    print("\n[4/5] Training Model B: LogisticRegression...")
    lr_model = LogisticRegression(C=0.8, max_iter=200)
    lr_model.fit(X_train, y_train)
    lr_preds = lr_model.predict(X_test)
    lr_acc = accuracy_score(y_test, lr_preds)
    lr_f1 = f1_score(y_test, lr_preds, zero_division=0)
    print(f"  -> Logistic Regression Accuracy: {lr_acc:.3f} | F1: {lr_f1:.3f}")

    # Step 5: Stop tracking session and prompt review checklist
    print("\n[5/5] Finalizing session...")
    summary = sdk.stop(auto_prompt=True, auto_sync=False)

    # Sync to backend if token available
    if active_token:
        print("\n--> Transmitting telemetry to ResearchOS Backend...")
        try:
            sync_res = sdk.sync(token=active_token)
            print(f"--> [SUCCESS] Synced session to Dashboard! Response: {sync_res}")
            print("\nNEXT STEP: Check your ResearchOS Dashboard:")
            print("  - 'Tracking SDK' page to approve or inspect the captured session.")
            print("  - 'Experiments' page to see your model metrics & parameters.")
            print("  - 'Lineage' page to view the Dataset -> Experiment -> Model graph!")
        except Exception as e:
            print(f"--> [WARNING] Sync failed: {e}")
            print("    Check if the backend server is running and your token is valid.")
    else:
        print("\n[OK] Offline run complete! Captured in memory buffer:")
        print(f"  - Datasets tracked:    {len(summary['datasets_touched'])}")
        print(f"  - Experiments tracked: {len(summary['experiments_run'])}")
        print("  - To sync live, rerun with your SDK token from the dashboard.")

if __name__ == "__main__":
    run_experiment()
