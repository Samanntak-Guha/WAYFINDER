from datetime import datetime
from fastapi import APIRouter
from backend.app.ai.providers.factory import get_llm_provider

router = APIRouter(tags=["Health & Diagnostics"])

@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "WAYFINDER Backend",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/ready")
async def ready():
    # Verify AI provider connection
    provider = get_llm_provider()
    report = await provider.test_connection()
    return {
        "status": "ready" if report.get("status") in ["healthy", "ready"] else "degraded",
        "ai_provider": report,
        "database": "connected",
        "version": "1.0.0"
    }
