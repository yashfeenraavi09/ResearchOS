from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.database import db_get, db_post

router = APIRouter(prefix="/api/lineage", tags=["Lineage Graph"])

@router.get("")
async def get_lineage_graph(user: dict = Depends(get_current_user)):
    """
    Returns nodes and edges representing the research provenance graph.
    Formats keys (id, type, x, y, source, target) matching the React Lineage canvas.
    If no explicit nodes exist, dynamically maps user's datasets & experiments.
    """
    token = user["_token"]
    user_id = user["id"]

    raw_nodes = await db_get("lineage_nodes", token, {"user_id": f"eq.{user_id}"})
    raw_edges = await db_get("lineage_edges", token, {"user_id": f"eq.{user_id}"})

    # If explicit lineage exists in database
    if raw_nodes:
        formatted_nodes = []
        for n in raw_nodes:
            formatted_nodes.append({
                "id": n.get("node_id") or str(n.get("id")),
                "type": n.get("node_type") or "dataset",
                "label": n.get("label", "Node"),
                "sublabel": n.get("sublabel", ""),
                "x": float(n.get("pos_x") or 100),
                "y": float(n.get("pos_y") or 100),
                "status": n.get("status", "active"),
                "meta": n.get("metadata") or {},
            })

        formatted_edges = []
        for e in raw_edges:
            formatted_edges.append({
                "id": str(e.get("id")),
                "source": e.get("from_node"),
                "target": e.get("to_node"),
                "label": e.get("label", "CONNECTS"),
                "animated": True,
            })

        return {"nodes": formatted_nodes, "edges": formatted_edges}

    # Dynamic Fallback: Auto-synthesize nodes from user's datasets & experiments
    datasets = await db_get("datasets", token, {"user_id": f"eq.{user_id}", "order": "created_at.asc"})
    experiments = await db_get("experiments", token, {"user_id": f"eq.{user_id}", "order": "created_at.asc"})

    synth_nodes = []
    synth_edges = []

    ds_map = {}
    for i, ds in enumerate(datasets):
        nid = f"ds-{ds['id'][:8]}"
        ds_map[ds["id"]] = nid
        synth_nodes.append({
            "id": nid,
            "type": "dataset",
            "label": ds["name"],
            "sublabel": f"{ds.get('rows_count', 0)} rows · {ds.get('current_version', 'V1')}",
            "x": 120,
            "y": 140 + (i * 120),
            "status": "active",
            "meta": {
                "Type": ds.get("type", "Tabular"),
                "Quality": f"{ds.get('quality_score', 100)}/100",
                "Version": ds.get("current_version", "V1"),
            },
        })

    for j, exp in enumerate(experiments):
        eid = f"exp-{exp['id'][:8]}"
        synth_nodes.append({
            "id": eid,
            "type": "experiment",
            "label": exp["name"],
            "sublabel": f"{exp.get('model', 'Model')} · {exp.get('status', 'completed')}",
            "x": 1920,
            "y": 140 + (j * 120),
            "status": "best" if (exp.get("accuracy") and float(exp["accuracy"]) > 90) else exp.get("status", "active"),
            "meta": {
                "Model": exp.get("model", ""),
                "Accuracy": f"{exp.get('accuracy')}%" if exp.get("accuracy") else "N/A",
                "Time": exp.get("execution_time", "0s"),
            },
        })

        # Connect edge if dataset is associated
        ds_id = exp.get("dataset_id")
        if ds_id and ds_id in ds_map:
            synth_edges.append({
                "id": f"edge-{ds_map[ds_id]}-{eid}",
                "source": ds_map[ds_id],
                "target": eid,
                "label": "TRAINS",
                "animated": exp.get("status") == "running",
            })
        elif synth_nodes and len(synth_nodes) > 1:
            # Connect to first dataset if available
            first_ds = next((n for n in synth_nodes if n["type"] == "dataset"), None)
            if first_ds:
                synth_edges.append({
                    "id": f"edge-{first_ds['id']}-{eid}",
                    "source": first_ds["id"],
                    "target": eid,
                    "label": "TRAINS",
                    "animated": False,
                })

    return {"nodes": synth_nodes, "edges": synth_edges}
