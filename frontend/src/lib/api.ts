const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("wayfinder_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMessage = `HTTP ${res.status}: ${res.statusText}`;
      let errData = null;
      try {
        errData = await res.json();
        if (errData && errData.detail) {
          errMessage = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
        }
      } catch (_) {}
      throw new ApiError(res.status, errMessage, errData);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err.message || "Network connection failed");
  }
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user_id: string; email: string; full_name?: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: { email: string; password: string; full_name?: string; organization?: string; role?: string }) =>
    request<{ access_token: string; user_id: string; email: string; full_name?: string; role: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () => request<any>("/auth/me"),
  updateProfile: (data: any) =>
    request<any>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  forgotPassword: (email: string) =>
    request<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (data: { token: string; new_password: string }) =>
    request<any>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Environments
  getEnvironments: () => request<any[]>("/environments"),
  getEnvironmentDetail: (id: string) => request<any>(`/environments/${id}`),
  getEnvironmentGraph: (id: string) => request<any>(`/environments/${id}/graph`),

  // Navigation Engine
  startNavigation: (data: {
    environment_id: string;
    start_viewpoint_id: string;
    goal_viewpoint_id: string;
    instruction_text: string;
    language?: string;
    policy_type?: string;
    model_id?: string;
    provider?: string;
    max_steps?: number;
  }) =>
    request<any>("/navigation/start", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  executeStep: (episodeId: string) =>
    request<any>(`/navigation/${episodeId}/step`, {
      method: "POST",
    }),
  pauseNavigation: (episodeId: string) =>
    request<any>(`/navigation/${episodeId}/pause`, {
      method: "POST",
    }),
  resumeNavigation: (episodeId: string) =>
    request<any>(`/navigation/${episodeId}/resume`, {
      method: "POST",
    }),
  stopNavigation: (episodeId: string) =>
    request<any>(`/navigation/${episodeId}/stop`, {
      method: "POST",
    }),
  resetNavigation: (episodeId: string) =>
    request<any>(`/navigation/${episodeId}/reset`, {
      method: "POST",
    }),
  getEpisodeState: (episodeId: string) => request<any>(`/navigation/${episodeId}/state`),
  getEpisodeHistory: (episodeId: string) => request<any[]>(`/navigation/${episodeId}/history`),

  // Models
  getModels: () => request<any[]>("/models"),
  getProviderHealth: () => request<any>("/models/health"),
  testModel: (data: { provider: string; model_id: string; prompt?: string }) =>
    request<any>("/models/test", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Datasets
  getDatasets: () => request<any[]>("/datasets"),
  getInstructions: (datasetId: string, params?: { environment_id?: string; language?: string }) => {
    const query = new URLSearchParams();
    if (params?.environment_id) query.append("environment_id", params.environment_id);
    if (params?.language) query.append("language", params.language);
    return request<any[]>(`/datasets/${datasetId}/instructions?${query.toString()}`);
  },
  registerLocalDataset: (data: { dataset_id: string; local_path: string; license_confirmed: boolean }) =>
    request<any>("/datasets/register-local", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Evaluations
  getEvaluations: () => request<any[]>("/evaluations"),
  runEvaluation: (data: {
    dataset_name?: string;
    split_name?: string;
    language?: string;
    policy_type?: string;
    max_episodes?: number;
  }) =>
    request<any>("/evaluations/run", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Experiments
  getExperiments: (params?: { environment_id?: string; policy_type?: string }) => {
    const query = new URLSearchParams();
    if (params?.environment_id) query.append("environment_id", params.environment_id);
    if (params?.policy_type) query.append("policy_type", params.policy_type);
    return request<any[]>(`/experiments?${query.toString()}`);
  },
  createExperiment: (data: { name: string; description?: string; environment_id: string; policy_type?: string }) =>
    request<any>("/experiments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getExperimentDetail: (id: string) => request<any>(`/experiments/${id}`),
  getDashboardSummary: () => request<any>("/experiments/dashboard/summary"),
};
