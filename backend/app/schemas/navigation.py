from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CandidateAction(BaseModel):
    action_type: str # "MOVE_FORWARD", "TURN_LEFT", "TURN_RIGHT", "STOP"
    target_viewpoint_id: Optional[str] = None
    target_room: Optional[str] = None
    distance: float = 0.0
    relative_heading: float = 0.0
    score: float = 0.0
    rationale: Optional[str] = None

class UncertaintyFactors(BaseModel):
    action_margin: float = 0.0 # Score diff between top 2 actions
    landmark_alignment: float = 0.0 # Visual-language landmark score
    instruction_ambiguity: float = 0.0 # Lexical / structural ambiguity
    loop_penalty: float = 0.0 # Penalty if visiting known cycle
    composite_confidence: float = 1.0 # Calibrated confidence [0, 1]

class StartNavigationRequest(BaseModel):
    environment_id: str
    start_viewpoint_id: str
    goal_viewpoint_id: str
    instruction_text: str
    language: str = "en" # "en", "hi", "te"
    policy_type: str = "instruction_conditioned" # "instruction_conditioned", "shortest_path_baseline"
    model_id: Optional[str] = None
    provider: Optional[str] = None
    max_steps: int = 25
    experiment_id: Optional[str] = None

class NavigationStepResponse(BaseModel):
    episode_id: str
    step_index: int
    current_viewpoint_id: str
    current_coordinates: Dict[str, float] # {x, y, z}
    current_heading: float
    current_room: str
    is_terminal: bool
    status: str # "running", "completed", "failed", "stopped"
    selected_action: CandidateAction
    candidate_actions: List[CandidateAction]
    confidence: float
    uncertainty: UncertaintyFactors
    instruction_progress: Dict[str, Any]
    visited_trajectory: List[str] # List of viewpoint IDs
    metrics_so_far: Dict[str, float]
    latency_ms: float

class EpisodeStateResponse(BaseModel):
    id: str
    environment_id: str
    instruction_text: str
    language: str
    start_viewpoint_id: str
    goal_viewpoint_id: str
    current_viewpoint_id: str
    current_heading: float
    current_step: int
    max_steps: int
    status: str
    confidence: float
    trajectory: List[Dict[str, Any]]
    optimal_path: List[str]
    outcome_metrics: Dict[str, Any]
    error_message: Optional[str] = None
