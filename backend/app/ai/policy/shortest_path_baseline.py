from typing import Dict, Any, List
from backend.app.ai.policy.base_policy import BaseNavigationPolicy
from backend.app.ai.graph.environment_graph import EnvironmentGraph

class ShortestPathBaselinePolicy(BaseNavigationPolicy):
    """
    Oracle / Heuristic shortest-path graph baseline.
    Uses Dijkstra on the environment graph to navigate directly along the optimal route.
    """

    async def select_action(
        self,
        current_viewpoint_id: str,
        current_heading: float,
        goal_viewpoint_id: str,
        instruction_data: Dict[str, Any],
        available_actions: List[Dict[str, Any]],
        graph: EnvironmentGraph,
        visited_trajectory: List[str]
    ) -> Dict[str, Any]:
        # If at goal or within stopping threshold
        dist_to_goal = graph.euclidean_distance(current_viewpoint_id, goal_viewpoint_id)
        if current_viewpoint_id == goal_viewpoint_id or dist_to_goal < 1.0:
            stop_action = next((a for a in available_actions if a["action_type"] == "STOP"), None)
            if not stop_action:
                stop_action = {
                    "action_type": "STOP",
                    "target_viewpoint_id": current_viewpoint_id,
                    "target_room": "goal",
                    "distance": 0.0,
                    "relative_heading": 0.0
                }
            return {
                "selected_action": stop_action,
                "candidate_scores": {stop_action["action_type"]: 1.0},
                "rationale": f"Goal viewpoint {goal_viewpoint_id} reached (distance {dist_to_goal:.2f}m). Issued STOP.",
                "is_terminal": True
            }

        # Compute shortest path from current to goal
        path = graph.shortest_path(current_viewpoint_id, goal_viewpoint_id)
        if len(path) >= 2:
            next_hop = path[1]
            # Match action in available_actions
            matching_action = next(
                (a for a in available_actions if a.get("target_viewpoint_id") == next_hop),
                None
            )
            if matching_action:
                return {
                    "selected_action": matching_action,
                    "candidate_scores": {
                        a.get("target_viewpoint_id", a["action_type"]): 0.95 if a == matching_action else 0.1
                        for a in available_actions
                    },
                    "rationale": f"Dijkstra graph shortest path next hop: {next_hop} towards goal {goal_viewpoint_id}.",
                    "is_terminal": False
                }

        # Fallback if no path found
        move_actions = [a for a in available_actions if a["action_type"] != "STOP"]
        if move_actions:
            # Pick neighbor closest to goal
            move_actions.sort(key=lambda a: graph.euclidean_distance(a.get("target_viewpoint_id", ""), goal_viewpoint_id))
            chosen = move_actions[0]
            return {
                "selected_action": chosen,
                "candidate_scores": {a.get("target_viewpoint_id", a["action_type"]): 0.6 for a in available_actions},
                "rationale": f"Greedy euclidean distance minimizing hop towards goal {goal_viewpoint_id}.",
                "is_terminal": False
            }

        stop_action = next(a for a in available_actions if a["action_type"] == "STOP")
        return {
            "selected_action": stop_action,
            "candidate_scores": {"STOP": 1.0},
            "rationale": "No navigable edges remaining; halting.",
            "is_terminal": True
        }
