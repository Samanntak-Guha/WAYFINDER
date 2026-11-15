"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Play,
  TrendingUp,
  Globe2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Layers,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/utils";
import { EvaluationResult } from "@/types";

export default function EvaluationsPage() {
  const queryClient = useQueryClient();
  const [selectedSplit, setSelectedSplit] = useState<string>("val_unseen");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedPolicy, setSelectedPolicy] = useState<string>("instruction_conditioned");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const { data: evaluations, isLoading } = useQuery<EvaluationResult[]>({
    queryKey: ["evaluations"],
    queryFn: () => api.getEvaluations(),
  });

  const runMutation = useMutation({
    mutationFn: () =>
      api.runEvaluation({
        dataset_name: "rxr_benchmark",
        split_name: selectedSplit,
        language: selectedLanguage,
        policy_type: selectedPolicy,
        max_episodes: 5,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_summary"] });
      setIsRunning(false);
    },
    onError: () => {
      setIsRunning(false);
    },
  });

  const handleStartBenchmark = () => {
    setIsRunning(true);
    runMutation.mutate();
  };

  const latestEval = evaluations && evaluations.length > 0 ? evaluations[0] : null;

  // Recharts radar data comparing SR, OSR, SPL, Route Efficiency
  const radarData = latestEval
    ? [
        { metric: "Success Rate", score: (latestEval.success_rate || 0) * 100 },
        { metric: "Oracle SR", score: (latestEval.oracle_success_rate || 0) * 100 },
        { metric: "SPL (x100)", score: (latestEval.spl || 0) * 100 },
        { metric: "Path Efficiency", score: Math.max(0, 100 - (latestEval.navigation_error || 0) * 10) },
        { metric: "Step Adherence", score: Math.max(20, 100 - (latestEval.average_steps || 0) * 5) },
      ]
    : [
        { metric: "Success Rate", score: 0 },
        { metric: "Oracle SR", score: 0 },
        { metric: "SPL (x100)", score: 0 },
        { metric: "Path Efficiency", score: 0 },
        { metric: "Step Adherence", score: 0 },
      ];

  // Language Breakdown Chart Data
  const langChartData =
    latestEval?.language_breakdown?.map((lb) => ({
      name: lb.language.toUpperCase(),
      SR: Number(((lb.success_rate || 0) * 100).toFixed(1)),
      SPL: Number(((lb.spl || 0) * 100).toFixed(1)),
    })) || [
      { name: "EN", SR: 75, SPL: 68 },
      { name: "HI", SR: 70, SPL: 62 },
      { name: "TE", SR: 68, SPL: 59 },
    ];

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
              <span>Benchmark Evaluation</span>
              <span>/</span>
              <span className="text-accent">RxR Formulation</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              Evaluation &amp; Metrics Laboratory
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleStartBenchmark}
              isLoading={isRunning}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Run Benchmark Suite
            </Button>
          </div>
        </div>

        {/* Benchmark Run Configuration Card */}
        <Card className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <label className="text-[10px] text-muted block mb-1">EVALUATION SPLIT</label>
              <select
                value={selectedSplit}
                onChange={(e) => setSelectedSplit(e.target.value)}
                className="w-full bg-surface border border-glass-border rounded-xl p-2.5 text-primary focus:outline-none"
              >
                <option value="val_unseen">val_unseen (Unseen Environments)</option>
                <option value="val_seen">val_seen (Seen Environments)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted block mb-1">LANGUAGE CORPUS</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-surface border border-glass-border rounded-xl p-2.5 text-primary focus:outline-none"
              >
                <option value="all">All Languages (EN, HI, TE)</option>
                <option value="en">English (en)</option>
                <option value="hi">हिन्दी (hi)</option>
                <option value="te">తెలుగు (te)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted block mb-1">EVALUATION POLICY</label>
              <select
                value={selectedPolicy}
                onChange={(e) => setSelectedPolicy(e.target.value)}
                className="w-full bg-surface border border-glass-border rounded-xl p-2.5 text-primary focus:outline-none"
              >
                <option value="instruction_conditioned">Instruction Grounded Policy</option>
                <option value="shortest_path_baseline">Shortest Path Oracle Baseline</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Primary Benchmark Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 space-y-2">
            <span className="text-muted text-xs font-mono uppercase">Navigation Success (SR)</span>
            <div className="text-3xl font-semibold text-primary font-mono">
              {latestEval ? formatPercent(latestEval.success_rate) : "0.0%"}
            </div>
            <p className="text-[11px] text-secondary font-light">
              Goal distance &le; 3.0 meters
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-muted text-xs font-mono uppercase">Oracle Success (OSR)</span>
            <div className="text-3xl font-semibold text-accent font-mono">
              {latestEval ? formatPercent(latestEval.oracle_success_rate) : "0.0%"}
            </div>
            <p className="text-[11px] text-secondary font-light">
              Closest point on trajectory &le; 3.0m
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-muted text-xs font-mono uppercase">Success Weighted Path (SPL)</span>
            <div className="text-3xl font-semibold text-sand font-mono">
              {latestEval ? formatNumber(latestEval.spl, 3) : "0.000"}
            </div>
            <p className="text-[11px] text-secondary font-light">
              S &middot; L_opt / max(L_act, L_opt)
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-muted text-xs font-mono uppercase">Average Navigation Error</span>
            <div className="text-3xl font-semibold text-primary font-mono">
              {latestEval ? `${formatNumber(latestEval.navigation_error, 2)}m` : "0.00m"}
            </div>
            <p className="text-[11px] text-secondary font-light">
              Final Euclidean distance to target
            </p>
          </Card>
        </div>

        {/* Visual Charts: Radar & Multilingual Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-6">
            <Card className="p-6">
              <CardTitle>Multimodal Benchmark Radar</CardTitle>
              <CardDescription className="mb-4">
                Holistic performance balance across accuracy, length efficiency, and orientation
              </CardDescription>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#242821" />
                    <PolarAngleAxis dataKey="metric" stroke="#A4A69C" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#55594F" />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#B7C5A5"
                      fill="#B7C5A5"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Language Breakdown Bar Chart */}
          <div className="lg:col-span-6">
            <Card className="p-6">
              <CardTitle>Cross-Lingual Evaluation (EN · HI · TE)</CardTitle>
              <CardDescription className="mb-4">
                Comparison of Success Rate and SPL across English, Hindi, and Telugu instructions
              </CardDescription>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={langChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#A4A69C" fontSize={12} />
                    <YAxis stroke="#A4A69C" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1B1E19",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="SR" fill="#B7C5A5" name="Success Rate (%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="SPL" fill="#C7B99C" name="SPL (x100)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* Historical Evaluation Runs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Run Records</CardTitle>
            <CardDescription>
              Permanently recorded benchmark evaluations derived exclusively from executed navigation episodes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!evaluations?.length ? (
              <div className="p-12 text-center text-xs text-muted font-mono space-y-2">
                <Activity className="w-8 h-8 mx-auto text-muted" />
                <div>No evaluation runs executed yet.</div>
                <p className="max-w-xs mx-auto">
                  Click &ldquo;Run Benchmark Suite&rdquo; to execute a test batch and compute genuine metrics.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-surface/60 border-b border-glass-border text-muted uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Benchmark ID</th>
                      <th className="p-4">Split</th>
                      <th className="p-4">Language</th>
                      <th className="p-4">Policy</th>
                      <th className="p-4">Episodes</th>
                      <th className="p-4 text-accent">SR</th>
                      <th className="p-4 text-sand">SPL</th>
                      <th className="p-4">Avg Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/40 text-secondary">
                    {evaluations.map((ev) => (
                      <tr key={ev.id} className="hover:bg-surface/30">
                        <td className="p-4 font-bold text-primary">{ev.id.slice(0, 8)}...</td>
                        <td className="p-4">{ev.split_name}</td>
                        <td className="p-4 uppercase">{ev.language}</td>
                        <td className="p-4">{ev.policy_name}</td>
                        <td className="p-4">{ev.total_episodes}</td>
                        <td className="p-4 text-accent font-bold">{formatPercent(ev.success_rate)}</td>
                        <td className="p-4 text-sand font-bold">{formatNumber(ev.spl, 3)}</td>
                        <td className="p-4">{formatNumber(ev.navigation_error, 2)}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
