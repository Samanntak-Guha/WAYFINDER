"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Layers,
  Terminal,
  ExternalLink,
  Compass,
  Globe2,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DocumentationPage() {
  return (
    <AppShell>
      <div className="space-y-10 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
            <span>Research Documentation</span>
            <span>/</span>
            <span className="text-accent">Specification v1.0</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            WAYFINDER System &amp; Benchmark Documentation
          </h1>
          <p className="text-secondary text-sm font-light mt-1">
            Formal mathematical definitions, architectural design, and API specification for Multilingual Vision-and-Language Navigation.
          </p>
        </div>

        {/* Section 1: Problem Formulation */}
        <Card className="p-6 space-y-4">
          <Badge variant="accent">1. Problem Formulation</Badge>
          <h2 className="text-xl font-semibold text-primary">
            Vision-and-Language Navigation (VLN)
          </h2>
          <p className="text-secondary text-xs leading-relaxed font-light">
            In VLN, an autonomous agent is situated in an unknown 3D environment represented as a viewpoint connectivity graph G = (V, E).
            The agent receives a natural-language navigation instruction I = (w1, w2, ..., wL) in English, Hindi, or Telugu.
            At each discrete time step t, the agent observes visual panorama features v_t at viewpoint u_t in V, maintains an internal state s_t, and selects an action from available candidates:
          </p>
          <div className="p-4 rounded-xl bg-background/60 border border-glass-border font-mono text-xs text-accent">
            {"A_t = { MOVE(v) | (u_t, v) in E } U { STOP }"}
          </div>
        </Card>

        {/* Section 2: Mathematical Evaluation Metrics */}
        <Card className="p-6 space-y-4">
          <Badge variant="sand">2. Evaluation Metrics</Badge>
          <h2 className="text-xl font-semibold text-primary">
            RxR Benchmark Metrics
          </h2>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-glass-border bg-background/50 space-y-2">
              <span className="text-accent font-bold">A. Navigation Error (NE)</span>
              <p className="text-secondary font-sans">
                Euclidean distance between the final agent viewpoint u_T and the target goal viewpoint v_goal in meters:
              </p>
              <div className="text-primary font-mono text-sm pt-1">
                {"NE = ||x(u_T) - x(v_goal)||_2"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-glass-border bg-background/50 space-y-2">
              <span className="text-accent font-bold">B. Success Rate (SR)</span>
              <p className="text-secondary font-sans">
                Binary indicator whether final navigation error is within the standard 3.0-meter threshold:
              </p>
              <div className="text-primary font-mono text-sm pt-1">
                {"SR = I(NE <= 3.0m)"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-glass-border bg-background/50 space-y-2">
              <span className="text-accent font-bold">C. Oracle Success Rate (OSR)</span>
              <p className="text-secondary font-sans">
                Whether the agent came within 3.0 meters of the destination at any point along its trajectory:
              </p>
              <div className="text-primary font-mono text-sm pt-1">
                {"OSR = I( min_{t in [0,T]} ||x(u_t) - x(v_goal)||_2 <= 3.0m )"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-glass-border bg-background/50 space-y-2">
              <span className="text-sand font-bold">D. Success weighted by Path Length (SPL)</span>
              <p className="text-secondary font-sans">
                Standard metric punishing unnecessarily winding or looping routes:
              </p>
              <div className="text-sand font-mono text-sm pt-1">
                {"SPL = S * ( L_optimal / max(L_actual, L_optimal) )"}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: REST & WebSocket API Reference */}
        <Card className="p-6 space-y-4">
          <Badge variant="accent">3. API Reference</Badge>
          <h2 className="text-xl font-semibold text-primary">Core REST &amp; WebSocket Endpoints</h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-glass-border bg-background/50 flex items-center justify-between">
              <span className="text-accent font-bold">POST /api/v1/navigation/start</span>
              <span className="text-muted text-[11px]">Initiate VLN episode with instruction</span>
            </div>
            <div className="p-3 rounded-xl border border-glass-border bg-background/50 flex items-center justify-between">
              <span className="text-accent font-bold">POST /api/v1/navigation/&#123;id&#125;/step</span>
              <span className="text-muted text-[11px]">Execute single decision policy step</span>
            </div>
            <div className="p-3 rounded-xl border border-glass-border bg-background/50 flex items-center justify-between">
              <span className="text-sand font-bold">WS /api/v1/navigation/&#123;id&#125;/stream</span>
              <span className="text-muted text-[11px]">Live WebSocket telemetry streaming for 3D simulator</span>
            </div>
            <div className="p-3 rounded-xl border border-glass-border bg-background/50 flex items-center justify-between">
              <span className="text-primary font-bold">GET /api/v1/environments/&#123;id&#125;/graph</span>
              <span className="text-muted text-[11px]">Retrieve full NetworkX topological 3D graph</span>
            </div>
            <div className="p-3 rounded-xl border border-glass-border bg-background/50 flex items-center justify-between">
              <span className="text-primary font-bold">POST /api/v1/evaluations/run</span>
              <span className="text-muted text-[11px]">Execute benchmark test suite across language corpus</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
