from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.environments.bundled_scenes import (
    get_bundled_environments_metadata,
    get_environment_graph
)
from backend.app.environments.matterport3d_adapter import Matterport3DAdapter

router = APIRouter(prefix="/environments", tags=["Environments"])
mp3d_adapter = Matterport3DAdapter()

@router.get("", response_model=List[Dict[str, Any]])
async def list_environments():
    bundled = get_bundled_environments_metadata()
    scans = mp3d_adapter.list_available_environments()
    return bundled + scans

@router.get("/{env_id}")
async def get_environment_detail(env_id: str):
    all_envs = get_bundled_environments_metadata() + mp3d_adapter.list_available_environments()
    meta = next((e for e in all_envs if e["id"] == env_id), None)
    if not meta:
        raise HTTPException(status_code=404, detail=f"Environment {env_id} not found")

    graph = get_environment_graph(env_id)
    graph_dict = graph.to_dict()

    return {
        **meta,
        "viewpoints": graph_dict["nodes"],
        "edges": graph_dict["edges"],
        "total_viewpoints": graph_dict["total_nodes"],
        "total_edges": graph_dict["total_edges"]
    }

@router.get("/{env_id}/graph")
async def get_environment_graph_data(env_id: str):
    graph = get_environment_graph(env_id)
    return graph.to_dict()

@router.get("/{env_id}/viewpoints")
async def get_viewpoints(env_id: str):
    graph = get_environment_graph(env_id)
    return graph.to_dict()["nodes"]
