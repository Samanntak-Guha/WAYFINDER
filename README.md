# WAYFINDER — Multilingual Vision-and-Language Navigation Decision Agent

> **Research-Grade Multilingual VLN Decision System connecting natural-language understanding, 3D visual perception, and sequential goal-based decision-making across Matterport3D and Room-Across-Room (RxR) environments.**

---

## 1. Overview & Research Foundation

WAYFINDER is a full-stack, research-oriented platform designed to benchmark and execute sequential navigation policies in photorealistic 3D indoor environments. Grounded in Google's **Room-Across-Room (RxR)** multilingual benchmark and **Matterport3D** scan topologies, WAYFINDER solves the problem of guiding autonomous agents from arbitrary starting viewpoints to target goal rooms via natural-language instructions in **English, Hindi (हिन्दी), and Telugu (తెలుగు)**.

### Core Capabilities
- **Multilingual Instruction Decomposition**: Parses raw instructions across languages into sequential sub-goals, extracting landmarks, movement primitives (`MOVE_FORWARD`, `TURN_LEFT`, `TURN_RIGHT`, `STOP`), and directional headings.
- **Topological Environment Representation**: Environments modeled as NetworkX spatial graphs \(G = (V, E)\), where each viewpoint node maintains exact 3D Cartesian coordinates \((x, y, z)\), semantic room classification, and visual feature embeddings.
- **Instruction-Conditioned Policy & Baseline**: Features both an oracle shortest-path Dijkstra baseline and an instruction-conditioned decision policy that scores candidate physical graph edges based on visual-landmark alignment, relative heading alignment, and goal distance heuristics.
- **Calibrated Uncertainty Estimation**: Computes dynamic confidence scores using a documented mathematical formulation accounting for action margin, visual landmark grounding, cycle detection, and instruction lexical clarity.
- **Automated Loop Detection & Recovery**: Detects trajectory oscillations and automatically replans unexplored branches or backtracks.
- **Interactive 3D Simulation**: High-fidelity Three.js / React Three Fiber interactive environment viewer with dynamic camera orbit, agent directional cones, glowing pulse rings, and real-time state synchronization via WebSockets.
- **RxR Benchmark Evaluation Suite**: Mathematically computes Navigation Error (NE), Success Rate (SR), Oracle Success Rate (OSR), and Success weighted by Path Length (SPL).

---

## 2. System Architecture

```
WAYFINDER/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI lifespan, CORS, route registry
│   │   ├── core/                    # Security (bcrypt), JWT, WebSockets, config
│   │   ├── models/                  # SQLAlchemy models (User, Episode, Environment, etc.)
│   │   ├── schemas/                 # Pydantic v2 schemas
│   │   ├── ai/
│   │   │   ├── providers/           # NVIDIA NIM, FreeLLMAPI, OpenAI provider abstraction
│   │   │   ├── language/            # Multilingual parser (EN, HI, TE), spatial lexicon
│   │   │   ├── perception/          # Visual encoder, landmark alignment
│   │   │   ├── graph/               # NetworkX EnvironmentGraph
│   │   │   ├── policy/              # Decision policies (Instruction-conditioned, Dijkstra)
│   │   │   ├── uncertainty/         # Calibrated confidence mathematical estimator
│   │   │   └── recovery/            # Cycle detection and backtracking engine
│   │   ├── environments/            # Bundled architectural scenes & Matterport3D adapter
│   │   ├── evaluation/              # Benchmark metrics (SR, OSR, SPL, NE)
│   │   └── api/v1/                  # REST and WebSocket endpoints
│   ├── tests/                       # Pytest test suite (13 passing tests)
│   └── requirements.txt
│
├── frontend/                        # Next.js 14 App Router, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Cinematic editorial landing page
│   │   │   ├── (auth)/              # Login, register, forgot-password
│   │   │   └── (app)/
│   │   │       ├── dashboard/       # Research overview & real database telemetry
│   │   │       ├── studio/          # Interactive navigation workspace
│   │   │       ├── simulator/       # Dedicated full-screen 3D simulator
│   │   │       ├── agent-lab/       # Model diagnostics & uncertainty simulator
│   │   │       ├── datasets/        # RxR and Matterport3D dataset explorer
│   │   │       ├── evaluations/     # Benchmark laboratory with Recharts
│   │   │       ├── experiments/     # Archived runs and trajectory details
│   │   │       ├── settings/        # Model provider & policy preferences
│   │   │       ├── profile/         # Researcher identity and credentials
│   │   │       └── documentation/   # Formal mathematical specification
│   │   ├── components/3d/           # Three.js / React Three Fiber EnvironmentViewer
│   │   ├── components/ui/           # Restrained liquid-glass design system
│   │   └── lib/                     # API client, AuthContext, WebSocket client
│   └── package.json
```

