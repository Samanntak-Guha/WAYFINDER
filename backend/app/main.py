import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy.future import select

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, AsyncSessionLocal
from backend.app.models import User, Profile, Environment, Viewpoint, NavigationEdge
from backend.app.core.security import get_password_hash
from backend.app.environments.bundled_scenes import (
    get_bundled_environments_metadata,
    get_environment_graph
)

# API Routers
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.environments import router as env_router
from backend.app.api.v1.navigation import router as nav_router
from backend.app.api.v1.models import router as models_router
from backend.app.api.v1.datasets import router as datasets_router
from backend.app.api.v1.evaluations import router as eval_router
from backend.app.api.v1.experiments import router as exp_router
from backend.app.api.v1.health import router as health_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wayfinder")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Pre-seed initial database state
    async with AsyncSessionLocal() as session:
        # Check user
        res = await session.execute(select(User).limit(1))
        if not res.scalar_one_or_none():
            logger.info("Seeding default lead researcher account...")
            user = User(
                id="usr_lead_researcher_01",
                email="researcher@wayfinder.ai",
                hashed_password=get_password_hash("Wayfinder2026!"),
                full_name="Dr. Elena Vance",
                role="lead_researcher",
                organization="Vision-and-Language Navigation Lab"
            )
            profile = Profile(
                id="prof_01",
                user_id="usr_lead_researcher_01",
                preferred_language="en",
                theme="dark"
            )
            session.add(user)
            session.add(profile)

        # Check environments
        for env_meta in get_bundled_environments_metadata():
            env_id = env_meta["id"]
            res = await session.execute(select(Environment).where(Environment.id == env_id))
            if not res.scalar_one_or_none():
                logger.info(f"Seeding environment {env_id}...")
                graph = get_environment_graph(env_id)
                env_record = Environment(
                    id=env_id,
                    name=env_meta["name"],
                    description=env_meta["description"],
                    category=env_meta["category"],
                    scene_type=env_meta["scene_type"],
                    floor_area=env_meta["floor_area"],
                    total_viewpoints=graph.graph.number_of_nodes(),
                    total_edges=graph.graph.number_of_edges(),
                    preview_image_url=env_meta.get("preview_image_url"),
                    metadata_json=env_meta.get("metadata_json", {})
                )
                session.add(env_record)

        await session.commit()
    logger.info("Database startup complete.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="WAYFINDER: Multilingual Vision-and-Language Navigation Decision Agent",
    lifespan=lifespan
)

# Response Compression & CORS Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for local dev & Vercel previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 routes
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(env_router, prefix=settings.API_V1_STR)
app.include_router(nav_router, prefix=settings.API_V1_STR)
app.include_router(models_router, prefix=settings.API_V1_STR)
app.include_router(datasets_router, prefix=settings.API_V1_STR)
app.include_router(eval_router, prefix=settings.API_V1_STR)
app.include_router(exp_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "name": "WAYFINDER API",
        "category": "Multilingual Vision-and-Language Navigation Decision Agent",
        "status": "operational",
        "docs": "/docs",
        "version": settings.VERSION
    }
