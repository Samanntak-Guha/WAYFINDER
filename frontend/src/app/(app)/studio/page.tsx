"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Square,
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Send,
  Cpu,
  Globe2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/utils";
import { EnvironmentMetadata, NavigationEpisodeState, CandidateAction, UncertaintyFactors } from "@/types";

const EnvironmentViewer = dynamic(
  () => import("@/components/3d/EnvironmentViewer").then((mod) => mod.EnvironmentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] rounded-2xl bg-[#0A0B09] border border-glass-border flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent/25 border-t-accent animate-spin" />
        <span className="font-mono text-xs text-muted">Initializing 3D Spatial Canvas...</span>
      </div>
    ),
  }
);

export default function StudioPage() {
  // Environments & Models lists
  const { data: environments } = useQuery<EnvironmentMetadata[]>({
    queryKey: ["environments"],
    queryFn: () => api.getEnvironments(),
  });

  const { data: models } = useQuery<any[]>({
    queryKey: ["models"],
    queryFn: () => api.getModels(),
  });

  // User selections
  const [selectedEnvId, setSelectedEnvId] = useState<string>("env_residence_01");
  const [startVpId, setStartVpId] = useState<string>("vp_01");
  const [goalVpId, setGoalVpId] = useState<string>("vp_07");
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en");
  const [selectedModel, setSelectedModel] = useState<string>("claude-haiku-4-5");
  const [policyType, setPolicyType] = useState<string>("instruction_conditioned");
  const [instructionText, setInstructionText] = useState<string>(
    "Walk straight through the main corridor, turn left into the living room, and stop in front of the fire hearth."
  );

  // Active episode state
  const [activeEpisode, setActiveEpisode] = useState<NavigationEpisodeState | null>(null);
  const [latestStepData, setLatestStepData] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch full 3D graph of selected environment
  const { data: graphData, refetch: refetchGraph } = useQuery({
    queryKey: ["environment_graph", selectedEnvId],
    queryFn: () => api.getEnvironmentGraph(selectedEnvId),
    enabled: !!selectedEnvId,
  });

  // Pre-fill instructions when language changes
  useEffect(() => {
    if (language === "hi") {
      setInstructionText("प्रवेश द्वार से सीधे गलियारे में चलें, फिर बाएं मुड़कर बैठक में सोफे के पास रुकें।");
    } else if (language === "te") {
      setInstructionText("కారిడార్ గుండా తిన్నగా వెళ్లి, లివింగ్ రూమ్‌కి ఎడమవైపు తిరిగి, సోఫా వద్ద ఆగండి.");
    } else {
      setInstructionText("Walk straight through the main corridor, turn left into the living room, and stop in front of the fire hearth.");
    }
  }, [language]);

  // Handle Start
  const handleStartNavigation = async () => {
    setErrorMsg(null);
    setIsExecuting(true);
    try {
      const episode = await api.startNavigation({
        environment_id: selectedEnvId,
        start_viewpoint_id: startVpId,
        goal_viewpoint_id: goalVpId,
        instruction_text: instructionText,
        language: language,
        policy_type: policyType,
        model_id: selectedModel,
        max_steps: 20,
      });
      setActiveEpisode(episode);
      setLatestStepData(null);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to start navigation episode");
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle Step Forward
  const handleExecuteStep = async () => {
    if (!activeEpisode) return;
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      const step = await api.executeStep(activeEpisode.id);
      setLatestStepData(step);
      // Update local episode representation
      setActiveEpisode((prev) => {
        if (!prev) return prev;
        const newTraj = [
          ...prev.trajectory,
          {
            viewpoint_id: step.current_viewpoint_id,
            x: step.current_coordinates.x,
            y: step.current_coordinates.y,
            z: step.current_coordinates.z,
            heading: step.current_heading,
            room_label: step.current_room,
            step: step.step_index,
            action: step.selected_action.action_type,
          },
        ];
        return {
          ...prev,
          current_viewpoint_id: step.current_viewpoint_id,
          current_heading: step.current_heading,
          current_step: step.step_index,
          status: step.status,
          confidence: step.confidence,
          trajectory: newTraj,
          outcome_metrics: step.metrics_so_far || {},
        };
      });

      if (step.is_terminal) {
        setAutoPlay(false);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Step execution failed");
      setAutoPlay(false);
    } finally {
      setIsExecuting(false);
    }
  };

  // Auto-play loop
  useEffect(() => {
    let timer: any;
    if (autoPlay && activeEpisode && activeEpisode.status === "running" && !isExecuting) {
      timer = setTimeout(() => {
        handleExecuteStep();
      }, 1200);
    }
    return () => clearTimeout(timer);
  }, [autoPlay, activeEpisode, isExecuting]);

  // Handle Pause
  const handlePause = async () => {
    if (!activeEpisode) return;
    setAutoPlay(false);
    await api.pauseNavigation(activeEpisode.id);
    setActiveEpisode((prev) => (prev ? { ...prev, status: "paused" } : null));
  };

  // Handle Resume
  const handleResume = async () => {
    if (!activeEpisode) return;
    await api.resumeNavigation(activeEpisode.id);
    setActiveEpisode((prev) => (prev ? { ...prev, status: "running" } : null));
    setAutoPlay(true);
  };

  // Handle Stop
  const handleStop = async () => {
    if (!activeEpisode) return;
    setAutoPlay(false);
    await api.stopNavigation(activeEpisode.id);
    setActiveEpisode((prev) => (prev ? { ...prev, status: "stopped" } : null));
  };

  // Handle Reset
  const handleReset = async () => {
    if (!activeEpisode) return;
    setAutoPlay(false);
    await api.resetNavigation(activeEpisode.id);
    const startVp = graphData?.nodes?.find((n: any) => n.viewpoint_id === activeEpisode.start_viewpoint_id);
    setActiveEpisode((prev) =>
      prev
        ? {
            ...prev,
            current_viewpoint_id: prev.start_viewpoint_id,
            current_heading: startVp?.heading || 0,
            current_step: 0,
            status: "idle",
            confidence: 1.0,
            trajectory: [
              {
                viewpoint_id: prev.start_viewpoint_id,
                x: startVp?.x || 0,
                y: startVp?.y || 0,
                z: startVp?.z || 0,
                heading: startVp?.heading || 0,
                room_label: startVp?.room_label || "start",
                step: 0,
              },
            ],
            outcome_metrics: {},
          }
        : null
    );
    setLatestStepData(null);
  };

  const visitedList = activeEpisode?.trajectory?.map((t) => t.viewpoint_id) || [startVpId];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header & Episode Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
              <span>Studio</span>
              <span>/</span>
              <span className="text-accent">{selectedEnvId}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary flex items-center gap-3">
              Vision-and-Language Navigation Studio
              {activeEpisode && (
                <Badge
                  variant={
                    activeEpisode.status === "completed"
                      ? "success"
                      : activeEpisode.status === "running"
                      ? "accent"
                      : activeEpisode.status === "paused"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {activeEpisode.status}
                </Badge>
              )}
            </h1>
          </div>

          {/* Action Control Toolbar */}
          <div className="flex items-center gap-2">
            {!activeEpisode || activeEpisode.status === "idle" ? (
              <Button
                variant="primary"
                onClick={handleStartNavigation}
                isLoading={isExecuting}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Start Episode
              </Button>
            ) : (
              <>
                {activeEpisode.status === "running" ? (
                  <Button variant="outline" size="sm" onClick={handlePause} leftIcon={<Pause className="w-4 h-4" />}>
                    Pause
                  </Button>
                ) : activeEpisode.status === "paused" ? (
                  <Button variant="primary" size="sm" onClick={handleResume} leftIcon={<Play className="w-4 h-4" />}>
                    Resume
                  </Button>
                ) : null}

                {activeEpisode.status !== "completed" && activeEpisode.status !== "stopped" && (
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={handleExecuteStep}
                    isLoading={isExecuting}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Step Next
                  </Button>
                )}

                <Button variant="danger" size="sm" onClick={handleStop} leftIcon={<Square className="w-3.5 h-3.5" />}>
                  Stop
                </Button>

                <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Work Area: 3D Simulator (Left/Center) + Telemetry & State (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 3D Simulation Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="h-[560px] w-full relative">
              <EnvironmentViewer
                nodes={graphData?.nodes || []}
                edges={graphData?.edges || []}
                currentViewpointId={activeEpisode?.current_viewpoint_id || startVpId}
                goalViewpointId={goalVpId}
                startViewpointId={startVpId}
                visitedTrajectory={visitedList}
                optimalPath={activeEpisode?.optimal_path || []}
                currentHeading={activeEpisode?.current_heading || 0}
                onSelectViewpoint={(vpId) => {
                  if (!activeEpisode || activeEpisode.status === "idle") {
                    setStartVpId(vpId);
                  }
                }}
                className="h-full w-full"
              />
            </div>

            {/* Natural-Language Instruction Formulation Bar */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-accent" />
                  NAVIGATION INSTRUCTION (MULTILINGUAL)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      language === "en" ? "bg-accent/20 text-accent font-semibold" : "text-muted hover:text-primary"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("hi")}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      language === "hi" ? "bg-accent/20 text-accent font-semibold" : "text-muted hover:text-primary"
                    }`}
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => setLanguage("te")}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      language === "te" ? "bg-accent/20 text-accent font-semibold" : "text-muted hover:text-primary"
                    }`}
                  >
                    తెలుగు
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={instructionText}
                  onChange={(e) => setInstructionText(e.target.value)}
                  disabled={activeEpisode?.status === "running"}
                  className="flex-1 bg-surface/80 border border-glass-border px-3.5 py-2.5 rounded-xl text-sm text-primary focus:outline-none focus:border-accent/60"
                  placeholder="Enter natural-language navigation instruction..."
                />
                {!activeEpisode || activeEpisode.status === "idle" ? (
                  <Button variant="primary" size="md" onClick={handleStartNavigation} leftIcon={<Send className="w-4 h-4" />}>
                    Dispatch
                  </Button>
                ) : (
                  <Button
                    variant="glass"
                    size="md"
                    onClick={() => setAutoPlay(!autoPlay)}
                    leftIcon={autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  >
                    {autoPlay ? "Auto Step (Running)" : "Auto Play"}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: State Inspector, Action Timeline & Configuration */}
          <div className="lg:col-span-4 space-y-6">
            {/* Configuration Panel */}
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
                <span className="text-xs font-mono text-muted uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-accent" />
                  Episode Configuration
                </span>
                <span className="text-[10px] font-mono text-secondary">
                  Nodes: {graphData?.total_nodes || 0}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-muted block mb-1">ENVIRONMENT</label>
                  <select
                    value={selectedEnvId}
                    onChange={(e) => setSelectedEnvId(e.target.value)}
                    disabled={activeEpisode?.status === "running"}
                    className="w-full bg-surface border border-glass-border rounded-lg p-2 text-primary focus:outline-none"
                  >
                    {environments?.map((env) => (
                      <option key={env.id} value={env.id}>
                        {env.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-muted block mb-1">DECISION POLICY</label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    disabled={activeEpisode?.status === "running"}
                    className="w-full bg-surface border border-glass-border rounded-lg p-2 text-primary focus:outline-none"
                  >
                    <option value="instruction_conditioned">Instruction Grounded</option>
                    <option value="shortest_path_baseline">Shortest Path (Oracle)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-muted block mb-1">START VIEWPOINT</label>
                  <select
                    value={startVpId}
                    onChange={(e) => setStartVpId(e.target.value)}
                    disabled={activeEpisode?.status === "running"}
                    className="w-full bg-surface border border-glass-border rounded-lg p-2 text-primary focus:outline-none"
                  >
                    {graphData?.nodes?.map((n: any) => (
                      <option key={n.viewpoint_id} value={n.viewpoint_id}>
                        {n.viewpoint_id} ({n.room_label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-muted block mb-1">GOAL VIEWPOINT</label>
                  <select
                    value={goalVpId}
                    onChange={(e) => setGoalVpId(e.target.value)}
                    disabled={activeEpisode?.status === "running"}
                    className="w-full bg-surface border border-glass-border rounded-lg p-2 text-primary focus:outline-none"
                  >
                    {graphData?.nodes?.map((n: any) => (
                      <option key={n.viewpoint_id} value={n.viewpoint_id}>
                        {n.viewpoint_id} ({n.room_label})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Real-time State & Action Inspector */}
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
                <span className="text-xs font-mono text-muted uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sand" />
                  Agent State Inspector
                </span>
                <span className="text-xs font-mono text-accent">
                  STEP {activeEpisode?.current_step || 0} / 20
                </span>
              </div>

              {/* Confidence & Uncertainty */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">CALIBRATED CONFIDENCE</span>
                  <span className="text-primary font-bold">
                    {formatPercent(activeEpisode?.confidence ?? 1.0)}
                  </span>
                </div>
                <div className="w-full bg-surface-active h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${(activeEpisode?.confidence ?? 1.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Selected Action & Rationale */}
              {latestStepData ? (
                <div className="p-3 rounded-xl border border-glass-border bg-background/60 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">CHOSEN ACTION</span>
                    <Badge variant="accent">
                      {latestStepData.selected_action.action_type}
                    </Badge>
                  </div>
                  <div className="text-primary font-medium">
                    Target: {latestStepData.selected_action.target_viewpoint_id || "CURRENT (STOP)"}
                  </div>
                  <p className="text-[11px] text-secondary font-sans leading-relaxed pt-1 border-t border-glass-border/40">
                    {latestStepData.selected_action.rationale || latestStepData.rationale}
                  </p>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted font-mono">
                  Ready. Press &ldquo;Start Episode&rdquo; to begin.
                </div>
              )}

              {/* Trajectory Timeline */}
              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                  Visited Viewpoint Trajectory
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {visitedList.map((vp, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-md border ${
                        vp === activeEpisode?.current_viewpoint_id
                          ? "bg-accent/20 text-accent border-accent/40 font-bold"
                          : "bg-surface border-glass-border text-secondary"
                      }`}
                    >
                      {idx + 1}. {vp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Outcome Metrics Card (when episode completes) */}
              {activeEpisode?.status === "completed" && (
                <div className="p-4 rounded-xl border border-emerald-800/40 bg-emerald-950/20 space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>NAVIGATION EPISODE COMPLETED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-secondary pt-1">
                    <div>Success: <span className="text-primary font-bold">YES</span></div>
                    <div>SPL: <span className="text-accent font-bold">{formatNumber(activeEpisode.outcome_metrics?.spl || 1.0, 3)}</span></div>
                    <div>Path Length: <span className="text-primary">{formatNumber(activeEpisode.outcome_metrics?.path_length || 0, 1)}m</span></div>
                    <div>Nav Error: <span className="text-primary">{formatNumber(activeEpisode.outcome_metrics?.navigation_error || 0, 2)}m</span></div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
