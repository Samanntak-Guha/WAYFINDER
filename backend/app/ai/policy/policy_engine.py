import time
from typing import Dict, Any, List, Optional
from backend.app.ai.graph.environment_graph import EnvironmentGraph
from backend.app.ai.policy.shortest_path_baseline import ShortestPathBaselinePolicy
from backend.app.ai.policy.instruction_conditioned_policy import InstructionConditionedPolicy
from backend.app.ai.uncertainty.estimator import UncertaintyEstimator

class PolicyEngine:
    """Orchestrates navigation decision loop step execution and state updates."""

    def __init__(self, provider_type: Optional[str] = None):
        self.provider_type = provider_type
        self.baseline_policy = ShortestPathBaselinePolicy()
        self.instruction_policy = InstructionConditionedPolicy(provider_type=provider_type)
        self.uncertainty_estimator = UncertaintyEstimator()

    async def execute_step(
        self,
        policy_type: str,
        graph: EnvironmentGraph,
        current_viewpoint_id: str,
        current_heading: float,
        goal_viewpoint_id: str,
        instruction_data: Dict[str, Any],
        visited_trajectory: List[str],
        current_step: int,
        max_steps: int = 25
    ) -> Dict[str, Any]:
        start_time = time.time()

        # 1. Fetch available physical actions from environment graph
        available_actions = graph.get_candidate_actions(current_viewpoint_id, current_heading)

        # 2. Select policy
        if policy_type == "shortest_path_baseline":
            decision = await self.baseline_policy.select_action(
                current_viewpoint_id=current_viewpoint_id,
                current_heading=current_heading,
                goal_viewpoint_id=goal_viewpoint_id,
                instruction_data=instruction_data,
                available_actions=available_actions,
                graph=graph,
                visited_trajectory=visited_trajectory
            )
        else:
            decision = await self.instruction_policy.select_action(
                current_viewpoint_id=current_viewpoint_id,
                current_heading=current_heading,
                goal_viewpoint_id=goal_viewpoint_id,
                instruction_data=instruction_data,
                available_actions=available_actions,
                graph=graph,
                visited_trajectory=visited_trajectory
            )

        selected_action = decision["selected_action"]
        candidate_scores_dict = decision["candidate_scores"]
        scores_list = list(candidate_scores_dict.values())

        # 3. Estimate calibrated uncertainty
        chosen_target_vp = selected_action.get("target_viewpoint_id", current_viewpoint_id)
        # Visual alignment factor
        v_align = selected_action.get("target_features", {}).get("visual_alignment", 0.85)

        uncertainty_info = self.uncertainty_estimator.estimate(
            candidate_scores=scores_list,
            landmark_alignment=v_align,
            visited_trajectory=visited_trajectory,
            candidate_target_viewpoint=chosen_target_vp
        )

        # 4. Compute next agent state
        action_type = selected_action["action_type"]
        is_terminal = decision.get("is_terminal", False) or (action_type == "STOP")

        if action_type == "STOP":
            next_viewpoint_id = current_viewpoint_id
            next_heading = current_heading
        else:
            next_viewpoint_id = chosen_target_vp
            rel_h = selected_action.get("relative_heading", 0.0)
            next_heading = (current_heading + rel_h) % 360.0

        if current_step + 1 >= max_steps:
            is_terminal = True

        latency_ms = (time.time() - start_time) * 1000.0

        # Attach scores to candidate_actions list
        for act in available_actions:
            key = act["action_type"] if act["action_type"] == "STOP" else act.get("target_viewpoint_id", "")
            act["score"] = candidate_scores_dict.get(key, 0.1)

        next_vp_data = graph.get_viewpoint(next_viewpoint_id) or {}

        return {
            "selected_action": selected_action,
            "candidate_actions": available_actions,
            "candidate_scores": candidate_scores_dict,
            "rationale": decision.get("rationale", ""),
            "confidence": uncertainty_info["composite_confidence"],
            "uncertainty": uncertainty_info,
            "next_viewpoint_id": next_viewpoint_id,
            "next_heading": round(next_heading, 1),
            "next_coordinates": {
                "x": next_vp_data.get("x", 0.0),
                "y": next_vp_data.get("y", 0.0),
                "z": next_vp_data.get("z", 0.0)
            },
            "next_room": next_vp_data.get("room_label", "unknown"),
            "is_terminal": is_terminal,
            "latency_ms": round(latency_ms, 2)
        }
