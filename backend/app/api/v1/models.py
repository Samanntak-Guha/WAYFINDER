import time
from fastapi import APIRouter
from typing import List, Dict, Any
from backend.app.schemas.experiment import ModelTestRequest, ModelTestResponse
from backend.app.ai.providers.factory import get_llm_provider
from backend.app.core.config import settings

router = APIRouter(prefix="/models", tags=["AI Models"])

ACTIVE_MODELS_CATALOG = [
    {
        "id": "claude-haiku-4-5",
        "name": "Claude Haiku 4.5",
        "provider": "freellmapi",
        "type": "multimodal_reasoning",
        "supports_vision": True,
        "supports_multilingual": True,
        "is_default": True,
        "context_window": 200000,
        "status": "online"
    },
    {
        "id": "gpt-oss-20b",
        "name": "GPT OSS 20B",
        "provider": "freellmapi",
        "type": "language_reasoning",
        "supports_vision": False,
        "supports_multilingual": True,
        "is_default": False,
        "context_window": 32000,
        "status": "online"
    },
    {
        "id": "meta/llama-3.3-70b-instruct",
        "name": "Llama 3.3 70B Instruct",
        "provider": "nvidia_nim",
        "type": "language_reasoning",
        "supports_vision": False,
        "supports_multilingual": True,
        "is_default": False,
        "context_window": 128000,
        "status": "ready"
    },
    {
        "id": "meta/llama-3.2-90b-vision-instruct",
        "name": "Llama 3.2 90B Vision Instruct",
        "provider": "nvidia_nim",
        "type": "vision_language_navigation",
        "supports_vision": True,
        "supports_multilingual": True,
        "is_default": False,
        "context_window": 128000,
        "status": "ready"
    },
    {
        "id": "nemotron-3-nano-omni-30b-a3b-reasoning",
        "name": "NVIDIA Nemotron 3 Nano Omni 30B",
        "provider": "freellmapi",
        "type": "spatial_reasoning",
        "supports_vision": True,
        "supports_multilingual": True,
        "is_default": False,
        "context_window": 64000,
        "status": "online"
    }
]

@router.get("", response_model=List[Dict[str, Any]])
async def list_models():
    return ACTIVE_MODELS_CATALOG

@router.get("/health")
async def check_provider_health():
    """Test health of configured provider."""
    provider = get_llm_provider()
    report = await provider.test_connection()
    return report

@router.post("/test", response_model=ModelTestResponse)
async def test_model(req: ModelTestRequest):
    provider = get_llm_provider(
        provider_type=req.provider,
        api_key=req.api_key,
        base_url=req.base_url,
        model=req.model_id
    )
    start_time = time.time()
    try:
        messages = [
            {"role": "system", "content": "You are WAYFINDER. Respond in one concise sentence."},
            {"role": "user", "content": req.prompt or "System diagnostics test."}
        ]
        res = await provider.chat_completion(
            messages=messages,
            model=req.model_id,
            temperature=0.1,
            max_tokens=60
        )
        latency = (time.time() - start_time) * 1000.0
        return ModelTestResponse(
            success=True,
            provider=req.provider,
            model_id=req.model_id,
            latency_ms=round(latency, 2),
            response_text=res.get("content", "").strip(),
            structured_output={"status": "verified", "latency_ms": round(latency, 2)}
        )
    except Exception as e:
        latency = (time.time() - start_time) * 1000.0
        return ModelTestResponse(
            success=False,
            provider=req.provider,
            model_id=req.model_id,
            latency_ms=round(latency, 2),
            error=str(e)
        )
