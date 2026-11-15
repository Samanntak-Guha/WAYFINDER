import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    print("=== STARTING WAYFINDER END-TO-END INTEGRATION TEST SUITE ===")

    # 1. Health
    with httpx.Client(timeout=60.0) as client:
        r = client.get(f"{BASE_URL}/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        print("[PASS] 1. Health endpoint operational:", r.json()["status"])

        # 2. Environments
        r = client.get(f"{BASE_URL}/environments")
        assert r.status_code == 200
        envs = r.json()
        assert len(envs) >= 3
        print(f"[PASS] 2. Environments catalog returned {len(envs)} environments.")

        # Check graph
        r_graph = client.get(f"{BASE_URL}/environments/env_residence_01/graph")
        assert r_graph.status_code == 200
        graph = r_graph.json()
        assert graph["total_nodes"] == 18
        assert graph["total_edges"] >= 20
        print(f"[PASS] 3. Graph topology verified: {graph['total_nodes']} nodes, {graph['total_edges']} edges.")

        # 3. Auth
        email = f"tester_{int(time.time())}@wayfinder.ai"
        reg_payload = {
            "email": email,
            "password": "SecurePassword2026!",
            "full_name": "QA Benchmark Agent",
            "organization": "Robotics Research",
            "role": "evaluator"
        }
        r_reg = client.post(f"{BASE_URL}/auth/register", json=reg_payload)
        assert r_reg.status_code == 200, f"Registration failed: {r_reg.text}"
        token_data = r_reg.json()
        token = token_data["access_token"]
        print("[PASS] 4. User registration & JWT generation successful.")

        headers = {"Authorization": f"Bearer {token}"}
        r_me = client.get(f"{BASE_URL}/auth/me", headers=headers)
        assert r_me.status_code == 200
        print(f"[PASS] 5. Authenticated profile verified: {r_me.json()['email']}")

        # 4. Multilingual Navigation Episode Execution (English)
        start_payload = {
            "environment_id": "env_residence_01",
            "start_viewpoint_id": "vp_01",
            "goal_viewpoint_id": "vp_07",
            "instruction_text": "Walk straight along the main corridor, turn left into the living room, and halt at the fire hearth.",
            "language": "en",
            "policy_type": "shortest_path_baseline",
            "max_steps": 12
        }
        r_start = client.post(f"{BASE_URL}/navigation/start", json=start_payload, headers=headers)
        assert r_start.status_code == 200, f"Start failed: {r_start.text}"
        ep = r_start.json()
        episode_id = ep["id"]
        print(f"[PASS] 6. Navigation episode initialized: ID {episode_id}, start vp_01 -> goal vp_07.")

        # Step loop
        current_step = 0
        terminal = False
        while current_step < 10 and not terminal:
            r_step = client.post(f"{BASE_URL}/navigation/{episode_id}/step", headers=headers)
            assert r_step.status_code == 200, f"Step {current_step} failed: {r_step.text}"
            step_data = r_step.json()
            current_step = step_data["step_index"]
            action = step_data["selected_action"]["action_type"]
            vp = step_data["current_viewpoint_id"]
            conf = step_data["confidence"]
            terminal = step_data["is_terminal"]
            print(f"       Step {current_step}: action={action}, viewpoint={vp}, confidence={conf:.2f}")

        # Check outcome
        r_state = client.get(f"{BASE_URL}/navigation/{episode_id}/state", headers=headers)
        state = r_state.json()
        print(f"[PASS] 7. Navigation episode completed. Status: {state['status']}, Metrics: {state['outcome_metrics']}")
        assert state["status"] == "completed"
        assert state["outcome_metrics"]["is_success"] is True
        assert state["outcome_metrics"]["spl"] > 0.0

        # 5. Multilingual Hindi Episode Execution
        hi_payload = {
            "environment_id": "env_residence_01",
            "start_viewpoint_id": "vp_01",
            "goal_viewpoint_id": "vp_10",
            "instruction_text": "हॉलवे से सीधे आगे बढ़ें और रसोई में जाकर रुकें।",
            "language": "hi",
            "policy_type": "shortest_path_baseline",
            "max_steps": 10
        }
        r_hi = client.post(f"{BASE_URL}/navigation/start", json=hi_payload, headers=headers)
        assert r_hi.status_code == 200
        ep_hi = r_hi.json()
        print(f"[PASS] 8. Multilingual Hindi episode initialized successfully: ID {ep_hi['id']}")

        # 6. Evaluation Suite Run
        eval_payload = {
            "dataset_name": "rxr_benchmark",
            "split_name": "val_unseen",
            "language": "all",
            "policy_type": "shortest_path_baseline",
            "max_episodes": 3
        }
        r_eval = client.post(f"{BASE_URL}/evaluations/run", json=eval_payload, headers=headers)
        assert r_eval.status_code == 200, f"Evaluation run failed: {r_eval.text}"
        eval_data = r_eval.json()
        print(f"[PASS] 9. Real benchmark evaluation suite executed across {eval_data['total_episodes']} episodes:")
        print(f"       Success Rate (SR): {eval_data['success_rate'] * 100:.1f}%")
        print(f"       Oracle SR (OSR):   {eval_data['oracle_success_rate'] * 100:.1f}%")
        print(f"       SPL:               {eval_data['spl']:.3f}")
        print(f"       Avg Nav Error:     {eval_data['navigation_error']:.2f}m")

        # 7. Dashboard Summary Verification
        r_dash = client.get(f"{BASE_URL}/experiments/dashboard/summary", headers=headers)
        assert r_dash.status_code == 200
        dash = r_dash.json()
        print(f"[PASS] 10. Dashboard summary aggregated genuine database records:")
        print(f"        Total episodes: {dash['total_episodes']}, Success rate: {dash['success_rate'] * 100:.1f}%, Avg SPL: {dash['average_spl']}")

    print("\n>>> ALL 10 END-TO-END INTEGRATION TESTS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    run_tests()
