from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ViewpointSchema(BaseModel):
    id: str
    viewpoint_id: str
    x: float
    y: float
    z: float
    heading: float = 0.0
    elevation: float = 0.0
    room_label: str
    is_navigable: bool = True
    visual_features: Dict[str, Any] = {}
    panorama_url: Optional[str] = None

class NavigationEdgeSchema(BaseModel):
    id: str
    from_viewpoint_id: str
    to_viewpoint_id: str
    distance: float
    heading_angle: float
    is_blocked: bool = False

class EnvironmentSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str # "matterport3d", "rxr_official", "architectural_simulated"
    scene_type: str
    floor_area: float
    total_viewpoints: int
    total_edges: int
    preview_image_url: Optional[str] = None
    metadata_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class EnvironmentDetailSchema(EnvironmentSchema):
    viewpoints: List[ViewpointSchema] = []
    edges: List[NavigationEdgeSchema] = []
