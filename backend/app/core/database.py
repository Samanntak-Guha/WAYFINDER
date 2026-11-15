from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from backend.app.core.config import settings

def normalize_database_url(url: str) -> str:
    """Normalize PostgreSQL URLs injected by cloud hosts (Render, Railway, Heroku) to use asyncpg driver."""
    if not url:
        return "sqlite+aiosqlite:///./wayfinder.db"
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

ASYNC_DATABASE_URL = normalize_database_url(settings.DATABASE_URL)

# Engine configuration
connect_args = {}
if "sqlite" in ASYNC_DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=True
)

if "sqlite" in ASYNC_DATABASE_URL:
    @event.listens_for(engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=10000")
        cursor.close()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
