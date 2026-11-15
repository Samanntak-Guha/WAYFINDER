import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_health_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/api/v1/health")
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_environments_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/api/v1/environments")
        assert r.status_code == 200
        envs = r.json()
        assert len(envs) >= 3

        r_det = await ac.get("/api/v1/environments/env_residence_01")
        assert r_det.status_code == 200
        assert "viewpoints" in r_det.json()

@pytest.mark.asyncio
async def test_navigation_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        start_payload = {
            "environment_id": "env_residence_01",
            "start_viewpoint_id": "vp_01",
            "goal_viewpoint_id": "vp_07",
            "instruction_text": "Walk down the corridor and turn left into the living room.",
            "language": "en",
            "policy_type": "shortest_path_baseline",
            "max_steps": 10
        }
        r_start = await ac.post("/api/v1/navigation/start", json=start_payload)
        assert r_start.status_code == 200
        ep_data = r_start.json()
        episode_id = ep_data["id"]
        assert ep_data["status"] == "running"

        # Execute step
        r_step = await ac.post(f"/api/v1/navigation/{episode_id}/step")
        assert r_step.status_code == 200
        step_data = r_step.json()
        assert step_data["step_index"] == 1
        assert "selected_action" in step_data
        assert step_data["current_viewpoint_id"] != "vp_01"
