export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  organization?: string;
  preferred_language?: string;
  theme?: string;
  reduced_motion?: boolean;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ViewpointNode {
  viewpoint_id: string;
  x: float;
  y: float;
  z: float;
  heading: float;
  room_label: string;
  is_navigable: boolean;
  visual_features?: {
    room_label?: string;
    detected_objects?: string[];
    ambient_lux?: number;
    visual_alignment?: number;
  };
}

export type float = number;

export interface NavigationEdge {
  from_viewpoint_id: string;
  to_viewpoint_id: string;
  distance: number;
  heading_angle: number;
  is_blocked?: boolean;
}

export interface EnvironmentGraphData {
  environment_id: string;
  nodes: ViewpointNode[];
  edges: NavigationEdge[];
  total_nodes: number;
  total_edges: number;
}

export interface EnvironmentMetadata {
  id: string;
  name: string;
  description: string;
  category: "architectural_simulated" | "matterport3d" | "rxr_official";
  scene_type: string;
  floor_area: number;
  total_viewpoints: number;
  total_edges: number;
  preview_image_url?: string;
  status: string;
  is_downloaded?: boolean;
}

export interface CandidateAction {
  action_type: "MOVE_FORWARD" | "TURN_LEFT" | "TURN_RIGHT" | "STOP";
  target_viewpoint_id?: string;
  target_room?: string;
  distance: number;
  relative_heading: number;
  score?: number;
  target_coordinates?: { x: number; y: number; z: number };
  target_features?: any;
}

export interface UncertaintyFactors {
  action_margin: number;
  landmark_alignment: number;
  loop_factor: number;
  instruction_clarity: number;
  composite_confidence: number;
  is_high_uncertainty?: boolean;
  factors_explanation?: string;
}

export interface NavigationStepResponse {
  episode_id: string;
  step_index: number;
  current_viewpoint_id: string;
  current_coordinates: { x: number; y: number; z: number };
  current_heading: number;
  current_room: string;
  is_terminal: boolean;
  status: "idle" | "running" | "paused" | "completed" | "failed" | "stopped";
  selected_action: CandidateAction;
  candidate_actions: CandidateAction[];
  confidence: number;
  uncertainty: UncertaintyFactors;
  instruction_progress: { current_step: number; max_steps: number };
  visited_trajectory: string[];
  metrics_so_far: Record<string, any>;
  latency_ms: number;
}

export interface NavigationEpisodeState {
  id: string;
  environment_id: string;
  instruction_text: string;
  language: "en" | "hi" | "te";
  start_viewpoint_id: string;
  goal_viewpoint_id: string;
  current_viewpoint_id: string;
  current_heading: number;
  current_step: number;
  max_steps: number;
  status: "idle" | "running" | "paused" | "completed" | "failed" | "stopped";
  confidence: number;
  trajectory: Array<{
    viewpoint_id: string;
    x: number;
    y: number;
    z: number;
    heading: number;
    room_label: string;
    step: number;
    action?: string;
  }>;
  optimal_path: string[];
  outcome_metrics: {
    is_success?: boolean;
    is_oracle_success?: boolean;
    navigation_error?: number;
    path_length?: number;
    optimal_path_length?: number;
    spl?: number;
    steps?: number;
    optimal_steps?: number;
  };
  error_message?: string;
}

export interface EvaluationResult {
  id: string;
  dataset_name: string;
  split_name: string;
  language: string;
  policy_name: string;
  total_episodes: number;
  successful_episodes: number;
  success_rate: number;
  oracle_success_rate: number;
  spl: number;
  navigation_error: number;
  average_path_length: number;
  average_steps: number;
  latency_avg_ms: number;
  language_breakdown?: Array<{
    language: string;
    total_episodes: number;
    success_rate: number;
    spl: number;
    avg_navigation_error: number;
    avg_steps: number;
  }>;
}

export interface DashboardSummary {
  total_experiments: number;
  total_episodes: number;
  successful_episodes: number;
  success_rate: number;
  average_spl: number;
  average_steps: number;
  ai_model_status: string;
  datasets_available: number;
  recent_activity: Array<{
    id: string;
    environment_id: string;
    instruction: string;
    language: string;
    status: string;
    confidence: number;
    created_at?: string;
  }>;
}
