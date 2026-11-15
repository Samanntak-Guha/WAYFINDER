"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Database,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FolderOpen,
  FileText,
  Globe2,
  HardDrive,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function DatasetsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localMountPath, setLocalMountPath] = useState<string>("C:\\Datasets\\RxR");
  const [mountStatus, setMountStatus] = useState<any | null>(null);

  const { data: datasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => api.getDatasets(),
  });

  const { data: instructions } = useQuery({
    queryKey: ["instructions", selectedLanguage],
    queryFn: () =>
      api.getInstructions("rxr_benchmark", {
        language: selectedLanguage === "all" ? undefined : selectedLanguage,
      }),
  });

  const handleRegisterLocal = async () => {
    try {
      const res = await api.registerLocalDataset({
        dataset_id: "rxr_benchmark",
        local_path: localMountPath,
        license_confirmed: true,
      });
      setMountStatus(res);
    } catch (e: any) {
      setMountStatus({ status: "error", message: e.message });
    }
  };

  const filteredInstructions = instructions?.filter((inst: any) => {
    if (!searchQuery) return true;
    return (
      inst.instruction_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.environment_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
              <span>Data Management</span>
              <span>/</span>
              <span className="text-accent">RxR &amp; Matterport3D</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              Benchmark Dataset Explorer
            </h1>
          </div>
          <Badge variant="accent">RxR Benchmark v1.0 Standard</Badge>
        </div>

        {/* Datasets Catalog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {datasets?.map((ds) => (
            <Card key={ds.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-primary">{ds.name}</h3>
                  <p className="text-xs text-muted font-mono mt-0.5">{ds.license}</p>
                </div>
                <Badge variant={ds.is_available ? "success" : "warning"}>
                  {ds.status}
                </Badge>
              </div>

              <p className="text-xs text-secondary leading-relaxed font-light">
                {ds.description}
              </p>

              <div className="pt-4 border-t border-glass-border/60 grid grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <span className="text-muted block text-[10px] uppercase">Instructions</span>
                  <span className="text-primary font-bold">{ds.total_instructions.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase">Environments</span>
                  <span className="text-accent font-bold">{ds.total_environments}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase">Languages</span>
                  <span className="text-sand font-bold">{ds.languages?.join(", ").toUpperCase() || "N/A"}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Local Directory Scanner & Mount Utility */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-medium text-primary">Local Authorized Dataset Mount</h3>
          </div>
          <p className="text-xs text-secondary font-light max-w-2xl">
            Register locally downloaded Matterport3D scans or RxR annotation folders (`*.connectivity.json`, `*.jsonl.gz`).
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <input
              type="text"
              value={localMountPath}
              onChange={(e) => setLocalMountPath(e.target.value)}
              placeholder="C:\Path\To\Matterport3D"
              className="flex-1 w-full bg-surface border border-glass-border rounded-xl px-4 py-2.5 text-xs font-mono text-primary focus:outline-none"
            />
            <Button variant="primary" size="md" onClick={handleRegisterLocal} leftIcon={<FolderOpen className="w-4 h-4" />}>
              Scan &amp; Register Path
            </Button>
          </div>

          {mountStatus && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                mountStatus.is_valid_path
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                  : "bg-amber-950/20 border-amber-800/40 text-amber-300"
              }`}
            >
              {mountStatus.is_valid_path ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{mountStatus.message}</span>
            </div>
          )}
        </Card>

        {/* Benchmark Instructions Explorer */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Multilingual Navigation Instruction Corpus</CardTitle>
              <CardDescription>
                Verified ground-truth instructions and viewpoint trajectories across English, Hindi, and Telugu
              </CardDescription>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-glass-border font-mono text-xs">
                {["all", "en", "hi", "te"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1 rounded text-[11px] uppercase transition-colors ${
                      selectedLanguage === lang
                        ? "bg-accent/20 text-accent font-bold"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-glass-border">
              {filteredInstructions?.map((inst: any) => (
                <div key={inst.id} className="p-5 space-y-3 hover:bg-surface/30 transition-colors">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">{inst.id}</span>
                      <Badge variant="neutral" size="sm">{inst.environment_id}</Badge>
                      <Badge variant="accent" size="sm">{inst.split_name}</Badge>
                      <Badge variant="sand" size="sm">{inst.language.toUpperCase()}</Badge>
                    </div>
                    <span className="text-muted text-[11px]">
                      Optimal Path: {inst.ground_truth_path?.length || 0} nodes
                    </span>
                  </div>

                  <p className="text-base text-primary font-light italic">
                    &ldquo;{inst.instruction_text}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted pt-1">
                    <span>Landmarks:</span>
                    {inst.extracted_landmarks?.map((lmk: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-surface border border-glass-border text-secondary">
                        {lmk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
