import pytest
from backend.app.ai.graph.environment_graph import EnvironmentGraph
from backend.app.environments.bundled_scenes import build_residence_graph

def test_environment_graph_construction():
    g = EnvironmentGraph("test_env")
    g.add_viewpoint("v1", 0.0, 0.0, 0.0, heading=0.0, room_label="hallway")
    g.add_viewpoint("v2", 0.0, 0.0, 3.0, heading=0.0, room_label="living_room")
    g.add_edge("v1", "v2", distance=3.0)

    assert g.graph.number_of_nodes() == 2
    assert g.graph.number_of_edges() == 1
    assert g.euclidean_distance("v1", "v2") == 3.0

def test_shortest_path():
    g = build_residence_graph()
    path = g.shortest_path("vp_01", "vp_07")
    assert len(path) >= 2
    assert path[0] == "vp_01"
    assert path[-1] == "vp_07"

def test_candidate_actions():
    g = build_residence_graph()
    actions = g.get_candidate_actions("vp_01", current_heading=0.0)
    assert len(actions) > 0
    # Must contain STOP action
    assert any(a["action_type"] == "STOP" for a in actions)
    # Must contain MOVE action to neighboring node vp_02
    target_nodes = [a.get("target_viewpoint_id") for a in actions]
    assert "vp_02" in target_nodes
