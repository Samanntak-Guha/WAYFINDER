"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Activity,
  Calendar,
  Share2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/utils";

export default function ExperimentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: experiment, isLoading, error } = useQuery({
    queryKey: ["experiment_detail", id],
    queryFn: () => api.getExperimentDetail(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-12 text-center font-mono text-xs text-muted">
          Loading experiment records...
        </div>
      </AppShell>
    );
  }

  if (error || !experiment) {
    return (
      <AppShell>
        <div className="space-y-4 max-w-xl mx-auto text-center py-12">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold text-primary">Experiment Not Found</h2>
          <p className="text-xs text-muted font-mono">
            Could not find an experiment matching ID: {id}
          </p>
          <Link href="/experiments">
            <Button variant="outline" size="sm">
              Back to History
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Back Link & Header */}
        <div className="space-y-3">
          <Link
            href="/experiments"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO EXPERIMENT ARCHIVE</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-primary">
                {experiment.name}
              </h1>
              <p className="text-xs text-secondary mt-1 font-mono">
                ID: {experiment.id} · Environment: {experiment.environment_id}
              </p>
            </div>
            <Badge variant={experiment.status === "completed" ? "success" : "accent"} size="md">
              {experiment.status}
            </Badge>
          </div>
        </div>

        {/* Experiment Telemetry Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono text-xs">
          <Card className="p-5 space-y-1">
            <span className="text-muted block text-[10px] uppercase">Decision Policy</span>
            <div className="text-xl font-bold text-primary">{experiment.policy_type}</div>
          </Card>
          <Card className="p-5 space-y-1">
            <span className="text-muted block text-[10px] uppercase">Created Date</span>
            <div className="text-xl font-bold text-accent">
              {experiment.created_at ? new Date(experiment.created_at).toLocaleDateString() : "Recent"}
            </div>
          </Card>
          <Card className="p-5 space-y-1">
            <span className="text-muted block text-[10px] uppercase">Episodes Logged</span>
            <div className="text-xl font-bold text-sand">{experiment.episodes?.length || 0}</div>
          </Card>
        </div>

        {/* Navigation Episodes List */}
        <Card>
          <CardHeader>
            <CardTitle>Recorded Navigation Episodes</CardTitle>
            <CardDescription>
              Step-by-step decision episodes executed under this experimental configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!experiment.episodes?.length ? (
              <div className="p-12 text-center text-xs font-mono text-muted">
                No individual episodes recorded under this run.
              </div>
            ) : (
              <div className="divide-y divide-glass-border">
                {experiment.episodes.map((ep: any) => (
                  <div key={ep.id} className="p-5 space-y-3 hover:bg-surface/30 transition-colors">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{ep.id.slice(0, 8)}...</span>
                        <Badge variant={ep.status === "completed" ? "success" : "warning"} size="sm">
                          {ep.status}
                        </Badge>
                        <Badge variant="sand" size="sm">{ep.language.toUpperCase()}</Badge>
                      </div>

                      <div className="text-secondary text-[11px]">
                        Route: <span className="text-primary">{ep.start_viewpoint_id}</span> → <span className="text-accent">{ep.goal_viewpoint_id}</span>
                      </div>
                    </div>

                    <p className="text-sm text-primary font-light italic">
                      &ldquo;{ep.instruction}&rdquo;
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-glass-border/40 font-mono text-xs">
                      <div>
                        <span className="text-muted text-[10px] block">Steps</span>
                        <span className="text-primary font-bold">{ep.steps}</span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] block">SPL</span>
                        <span className="text-accent font-bold">
                          {formatNumber(ep.metrics?.spl || 1.0, 3)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] block">Nav Error</span>
                        <span className="text-primary font-bold">
                          {formatNumber(ep.metrics?.navigation_error || 0, 2)}m
                        </span>
                      </div>
                      <div>
                        <span className="text-muted text-[10px] block">Path Length</span>
                        <span className="text-primary font-bold">
                          {formatNumber(ep.metrics?.path_length || 0, 1)}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
