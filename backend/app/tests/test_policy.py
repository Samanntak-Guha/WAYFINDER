import pytest
from backend.app.environments.bundled_scenes import build_residence_graph
from backend.app.ai.policy.policy_engine import PolicyEngine

@pytest.mark.asyncio
async def test_policy_engine_shortest_path():
    graph = build_residence_graph()
    engine = PolicyEngine()

    step_res = await engine.execute_step(
        policy_type="shortest_path_baseline",
        graph=graph,
        current_viewpoint_id="vp_01",
        current_heading=0.0,
        goal_viewpoint_id="vp_07",
        instruction_data={"sub_goals": []},
        visited_trajectory=["vp_01"],
        current_step=0,
        max_steps=10
    )

    assert step_res["selected_action"]["action_type"] in ["MOVE_FORWARD", "TURN_LEFT", "TURN_RIGHT"]
    assert step_res["confidence"] > 0.5
    assert step_res["next_viewpoint_id"] != "vp_01"

@pytest.mark.asyncio
async def test_policy_engine_instruction_conditioned():
    graph = build_residence_graph()
    engine = PolicyEngine()

    instruction_data = {
        "sub_goals": [
            {
                "action_type": "MOVE_FORWARD",
                "primary_landmark": "corridor",
                "expected_heading_degrees": 0.0
            }
        ]
    }

    step_res = await engine.execute_step(
        policy_type="instruction_conditioned",
        graph=graph,
        current_viewpoint_id="vp_01",
        current_heading=0.0,
        goal_viewpoint_id="vp_07",
        instruction_data=instruction_data,
        visited_trajectory=["vp_01"],
        current_step=0,
        max_steps=10
    )

    assert "selected_action" in step_res
    assert "uncertainty" in step_res
    assert step_res["confidence"] >= 0.05
