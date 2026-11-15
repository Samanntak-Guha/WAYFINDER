import math
from typing import Dict, Any, List, Optional, Tuple
import networkx as nx

class EnvironmentGraph:
    """NetworkX-based representation of Matterport3D / RxR viewpoint connectivity."""

    def __init__(self, environment_id: str):
        self.environment_id = environment_id
        self.graph = nx.Graph()

    def add_viewpoint(
        self,
        viewpoint_id: str,
        x: float,
        y: float,
        z: float,
        heading: float = 0.0,
        room_label: str = "hallway",
        visual_features: Optional[Dict[str, Any]] = None,
        is_navigable: bool = True
    ):
        self.graph.add_node(
            viewpoint_id,
            x=x,
            y=y,
            z=z,
            heading=heading,
            room_label=room_label,
            visual_features=visual_features or {},
            is_navigable=is_navigable
        )

    def add_edge(
        self,
        u: str,
        v: str,
        distance: Optional[float] = None,
        heading_angle: Optional[float] = None,
        is_blocked: bool = False
    ):
        if not self.graph.has_node(u) or not self.graph.has_node(v):
            return

        pos_u = (self.graph.nodes[u]["x"], self.graph.nodes[u]["y"], self.graph.nodes[u]["z"])
        pos_v = (self.graph.nodes[v]["x"], self.graph.nodes[v]["y"], self.graph.nodes[v]["z"])

        if distance is None:
            distance = math.sqrt(
                (pos_u[0] - pos_v[0]) ** 2 +
                (pos_u[1] - pos_v[1]) ** 2 +
                (pos_u[2] - pos_v[2]) ** 2
            )

        if heading_angle is None:
            dx = pos_v[0] - pos_u[0]
            dz = pos_v[2] - pos_u[2]
            heading_angle = math.degrees(math.atan2(dx, dz)) % 360.0

        self.graph.add_edge(
            u, v,
            weight=distance,
            distance=distance,
            heading_angle=heading_angle,
            is_blocked=is_blocked
        )

    def get_viewpoint(self, viewpoint_id: str) -> Optional[Dict[str, Any]]:
        if not self.graph.has_node(viewpoint_id):
            return None
        data = self.graph.nodes[viewpoint_id].copy()
        data["viewpoint_id"] = viewpoint_id
        return data

    def get_candidate_actions(
        self,
        current_viewpoint_id: str,
        current_heading: float = 0.0
    ) -> List[Dict[str, Any]]:
        """Compute all navigable neighbors with relative headings and distance."""
        actions: List[Dict[str, Any]] = []
        if not self.graph.has_node(current_viewpoint_id):
            return actions

        node_data = self.graph.nodes[current_viewpoint_id]
        curr_x, curr_y, curr_z = node_data["x"], node_data["y"], node_data["z"]

        for neighbor_id in self.graph.neighbors(current_viewpoint_id):
            edge_data = self.graph.get_edge_data(current_viewpoint_id, neighbor_id)
            if edge_data.get("is_blocked", False):
                continue

            nbr_data = self.graph.nodes[neighbor_id]
            if not nbr_data.get("is_navigable", True):
                continue

            dist = edge_data.get("distance", 1.5)
            # Calculate angle from current position to neighbor
            dx = nbr_data["x"] - curr_x
            dz = nbr_data["z"] - curr_z
            target_angle = math.degrees(math.atan2(dx, dz)) % 360.0
            relative_heading = (target_angle - current_heading + 180.0) % 360.0 - 180.0 # [-180, 180]

            # Categorize action primitive
            if abs(relative_heading) <= 45.0:
                action_type = "MOVE_FORWARD"
            elif relative_heading < -45.0:
                action_type = "TURN_LEFT"
            else:
                action_type = "TURN_RIGHT"

            actions.append({
                "action_type": action_type,
                "target_viewpoint_id": neighbor_id,
                "target_room": nbr_data.get("room_label", "hallway"),
                "distance": round(dist, 2),
                "relative_heading": round(relative_heading, 1),
                "target_coordinates": {
                    "x": nbr_data["x"],
                    "y": nbr_data["y"],
                    "z": nbr_data["z"]
                },
                "target_features": nbr_data.get("visual_features", {})
            })

        # STOP action is always physically candidate
        actions.append({
            "action_type": "STOP",
            "target_viewpoint_id": current_viewpoint_id,
            "target_room": node_data.get("room_label", "current_location"),
            "distance": 0.0,
            "relative_heading": 0.0,
            "target_coordinates": {"x": curr_x, "y": curr_y, "z": curr_z},
            "target_features": node_data.get("visual_features", {})
        })

        return actions

    def euclidean_distance(self, u: str, v: str) -> float:
        if not self.graph.has_node(u) or not self.graph.has_node(v):
            return 999.0
        n1 = self.graph.nodes[u]
        n2 = self.graph.nodes[v]
        return math.sqrt(
            (n1["x"] - n2["x"]) ** 2 +
            (n1["y"] - n2["y"]) ** 2 +
            (n1["z"] - n2["z"]) ** 2
        )

    def shortest_path(self, source: str, target: str) -> List[str]:
        try:
            return nx.shortest_path(self.graph, source=source, target=target, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

    def shortest_path_length(self, source: str, target: str) -> float:
        try:
            return nx.shortest_path_length(self.graph, source=source, target=target, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return 999.0

    def to_dict(self) -> Dict[str, Any]:
        """Export graph format for serialization and frontend 3D rendering."""
        nodes = []
        for n, d in self.graph.nodes(data=True):
            nodes.append({
                "viewpoint_id": n,
                "x": d["x"],
                "y": d["y"],
                "z": d["z"],
                "heading": d.get("heading", 0.0),
                "room_label": d.get("room_label", "room"),
                "is_navigable": d.get("is_navigable", True),
                "visual_features": d.get("visual_features", {})
            })
        edges = []
        for u, v, d in self.graph.edges(data=True):
            edges.append({
                "from_viewpoint_id": u,
                "to_viewpoint_id": v,
                "distance": d.get("distance", 1.5),
                "heading_angle": d.get("heading_angle", 0.0),
                "is_blocked": d.get("is_blocked", False)
            })
        return {
            "environment_id": self.environment_id,
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges)
        }
