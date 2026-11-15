import pytest
from backend.app.ai.graph.environment_graph import EnvironmentGraph
from backend.app.evaluation.metrics import NavigationEvaluator

def test_evaluation_success_and_spl():
    g = EnvironmentGraph("test_env")
    g.add_viewpoint("v1", 0.0, 0.0, 0.0)
    g.add_viewpoint("v2", 0.0, 0.0, 2.0)
    g.add_viewpoint("v3", 0.0, 0.0, 4.0)
    g.add_edge("v1", "v2", distance=2.0)
    g.add_edge("v2", "v3", distance=2.0)

    # Trajectory reaches goal v3 directly
    traj = ["v1", "v2", "v3"]
    metrics = NavigationEvaluator.evaluate_episode(
        graph=g,
        trajectory=traj,
        goal_viewpoint_id="v3"
    )

    assert metrics["is_success"] is True
    assert metrics["is_oracle_success"] is True
    assert metrics["navigation_error"] == 0.0
    assert metrics["path_length"] == 4.0
    assert metrics["optimal_path_length"] == 4.0
    assert metrics["spl"] == 1.0 # Optimal path followed

def test_evaluation_failure_distant():
    g = EnvironmentGraph("test_env")
    g.add_viewpoint("v1", 0.0, 0.0, 0.0)
    g.add_viewpoint("v2", 0.0, 0.0, 5.0)
    g.add_viewpoint("v3", 0.0, 0.0, 10.0)
    g.add_edge("v1", "v2", distance=5.0)
    g.add_edge("v2", "v3", distance=5.0)

    # Agent stopped at v1, 10 meters away from v3 (> 3.0m threshold)
    traj = ["v1"]
    metrics = NavigationEvaluator.evaluate_episode(
        graph=g,
        trajectory=traj,
        goal_viewpoint_id="v3"
    )

    assert metrics["is_success"] is False
    assert metrics["navigation_error"] == 10.0
    assert metrics["spl"] == 0.0
