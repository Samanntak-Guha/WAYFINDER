import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from backend.app.core.database import get_db
from backend.app.models.experiment import Experiment, NavigationEpisode, EvaluationResult
from backend.app.schemas.experiment import ExperimentCreate, ExperimentResponse
from backend.app.ai.providers.factory import get_llm_provider
from backend.app.environments.rxr_dataset_adapter import RxRDatasetAdapter

router = APIRouter(prefix="/experiments", tags=["Experiments"])
rxr_adapter = RxRDatasetAdapter()

@router.get("", response_model=List[ExperimentResponse])
async def list_experiments(
    environment_id: Optional[str] = Query(None),
    policy_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Experiment).order_by(Experiment.created_at.desc())
    if environment_id:
        query = query.where(Experiment.environment_id == environment_id)
    if policy_type:
        query = query.where(Experiment.policy_type == policy_type)

    res = await db.execute(query)
    exps = res.scalars().all()
    results = []
    for exp in exps:
        # Count episodes
        ep_count_res = await db.execute(
            select(func.count(NavigationEpisode.id)).where(NavigationEpisode.experiment_id == exp.id)
        )
        total_eps = ep_count_res.scalar() or 0
        results.append(
            ExperimentResponse(
                id=exp.id,
                name=exp.name,
                description=exp.description,
                environment_id=exp.environment_id,
                policy_type=exp.policy_type,
                status=exp.status,
                summary_metrics=exp.summary_metrics or {},
                total_episodes=total_eps,
                created_at=exp.created_at,
                completed_at=exp.completed_at
            )
        )
    return results

@router.post("", response_model=ExperimentResponse)
async def create_experiment(
    req: ExperimentCreate,
    db: AsyncSession = Depends(get_db)
):
    exp_id = str(uuid.uuid4())
    exp = Experiment(
        id=exp_id,
        name=req.name,
        description=req.description,
        environment_id=req.environment_id,
        policy_type=req.policy_type,
        model_config_id=req.model_config_id,
        status="in_progress"
    )
    db.add(exp)
    await db.commit()
    await db.refresh(exp)

    return ExperimentResponse(
        id=exp.id,
        name=exp.name,
        description=exp.description,
        environment_id=exp.environment_id,
        policy_type=exp.policy_type,
        status=exp.status,
        summary_metrics={},
        total_episodes=0,
        created_at=exp.created_at
    )

@router.get("/dashboard/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """Return actual metrics retrieved from backend DB for the research dashboard."""
    # Total experiments
    exp_res = await db.execute(select(func.count(Experiment.id)))
    total_experiments = exp_res.scalar() or 0

    # Total episodes
    ep_res = await db.execute(select(func.count(NavigationEpisode.id)))
    total_episodes = ep_res.scalar() or 0

    # Successful episodes
    success_res = await db.execute(
        select(func.count(NavigationEpisode.id)).where(NavigationEpisode.status == "completed")
    )
    successful_episodes = success_res.scalar() or 0

    # Recent episodes for metric calculation
    recent_res = await db.execute(
        select(NavigationEpisode).order_by(NavigationEpisode.created_at.desc()).limit(20)
    )
    recent_episodes = recent_res.scalars().all()

    spl_values = []
    step_values = []
    recent_activity = []

    for ep in recent_episodes:
        recent_activity.append({
            "id": ep.id,
            "environment_id": ep.environment_id,
            "instruction": ep.instruction_text[:70] + "..." if len(ep.instruction_text) > 70 else ep.instruction_text,
            "language": ep.language,
            "status": ep.status,
            "confidence": ep.confidence,
            "created_at": ep.created_at.isoformat() if ep.created_at else None
        })
        if ep.outcome_metrics and "spl" in ep.outcome_metrics:
            spl_values.append(ep.outcome_metrics["spl"])
        if ep.current_step > 0:
            step_values.append(ep.current_step)

    avg_spl = round(sum(spl_values) / len(spl_values), 4) if spl_values else 0.0
    avg_steps = round(sum(step_values) / len(step_values), 1) if step_values else 0.0
    success_rate = round(successful_episodes / total_episodes, 4) if total_episodes > 0 else 0.0

    # AI Model status
    provider = get_llm_provider()
    try:
        health_report = await provider.test_connection()
        ai_status = health_report.get("status", "ready")
    except Exception:
        ai_status = "offline"

    # Datasets
    datasets = rxr_adapter.get_registered_datasets()

    return {
        "total_experiments": total_experiments,
        "total_episodes": total_episodes,
        "successful_episodes": successful_episodes,
        "success_rate": success_rate,
        "average_spl": avg_spl,
        "average_steps": avg_steps,
        "ai_model_status": ai_status,
        "datasets_available": len(datasets),
        "recent_activity": recent_activity
    }

@router.get("/{experiment_id}")
async def get_experiment_detail(
    experiment_id: str,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Experiment).where(Experiment.id == experiment_id))
    exp = res.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    # Fetch episodes
    ep_res = await db.execute(
        select(NavigationEpisode).where(NavigationEpisode.experiment_id == experiment_id)
    )
    episodes = ep_res.scalars().all()

    return {
        "id": exp.id,
        "name": exp.name,
        "description": exp.description,
        "environment_id": exp.environment_id,
        "policy_type": exp.policy_type,
        "status": exp.status,
        "summary_metrics": exp.summary_metrics or {},
        "created_at": exp.created_at,
        "completed_at": exp.completed_at,
        "episodes": [
            {
                "id": ep.id,
                "start_viewpoint_id": ep.start_viewpoint_id,
                "goal_viewpoint_id": ep.goal_viewpoint_id,
                "instruction": ep.instruction_text,
                "language": ep.language,
                "status": ep.status,
                "steps": ep.current_step,
                "metrics": ep.outcome_metrics,
                "trajectory_length": len(ep.trajectory or [])
            }
            for ep in episodes
        ]
    }