---

## 3. Mathematical Benchmark Formulations

### Navigation Error (NE)
Euclidean distance between the final agent viewpoint \(u_T\) and the goal viewpoint \(v_{goal}\):
$$\text{NE} = \|x(u_T) - x(v_{goal})\|_2$$

### Navigation Success Rate (SR)
$$\text{SR} = \mathbb{I}(\text{NE} \le 3.0\,\text{meters})$$

### Oracle Success Rate (OSR)
$$\text{OSR} = \mathbb{I}\left(\min_{t \in [0, T]} \|x(u_t) - x(v_{goal})\|_2 \le 3.0\,\text{meters}\right)$$

### Success weighted by Path Length (SPL)
Standard metric penalizing detour paths:
$$\text{SPL} = S \cdot \frac{L_{optimal}}{\max(L_{actual}, L_{optimal})}$$

### Calibrated Confidence Estimation
$$C = \text{clamp}\left(0.40 \cdot \Delta_{top} + 0.30 \cdot V_{align} + 0.15 \cdot L_{factor} + 0.15 \cdot I_{clarity},\, 0.05,\, 0.99\right)$$
- \(\Delta_{top} = s_1 - s_2\): Margin between top-2 scored candidate actions.
- \(V_{align}\): Multi-modal visual landmark alignment score \([0, 1]\).
- \(L_{factor}\): Loop penalty (\(1.0\) for unseen nodes, \(0.45\) for visited once, \(0.15\) for cycling).
- \(I_{clarity}\): Lexical and semantic certainty of the parsed instruction segment.

---

## 4. Visual Design System

The platform is designed with an **Awwwards-quality editorial and architectural identity**:
- **Primary Background**: `#0C0D0B`
- **Secondary Background**: `#141613`
- **Surface**: `#1B1E19`
- **Primary Typography**: `#F1F0E9`
- **Secondary Typography**: `#A4A69C`
- **Muted Text**: `#777C70`
- **Sage Accent**: `#B7C5A5`
- **Sand Accent**: `#C7B99C`
- **Glass Borders**: `rgba(255, 255, 255, 0.09)`
- **Restrained Liquid Glass**: Subtle backdrop blur, soft depth, and zero generic purple/blue gradients.

---

## 5. Local Startup Instructions

### Backend (Python FastAPI)
```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Run backend server
python run.py
# Server starts on http://127.0.0.1:8000
# OpenAPI Docs: http://127.0.0.1:8000/docs
```

### Frontend (Next.js)
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Run development server
npm run dev
# Or build and start production server
npm run build
npm start
# Server starts on http://localhost:3000
```

---

## 6. AI Provider Configuration

WAYFINDER supports multiple providers configured via environment variables:

```bash
# Provider selector: "freellmapi", "nvidia_nim", or "custom_openai"
LLM_PROVIDER=freellmapi

# Direct NVIDIA NIM (https://build.nvidia.com)
NVIDIA_NIM_API_KEY=nvapi-your-key-here
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=meta/llama-3.3-70b-instruct
NVIDIA_NIM_VISION_MODEL=meta/llama-3.2-90b-vision-instruct

# Local Gateway (FreeLLMAPI)
FREE_LLM_API_BASE_URL=http://127.0.0.1:31415/v1
FREE_LLM_API_KEY=freellmapi-cd5d18fe34df4d9ae6e418b82cb188ca6218c7df87b182df
FREE_LLM_API_MODEL=claude-haiku-4-5
```

---

## 7. Cloud Deployment Guide

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. Import project into Vercel dashboard with root directory set to `frontend`.
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-domain.com`
   - `NEXT_PUBLIC_WS_URL`: `wss://your-backend-domain.com`
4. Deploy.

### Backend Deployment (Railway / Render / AWS ECS)
1. Use Docker or Python 3.11 runtime.
2. Set environment variables from `.env.example`:
   - `DATABASE_URL`: Managed PostgreSQL connection string (`postgresql+asyncpg://...`)
   - `SECRET_KEY`: High-entropy secret key
   - `LLM_PROVIDER`: `nvidia_nim`
   - `NVIDIA_NIM_API_KEY`: NVIDIA NIM API Key
3. Run command: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`

---

## 8. Verification & Test Results
- **Unit & Graph Tests**: 13/13 passing (`pytest backend/app/tests`)
- **End-to-End Integration**: 10/10 passing (`python verify_e2e_integration.py`)
- **Frontend Compilation**: 17/17 routes compiled statically with zero errors (`npm run build`)
- **Matterport3D / RxR Adapter**: Complete support for official scan graphs (`*.connectivity.json`) and benchmark splits.
