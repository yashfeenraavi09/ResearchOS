import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from Backend root
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Local storage directory for dataset files
STORAGE_DIR = backend_dir / "storage"
DATASETS_STORAGE_DIR = STORAGE_DIR / "datasets"
DATASETS_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
