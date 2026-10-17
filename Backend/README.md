# ResearchOS — Backend

FastAPI Python backend providing authenticated REST APIs for dataset versioning, experiment tracking, provenance lineage, project management, and user settings. All data is user-scoped via Supabase JWT authentication and PostgreSQL Row Level Security.

---

## Tech Stack

| Tech | Purpose |
|---|---|
| FastAPI | Async REST API framework |
| Uvicorn | ASGI server |
| Supabase PostgreSQL | Primary database (via REST API) |
| Supabase Auth | JWT token validation |
| Pandas | Dataset profiling and drift analysis |
| scikit-learn | PCA drift engine + estimator auto-instrumentation |
| NumPy / SciPy | Numerical computation |
| MinIO | Local S3-compatible file storage (primary) |
| Supabase Storage | Cloud file storage (fallback) |
| httpx | Async HTTP client for Supabase REST calls |
| python-dotenv | Environment variable loading |

---

## Project Structure

```
Backend/
├── main.py                      # FastAPI app — mounts all routers + dashboard endpoint
├── requirements.txt             # Python dependencies
├── .env                         # Supabase URL, keys, MinIO config
│
├── core/                        # Shared infrastructure
│   ├── config.py                # Loads all env vars, defines storage paths
│   ├── auth.py                  # JWT validation middleware (get_current_user)
│   └── database.py              # Supabase REST CRUD helpers + log_activity
│
├── dataset_versioning/          # Feature: Dataset upload, versioning, drift
│   ├── router.py                # REST endpoints at /api/datasets
│   ├── hasher.py                # SHA-256 fingerprinting for files and buffers
│   ├── profiler.py              # Pandas-based dataset profiling (rows, schema, quality)
│   ├── drift_engine.py          # PCA reconstruction error drift detection
│   ├── comparator.py            # Version comparison — diffs + drift
│   ├── storage.py               # Multi-tier file storage (MinIO → Supabase → local)
│   └── schemas.py               # Pydantic request/response models
│
├── tracking_plugin/             # Feature: Python SDK + event ingestion
│   ├── router.py                # REST endpoints at /api/tracking
│   ├── service.py               # Ingestion service — links datasets, creates runs, lineage
│   ├── schemas.py               # Pydantic models for SDK sync payloads
│   └── sdk/                     # Installable Python SDK package
│       ├── __init__.py          # Public API: tracker.start/stop/track/sync/status
│       ├── instrumentation.py   # Monkey-patches pandas + 208 sklearn estimators
│       ├── buffer.py            # Thread-safe in-memory session event buffer
│       ├── fingerprint.py       # SHA-256 file fingerprinting (matches backend)
│       └── consent.py           # Breakpoint review + sync transmitter
│
├── experiments/
│   └── router.py                # REST endpoints at /api/experiments (CRUD)
│
├── projects/
│   └── router.py                # REST endpoints at /api/projects (CRUD)
│
├── lineage/
│   └── router.py                # REST endpoint at /api/lineage (nodes + edges graph)
│
├── settings/
│   └── router.py                # REST endpoints at /api/settings (GET + POST)
│
├── storage/
│   └── datasets/                # Local file cache (gitignored, auto-created)
│
├── test_features_demo.py        # Integration test script (run manually)
└── verify_setup.py              # Quick environment verification script
```

---

## File Roles — Detailed

### `main.py`
Entry point. Mounts all feature routers and defines two additional endpoints:
- `GET /` — health check
- `GET /api/me` — returns authenticated user profile from token
- `GET /api/dashboard` — aggregates recent experiments, datasets, projects, and activities for the home page
- `GET /api/results` — returns completed experiments sorted by accuracy for the Results page

