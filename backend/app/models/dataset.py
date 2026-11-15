import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(64), primary_key=True) # e.g. "rxr_benchmark", "wayfinder_standard", "matterport3d_scans"
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(50), default="1.0.0")
    total_instructions = Column(Integer, default=0)
    total_environments = Column(Integer, default=0)
    languages = Column(JSON, default=list) # ["en", "hi", "te"]
    license = Column(String(100), default="Research Only")
    local_path = Column(String(512), nullable=True)
    is_available = Column(Boolean, default=True) # True if verified accessible on disk
    created_at = Column(DateTime, default=datetime.utcnow)

    splits = relationship("DatasetSplit", back_populates="dataset", cascade="all, delete-orphan")
    instructions = relationship("NavigationInstruction", back_populates="dataset", cascade="all, delete-orphan")

class DatasetSplit(Base):
    __tablename__ = "dataset_splits"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    split_name = Column(String(50), nullable=False) # "val_seen", "val_unseen", "train", "test"
    language = Column(String(10), nullable=False) # "en", "hi", "te"
    instruction_count = Column(Integer, default=0)

    dataset = relationship("Dataset", back_populates="splits")

class NavigationInstruction(Base):
    __tablename__ = "navigation_instructions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    environment_id = Column(String(64), nullable=False, index=True)
    split_name = Column(String(50), default="val_unseen")
    instruction_text = Column(Text, nullable=False)
    language = Column(String(10), default="en") # "en", "hi", "te"
    ground_truth_path = Column(JSON, default=list) # list of viewpoint IDs [v0, v1, v2, ...]
    extracted_landmarks = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="instructions")
