from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.environments.bundled_scenes import (
    get_bundled_environments_metadata,
    get_environment_graph
)
from backend.app.environments.matterport3d_adapter import Matterport3DAdapter

router = APIRouter(prefix="/environments", tags=["Environments"])
mp3d_adapter = Matterport3DAdapter()

_ENV_DETAIL_CACHE: Dict[str, Dict[str, Any]] = {}
_GRAPH_DICT_CACHE: Dict[str, Dict[str, Any]] = {}

@router.get("", response_model=List[Dict[str, Any]])
async def list_environments():
    bundled = get_bundled_environments_metadata()
    scans = mp3d_adapter.list_available_environments()
    return bundled + scans

@router.get("/{env_id}")
async def get_environment_detail(env_id: str):
    if env_id in _ENV_DETAIL_CACHE:
        return _ENV_DETAIL_CACHE[env_id]

    all_envs = get_bundled_environments_metadata() + mp3d_adapter.list_available_environments()
    meta = next((e for e in all_envs if e["id"] == env_id), None)
    if not meta:
        raise HTTPException(status_code=404, detail=f"Environment {env_id} not found")

    graph = get_environment_graph(env_id)
    graph_dict = graph.to_dict()

    res = {
        **meta,
        "viewpoints": graph_dict["nodes"],
        "edges": graph_dict["edges"],
        "total_viewpoints": graph_dict["total_nodes"],
        "total_edges": graph_dict["total_edges"]
    }
    _ENV_DETAIL_CACHE[env_id] = res
    return res

@router.get("/{env_id}/graph")
async def get_environment_graph_data(env_id: str):
    if env_id in _GRAPH_DICT_CACHE:
        return _GRAPH_DICT_CACHE[env_id]
    graph = get_environment_graph(env_id)
    data = graph.to_dict()
    _GRAPH_DICT_CACHE[env_id] = data
    return data

@router.get("/{env_id}/viewpoints")
async def get_viewpoints(env_id: str):
    if env_id in _GRAPH_DICT_CACHE:
        return _GRAPH_DICT_CACHE[env_id]["nodes"]
    graph = get_environment_graph(env_id)
    data = graph.to_dict()
    _GRAPH_DICT_CACHE[env_id] = data
    return data["nodes"]
