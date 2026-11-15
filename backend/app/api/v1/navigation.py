import uuid
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.core.database import get_db
from backend.app.core.websocket import ws_manager
from backend.app.models.experiment import NavigationEpisode, AgentState, Experiment
from backend.app.schemas.navigation import StartNavigationRequest, NavigationStepResponse, EpisodeStateResponse
from backend.app.environments.bundled_scenes import get_environment_graph
from backend.app.ai.language.parser import InstructionParser
from backend.app.ai.policy.policy_engine import PolicyEngine
from backend.app.evaluation.metrics import NavigationEvaluator

router = APIRouter(prefix="/navigation", tags=["Navigation Engine"])
logger = logging.getLogger("wayfinder.navigation_api")

# In-memory episode cache for high-speed sequential execution & simulation state
active_episodes_cache: Dict[str, Dict[str, Any]] = {}

@router.post("/start", response_model=EpisodeStateResponse)
async def start_navigation(
    req: StartNavigationRequest,
    db: AsyncSession = Depends(get_db)
):
    # 1. Load environment graph
    graph = get_environment_graph(req.environment_id)
    if not graph.graph.has_node(req.start_viewpoint_id):
        raise HTTPException(status_code=400, detail=f"Invalid start viewpoint: {req.start_viewpoint_id}")
    if not graph.graph.has_node(req.goal_viewpoint_id):
        raise HTTPException(status_code=400, detail=f"Invalid goal viewpoint: {req.goal_viewpoint_id}")

    # 2. Parse instruction
    parser = InstructionParser(provider_type=req.provider)
    parsed_instruction = await parser.parse(req.instruction_text, language=req.language)

    # 3. Compute optimal path
    optimal_path = graph.shortest_path(req.start_viewpoint_id, req.goal_viewpoint_id)

    # 4. Initialize episode
    episode_id = str(uuid.uuid4())
    start_vp_data = graph.get_viewpoint(req.start_viewpoint_id)
    initial_heading = start_vp_data.get("heading", 0.0)

    initial_trajectory = [{
        "viewpoint_id": req.start_viewpoint_id,
        "x": start_vp_data["x"],
        "y": start_vp_data["y"],
        "z": start_vp_data["z"],
        "heading": initial_heading,
        "room_label": start_vp_data.get("room_label", "start"),
        "step": 0
    }]

    episode_data = {
        "id": episode_id,
        "environment_id": req.environment_id,
        "instruction_text": req.instruction_text,
        "language": req.language,
        "parsed_instruction": parsed_instruction,
        "start_viewpoint_id": req.start_viewpoint_id,
        "goal_viewpoint_id": req.goal_viewpoint_id,
        "current_viewpoint_id": req.start_viewpoint_id,
        "current_heading": initial_heading,
        "current_step": 0,
        "max_steps": req.max_steps,
        "status": "running",
        "policy_type": req.policy_type,
        "provider": req.provider,
        "confidence": 1.0,
        "trajectory": initial_trajectory,
        "visited_vp_ids": [req.start_viewpoint_id],
        "optimal_path": optimal_path,
        "history": [],
        "outcome_metrics": {},
        "error_message": None
    }
    active_episodes_cache[episode_id] = episode_data

    # Persist episode to DB
    episode_db = NavigationEpisode(
        id=episode_id,
        environment_id=req.environment_id,
        instruction_text=req.instruction_text,
        language=req.language,
        start_viewpoint_id=req.start_viewpoint_id,
        goal_viewpoint_id=req.goal_viewpoint_id,
        current_viewpoint_id=req.start_viewpoint_id,
        current_heading=initial_heading,
        current_step=0,
        max_steps=req.max_steps,
        status="running",
        confidence=1.0,
        trajectory=initial_trajectory,
        optimal_path=optimal_path,
        outcome_metrics={}
    )
    db.add(episode_db)
    await db.commit()

    # Broadcast via websocket
    await ws_manager.broadcast(episode_id, {
        "event": "EPISODE_STARTED",
        "episode_id": episode_id,
        "state": episode_data
    })

    return EpisodeStateResponse(**episode_data)

