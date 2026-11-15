from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ExperimentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    environment_id: str
    policy_type: str = "instruction_conditioned"
    model_config_id: Optional[str] = None

class ExperimentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    environment_id: str
    policy_type: str
    status: str
    summary_metrics: Dict[str, Any] = {}
    total_episodes: int = 0
    created_at: datetime
    completed_at: Optional[datetime] = None

class ModelTestRequest(BaseModel):
    provider: str # "freellmapi", "nvidia_nim", "custom_openai"
    model_id: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    prompt: Optional[str] = "Parse: Turn right at the hallway and proceed to the kitchen."

class ModelTestResponse(BaseModel):
    success: bool
    provider: str
    model_id: str
    latency_ms: float
    response_text: Optional[str] = None
    structured_output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
