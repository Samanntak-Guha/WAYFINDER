import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "WAYFINDER"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "wayfinder-super-secret-jwt-key-research-grade-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./wayfinder.db")

    # AI Provider Configuration
    # Options: "freellmapi", "nvidia_nim", "custom_openai"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "freellmapi")

    # NVIDIA NIM Direct
    NVIDIA_NIM_API_KEY: str = os.getenv("NVIDIA_NIM_API_KEY", "")
    NVIDIA_NIM_BASE_URL: str = os.getenv("NVIDIA_NIM_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_NIM_MODEL: str = os.getenv("NVIDIA_NIM_MODEL", "meta/llama-3.3-70b-instruct")
    NVIDIA_NIM_VISION_MODEL: str = os.getenv("NVIDIA_NIM_VISION_MODEL", "meta/llama-3.2-90b-vision-instruct")

    # FreeLLMAPI Dev Gateway
    FREE_LLM_API_BASE_URL: str = os.getenv("FREE_LLM_API_BASE_URL", "http://127.0.0.1:31415/v1")
    FREE_LLM_API_KEY: str = os.getenv("FREE_LLM_API_KEY", "freellmapi-cd5d18fe34df4d9ae6e418b82cb188ca6218c7df87b182df")
    FREE_LLM_API_MODEL: str = os.getenv("FREE_LLM_API_MODEL", "claude-haiku-4-5")

    # Custom OpenAI-compatible Provider
    CUSTOM_OPENAI_BASE_URL: str = os.getenv("CUSTOM_OPENAI_BASE_URL", "")
    CUSTOM_OPENAI_API_KEY: str = os.getenv("CUSTOM_OPENAI_API_KEY", "")
    CUSTOM_OPENAI_MODEL: str = os.getenv("CUSTOM_OPENAI_MODEL", "")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