@router.post("/{episode_id}/step", response_model=NavigationStepResponse)
async def execute_step(
    episode_id: str,
    db: AsyncSession = Depends(get_db)
):
    episode = active_episodes_cache.get(episode_id)
    if not episode:
        # Check DB
        res = await db.execute(select(NavigationEpisode).where(NavigationEpisode.id == episode_id))
        ep_db = res.scalar_one_or_none()
        if not ep_db:
            raise HTTPException(status_code=404, detail=f"Episode {episode_id} not found")
        # Reconstruct in cache
        episode = {
            "id": ep_db.id,
            "environment_id": ep_db.environment_id,
            "instruction_text": ep_db.instruction_text,
            "language": ep_db.language,
            "parsed_instruction": {"sub_goals": []},
            "start_viewpoint_id": ep_db.start_viewpoint_id,
            "goal_viewpoint_id": ep_db.goal_viewpoint_id,
            "current_viewpoint_id": ep_db.current_viewpoint_id,
            "current_heading": ep_db.current_heading,
            "current_step": ep_db.current_step,
            "max_steps": ep_db.max_steps,
            "status": ep_db.status,
            "policy_type": "instruction_conditioned",
            "provider": None,
            "confidence": ep_db.confidence,
            "trajectory": ep_db.trajectory or [],
            "visited_vp_ids": [t["viewpoint_id"] for t in (ep_db.trajectory or [])],
            "optimal_path": ep_db.optimal_path or [],
            "history": [],
            "outcome_metrics": ep_db.outcome_metrics or {},
            "error_message": ep_db.error_message
        }
        active_episodes_cache[episode_id] = episode

    if episode["status"] in ["completed", "failed", "stopped"]:
        raise HTTPException(status_code=400, detail=f"Episode is already terminal ({episode['status']})")

    graph = get_environment_graph(episode["environment_id"])
    policy_engine = PolicyEngine(provider_type=episode.get("provider"))

    # Execute step
    step_result = await policy_engine.execute_step(
        policy_type=episode["policy_type"],
        graph=graph,
        current_viewpoint_id=episode["current_viewpoint_id"],
        current_heading=episode["current_heading"],
        goal_viewpoint_id=episode["goal_viewpoint_id"],
        instruction_data=episode["parsed_instruction"],
        visited_trajectory=episode["visited_vp_ids"],
        current_step=episode["current_step"],
        max_steps=episode["max_steps"]
    )

    # Update episode state
    episode["current_step"] += 1
    episode["current_viewpoint_id"] = step_result["next_viewpoint_id"]
    episode["current_heading"] = step_result["next_heading"]
    episode["confidence"] = step_result["confidence"]
    episode["visited_vp_ids"].append(step_result["next_viewpoint_id"])

    # Trajectory coordinates
    coords = step_result["next_coordinates"]
    episode["trajectory"].append({
        "viewpoint_id": step_result["next_viewpoint_id"],
        "x": coords["x"],
        "y": coords["y"],
        "z": coords["z"],
        "heading": step_result["next_heading"],
        "room_label": step_result["next_room"],
        "step": episode["current_step"],
        "action": step_result["selected_action"]["action_type"]
    })

    # Terminal checks
    if step_result["is_terminal"]:
        # Evaluate final benchmark metrics
        metrics = NavigationEvaluator.evaluate_episode(
            graph=graph,
            trajectory=episode["visited_vp_ids"],
            goal_viewpoint_id=episode["goal_viewpoint_id"],
            optimal_path=episode["optimal_path"]
        )
        episode["outcome_metrics"] = metrics
        episode["status"] = "completed" if metrics["is_success"] else "failed"
    elif episode["current_step"] >= episode["max_steps"]:
        metrics = NavigationEvaluator.evaluate_episode(
            graph=graph,
            trajectory=episode["visited_vp_ids"],
            goal_viewpoint_id=episode["goal_viewpoint_id"],
            optimal_path=episode["optimal_path"]
        )
        episode["outcome_metrics"] = metrics
        episode["status"] = "failed"
        step_result["is_terminal"] = True

    # Record state history
    state_record = {
        "step_index": episode["current_step"],
        "viewpoint_id": step_result["next_viewpoint_id"],
        "heading": step_result["next_heading"],
        "action": step_result["selected_action"],
        "candidate_actions": step_result["candidate_actions"],
        "confidence": step_result["confidence"],
        "uncertainty": step_result["uncertainty"],
        "rationale": step_result["rationale"],
        "latency_ms": step_result["latency_ms"]
    }
    episode["history"].append(state_record)

    # Update DB
    res = await db.execute(select(NavigationEpisode).where(NavigationEpisode.id == episode_id))
    ep_db = res.scalar_one_or_none()
    if ep_db:
        ep_db.current_viewpoint_id = episode["current_viewpoint_id"]
        ep_db.current_heading = episode["current_heading"]
        ep_db.current_step = episode["current_step"]
        ep_db.status = episode["status"]
        ep_db.confidence = episode["confidence"]
        ep_db.trajectory = episode["trajectory"]
        ep_db.outcome_metrics = episode["outcome_metrics"]
        await db.commit()

    # Broadcast step via websocket
    await ws_manager.broadcast(episode_id, {
        "event": "STEP_EXECUTED",
        "episode_id": episode_id,
        "step": episode["current_step"],
        "current_viewpoint_id": episode["current_viewpoint_id"],
        "coordinates": coords,
        "heading": episode["current_heading"],
        "action": step_result["selected_action"],
        "is_terminal": step_result["is_terminal"],
        "status": episode["status"],
        "confidence": episode["confidence"],
        "outcome_metrics": episode.get("outcome_metrics", {})
    })

    return NavigationStepResponse(
        episode_id=episode_id,
        step_index=episode["current_step"],
        current_viewpoint_id=episode["current_viewpoint_id"],
        current_coordinates=coords,
        current_heading=episode["current_heading"],
        current_room=step_result["next_room"],
        is_terminal=step_result["is_terminal"],
        status=episode["status"],
        selected_action=step_result["selected_action"],
        candidate_actions=step_result["candidate_actions"],
        confidence=step_result["confidence"],
        uncertainty=step_result["uncertainty"],
        instruction_progress={
            "current_step": episode["current_step"],
            "max_steps": episode["max_steps"]
        },
        visited_trajectory=episode["visited_vp_ids"],
        metrics_so_far=episode.get("outcome_metrics", {}),
        latency_ms=step_result["latency_ms"]
    )

