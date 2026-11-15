import math
from typing import List, Dict, Any, Optional
from backend.app.ai.graph.environment_graph import EnvironmentGraph

class NavigationEvaluator:
    """
    Standard Vision-and-Language Navigation (VLN / RxR) Benchmark Evaluator.
    Calculates Success Rate (SR), Oracle Success Rate (OSR), SPL, Navigation Error (NE), and Path Length.
    """

    SUCCESS_THRESHOLD_METERS = 3.0

    @classmethod
    def evaluate_episode(
        cls,
        graph: EnvironmentGraph,
        trajectory: List[str],
        goal_viewpoint_id: str,
        optimal_path: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate a single completed navigation episode.
        trajectory: list of viewpoint IDs visited [v_start, v_1, ..., v_final]
        goal_viewpoint_id: target destination viewpoint ID
        """
        if not trajectory:
            return {
                "is_success": False,
                "is_oracle_success": False,
                "navigation_error": 999.0,
                "path_length": 0.0,
                "optimal_path_length": 0.0,
                "spl": 0.0,
                "steps": 0,
                "optimal_steps": 0
            }

        start_vp = trajectory[0]
        final_vp = trajectory[-1]

        # 1. Navigation Error (NE): Euclidean distance from final viewpoint to goal
        nav_error = graph.euclidean_distance(final_vp, goal_viewpoint_id)

        # 2. Success: NE <= 3.0 meters
        is_success = bool(nav_error <= cls.SUCCESS_THRESHOLD_METERS)

        # 3. Oracle Success: min distance to goal over entire trajectory <= 3.0 meters
        min_dist_to_goal = min(graph.euclidean_distance(vp, goal_viewpoint_id) for vp in trajectory)
        is_oracle_success = bool(min_dist_to_goal <= cls.SUCCESS_THRESHOLD_METERS)

        # 4. Actual Path Length: sum of edge lengths traversed along trajectory
        path_length = 0.0
        for i in range(len(trajectory) - 1):
            u, v = trajectory[i], trajectory[i + 1]
            dist = graph.euclidean_distance(u, v)
            path_length += dist

        # 5. Optimal Path Length: shortest path from start to goal
        if not optimal_path:
            optimal_path = graph.shortest_path(start_vp, goal_viewpoint_id)

        optimal_path_length = 0.0
        if len(optimal_path) >= 2:
            for i in range(len(optimal_path) - 1):
                optimal_path_length += graph.euclidean_distance(optimal_path[i], optimal_path[i + 1])
        elif len(optimal_path) == 1:
            optimal_path_length = 0.0
        else:
            optimal_path_length = graph.euclidean_distance(start_vp, goal_viewpoint_id)

        # 6. SPL (Success weighted by Path Length): S * (L_opt / max(L_act, L_opt))
        if is_success:
            spl = optimal_path_length / max(path_length, optimal_path_length, 1e-4)
            spl = min(1.0, max(0.0, spl))
        else:
            spl = 0.0

        steps_taken = max(0, len(trajectory) - 1)
        optimal_steps = max(0, len(optimal_path) - 1)

        return {
            "is_success": is_success,
            "is_oracle_success": is_oracle_success,
            "navigation_error": round(nav_error, 2),
            "min_distance_to_goal": round(min_dist_to_goal, 2),
            "path_length": round(path_length, 2),
            "optimal_path_length": round(optimal_path_length, 2),
            "spl": round(spl, 4),
            "steps": steps_taken,
            "optimal_steps": optimal_steps
        }

    @classmethod
    def aggregate_metrics(cls, episode_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate episode metrics into benchmark summary."""
        n = len(episode_results)
        if n == 0:
            return {
                "total_episodes": 0,
                "successful_episodes": 0,
                "success_rate": 0.0,
                "oracle_success_rate": 0.0,
                "spl": 0.0,
                "average_navigation_error": 0.0,
                "average_path_length": 0.0,
                "average_steps": 0.0
            }

        successes = sum(1 for e in episode_results if e.get("is_success", False))
        oracle_successes = sum(1 for e in episode_results if e.get("is_oracle_success", False))
        spl_sum = sum(e.get("spl", 0.0) for e in episode_results)
        ne_sum = sum(e.get("navigation_error", 0.0) for e in episode_results)
        pl_sum = sum(e.get("path_length", 0.0) for e in episode_results)
        steps_sum = sum(e.get("steps", 0) for e in episode_results)

        return {
            "total_episodes": n,
            "successful_episodes": successes,
            "success_rate": round(successes / n, 4),
            "oracle_success_rate": round(oracle_successes / n, 4),
            "spl": round(spl_sum / n, 4),
            "average_navigation_error": round(ne_sum / n, 2),
            "average_path_length": round(pl_sum / n, 2),
            "average_steps": round(steps_sum / n, 1)
        }
