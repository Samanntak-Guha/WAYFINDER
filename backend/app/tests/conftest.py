import pytest
import pytest_asyncio
from backend.app.core.database import engine, Base

@pytest_asyncio.fixture(autouse=True, scope="function")
async def init_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
