"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Square,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Layers,
  Activity,
  Crosshair,
  Eye,
  Sliders,
} from "lucide-react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/utils";
import { EnvironmentMetadata, NavigationEpisodeState } from "@/types";

const EnvironmentViewer = dynamic(
  () => import("@/components/3d/EnvironmentViewer").then((mod) => mod.EnvironmentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[600px] rounded-2xl bg-[#0A0B09] border border-glass-border flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent/25 border-t-accent animate-spin" />
        <span className="font-mono text-xs text-muted">Initializing Fullscreen 3D Spatial Canvas...</span>
      </div>
    ),
  }
);

export default function SimulatorPage() {
  const [selectedEnvId, setSelectedEnvId] = useState<string>("env_residence_01");
  const [activeEpisode, setActiveEpisode] = useState<NavigationEpisodeState | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const { data: environments } = useQuery<EnvironmentMetadata[]>({
    queryKey: ["environments"],
    queryFn: () => api.getEnvironments(),
  });

  const { data: graphData } = useQuery({
    queryKey: ["environment_graph", selectedEnvId],
    queryFn: () => api.getEnvironmentGraph(selectedEnvId),
    enabled: !!selectedEnvId,
  });

  // Start demonstration episode if none exists
  const handleStartSim = async () => {
    const episode = await api.startNavigation({
      environment_id: selectedEnvId,
      start_viewpoint_id: "vp_01",
      goal_viewpoint_id: "vp_07",
      instruction_text: "Walk straight down the main corridor, turn left into the living room, and halt at the fire hearth.",
      language: "en",
      policy_type: "shortest_path_baseline",
      max_steps: 15,
    });
    setActiveEpisode(episode);
    setCurrentStepIndex(0);
  };

  const handleStepForward = async () => {
    if (!activeEpisode) return;
    const step = await api.executeStep(activeEpisode.id);
    setActiveEpisode((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        current_viewpoint_id: step.current_viewpoint_id,
        current_heading: step.current_heading,
        current_step: step.step_index,
        status: step.status,
        confidence: step.confidence,
        trajectory: [
          ...prev.trajectory,
          {
            viewpoint_id: step.current_viewpoint_id,
            x: step.current_coordinates.x,
            y: step.current_coordinates.y,
            z: step.current_coordinates.z,
            heading: step.current_heading,
            room_label: step.current_room,
            step: step.step_index,
          },
        ],
        outcome_metrics: step.metrics_so_far || {},
      };
    });
  };

  const handleReset = async () => {
    if (activeEpisode) {
      await api.resetNavigation(activeEpisode.id);
    }
    setActiveEpisode(null);
  };

  const visitedList = activeEpisode?.trajectory?.map((t) => t.viewpoint_id) || ["vp_01"];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
              <span>3D Virtual Environment</span>
              <span>/</span>
              <span className="text-accent">{selectedEnvId}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary">
              Interactive 3D Navigation Simulator
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEnvId}
              onChange={(e) => setSelectedEnvId(e.target.value)}
              className="bg-surface border border-glass-border rounded-xl px-3 py-2 text-xs font-mono text-primary focus:outline-none"
            >
              {environments?.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name}
                </option>
              ))}
            </select>

            {!activeEpisode ? (
              <Button variant="primary" size="sm" onClick={handleStartSim} leftIcon={<Play className="w-3.5 h-3.5" />}>
                Initialize Run
              </Button>
            ) : (
              <>
                <Button variant="glass" size="sm" onClick={handleStepForward} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                  Step Forward
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Full Interactive 3D Canvas Box */}
        <div className="flex-1 w-full relative rounded-3xl overflow-hidden border border-glass-border shadow-glass">
          <EnvironmentViewer
            nodes={graphData?.nodes || []}
            edges={graphData?.edges || []}
            currentViewpointId={activeEpisode?.current_viewpoint_id || "vp_01"}
            goalViewpointId={activeEpisode?.goal_viewpoint_id || "vp_07"}
            startViewpointId={activeEpisode?.start_viewpoint_id || "vp_01"}
            visitedTrajectory={visitedList}
            optimalPath={activeEpisode?.optimal_path || []}
            currentHeading={activeEpisode?.current_heading || 0}
            className="w-full h-full"
          />

          {/* Floating HUD Telemetry Overlay on Bottom */}
          <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-surface/85 border border-glass-border backdrop-blur-xl shadow-glass flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-muted block text-[10px] uppercase">Current Viewpoint Node</span>
              <div className="text-primary font-bold text-sm">
                {activeEpisode?.current_viewpoint_id || "vp_01 (entrance_foyer)"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted block text-[10px] uppercase">Orientation Heading</span>
              <div className="text-accent font-bold text-sm">
                {formatNumber(activeEpisode?.current_heading || 0, 1)}°
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted block text-[10px] uppercase">Calibrated Confidence</span>
              <div className="text-primary font-bold text-sm">
                {formatPercent(activeEpisode?.confidence || 1.0)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted block text-[10px] uppercase">Trajectory Steps</span>
              <div className="text-sand font-bold text-sm">
                {activeEpisode?.current_step || 0} steps taken
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted block text-[10px] uppercase">Episode Status</span>
              <Badge variant={activeEpisode?.status === "completed" ? "success" : "accent"} size="md">
                {activeEpisode?.status || "STANDBY"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