@router.post("/{episode_id}/pause")
async def pause_navigation(episode_id: str, db: AsyncSession = Depends(get_db)):
    if episode_id in active_episodes_cache:
        active_episodes_cache[episode_id]["status"] = "paused"
    await ws_manager.broadcast(episode_id, {"event": "EPISODE_PAUSED", "episode_id": episode_id})
    return {"status": "ok", "episode_id": episode_id, "state": "paused"}

@router.post("/{episode_id}/resume")
async def resume_navigation(episode_id: str, db: AsyncSession = Depends(get_db)):
    if episode_id in active_episodes_cache:
        active_episodes_cache[episode_id]["status"] = "running"
    await ws_manager.broadcast(episode_id, {"event": "EPISODE_RESUMED", "episode_id": episode_id})
    return {"status": "ok", "episode_id": episode_id, "state": "running"}

@router.post("/{episode_id}/stop")
async def stop_navigation(episode_id: str, db: AsyncSession = Depends(get_db)):
    if episode_id in active_episodes_cache:
        ep = active_episodes_cache[episode_id]
        ep["status"] = "stopped"
        graph = get_environment_graph(ep["environment_id"])
        metrics = NavigationEvaluator.evaluate_episode(
            graph=graph,
            trajectory=ep["visited_vp_ids"],
            goal_viewpoint_id=ep["goal_viewpoint_id"],
            optimal_path=ep["optimal_path"]
        )
        ep["outcome_metrics"] = metrics
    await ws_manager.broadcast(episode_id, {"event": "EPISODE_STOPPED", "episode_id": episode_id})
    return {"status": "ok", "episode_id": episode_id, "state": "stopped"}

@router.post("/{episode_id}/reset")
async def reset_navigation(episode_id: str):
    if episode_id in active_episodes_cache:
        ep = active_episodes_cache[episode_id]
        graph = get_environment_graph(ep["environment_id"])
        start_vp = graph.get_viewpoint(ep["start_viewpoint_id"])
        ep["current_viewpoint_id"] = ep["start_viewpoint_id"]
        ep["current_heading"] = start_vp.get("heading", 0.0)
        ep["current_step"] = 0
        ep["status"] = "idle"
        ep["confidence"] = 1.0
        ep["visited_vp_ids"] = [ep["start_viewpoint_id"]]
        ep["trajectory"] = [{
            "viewpoint_id": ep["start_viewpoint_id"],
            "x": start_vp["x"],
            "y": start_vp["y"],
            "z": start_vp["z"],
            "heading": ep["current_heading"],
            "room_label": start_vp.get("room_label", "start"),
            "step": 0
        }]
        ep["history"] = []
        ep["outcome_metrics"] = {}
    await ws_manager.broadcast(episode_id, {"event": "EPISODE_RESET", "episode_id": episode_id})
    return {"status": "ok", "episode_id": episode_id, "state": "idle"}

@router.get("/{episode_id}/state", response_model=EpisodeStateResponse)
async def get_episode_state(episode_id: str, db: AsyncSession = Depends(get_db)):
    if episode_id in active_episodes_cache:
        return EpisodeStateResponse(**active_episodes_cache[episode_id])
    res = await db.execute(select(NavigationEpisode).where(NavigationEpisode.id == episode_id))
    ep = res.scalar_one_or_none()
    if not ep:
        raise HTTPException(status_code=404, detail="Episode not found")
    return ep

@router.get("/{episode_id}/history")
async def get_episode_history(episode_id: str):
    if episode_id in active_episodes_cache:
        return active_episodes_cache[episode_id].get("history", [])
    return []

@router.websocket("/{episode_id}/stream")
async def navigation_stream(websocket: WebSocket, episode_id: str):
    await ws_manager.connect(episode_id, websocket)
    # Send current state if available
    if episode_id in active_episodes_cache:
        await websocket.send_json({
            "event": "INITIAL_SYNC",
            "state": active_episodes_cache[episode_id]
        })
    try:
        while True:
            # Keep socket open and listen for client commands (e.g. step request)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(episode_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(episode_id, websocket)
