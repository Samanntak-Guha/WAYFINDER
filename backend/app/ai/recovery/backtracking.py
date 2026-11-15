from typing import List, Dict, Any, Optional

class RecoveryEngine:
    """Detects navigation loops, stagnation, dead-ends, and triggers backtracking or replanning."""

    def __init__(self, loop_threshold: int = 2):
        self.loop_threshold = loop_threshold

    def check_loop(self, trajectory: List[str]) -> bool:
        """Detect if agent is trapped in an oscillating loop (e.g. A -> B -> A -> B)."""
        if len(trajectory) < 4:
            return False
        # Check 2-step oscillation: [..., A, B, A, B]
        if trajectory[-1] == trajectory[-3] and trajectory[-2] == trajectory[-4]:
            return True
        # Check repeated visits to same node
        if trajectory.count(trajectory[-1]) > self.loop_threshold:
            return True
        return False

    def suggest_backtrack(
        self,
        trajectory: List[str],
        available_actions: List[Dict[str, Any]],
        forbidden_nodes: Optional[List[str]] = None
    ) -> Optional[Dict[str, Any]]:
        """Find an unvisited or previously unexplored candidate branch from the trajectory."""
        forbidden = set(forbidden_nodes or [])
        # Find candidate that is NOT in forbidden set and has least visit count
        candidates = [
            a for a in available_actions
            if a["action_type"] != "STOP" and a.get("target_viewpoint_id") not in forbidden
        ]
        if not candidates:
            return None

        # Sort by fewest visits in trajectory
        candidates.sort(key=lambda a: trajectory.count(a.get("target_viewpoint_id", "")))
        return candidates[0]
