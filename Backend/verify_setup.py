import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

import main

print("=== RESEARCHOS BACKEND VERIFICATION ===")
print("Application title:", main.app.title)
print("\nMounted API Routes:")
routes = []
for r in main.app.routes:
    if hasattr(r, "path"):
        routes.append(f"{list(r.methods) if hasattr(r, 'methods') else ''} {r.path}")

for r in sorted(routes):
    print(" ", r)

print("\nVerifying SDK Imports...")
from tracking_plugin import sdk
print("SDK loaded:", sdk.start, sdk.stop, sdk.track)

from dataset_versioning import hasher, profiler, comparator, drift_engine
print("Dataset versioning loaded:", hasher.compute_file_sha256, profiler.profile_dataset, comparator.compare_dataset_versions, drift_engine.calculate_pca_drift)

print("\nALL BACKEND MODULES VERIFIED SUCCESSFULLY!")
