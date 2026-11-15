import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class ModelConfiguration(Base):
    __tablename__ = "model_configurations"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    provider = Column(String(50), default="freellmapi") # "nvidia_nim", "freellmapi", "custom_openai"
    model_id = Column(String(100), nullable=False)
    vision_model_id = Column(String(100), nullable=True)
    temperature = Column(Float, default=0.2)
    max_tokens = Column(Integer, default=512)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiments = relationship("Experiment", back_populates="model_config")

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    environment_id = Column(String(64), ForeignKey("environments.id"), nullable=False)
    model_config_id = Column(String(64), ForeignKey("model_configurations.id"), nullable=True)
    policy_type = Column(String(50), default="instruction_conditioned") # "instruction_conditioned", "shortest_path_baseline"
    status = Column(String(50), default="in_progress") # "in_progress", "completed", "failed", "aborted"
    summary_metrics = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="experiments")
    model_config = relationship("ModelConfiguration", back_populates="experiments")
    episodes = relationship("NavigationEpisode", back_populates="experiment", cascade="all, delete-orphan")
    evaluations = relationship("EvaluationResult", back_populates="experiment", cascade="all, delete-orphan")

class NavigationEpisode(Base):
    __tablename__ = "navigation_episodes"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(64), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=True)
    environment_id = Column(String(64), ForeignKey("environments.id"), nullable=False)
    instruction_id = Column(String(64), ForeignKey("navigation_instructions.id"), nullable=True)
    instruction_text = Column(Text, nullable=False)
    language = Column(String(10), default="en") # "en", "hi", "te"
    start_viewpoint_id = Column(String(64), nullable=False)
    goal_viewpoint_id = Column(String(64), nullable=False)
    current_viewpoint_id = Column(String(64), nullable=False)
    current_heading = Column(Float, default=0.0)
    current_step = Column(Integer, default=0)
    max_steps = Column(Integer, default=25)
    status = Column(String(50), default="idle") # "idle", "running", "paused", "completed", "failed", "stopped"
    confidence = Column(Float, default=1.0)
    trajectory = Column(JSON, default=list) # List of visited viewpoint IDs with coordinates
    optimal_path = Column(JSON, default=list) # Ground truth or Dijkstra optimal path
    outcome_metrics = Column(JSON, default=dict) # SR, SPL, Navigation Error, Path Length, Steps
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="episodes")
    environment = relationship("Environment", back_populates="episodes")
    states = relationship("AgentState", back_populates="episode", cascade="all, delete-orphan")

class AgentState(Base):
    __tablename__ = "agent_states"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    episode_id = Column(String(64), ForeignKey("navigation_episodes.id", ondelete="CASCADE"), nullable=False, index=True)
    step_index = Column(Integer, nullable=False)
    viewpoint_id = Column(String(64), nullable=False)
    heading = Column(Float, default=0.0)
    available_actions = Column(JSON, default=list) # List of candidate action dicts
    chosen_action = Column(JSON, default=dict) # The action selected
    confidence = Column(Float, default=1.0)
    uncertainty_breakdown = Column(JSON, default=dict) # factors contributing to uncertainty
    rationale = Column(Text, nullable=True) # Explanation / grounding
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    episode = relationship("NavigationEpisode", back_populates="states")

class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(64), ForeignKey("experiments.id", ondelete="CASCADE"), nullable=True)
    dataset_name = Column(String(100), default="rxr_benchmark")
    split_name = Column(String(50), default="val_unseen")
    language = Column(String(10), default="all") # "all", "en", "hi", "te"
    policy_name = Column(String(100), default="instruction_conditioned")
    total_episodes = Column(Integer, default=0)
    successful_episodes = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0) # SR (0.0 - 1.0)
    oracle_success_rate = Column(Float, default=0.0) # OSR (0.0 - 1.0)
    spl = Column(Float, default=0.0) # Success weighted by Path Length (0.0 - 1.0)
    navigation_error = Column(Float, default=0.0) # Average distance to goal in meters
    average_path_length = Column(Float, default=0.0) # Average meters traveled
    average_steps = Column(Float, default=0.0)
    latency_avg_ms = Column(Float, default=0.0)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="evaluations")

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    level = Column(String(20), default="INFO")
    source = Column(String(100), default="backend")
    message = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
