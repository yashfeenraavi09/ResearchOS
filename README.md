# ResearchOS

> A full-stack ML Research Management Platform — track datasets, experiments, lineage, and model versions from a Python SDK directly to a live web dashboard.

---

## What is ResearchOS?

ResearchOS is an end-to-end research operations platform built for data scientists and ML researchers. It bridges the gap between your Python environment (notebooks, scripts, VS Code) and a powerful web dashboard — letting you manage datasets with version control, track model training runs automatically, visualize data provenance as a graph, and collaborate with teammates — all in real time.

---

## Core Features

| Feature | Description |
|---|---|
| **Dataset Versioning** | Upload CSV/Parquet/Excel files, auto-profile rows/cols/quality, detect schema drift with PCA, compare versions side-by-side |
| **Python Tracking SDK** | Auto-intercepts `pandas.read_csv()` and all 208 scikit-learn estimators non-invasively. No code changes required |
| **Live Experiments Dashboard** | View accuracy, F1, precision, recall across all runs. Filter by status, sort by metric, compare models |
| **Provenance Lineage Graph** | Auto-generates `Dataset → trains → Experiment → Model` provenance canvas in real time |
| **Research Copilot** | AI assistant for querying your own research history |
| **Projects Workspace** | Organize datasets and experiments into research projects with team collaboration |
| **Settings & Auth** | Per-user secure JWT-based SDK token, notification preferences, live storage quota |

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Auth | Supabase Auth (JWT) |
| Styling | Vanilla CSS (custom design system) |
| Charts | Custom SVG (no charting library) |
| State | React useState / useEffect with 3-5s live polling |

### Backend
| Layer | Technology |
|---|---|
| API Server | FastAPI (Python) |
| Database | Supabase PostgreSQL with Row Level Security (RLS) |
| Auth Validation | Supabase JWT verification |
| Primary Storage | Local MinIO (S3-compatible, localhost:9000) |
| Fallback Storage | Supabase Cloud Storage (bucket: datasets) |
| Local Cache | Backend/storage/datasets/ (fast Pandas reading) |
| ML Analysis | Pandas, scikit-learn, NumPy, SciPy |

---

## Project Structure

```
ResearchOS/
├── Frontend/               # React + Vite web application
│   ├── src/
│   │   ├── pages/          # All page components (one per feature)
│   │   ├── components/     # Shared UI components (Sidebar, TopBar, Logo)
│   │   ├── context/        # AuthContext (Supabase session management)
│   │   ├── lib/            # API client + Supabase client
│   │   └── App.jsx         # Root router and navigation state machine
│   ├── .env                # Supabase keys
│   └── package.json
│
├── Backend/                # FastAPI Python server
│   ├── core/               # Auth middleware, DB helpers, config
│   ├── dataset_versioning/ # Upload, profile, version, drift, storage
│   ├── tracking_plugin/    # Python SDK + session ingestion service
│   │   └── sdk/            # Installable Python tracker (instrumentation)
│   ├── experiments/        # Experiment CRUD router
│   ├── projects/           # Project CRUD router
│   ├── lineage/            # Provenance graph router
│   ├── settings/           # User preferences + storage quota router
│   ├── storage/            # Local dataset file cache (gitignored)
│   ├── main.py             # FastAPI app entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Supabase + MinIO keys
│
├── supabase_schema.sql     # Full database schema with RLS policies
├── Implementation Plans/   # Original feature planning documents
└── README.md
```

---

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **Supabase account** (free tier works) — https://supabase.com
- **MinIO** (optional, for local S3 storage) — https://min.io

---

## Full Setup Guide

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/ResearchOS.git
cd ResearchOS
```

### Step 2 — Supabase Database Setup

1. Go to https://supabase.com and create a new project
2. Open **SQL Editor** in your Supabase dashboard
3. Paste the entire contents of `supabase_schema.sql` and click **Run**
4. This creates all tables with Row Level Security:
   - `datasets`, `dataset_versions`, `experiments`, `tracking_sessions`
   - `lineage_nodes`, `lineage_edges`, `projects`, `activities`

### Step 3 — Configure Environment Variables

**Frontend** — create `Frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8000
```

**Backend** — create `Backend/.env`:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:8443
```

Get your keys from: Supabase Dashboard → Your Project → Settings → API

### Step 4 — Start the Backend

```bash
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- Backend runs at: http://localhost:8000
- Interactive API docs at: http://localhost:8000/docs

### Step 5 — Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:8443

### Step 6 — (Optional) Start Local MinIO

For local S3-compatible file storage (recommended for large datasets):

```bash
# Using Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

MinIO Console: http://localhost:9001

The backend auto-creates the `researchos-datasets` bucket on first upload.
If MinIO is not running, the system automatically falls back to Supabase Cloud Storage.

---

## How to Use the Python SDK

1. Open your ResearchOS dashboard and sign in
2. Go to **Settings** → **Tracking Preferences**
3. Click **"Copy SDK Token"**
4. In your Python environment:

```python
from Backend.tracking_plugin.sdk import tracker

# Initialize with your personal token
tracker.start(project_id="My Research Project", token="YOUR_SDK_TOKEN")

# Your normal data science code — no changes needed!
import pandas as pd
df = pd.read_csv("research_data.csv")   # automatically tracked

from sklearn.ensemble import RandomForestClassifier
clf = RandomForestClassifier(n_estimators=100)
clf.fit(X_train, y_train)               # automatically tracked

# Sync everything to your live dashboard
tracker.sync()
```

5. Go to **Tracking SDK** page on the dashboard to review and confirm the session

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/dashboard` | GET | Live stats, recent datasets, experiments, activities |
| `/api/datasets` | GET | All user datasets with quality scores |
| `/api/datasets/upload` | POST | Multipart file upload with auto-profiling |
| `/api/datasets/{id}/compare` | GET | PCA drift comparison between two versions |
| `/api/experiments` | GET/POST | List and create experiment runs |
| `/api/tracking/sync` | POST | Ingest Python SDK session events |
| `/api/lineage` | GET | Provenance graph nodes and edges |
| `/api/projects` | GET/POST | Research project management |
| `/api/settings` | GET/POST | User preferences and storage quota |
| `/api/me` | GET | Authenticated user profile |

All endpoints require: `Authorization: Bearer <supabase-jwt-token>` header.

---

## License

MIT — Built for academic and research use.
