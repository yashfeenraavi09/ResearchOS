# 🧪 ResearchOS: Real-World User Testing Guide & Dataset Suite

Welcome to the **End-to-End Testing Suite** for ResearchOS. This guide allows you to test the entire platform from the perspective of an external ML Researcher, Data Scientist, or Quality Reviewer prior to your final review.

---

## 📁 What Has Been Provided For You

All test assets are placed in the [`test_datasets/`](.) directory:

| File | Purpose | Key Test Objectives |
|---|---|---|
| [`cancer_biomarkers_v1_baseline.csv`](file:///c:/Users/YASHFEEN%20RAAVI/Downloads/ResearchOS/test_datasets/cancer_biomarkers_v1_baseline.csv) | **Clean Baseline Dataset** (60 patients, 9 features) | Tests dataset ingestion, automated Pandas profiling, SHA-256 fingerprinting, clean 98-100% quality score. |
| [`cancer_biomarkers_v2_drifted.csv`](file:///c:/Users/YASHFEEN%20RAAVI/Downloads/ResearchOS/test_datasets/cancer_biomarkers_v2_drifted.csv) | **Drifted Dataset** (70 patients, shifted distributions, +1 new column `treatment_cohort`) | Tests **PCA Drift Engine**, Principal Component shift calculation, and side-by-side version comparison (+10 rows, +1 column). |
| [`cancer_biomarkers_v3_dirty.csv`](file:///c:/Users/YASHFEEN%20RAAVI/Downloads/ResearchOS/test_datasets/cancer_biomarkers_v3_dirty.csv) | **Dirty / Corrupt Dataset** (Missing values, duplicates) | Tests data validation, missing value percentage detection, duplicate detection, and automated quality score degradation. |
| [`run_realworld_experiment.py`](file:///c:/Users/YASHFEEN%20RAAVI/Downloads/ResearchOS/test_datasets/run_realworld_experiment.py) | **Runnable Python ML Experiment** | Tests the **Python Tracking SDK**: passive `pandas.read_csv` interception, `scikit-learn` model fitting interception, metric tracking, and live backend sync. |

---

## 🚀 Pre-Flight: Starting the System

### 1. Start the Backend
Open a terminal in the root directory:
```powershell
cd Backend
# Activate the venv you created:
.\venv\Scripts\activate

# Install requirements (if not done yet):
pip install -r requirements.txt

# Start the FastAPI server:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Start the Frontend
Open a second terminal:
```powershell
cd Frontend
npm install
npm run dev
```
- Web Application: [http://localhost:8443](http://localhost:8443)

*(Note: If you are using the cloud-deployed backend/frontend, you can use those directly without starting local servers!)*

---

## 📋 Real-World User Testing Journey (7 Scenarios)

### Scenario 1: Authentication & Workspace Setup
1. Open the dashboard at [http://localhost:8443](http://localhost:8443).
2. Click **Sign Up** to create a fresh test researcher account (e.g., `researcher@biotech.io`), or log in.
3. Upon entering the **Home Dashboard**, notice the summary metrics (Total Datasets, Active Experiments, Recent Activity).
4. Navigate to **Settings**:
   - Verify user profile info.
   - Look at the **Storage Quota** card (live storage tracking).
   - Locate the **SDK Token** section and click **Copy SDK Token** (keep this handy for Scenario 6).

---

### Scenario 2: Project Management
1. Click **Projects** in the sidebar.
2. Click **Create Project**:
   - **Name**: `Oncology Biomarker Study 2026`
   - **Description**: `Evaluating TP53, BRCA1, and EGFR predictive power on tumor progression.`
   - **Tags**: `Genomics, Oncology, Tabular`
3. Click **Create**: Verify the project appears in the project list and workspace.
4. Open the project and try the **Invite Researcher** modal.

---

### Scenario 3: Baseline Dataset Ingestion & Auto-Profiling
1. Navigate to **Datasets** → Click **Upload Dataset**.
2. Fill in:
   - **Name**: `Cancer Biomarkers Clinical Cohort`
   - **Project**: Select `Oncology Biomarker Study 2026`
   - **Version Label**: `V1`
   - **Version Note**: `Initial baseline clinical cohort`
3. Drag and drop or browse to:
   `test_datasets/cancer_biomarkers_v1_baseline.csv`
4. Click **Upload & Profile**:
   - ✅ **Verify**: Upload spinner and notification.
   - ✅ **Verify**: In the **Dataset Detail** page, check the circular Quality Score gauge (~95-100%).
   - ✅ **Verify**: Check row count (`60`), column count (`9`), 0% missing, 0% duplicates.
   - ✅ **Verify**: Inspect the column schema preview.

---

### Scenario 4: PCA Drift Engine & Version Comparison
Now test ResearchOS's flagship statistical engine:
1. In the **Dataset Detail** page for `Cancer Biomarkers Clinical Cohort`:
   - Click **Upload New Version**.
   - **Version Label**: `V2`
   - **Version Note**: `Post-treatment cohort with shifted age distribution and treatment cohort column`
   - Select file: `test_datasets/cancer_biomarkers_v2_drifted.csv`
   - Submit.
2. Switch to the **Drift Analysis (PCA)** tab:
   - ✅ **Verify**: ResearchOS executes PCA on both versions and reports:
     - Component shifts (`PC1`, `PC2`, etc.) with visual progress bars.
     - Warning badge (`Significant drift` or `Low drift`).
     - Reconstruction MSE and maximum component shift.
3. Switch to or click **Compare Versions**:
   - Compare `V1` vs `V2`.
   - ✅ **Verify Row Delta**: `+10` rows.
   - ✅ **Verify Column Delta**: `+1` column.
   - ✅ **Verify Schema Diff**: Identifies the newly introduced `treatment_cohort` column.

---

### Scenario 5: Quality Degradation & Dirty Data Ingestion
1. Upload a separate dataset or version with `cancer_biomarkers_v3_dirty.csv`:
   - Name: `Biomarkers Dirty Field Samples`
   - Version: `V1-Dirty`
2. Inspect the **Dataset Detail** page:
   - ✅ **Verify**: Quality Score significantly drops (to ~70-75%).
   - ✅ **Verify Missing Values**: Non-zero % displayed with warning styling.
   - ✅ **Verify Duplicates**: Flags the duplicated rows.

---

### Scenario 6: Non-Invasive Python Tracking SDK & Provenance Graph
This is the core developer / data scientist experience.

1. Ensure the backend is running.
2. Open terminal in the project root:
   ```powershell
   # Activate your venv:
   .\Backend\venv\Scripts\activate
   
   # Run the provided real-world script:
   python test_datasets/run_realworld_experiment.py
   ```
3. When prompted, paste the **SDK Token** you copied from the Settings page.
4. Watch the terminal output:
   - Passive interception captures `cancer_biomarkers_v1_baseline.csv` via standard `pandas.read_csv()`.
   - Passive interception captures `RandomForestClassifier` and `LogisticRegression` fit events.
   - Terminal prints the **Session Checklist** (captured datasets, models, sample sizes, and privacy consent).
   - Telemetry syncs directly to the backend!
5. Now check your Web Dashboard:
   - Open **Tracking SDK** page: Observe the newly ingested session with approval toggles.
   - Open **Experiments** page: Notice the new experiment runs, accuracy, F1, precision, and model type.
   - Click an experiment to see hyperparameters and metrics.
   - Open **Lineage** page: View the dynamic provenance graph showing:
     `Dataset → trains → Experiment → Model`.
   - Test zoom, drag, and node inspector in the graph.

---

### Scenario 7: Research Copilot & Review Sign-Off
1. Navigate to **Copilot** in the sidebar.
2. Query your platform research data:
   - *"Which model performed better between Random Forest and Logistic Regression?"*
   - *"Did the biomarker dataset experience distribution drift in V2?"*
   - *"Give me a summary of my active research projects."*
3. Verify the AI response incorporates your logged datasets and experiments.

---

## ✅ Evaluation Checklist For Your Review

| Checkpoint | Status | Notes |
|---|---|---|
| User Sign-up, Login & JWT Session | [ ] | Seamless login & session persistence |
| Project Creation & Collaboration | [ ] | Projects and invite modals work |
| Dataset Upload & SHA-256 Hash | [ ] | File upload + SHA-256 fingerprinting |
| Automated Profiling & Quality Score | [ ] | Rows, cols, missing %, quality gauge |
| Multi-version PCA Drift Engine | [ ] | PC shift, reconstruction error, drift warning |
| Side-by-side Version Comparison | [ ] | Row delta, col delta, schema differences |
| Python SDK Passive Tracking | [ ] | Non-invasive pandas & sklearn interception |
| Experiment Runs & Metrics Table | [ ] | Model params, F1, Accuracy, duration |
| Interactive Lineage Graph | [ ] | Node connections (Dataset -> Exp -> Model) |
| Research Copilot AI | [ ] | Contextual research chat |