### `core/config.py`
Loads all environment variables with `python-dotenv`. Exports:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL` (for CORS)
- `STORAGE_DIR` — local cache path at `Backend/storage/datasets/`

### `core/auth.py`
FastAPI dependency `get_current_user`. Validates `Authorization: Bearer <token>` by calling `GET /auth/v1/user` on Supabase. Returns the full user object with `_token` injected (used for subsequent RLS-passing DB calls). Raises HTTP 401 if token is missing or invalid.

### `core/database.py`
Async Supabase REST helpers that pass the user's JWT to every query — this is what triggers Row Level Security on the database:
- `db_get(table, token, params)` — filtered SELECT
- `db_get_one(table, token, params)` — SELECT with limit 1
- `db_post(table, token, data)` — INSERT returning created row
- `db_patch(table, token, params, data)` — UPDATE
- `log_activity(token, user_id, text, icon, type)` — inserts into `activities` table

---

## Feature Implementation — Step by Step

### Feature 1: Dataset Versioning

**Goal:** Upload a dataset file, automatically profile it, store it, version it, and enable drift detection between versions.

**Step 1 — File Upload (`router.py` → `POST /api/datasets/upload`)**
1. Receives multipart form data: file + metadata (name, description, type, version label)
2. Reads raw bytes from the uploaded file

**Step 2 — SHA-256 Fingerprinting (`hasher.py`)**
3. Computes a deterministic SHA-256 hash of the file bytes
4. This fingerprint is stored and later used by the Python SDK to detect if the same file was loaded in a Python session

**Step 3 — Pandas Profiling (`profiler.py`)**
5. Loads the file into a Pandas DataFrame (`load_dataframe` supports CSV, Parquet, Excel, JSON)
6. Computes: row count, column count, column schema (name + inferred friendly type), null percentage, duplicate percentage
7. Calculates a 0–100 quality score based on nulls, duplicates, and column type coverage

**Step 4 — Multi-Tier Storage (`storage.py`)**
8. Tries to upload to **MinIO** first (bucket: `researchos-datasets`, path: `{dataset_id}/{version}/{filename}`)
9. If MinIO is unreachable, falls back to **Supabase Cloud Storage** (bucket: `datasets`)
10. Always saves a local copy to `Backend/storage/datasets/` for fast re-reading in drift analysis

**Step 5 — Database Records**
11. Creates a `datasets` record with: user_id, name, description, type, current_version, rows/cols/quality
12. Creates a `dataset_versions` record with full profile + storage path + SHA-256 hash

**Version Comparison (`comparator.py` + `drift_engine.py`)**

When `GET /api/datasets/{id}/compare?base=V1&target=V2` is called:
1. Loads both version DataFrames from local cache
2. `comparator.py` computes: row delta, col delta, quality delta, null delta, added/removed columns
3. `drift_engine.py` runs **PCA drift analysis**:
   - Selects numeric columns present in both versions
   - Standardizes with `StandardScaler`
   - Fits PCA on base version, transforms both versions
   - Computes **reconstruction error** (MSE) — higher = more drift
   - Returns centroid shifts per principal component (PC1, PC2, etc.)
4. Returns the full diff + drift report to the frontend `VersionComparison` component

---

### Feature 2: Python Tracking SDK

**Goal:** Let researchers run their existing Python code unchanged. The SDK silently intercepts data loading and model training events, then syncs them to the dashboard on demand.

**Step 1 — Auto-Instrumentation (`sdk/instrumentation.py`)**

On `tracker.start()`, the SDK monkey-patches:
- `pandas.read_csv`, `pandas.read_parquet`, `pandas.read_excel` — wraps them to capture: file path, SHA-256 hash, row count, column count
- All 208 scikit-learn estimators via `sklearn.utils.all_estimators()` — wraps `.fit()` on each class to capture: estimator class name, hyperparameters, fitted flag, timestamp

Patches are stored in a registry so `tracker.stop()` can safely restore all original functions.

**Step 2 — Thread-Safe Buffer (`sdk/buffer.py`)**

All intercepted events are appended to an in-memory `SessionBuffer` protected by a `threading.Lock`. Events are typed: `dataset_load` or `model_fit`.

**Step 3 — Consent Breakpoint (`sdk/consent.py`)**

When `tracker.sync()` is called:
1. Displays a summary of pending events in the terminal
2. User confirms or skips individual events
3. Sends the confirmed payload to `POST /api/tracking/sync` with the user's JWT token

**Step 4 — Backend Ingestion (`service.py`)**

The `TrackingService.ingest_session()` processes each event:

For `dataset_load` events:
1. Checks if a dataset with matching SHA-256 hash already exists in `datasets` table
2. If not found, creates a new dataset record
3. Creates a `lineage_nodes` record of type `dataset`

For `model_fit` events:
1. Creates an `experiments` record with: name, model class, hyperparameters, project_id, user_id, status=`completed`
2. Creates a `lineage_nodes` record of type `experiment`
3. Creates a `lineage_edges` record linking: `dataset_node → trains → experiment_node`
4. Logs an activity record

**Step 5 — Session Toggle (`router.py`)**

`POST /api/tracking/session/toggle?session_id=X&status=paused/active` allows the frontend Tracking page to pause or resume a live session.

---

### Feature 3: Experiments

`router.py` at `/api/experiments`:
- `GET /api/experiments` — returns all experiments for the authenticated user (ordered newest first)
- `POST /api/experiments` — manually creates an experiment run record
- `GET /api/experiments/{id}` — returns a single experiment with all fields

All queries include `user_id = eq.{user_id}` filter — Supabase RLS additionally enforces this at the DB level.

---

### Feature 4: Projects

`router.py` at `/api/projects`:
- `GET /api/projects` — all user projects
- `POST /api/projects` — create a project (name, description, visibility, tags)
- `GET /api/projects/{id}` — project detail with associated datasets and experiments

---

### Feature 5: Lineage

`router.py` at `/api/lineage`:
- `GET /api/lineage` — returns `{ nodes: [], edges: [] }` in React Flow format

Logic:
1. Queries `lineage_nodes` and `lineage_edges` tables for the user
2. If no explicit lineage nodes exist, **auto-synthesizes** a graph from the user's datasets and experiments
3. Nodes are colored by type: blue (dataset), green (experiment), purple (model)
4. Edges include labels (`trains`, `produces`, `uses`)

---

### Feature 6: Settings

`router.py` at `/api/settings`:

**GET /api/settings:**
1. Reads user profile from the JWT-decoded user object (name, email, affiliation)
2. Computes real storage usage by scanning `Backend/storage/datasets/` directory
3. Counts datasets and versions from database
4. Reads saved preferences from `user_metadata.settings` in Supabase Auth
5. Builds a complete settings object with real data — no defaults are shown as real data

**POST /api/settings:**
1. Receives updated profile fields + notification/privacy/tracking preference objects
2. Updates `user_metadata` via Supabase Auth `PUT /auth/v1/user` API
3. Persists all preference toggles inside `user_metadata.settings` JSON field
4. Logs a settings-changed activity record

---

## Database Schema Summary

All tables use `user_id UUID` with RLS policy `user_id = auth.uid()`:

| Table | Purpose |
|---|---|
| `datasets` | Dataset registry with metadata and quality scores |
| `dataset_versions` | Versioned snapshots with SHA-256, profile, storage path |
| `experiments` | ML training run records with metrics |
| `tracking_sessions` | Python SDK session logs |
| `lineage_nodes` | Graph nodes (dataset, experiment, model) |
| `lineage_edges` | Directed relationships between lineage nodes |
| `projects` | Research project containers |
| `activities` | Activity log stream for the dashboard |

Full schema with RLS policies: `supabase_schema.sql` in the project root.

---

## How to Run

```bash
# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create Backend/.env (see root README for values)

