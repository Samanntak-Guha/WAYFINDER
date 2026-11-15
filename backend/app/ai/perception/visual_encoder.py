import math
from typing import Dict, Any, List

class VisualEncoder:
    """Encodes visual observations from viewpoints and computes multimodal visual-landmark alignment."""

    def __init__(self):
        pass

    def compute_landmark_alignment(
        self,
        target_landmark: str,
        viewpoint_features: Dict[str, Any]
    ) -> float:
        """Compute cosine/semantic similarity between target landmark and viewpoint visual detections."""
        if not target_landmark:
            return 0.5

        detected_objects = viewpoint_features.get("detected_objects", [])
        room_label = viewpoint_features.get("room_label", "").lower()

        # Direct room label match
        if target_landmark.lower() in room_label or room_label in target_landmark.lower():
            return 0.95

        # Landmark in detected objects list
        for obj in detected_objects:
            obj_name = obj.get("name", "").lower() if isinstance(obj, dict) else str(obj).lower()
            if target_landmark.lower() in obj_name or obj_name in target_landmark.lower():
                conf = obj.get("confidence", 0.9) if isinstance(obj, dict) else 0.85
                return float(conf)

        # Partial semantic category overlaps
        semantic_map = {
            "kitchen": ["counter", "sink", "refrigerator", "oven", "dining_table", "cabinets"],
            "living_room": ["sofa", "couch", "television", "coffee_table", "armchair", "carpet"],
            "bedroom": ["bed", "wardrobe", "nightstand", "lamp"],
            "hallway": ["corridor", "door", "archway", "wall_art"],
            "bathroom": ["toilet", "sink", "mirror", "bathtub", "shower"]
        }

        related_terms = semantic_map.get(target_landmark.lower(), [])
        for obj in detected_objects:
            obj_name = obj.get("name", "").lower() if isinstance(obj, dict) else str(obj).lower()
            if any(term in obj_name for term in related_terms):
                return 0.80

        return 0.35

    def get_viewpoint_observation_summary(self, viewpoint_data: Dict[str, Any]) -> str:
        """Produce scientific summary of current visual observation."""
        room = viewpoint_data.get("room_label", "unknown")
        detected = viewpoint_data.get("visual_features", {}).get("detected_objects", [])
        obj_names = [o.get("name", str(o)) if isinstance(o, dict) else str(o) for o in detected]
        summary = f"Room: {room}. Salient visual objects: {', '.join(obj_names) if obj_names else 'open pathway, walls, flooring'}."
        return summary
