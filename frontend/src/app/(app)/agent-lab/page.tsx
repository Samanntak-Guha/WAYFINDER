"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Cpu,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  RotateCw,
  Search,
  Sliders,
  Send,
  Terminal,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/utils";

export default function AgentLabPage() {
  const { data: models } = useQuery({
    queryKey: ["models"],
    queryFn: () => api.getModels(),
  });

  const [selectedModel, setSelectedModel] = useState<string>("claude-haiku-4-5");
  const [testPrompt, setTestPrompt] = useState<string>(
    "Decompose into landmarks: Walk down the long corridor, turn left at the wooden door, and continue to the living room."
  );
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Uncertainty formula interactive simulation
  const [actionMargin, setActionMargin] = useState<number>(0.35);
  const [landmarkAlignment, setLandmarkAlignment] = useState<number>(0.85);
  const [loopPenalty, setLoopPenalty] = useState<number>(1.0);
  const [instructionClarity, setInstructionClarity] = useState<number>(0.90);

  const compositeConfidence = Math.min(
    0.99,
    Math.max(
      0.05,
      Number((0.40 * actionMargin + 0.30 * landmarkAlignment + 0.15 * loopPenalty + 0.15 * instructionClarity).toFixed(3))
    )
  );

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.testModel({
        provider: "freellmapi",
        model_id: selectedModel,
        prompt: testPrompt,
      });
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
              <span>Agent Laboratory</span>
              <span>/</span>
              <span className="text-accent">Model &amp; Policy Diagnostics</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">
              AI Decision &amp; Perception Laboratory
            </h1>
          </div>
          <Badge variant="accent" size="md">
            Active Engine: Instruction Grounding Policy v1.0
          </Badge>
        </div>

        {/* Section 1: Active Model Inspection & Live Inference Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inference Provider Diagnostics</CardTitle>
                <CardDescription>
                  Verify actual LLM/VLM connectivity, latency, and structured parsing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-muted block mb-1">SELECT EVALUATION MODEL</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-surface border border-glass-border rounded-xl p-2.5 text-primary focus:outline-none"
                  >
                    {models?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.provider})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-muted block mb-1">TEST DIAGNOSTIC PROMPT</label>
                  <textarea
                    rows={3}
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="w-full bg-surface border border-glass-border rounded-xl p-2.5 text-primary text-xs font-sans focus:outline-none"
                  />
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  isLoading={isTesting}
                  onClick={handleRunTest}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Execute Inference Verification
                </Button>

                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border ${
                      testResult.success
                        ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                        : "bg-red-950/20 border-red-800/40 text-red-300"
                    } space-y-1.5`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{testResult.success ? "VERIFIED ONLINE" : "TEST FAILED"}</span>
                      {testResult.latency_ms && <span>{testResult.latency_ms} ms</span>}
                    </div>
                    <p className="text-[11px] font-sans text-secondary">
                      {testResult.response_text || testResult.error}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Calibrated Uncertainty Formulation Simulator */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mathematical Confidence &amp; Uncertainty Engine</CardTitle>
                    <CardDescription>
                      Calibrated composite formulation: C = 0.40&Delta; + 0.30V + 0.15L + 0.15I
                    </CardDescription>
                  </div>
                  <Badge variant={compositeConfidence < 0.45 ? "danger" : "accent"} size="md">
                    {compositeConfidence < 0.45 ? "HIGH UNCERTAINTY" : "HIGH CONFIDENCE"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 font-mono text-xs">
                {/* Composite Gauge */}
                <div className="p-4 rounded-xl border border-glass-border bg-background/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Composite Calibrated Confidence</span>
                    <span className="text-3xl font-bold text-accent">{formatPercent(compositeConfidence)}</span>
                  </div>
                  <div className="text-right text-[11px] text-secondary">
                    <div>Action Margin (&Delta;): {formatNumber(actionMargin, 2)}</div>
                    <div>Visual Landmark (V): {formatNumber(landmarkAlignment, 2)}</div>
                  </div>
                </div>

                {/* Interactive Sliders to demonstrate rigorous uncertainty behavior */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted">Action Score Margin (&Delta; = s1 - s2) [Weight: 40%]</span>
                      <span className="text-primary font-bold">{formatNumber(actionMargin, 2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={actionMargin}
                      onChange={(e) => setActionMargin(parseFloat(e.target.value))}
                      className="w-full accent-[#B7C5A5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted">Visual Landmark Alignment (V_align) [Weight: 30%]</span>
                      <span className="text-primary font-bold">{formatNumber(landmarkAlignment, 2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={landmarkAlignment}
                      onChange={(e) => setLandmarkAlignment(parseFloat(e.target.value))}
                      className="w-full accent-[#B7C5A5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted">Cycle / Loop Avoidance Factor (L_factor) [Weight: 15%]</span>
                      <span className="text-primary font-bold">{formatNumber(loopPenalty, 2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={loopPenalty}
                      onChange={(e) => setLoopPenalty(parseFloat(e.target.value))}
                      className="w-full accent-[#B7C5A5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted">Instruction Syntax Clarity (I_clarity) [Weight: 15%]</span>
                      <span className="text-primary font-bold">{formatNumber(instructionClarity, 2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={1}
                      step={0.01}
                      value={instructionClarity}
                      onChange={(e) => setInstructionClarity(parseFloat(e.target.value))}
                      className="w-full accent-[#B7C5A5]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-glass-border/40 bg-surface/30 text-[11px] text-secondary font-sans leading-relaxed">
                  <span className="font-mono text-accent font-semibold block mb-0.5">Calibrated Confidence Rule:</span>
                  When candidate scores have tight margins (&Delta; &lt; 0.15) or visual alignment drops, confidence drops below 0.45, triggering active backtracking and re-evaluation rather than blind forward movement.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 3: Multilingual Prompt & Landmark Decomposition Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Multilingual Grounding &amp; Spatial Decomposition Matrix</CardTitle>
            <CardDescription>
              Inspection of how multilingual sentences map into canonical navigation primitives
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface/60 border-b border-glass-border text-muted uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Language</th>
                    <th className="p-4">Sample Lexical Token</th>
                    <th className="p-4">Canonical Action</th>
                    <th className="p-4">Extracted Landmark</th>
                    <th className="p-4">Relative Heading</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/40 text-secondary">
                  <tr className="hover:bg-surface/30">
                    <td className="p-4 font-bold text-primary">English (en)</td>
                    <td className="p-4">&ldquo;turn left at the wooden door&rdquo;</td>
                    <td className="p-4 text-accent font-semibold">TURN_LEFT</td>
                    <td className="p-4">wooden_door</td>
                    <td className="p-4">-90°</td>
                  </tr>
                  <tr className="hover:bg-surface/30">
                    <td className="p-4 font-bold text-primary">हिन्दी (hi)</td>
                    <td className="p-4">&ldquo;लकड़ी के दरवाजे पर बाएं मुड़ें&rdquo;</td>
                    <td className="p-4 text-accent font-semibold">TURN_LEFT</td>
                    <td className="p-4">wooden_door</td>
                    <td className="p-4">-90°</td>
                  </tr>
                  <tr className="hover:bg-surface/30">
                    <td className="p-4 font-bold text-primary">తెలుగు (te)</td>
                    <td className="p-4">&ldquo;చెక్క తలుపు వద్ద ఎడమవైపు తిరగండి&rdquo;</td>
                    <td className="p-4 text-accent font-semibold">TURN_LEFT</td>
                    <td className="p-4">wooden_door</td>
                    <td className="p-4">-90°</td>
                  </tr>
                  <tr className="hover:bg-surface/30">
                    <td className="p-4 font-bold text-primary">English (en)</td>
                    <td className="p-4">&ldquo;walk down the long corridor&rdquo;</td>
                    <td className="p-4 text-accent font-semibold">MOVE_FORWARD</td>
                    <td className="p-4">main_corridor</td>
                    <td className="p-4">0°</td>
                  </tr>
                  <tr className="hover:bg-surface/30">
                    <td className="p-4 font-bold text-primary">हिन्दी (hi)</td>
                    <td className="p-4">&ldquo;लंबे गलियारे से सीधे आगे बढ़ें&rdquo;</td>
                    <td className="p-4 text-accent font-semibold">MOVE_FORWARD</td>
                    <td className="p-4">main_corridor</td>
                    <td className="p-4">0°</td>
                  </tr>
                  <tr className="hover:bg-surface/30">
                    <td className="p-4 font-bold text-primary">తెలుగు (te)</td>
                    <td className="p-4">&ldquo;పొడవైన కారిడార్ గుండా తిన్నగా వెళ్ళండి&rdquo;</td>
                    <td className="p-4 text-accent font-semibold">MOVE_FORWARD</td>
                    <td className="p-4">main_corridor</td>
                    <td className="p-4">0°</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