# 4. Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## How to Test

### 1. Interactive API Docs (Swagger UI)

Open http://localhost:8000/docs in your browser. All endpoints are listed with request/response schemas. You can test them directly after pasting a Supabase JWT token in the Authorize button.

**Get a JWT token:**
1. Open the frontend at http://localhost:8443
2. Sign in to your account
3. Open browser DevTools → Application → Local Storage → find the Supabase session token

### 2. Test Dataset Versioning

```bash
# Upload a CSV file
curl -X POST http://localhost:8000/api/datasets/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test_data.csv" \
  -F "name=Test Dataset" \
  -F "dataset_type=Tabular" \
  -F "version_label=V1"
```

### 3. Test Python Tracking SDK

```python
# Run from the ResearchOS root folder
from Backend.tracking_plugin.sdk import tracker
import pandas as pd
from sklearn.linear_model import LogisticRegression

tracker.start(project_id="Test", token="YOUR_JWT_TOKEN")

df = pd.DataFrame({"x": [1.0, 2.0, 3.0], "y": [0, 1, 1]})
df.to_csv("tmp_test.csv", index=False)
df2 = pd.read_csv("tmp_test.csv")   # auto-tracked

clf = LogisticRegression()
clf.fit(df2[["x"]], df2["y"])       # auto-tracked

tracker.sync()
```

### 4. Run the Built-In Demo Test Script

```bash
cd Backend
python test_features_demo.py
```

This runs automated tests for:
- Dataset SHA-256 fingerprinting
- Pandas profiling (rows, cols, schema, quality)
- PCA drift engine (reconstruction error)
- SDK passive instrumentation (pandas + sklearn intercept)
- Buffer event capture and flush

### 5. Verify Environment Setup

```bash
cd Backend
python verify_setup.py
```

Checks that all required packages are installed and environment variables are set.

### 6. Test the Lineage Graph

```bash
curl -X GET http://localhost:8000/api/lineage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response will contain `nodes` and `edges` arrays. If you have uploaded datasets and run experiments, they appear as connected graph nodes.

---

## User Isolation (Security)

Every endpoint uses `Depends(get_current_user)` which:
1. Extracts the Bearer token from the request header
2. Validates it against Supabase Auth
3. Returns the user object including `id` (user UUID)

Every database query then includes `user_id: f"eq.{user_id}"` in the query params. Additionally, Supabase Row Level Security policies enforce this at the database level — even if a query parameter were manipulated, the database would return no rows for other users' data.
