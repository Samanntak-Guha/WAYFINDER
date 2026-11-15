from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List

class BaseLLMProvider(ABC):
    """Abstract interface for LLM/VLM inference providers."""

    @abstractmethod
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 512,
        response_format: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Perform chat completion and return response dict with 'content', 'model', 'latency_ms'."""
        pass

    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """Test provider connectivity and return health report."""
        pass

    @abstractmethod
    def get_capabilities(self) -> Dict[str, bool]:
        """Return provider capability flags (vision, structured_output, tool_calling, embeddings)."""
        pass
