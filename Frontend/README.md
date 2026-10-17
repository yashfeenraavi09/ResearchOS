# ResearchOS — Frontend

React 19 + Vite 8 single-page application. Handles authentication, real-time dashboard polling, dataset management, experiment tracking, provenance visualization, and user settings — all connected to the FastAPI backend via JWT-authenticated REST calls.

---

## Tech Stack

| Tech | Purpose |
|---|---|
| React 19 | UI component framework |
| Vite 8 | Build tool and dev server |
| Supabase JS v2 | Auth session management (login, signup, JWT) |
| Vanilla CSS | Custom design system — no Tailwind, no component library |
| Custom SVG | All charts drawn as raw SVG (accuracy trends, bars, sparklines) |

---

## Project Structure

```
Frontend/
├── src/
│   ├── App.jsx                  # Root component — routing state machine
│   ├── main.jsx                 # React DOM entry point
│   ├── index.css                # Global CSS resets and base tokens
│   │
│   ├── context/
│   │   └── AuthContext.jsx      # Supabase session provider (user, session)
│   │
│   ├── lib/
│   │   ├── api.js               # All backend API functions (fetch + mutate)
│   │   └── supabaseClient.js    # Supabase JS client singleton
│   │
│   ├── components/
│   │   ├── Sidebar.jsx          # Left navigation with icon links to all pages
│   │   ├── Sidebar.css
│   │   ├── TopBar.jsx           # Top bar with page title + user avatar + logout
│   │   ├── TopBar.css
│   │   └── ResearchOSLogo.jsx   # SVG logo component
│   │
│   └── pages/
│       ├── Landing.jsx/css           # Public landing page (hero, features, CTA)
│       ├── Login.jsx/css             # Email + password sign in
│       ├── Signup.jsx/css            # New account registration
│       │
│       ├── Home.jsx/css              # Live dashboard — stats, sparklines, activity
│       │
│       ├── DatasetList.jsx/css       # Dataset table with search, filter, sort
│       ├── DatasetDetail.jsx/css     # Schema, quality score, version history
│       ├── DatasetUpload.jsx/css     # Multipart file upload form
│       ├── VersionComparison.jsx/css # Side-by-side version diff + PCA drift bars
│       │
│       ├── ExperimentList.jsx/css    # All experiments table — filter, sort, search
│       ├── ExperimentDetail.jsx/css  # Metrics, charts, hyperparams for one run
│       ├── NewExperiment.jsx/css     # Form to manually log a new experiment run
│       │
│       ├── Results.jsx/css           # Best model leaderboard + accuracy trend chart
│       │
│       ├── Lineage.jsx/css           # Interactive provenance canvas (Dataset→Model)
│       │
│       ├── Tracking.jsx/css          # Python SDK session review and sync UI
│       │
│       ├── ProjectsList.jsx/css      # Research projects grid with live stats
│       ├── ProjectWorkspace.jsx/css  # Single project detail — datasets + experiments
│       ├── CreateProject.jsx/css     # Form to create a new research project
│       │
│       ├── Copilot.jsx/css           # Research Copilot AI assistant chat interface
│       │
│       ├── Settings.jsx/css          # User profile, storage, team, preferences
│       │
│       ├── InviteResearcher.jsx/css  # Invite collaborator form
│       ├── Datasets.jsx/css          # (Legacy — replaced by DatasetList)
│       └── Experiments.jsx/css       # (Legacy — replaced by ExperimentList)
│
├── public/                  # Static assets
├── index.html               # Vite HTML shell
├── vite.config.js           # Vite config (port 8443)
├── package.json
├── jsconfig.json
└── .env                     # Supabase URL and anon key
```

---

## File Roles — Detailed

