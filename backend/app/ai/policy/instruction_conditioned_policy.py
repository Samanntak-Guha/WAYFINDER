import math
import logging
from typing import Dict, Any, List, Optional
from backend.app.ai.policy.base_policy import BaseNavigationPolicy
from backend.app.ai.graph.environment_graph import EnvironmentGraph
from backend.app.ai.perception.visual_encoder import VisualEncoder
from backend.app.ai.recovery.backtracking import RecoveryEngine

logger = logging.getLogger("wayfinder.policy")

class InstructionConditionedPolicy(BaseNavigationPolicy):
    """
    Instruction-conditioned Vision-and-Language Navigation policy.
    Grounds multilingual instructions and visual landmarks into sequential action scores.
    """

    def __init__(self, provider_type: Optional[str] = None):
        self.provider_type = provider_type
        self.visual_encoder = VisualEncoder()
        self.recovery_engine = RecoveryEngine()

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
        curr_vp = graph.get_viewpoint(current_viewpoint_id) or {}
        curr_room = curr_vp.get("room_label", "").lower()
        sub_goals = instruction_data.get("sub_goals", [])

        # Determine active sub-goal based on trajectory progression
        progress_idx = min(len(visited_trajectory) // 2, max(0, len(sub_goals) - 1))
        active_subgoal = sub_goals[progress_idx] if sub_goals else {
            "action_type": "MOVE_FORWARD",
            "primary_landmark": "room",
            "expected_heading_degrees": 0.0
        }

        target_landmark = active_subgoal.get("primary_landmark", "corridor")
        expected_action = active_subgoal.get("action_type", "MOVE_FORWARD")
        is_last_subgoal = (progress_idx == len(sub_goals) - 1)

        # Check for loop / oscillation trap
        is_loop = self.recovery_engine.check_loop(visited_trajectory)
        if is_loop:
            logger.info(f"Loop detected in trajectory ({visited_trajectory[-4:]}). Triggering recovery backtrack.")
            backtrack_action = self.recovery_engine.suggest_backtrack(
                visited_trajectory, available_actions, forbidden_nodes=[current_viewpoint_id]
            )
            if backtrack_action:
                return {
                    "selected_action": backtrack_action,
                    "candidate_scores": {
                        a.get("target_viewpoint_id", a["action_type"]): 0.85 if a == backtrack_action else 0.2
                        for a in available_actions
                    },
                    "rationale": f"Loop detected. Executing recovery branch to {backtrack_action.get('target_viewpoint_id')}.",
                    "is_terminal": False,
                    "active_subgoal": active_subgoal
                }

        # Check for goal proximity
        dist_to_goal = graph.euclidean_distance(current_viewpoint_id, goal_viewpoint_id)
        if (current_viewpoint_id == goal_viewpoint_id) or (dist_to_goal < 2.0 and is_last_subgoal):
            stop_action = next((a for a in available_actions if a["action_type"] == "STOP"), None)
            if not stop_action:
                stop_action = {
                    "action_type": "STOP",
                    "target_viewpoint_id": current_viewpoint_id,
                    "target_room": curr_room,
                    "distance": 0.0,
                    "relative_heading": 0.0
                }
            return {
                "selected_action": stop_action,
                "candidate_scores": {"STOP": 0.98},
                "rationale": f"Target goal reached ({dist_to_goal:.2f}m from goal {goal_viewpoint_id}). STOP issued.",
                "is_terminal": True,
                "active_subgoal": active_subgoal
            }

        # Score candidate actions
        candidate_scores: Dict[str, float] = {}
        for action in available_actions:
            action_type = action["action_type"]
            target_vp_id = action.get("target_viewpoint_id", current_viewpoint_id)

            if action_type == "STOP":
                # Only reward STOP if at target room or close to destination
                if is_last_subgoal and (target_landmark in curr_room or dist_to_goal < 3.0):
                    score = 0.85
                else:
                    score = 0.05
                candidate_scores[action_type] = round(score, 3)
                continue

            # 1. Directional alignment score
            rel_heading = action.get("relative_heading", 0.0)
            if expected_action == "TURN_LEFT":
                dir_score = 0.9 if rel_heading < -25.0 else (0.4 if rel_heading < 0 else 0.1)
            elif expected_action == "TURN_RIGHT":
                dir_score = 0.9 if rel_heading > 25.0 else (0.4 if rel_heading > 0 else 0.1)
            else: # MOVE_FORWARD
                dir_score = max(0.1, 1.0 - (abs(rel_heading) / 120.0))

            # 2. Visual landmark grounding score
            target_features = action.get("target_features", {})
            v_score = self.visual_encoder.compute_landmark_alignment(target_landmark, target_features)

            # 3. Goal distance potential
            cand_dist_to_goal = graph.euclidean_distance(target_vp_id, goal_viewpoint_id)
            goal_dist_score = max(0.1, 1.0 - (cand_dist_to_goal / 25.0))

            # 4. Loop penalty
            visit_count = visited_trajectory.count(target_vp_id)
            loop_factor = 1.0 if visit_count == 0 else (0.35 if visit_count == 1 else 0.05)

            # Composite policy score
            composite = (
                0.35 * dir_score +
                0.35 * v_score +
                0.15 * goal_dist_score +
                0.15 * loop_factor
            )
            candidate_scores[target_vp_id] = round(min(0.99, max(0.05, composite)), 3)

        # Select highest scoring action
        best_action = None
        best_score = -1.0
        for action in available_actions:
            key = action["action_type"] if action["action_type"] == "STOP" else action.get("target_viewpoint_id", "")
            sc = candidate_scores.get(key, 0.0)
            if sc > best_score:
                best_score = sc
                best_action = action

        if not best_action:
            best_action = available_actions[0]

        is_term = (best_action["action_type"] == "STOP")
        rationale = (
            f"Step {progress_idx + 1}/{len(sub_goals)}: Target '{target_landmark}'. "
            f"Action '{best_action['action_type']}' toward {best_action.get('target_room', 'corridor')} "
            f"selected with score {best_score:.2f}."
        )

        return {
            "selected_action": best_action,
            "candidate_scores": candidate_scores,
            "rationale": rationale,
            "is_terminal": is_term,
            "active_subgoal": active_subgoal
        }
