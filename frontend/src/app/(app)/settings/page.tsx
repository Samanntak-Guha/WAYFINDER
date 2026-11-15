"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Cpu,
  Globe2,
  Shield,
  Eye,
  Sliders,
  CheckCircle2,
  Save,
  Laptop,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const [provider, setProvider] = useState<string>("freellmapi");
  const [model, setModel] = useState<string>("claude-haiku-4-5");
  const [temperature, setTemperature] = useState<number>(0.2);
  const [maxSteps, setMaxSteps] = useState<number>(20);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [autoBacktracking, setAutoBacktracking] = useState<boolean>(true);
  const [savedMsg, setSavedMsg] = useState<boolean>(false);

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
            <span>System Configuration</span>
            <span>/</span>
            <span className="text-accent">Preferences</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            Settings &amp; Model Configuration
          </h1>
        </div>

        {savedMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        {/* AI Provider & Inference Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inference Provider Abstraction</CardTitle>
                <CardDescription>
                  Configure active backend gateway for vision-and-language model inference
                </CardDescription>
              </div>
              <Badge variant="accent">Production Ready</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-muted block mb-1">AI INFERENCE PROVIDER</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-surface border border-glass-border rounded-xl p-2.5 text-primary focus:outline-none"
                >
                  <option value="freellmapi">Local Development Gateway (FreeLLMAPI)</option>
                  <option value="nvidia_nim">Direct NVIDIA NIM API (build.nvidia.com)</option>
                  <option value="custom_openai">Custom OpenAI-Compatible Gateway</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-muted block mb-1">DEFAULT MODEL IDENTIFIER</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-surface border border-glass-border rounded-xl p-2.5 text-primary focus:outline-none"
                >
                  <option value="claude-haiku-4-5">Claude Haiku 4.5 (Multimodal &amp; Fast)</option>
                  <option value="gpt-oss-20b">GPT OSS 20B (Reasoning)</option>
                  <option value="meta/llama-3.3-70b-instruct">Llama 3.3 70B Instruct (NVIDIA NIM)</option>
                  <option value="meta/llama-3.2-90b-vision-instruct">Llama 3.2 90B Vision Instruct</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Inference Temperature</span>
                <span className="text-primary font-bold">{temperature}</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={1.0}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#B7C5A5]"
              />
              <span className="text-[10px] text-muted block">
                Lower values (0.1 - 0.2) yield strictly deterministic grounded navigational choices.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation & Recovery Policy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Autonomous Policy &amp; Loop Recovery</CardTitle>
            <CardDescription>
              Control agent trajectory safety limits, cycle detection, and backtracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-muted block mb-1">EPISODE STEP LIMIT</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={maxSteps}
                  onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                  className="w-full bg-surface border border-glass-border rounded-xl p-2.5 text-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-surface/50">
                <div>
                  <span className="text-primary font-semibold block">Automatic Backtracking</span>
                  <span className="text-muted text-[10px]">Backtrack on loop detection</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoBacktracking}
                  onChange={(e) => setAutoBacktracking(e.target.checked)}
                  className="w-4 h-4 accent-[#B7C5A5]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual & Hardware Optimization */}
        <Card>
          <CardHeader>
            <CardTitle>Visual &amp; Hardware Preferences</CardTitle>
            <CardDescription>
              Tailored for NVIDIA RTX 4050 6GB Laptop GPU and smooth 60fps rendering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-surface/50">
              <div>
                <span className="text-primary font-semibold block">Prefers Reduced Motion</span>
                <span className="text-muted text-[10px]">Disable background particle animations</span>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-4 h-4 accent-[#B7C5A5]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
            Save Preferences
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
