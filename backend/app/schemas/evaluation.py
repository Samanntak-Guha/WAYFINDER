from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict

class NavigationMetrics(BaseModel):
    success_rate: float # SR (0.0 to 1.0)
    oracle_success_rate: float # OSR (0.0 to 1.0)
    spl: float # Success weighted by Path Length (0.0 to 1.0)
    navigation_error: float # Distance to goal in meters
    path_length: float # Total trajectory length in meters
    optimal_path_length: float # Shortest path length in meters
    steps_taken: int
    optimal_steps: int
    is_success: bool
    is_oracle_success: bool

class LanguageEvaluationSummary(BaseModel):
    language: str # "en", "hi", "te"
    total_episodes: int
    success_rate: float
    spl: float
    avg_navigation_error: float
    avg_steps: float

class EvaluationResultSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    dataset_name: str
    split_name: str
    language: str
    policy_name: str
    total_episodes: int
    successful_episodes: int
    success_rate: float
    oracle_success_rate: float
    spl: float
    navigation_error: float
    average_path_length: float
    average_steps: float
    latency_avg_ms: float
    language_breakdown: Optional[List[LanguageEvaluationSummary]] = None
