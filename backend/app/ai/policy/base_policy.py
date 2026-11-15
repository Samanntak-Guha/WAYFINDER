from abc import ABC, abstractmethod
from typing import Dict, Any, List
from backend.app.ai.graph.environment_graph import EnvironmentGraph

class BaseNavigationPolicy(ABC):
    """Abstract navigation decision policy interface."""

    @abstractmethod
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
        """
        Evaluate candidate actions and select the next navigation action.
        Returns dict containing:
        - selected_action: Dict[str, Any]
        - candidate_scores: Dict[str, float]
        - rationale: str
        - is_terminal: bool
        """
        pass
