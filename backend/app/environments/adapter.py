from abc import ABC, abstractmethod
from typing import Dict, Any, List
from backend.app.ai.graph.environment_graph import EnvironmentGraph

class BaseEnvironmentAdapter(ABC):
    """Abstract base adapter for loading 3D environments into WAYFINDER graphs."""

    @abstractmethod
    def load_environment(self, environment_id: str) -> EnvironmentGraph:
        """Load and return an EnvironmentGraph for the given environment ID."""
        pass

    @abstractmethod
    def list_available_environments(self) -> List[Dict[str, Any]]:
        """List metadata for environments managed by this adapter."""
        pass
