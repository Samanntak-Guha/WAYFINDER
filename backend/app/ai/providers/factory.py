from typing import Optional
from backend.app.ai.providers.base import BaseLLMProvider
from backend.app.ai.providers.nim import NvidiaNimProvider
from backend.app.ai.providers.freellmapi import FreeLLMProvider
from backend.app.ai.providers.custom import CustomOpenAIProvider
from backend.app.core.config import settings

def get_llm_provider(
    provider_type: Optional[str] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    model: Optional[str] = None
) -> BaseLLMProvider:
    provider = (provider_type or settings.LLM_PROVIDER).lower()

    if provider in ["nvidia_nim", "nvidia", "nim"]:
        return NvidiaNimProvider(
            api_key=api_key or settings.NVIDIA_NIM_API_KEY,
            base_url=base_url or settings.NVIDIA_NIM_BASE_URL,
            default_model=model or settings.NVIDIA_NIM_MODEL
        )
    elif provider in ["freellmapi", "free_llm_api", "local"]:
        return FreeLLMProvider(
            api_key=api_key or settings.FREE_LLM_API_KEY,
            base_url=base_url or settings.FREE_LLM_API_BASE_URL,
            default_model=model or settings.FREE_LLM_API_MODEL
        )
    else:
        return CustomOpenAIProvider(
            api_key=api_key or settings.CUSTOM_OPENAI_API_KEY,
            base_url=base_url or settings.CUSTOM_OPENAI_BASE_URL,
            default_model=model or settings.CUSTOM_OPENAI_MODEL
        )
