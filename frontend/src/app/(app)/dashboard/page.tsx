"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/utils";
import { DashboardSummary } from "@/types";

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ["dashboard_summary"],
    queryFn: () => api.getDashboardSummary(),
  });

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
              <span>Overview</span>
              <span>/</span>
              <span className="text-accent">Research Telemetry</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              Navigation Research Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/studio">
              <Button variant="primary" leftIcon={<Play className="w-4 h-4" />}>
                Launch Navigation Studio
              </Button>
            </Link>
            <Link href="/evaluations">
              <Button variant="glass" leftIcon={<BarChart3 className="w-4 h-4" />}>
                Run Benchmark
              </Button>
            </Link>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Success Rate */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted text-xs font-mono uppercase tracking-wider">
              <span>Success Rate (SR)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-semibold text-primary font-mono tracking-tight">
              {isLoading ? "..." : formatPercent(summary?.success_rate || 0)}
            </div>
            <p className="text-xs text-secondary font-light">
              Threshold: d(final, goal) ≤ 3.0m
            </p>
          </Card>

          {/* Card 2: SPL (Success weighted by Path Length) */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted text-xs font-mono uppercase tracking-wider">
              <span>Path Efficiency (SPL)</span>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div className="text-3xl font-semibold text-accent font-mono tracking-tight">
              {isLoading ? "..." : formatNumber(summary?.average_spl || 0, 3)}
            </div>
            <p className="text-xs text-secondary font-light">
              Benchmark standard metric (0 to 1.0)
            </p>
          </Card>

          {/* Card 3: Episodes Executed */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted text-xs font-mono uppercase tracking-wider">
              <span>Completed Episodes</span>
              <Activity className="w-4 h-4 text-sand" />
            </div>
            <div className="text-3xl font-semibold text-primary font-mono tracking-tight">
              {isLoading ? "..." : summary?.total_episodes || 0}
            </div>
            <p className="text-xs text-secondary font-light">
              Successful: {summary?.successful_episodes || 0} episodes
            </p>
          </Card>

          {/* Card 4: AI Model Status */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-muted text-xs font-mono uppercase tracking-wider">
              <span>Inference Engine</span>
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-semibold text-primary font-mono tracking-tight capitalize flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${summary?.ai_model_status === "offline" ? "bg-red-500" : "bg-emerald-400 animate-pulse"}`} />
              {isLoading ? "Checking..." : summary?.ai_model_status || "Online"}
            </div>
            <p className="text-xs text-secondary font-light">
              Direct NIM / FreeLLM Gateway
            </p>
          </Card>
        </div>

        {/* Recent Navigation Activity & Benchmark Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recent Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Navigation Episodes</CardTitle>
                  <CardDescription>Live record of sequential agent runs and decisions</CardDescription>
                </div>
                <Link href="/experiments">
                  <Button variant="outline" size="sm">
                    View All History
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {!summary?.recent_activity?.length ? (
                  <div className="p-12 text-center space-y-3">
                    <Compass className="w-8 h-8 text-muted mx-auto" />
                    <div className="text-sm text-primary font-medium">No recorded episodes yet</div>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Start your first navigation episode in the Studio to record trajectories, decisions, and calibrated uncertainty.
                    </p>
                    <Link href="/studio">
                      <Button variant="primary" size="sm" className="mt-2">
                        Start Studio Episode
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-glass-border">
                    {summary.recent_activity.map((act) => (
                      <div key={act.id} className="p-4 flex items-center justify-between hover:bg-surface/40 transition-colors text-xs font-mono">
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-semibold">{act.environment_id}</span>
                            <Badge variant={act.status === "completed" ? "success" : act.status === "running" ? "accent" : "warning"} size="sm">
                              {act.status}
                            </Badge>
                            <span className="text-muted uppercase text-[10px]">{act.language}</span>
                          </div>
                          <p className="text-secondary truncate text-[11px] font-sans font-light">
                            {act.instruction}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-primary font-semibold">
                            Confidence: {formatPercent(act.confidence)}
                          </div>
                          <span className="text-[10px] text-muted">
                            {act.created_at ? new Date(act.created_at).toLocaleTimeString() : "Live"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Environment & Research Status Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registered Environments</CardTitle>
                <CardDescription>Matterport3D and architectural test topologies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 font-mono text-xs">
                <div className="p-3 rounded-xl border border-glass-border bg-background/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">Modern Minimalist Villa</span>
                    <Badge variant="success" size="sm">Ready</Badge>
                  </div>
                  <div className="text-muted text-[11px]">18 Viewpoints · 32 Edges · Residential</div>
                </div>

                <div className="p-3 rounded-xl border border-glass-border bg-background/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">Pavilion of Contemporary Art</span>
                    <Badge variant="success" size="sm">Ready</Badge>
                  </div>
                  <div className="text-muted text-[11px]">15 Viewpoints · 26 Edges · Gallery</div>
                </div>

                <div className="p-3 rounded-xl border border-glass-border bg-background/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold">Matterport3D Scan Scaffolds</span>
                    <Badge variant="sand" size="sm">Adapter Ready</Badge>
                  </div>
                  <div className="text-muted text-[11px]">Scans: 2tNkQVZXNV5, gTV8FGcVJC9</div>
                </div>

                <Link href="/datasets" className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Explore Datasets &amp; Scans
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
