import time
import httpx
from typing import Dict, Any, Optional, List
from backend.app.ai.providers.base import BaseLLMProvider

class CustomOpenAIProvider(BaseLLMProvider):
    """Generic OpenAI-compatible inference client."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        default_model: Optional[str] = None
    ):
        self.api_key = api_key or ""
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")
        self.default_model = default_model or "gpt-4o-mini"
        self.timeout = 25.0

    def get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def get_capabilities(self) -> Dict[str, bool]:
        return {
            "text_generation": True,
            "structured_output": True,
            "tool_calling": True,
            "vision_input": True,
            "embeddings": True
        }

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 512,
        response_format: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        target_model = model or self.default_model
        payload: Dict[str, Any] = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if response_format:
            payload["response_format"] = response_format

        url = f"{self.base_url}/chat/completions"
        start_time = time.time()

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(url, headers=self.get_headers(), json=payload)
                latency_ms = (time.time() - start_time) * 1000.0
                if response.status_code != 200:
                    raise Exception(f"Provider error {response.status_code}: {response.text}")
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return {
                    "content": content,
                    "model": target_model,
                    "latency_ms": round(latency_ms, 2),
                    "raw": data
                }
            except Exception as e:
                latency_ms = (time.time() - start_time) * 1000.0
                raise Exception(f"Inference failed ({latency_ms:.1f}ms): {str(e)}")

    async def test_connection(self) -> Dict[str, Any]:
        start_time = time.time()
        url = f"{self.base_url}/models"
        async with httpx.AsyncClient(timeout=6.0) as client:
            try:
                response = await client.get(url, headers=self.get_headers())
                latency_ms = (time.time() - start_time) * 1000.0
                if response.status_code == 200:
                    data = response.json()
                    model_list = [m["id"] for m in data.get("data", [])]
                    return {
                        "status": "healthy",
                        "latency_ms": round(latency_ms, 2),
                        "models_count": len(model_list),
                        "models": model_list[:10],
                        "provider": "custom_openai"
                    }
                else:
                    return {
                        "status": "error",
                        "status_code": response.status_code,
                        "error": response.text,
                        "latency_ms": round(latency_ms, 2),
                        "provider": "custom_openai"
                    }
            except Exception as e:
                return {
                    "status": "unreachable",
                    "error": str(e),
                    "provider": "custom_openai"
                }
