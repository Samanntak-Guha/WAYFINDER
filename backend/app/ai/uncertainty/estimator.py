import math
from typing import Dict, Any, List

class UncertaintyEstimator:
    """Calculates calibrated confidence and uncertainty factors for VLN decision making."""

    def __init__(self):
        pass

    def estimate(
        self,
        candidate_scores: List[float],
        landmark_alignment: float,
        visited_trajectory: List[str],
        candidate_target_viewpoint: str,
        instruction_subgoal_clarity: float = 0.9
    ) -> Dict[str, Any]:
        """
        Calculates calibrated confidence using documented multi-factor formulation:
        - action_margin: difference between top-1 and top-2 scored actions
        - landmark_alignment: visual-language alignment with target features
        - instruction_clarity: structural confidence in instruction parse
        - loop_penalty: penalty if candidate viewpoint was recently visited
        """
        # 1. Action Margin
        sorted_scores = sorted(candidate_scores, reverse=True)
        if len(sorted_scores) >= 2:
            action_margin = max(0.0, sorted_scores[0] - sorted_scores[1])
        elif len(sorted_scores) == 1:
            action_margin = sorted_scores[0]
        else:
            action_margin = 0.0

        # 2. Loop / Cycle Detection
        occurrences = visited_trajectory.count(candidate_target_viewpoint)
        if occurrences == 0:
            loop_factor = 1.0
        elif occurrences == 1:
            loop_factor = 0.45
        else:
            loop_factor = 0.15

        # 3. Visual Landmark Grounding
        v_align = max(0.0, min(1.0, landmark_alignment))

        # 4. Instruction Clarity
        i_clarity = max(0.0, min(1.0, instruction_subgoal_clarity))

        # Composite Confidence Formula
        # Weighted blend of decisive margin (40%), visual match (30%), loop prevention (15%), instruction clarity (15%)
        raw_confidence = (
            0.40 * action_margin +
            0.30 * v_align +
            0.15 * loop_factor +
            0.15 * i_clarity
        )

        calibrated_confidence = max(0.05, min(0.99, round(raw_confidence, 3)))
        is_high_uncertainty = calibrated_confidence < 0.45

        uncertainty_explanation = []
        if action_margin < 0.15 and len(sorted_scores) > 1:
            uncertainty_explanation.append("Multiple candidate pathways have very close likelihood scores.")
        if v_align < 0.50:
            uncertainty_explanation.append("Weak visual landmark alignment in current camera observation.")
        if loop_factor < 1.0:
            uncertainty_explanation.append(f"Candidate viewpoint was already visited {occurrences} time(s).")
        if not uncertainty_explanation:
            uncertainty_explanation.append("Observation matches instruction landmark with clear directional gradient.")

        return {
            "composite_confidence": calibrated_confidence,
            "is_high_uncertainty": is_high_uncertainty,
            "action_margin": round(action_margin, 3),
            "landmark_alignment": round(v_align, 3),
            "loop_factor": round(loop_factor, 3),
            "instruction_clarity": round(i_clarity, 3),
            "factors_explanation": " ".join(uncertainty_explanation)
        }