### `App.jsx`
The central routing brain of the application. Uses a **state machine pattern** (no React Router) — a single `page` string state determines what is rendered. Handles:
- Auth state detection (redirects to landing if not logged in)
- Sub-view states for Datasets (`list`, `detail`, `upload`, `compare`), Experiments (`list`, `detail`, `new`), and Projects (`list`, `workspace`)
- Cross-module navigation (e.g. clicking a dataset from an experiment)
- TopBar metadata (title, subtitle) per active view

### `context/AuthContext.jsx`
Wraps the app in a Supabase auth listener. Exposes `user` (Supabase user object) and `session` (JWT session with `access_token`) to all child components via `useAuth()` hook. The session's `access_token` is the Bearer token sent to the backend.

### `lib/api.js`
Centralized API client. Every function:
1. Retrieves the active Supabase JWT token via `supabase.auth.getSession()`
2. Injects it as `Authorization: Bearer <token>` header automatically
3. Calls `http://localhost:8000` (configurable via `VITE_API_BASE_URL`)
4. Returns parsed JSON or `null` on failure (never throws to the UI)

Key exported functions:
| Function | Endpoint |
|---|---|
| `fetchDashboard()` | GET /api/dashboard |
| `fetchDatasets()` | GET /api/datasets |
| `uploadDatasetFile(formData)` | POST /api/datasets/upload |
| `compareDatasetVersions(id, base, target)` | GET /api/datasets/{id}/compare |
| `fetchExperiments()` | GET /api/experiments |
| `createExperiment(payload)` | POST /api/experiments |
| `fetchLineage()` | GET /api/lineage |
| `syncTrackingBatch(payload)` | POST /api/tracking/sync |
| `toggleTrackingSession(id, status)` | POST /api/tracking/session/toggle |
| `fetchProjects()` | GET /api/projects |
| `fetchSettings()` | GET /api/settings |
| `saveSettings(payload)` | POST /api/settings |

### `lib/supabaseClient.js`
Creates the single Supabase JS client singleton using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`. Imported by `AuthContext`, `api.js`, and `Settings.jsx`.

### `components/Sidebar.jsx`
Left navigation rail with icon buttons for every page section. Active page is highlighted. Collapses to icons only on smaller viewports.

### `components/TopBar.jsx`
Shows the current page title/subtitle and user avatar initials in the top right. Clicking the avatar shows a logout option.

---

## Real-Time Data Pattern

Every data-displaying page uses the same pattern — initial fetch on mount, then a `setInterval` polling loop:

```jsx
useEffect(() => {
  let mounted = true;
  const load = () => {
    fetchDatasets().then(data => {
      if (mounted) setDatasets(data || []);
    });
  };
  load();
  const interval = setInterval(load, 5000); // poll every 5 seconds
  return () => {
    mounted = false;
    clearInterval(interval); // cleanup on unmount
  };
}, []);
```

Polling intervals by page:
| Page | Interval | What updates |
|---|---|---|
| Home | 4s | Stats, sparklines, activity log |
| Tracking | 3.5s | Pending Python SDK events |
| Lineage | 5s | Provenance graph nodes and edges |
| Datasets | 5s | Dataset list with quality scores |
| Experiments | 5s | Run list with metrics |
| Projects | 5s | Project list |
| Results | 5s | Completed experiment leaderboard |
| Settings | 5s | Storage quota, team, preferences |

---

## Auth Flow

```
User visits app
  → AuthContext detects no session → page = 'landing'
  → User clicks Sign In → page = 'login'
  → Supabase email+password auth
  → On success → session + user saved → page = 'home'
  → All API calls auto-inject JWT Bearer token
  → Token sent to FastAPI → validated → user_id extracted → RLS enforced
```

---

## Environment Variables

Create `Frontend/.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://localhost:8000
```

---

## Local Development

```bash
npm install
npm run dev
```

Runs at http://localhost:8443 (configured in `vite.config.js`)

---

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy to Vercel, Netlify, or any static host.

> Make sure to set `VITE_API_BASE_URL` to your deployed backend URL in production environment variables.
