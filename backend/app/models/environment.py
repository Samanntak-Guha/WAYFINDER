import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Environment(Base):
    __tablename__ = "environments"

    id = Column(String(64), primary_key=True) # e.g. "env_residence_01", "2tNkQVZXNV5" (Matterport scan ID)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="architectural_simulated") # "matterport3d", "rxr_official", "architectural_simulated"
    scene_type = Column(String(50), default="residential") # residential, commercial, museum, gallery
    floor_area = Column(Float, default=150.0) # in sq meters
    total_viewpoints = Column(Integer, default=0)
    total_edges = Column(Integer, default=0)
    metadata_json = Column(JSON, default=dict)
    preview_image_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    viewpoints = relationship("Viewpoint", back_populates="environment", cascade="all, delete-orphan")
    edges = relationship("NavigationEdge", back_populates="environment", cascade="all, delete-orphan")
    episodes = relationship("NavigationEpisode", back_populates="environment")

class Viewpoint(Base):
    __tablename__ = "viewpoints"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    environment_id = Column(String(64), ForeignKey("environments.id", ondelete="CASCADE"), nullable=False, index=True)
    viewpoint_id = Column(String(64), nullable=False, index=True) # Viewpoint key within scene
    x = Column(Float, nullable=False, default=0.0)
    y = Column(Float, nullable=False, default=0.0)
    z = Column(Float, nullable=False, default=0.0)
    heading = Column(Float, default=0.0) # Heading in radians / degrees
    elevation = Column(Float, default=0.0)
    room_label = Column(String(100), default="hallway") # e.g. "living_room", "kitchen", "corridor"
    is_navigable = Column(Boolean, default=True)
    visual_features = Column(JSON, default=dict) # landmarks, detected objects, colors, textures
    panorama_url = Column(String(512), nullable=True)

    environment = relationship("Environment", back_populates="viewpoints")

class NavigationEdge(Base):
    __tablename__ = "navigation_edges"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    environment_id = Column(String(64), ForeignKey("environments.id", ondelete="CASCADE"), nullable=False, index=True)
    from_viewpoint_id = Column(String(64), nullable=False, index=True)
    to_viewpoint_id = Column(String(64), nullable=False, index=True)
    distance = Column(Float, nullable=False, default=1.5) # Euclidean distance in meters
    heading_angle = Column(Float, default=0.0) # relative angle in degrees
    is_blocked = Column(Boolean, default=False)

    environment = relationship("Environment", back_populates="edges")
