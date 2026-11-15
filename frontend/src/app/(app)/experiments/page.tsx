"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Search,
  Filter,
  ArrowRight,
  Compass,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function ExperimentsPage() {
  const [search, setSearch] = useState("");
  const [filterPolicy, setFilterPolicy] = useState("all");

  const { data: experiments, isLoading } = useQuery({
    queryKey: ["experiments", filterPolicy],
    queryFn: () =>
      api.getExperiments({
        policy_type: filterPolicy === "all" ? undefined : filterPolicy,
      }),
  });

  const filtered = experiments?.filter((exp) => {
    if (!search) return true;
    return exp.name.toLowerCase().includes(search.toLowerCase()) || exp.environment_id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
              <span>Experiment Archive</span>
              <span>/</span>
              <span className="text-accent">Persistent Runs</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              Experiment History &amp; Trajectories
            </h1>
          </div>

          <Link href="/studio">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Experiment
            </Button>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full flex items-center gap-2">
            <Search className="w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiments by name or environment..."
              className="w-full bg-transparent border-none text-xs font-mono text-primary placeholder:text-muted focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <Filter className="w-4 h-4 text-muted" />
            <select
              value={filterPolicy}
              onChange={(e) => setFilterPolicy(e.target.value)}
              className="bg-surface border border-glass-border rounded-lg px-3 py-1.5 text-secondary focus:outline-none"
            >
              <option value="all">All Policies</option>
              <option value="instruction_conditioned">Instruction Grounded</option>
              <option value="shortest_path_baseline">Shortest Path Baseline</option>
            </select>
          </div>
        </Card>

        {/* Experiments List */}
        <Card>
          <CardHeader>
            <CardTitle>Archived Research Experiments</CardTitle>
            <CardDescription>
              Every completed or recorded episode with detailed step sequences and evaluations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!filtered?.length ? (
              <div className="p-16 text-center text-xs font-mono text-muted space-y-3">
                <History className="w-8 h-8 text-muted mx-auto" />
                <div className="text-primary font-medium">No experiments found</div>
                <p className="max-w-xs mx-auto">
                  Run a navigation episode in the Studio to automatically log the trajectory and decision metrics.
                </p>
                <Link href="/studio">
                  <Button variant="primary" size="sm">
                    Open Studio
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-glass-border">
                {filtered.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/experiments/${exp.id}`}
                          className="text-base font-medium text-primary hover:text-accent transition-colors font-sans"
                        >
                          {exp.name}
                        </Link>
                        <Badge
                          variant={exp.status === "completed" ? "success" : "accent"}
                          size="sm"
                        >
                          {exp.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                        <span>Env: <span className="text-secondary">{exp.environment_id}</span></span>
                        <span>·</span>
                        <span>Policy: <span className="text-secondary">{exp.policy_type}</span></span>
                        <span>·</span>
                        <span>Episodes: <span className="text-secondary">{exp.total_episodes}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono text-xs text-muted hidden sm:block">
                        <div className="text-secondary">
                          {exp.created_at ? new Date(exp.created_at).toLocaleDateString() : ""}
                        </div>
                      </div>

                      <Link href={`/experiments/${exp.id}`}>
                        <Button variant="glass" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Inspect
                        </Button>
                      </Link>
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
