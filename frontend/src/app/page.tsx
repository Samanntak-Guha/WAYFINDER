"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  BarChart2,
  ShieldCheck,
  Globe2,
  Terminal,
  Activity,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { CursorGlow } from "@/components/common/CursorGlow";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ViewpointNode, NavigationEdge } from "@/types";

const EnvironmentViewer = dynamic(
  () => import("@/components/3d/EnvironmentViewer").then((mod) => mod.EnvironmentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[460px] rounded-2xl bg-[#0A0B09] border border-glass-border flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-accent/25 border-t-accent animate-spin" />
        <span className="font-mono text-[11px] text-muted">Initializing 3D Spatial Canvas...</span>
      </div>
    ),
  }
);

// Demonstration scene data for interactive landing hero
const DEMO_NODES: ViewpointNode[] = [
  { viewpoint_id: "vp_01", x: 0, y: 0, z: 0, heading: 0, room_label: "foyer", is_navigable: true },
  { viewpoint_id: "vp_02", x: 0, y: 0, z: 2.8, heading: 0, room_label: "gallery", is_navigable: true },
  { viewpoint_id: "vp_03", x: 0, y: 0, z: 5.6, heading: 0, room_label: "rotunda", is_navigable: true },
  { viewpoint_id: "vp_06", x: 3.2, y: 0, z: 4.2, heading: 90, room_label: "living_room", is_navigable: true },
  { viewpoint_id: "vp_07", x: 6.4, y: 0, z: 4.2, heading: 90, room_label: "living_room", is_navigable: true },
  { viewpoint_id: "vp_09", x: -3.2, y: 0, z: 4.2, heading: 270, room_label: "dining", is_navigable: true },
  { viewpoint_id: "vp_10", x: -6.4, y: 0, z: 4.2, heading: 270, room_label: "kitchen", is_navigable: true },
];

const DEMO_EDGES: NavigationEdge[] = [
  { from_viewpoint_id: "vp_01", to_viewpoint_id: "vp_02", distance: 2.8, heading_angle: 0 },
  { from_viewpoint_id: "vp_02", to_viewpoint_id: "vp_03", distance: 2.8, heading_angle: 0 },
  { from_viewpoint_id: "vp_02", to_viewpoint_id: "vp_06", distance: 3.4, heading_angle: 45 },
  { from_viewpoint_id: "vp_06", to_viewpoint_id: "vp_07", distance: 3.2, heading_angle: 90 },
  { from_viewpoint_id: "vp_02", to_viewpoint_id: "vp_09", distance: 3.4, heading_angle: -45 },
  { from_viewpoint_id: "vp_09", to_viewpoint_id: "vp_10", distance: 3.2, heading_angle: 270 },
];

export default function LandingPage() {
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "te">("en");

  const sampleInstructions = {
    en: {
      text: "Walk through the main gallery, turn left into the living room, and stop in front of the hearth.",
      subgoals: [
        { step: 1, action: "MOVE_FORWARD", landmark: "main gallery", status: "completed" },
        { step: 2, action: "TURN_LEFT", landmark: "living room entry", status: "active" },
        { step: 3, action: "STOP", landmark: "travertine hearth", status: "pending" },
      ],
    },
    hi: {
      text: "मुख्य गैलरी से सीधे चलें, लिविंग रूम में बाएं मुड़ें और सोफे के पास रुकें।",
      subgoals: [
        { step: 1, action: "MOVE_FORWARD", landmark: "मुख्य गैलरी", status: "completed" },
        { step: 2, action: "TURN_LEFT", landmark: "लिविंग रूम प्रवेश", status: "active" },
        { step: 3, action: "STOP", landmark: "सोफा", status: "pending" },
      ],
    },
    te: {
      text: "ప్రధాన గ్యాలరీ గుండా ముందుకు వెళ్ళండి, లివింగ్ రూమ్‌లోకి ఎడమవైపు తిరిగి, సోఫా వద్ద ఆగండి.",
      subgoals: [
        { step: 1, action: "MOVE_FORWARD", landmark: "ప్రధాన గ్యాలరీ", status: "completed" },
        { step: 2, action: "TURN_LEFT", landmark: "లివింగ్ రూమ్ ద్వారం", status: "active" },
        { step: 3, action: "STOP", landmark: "సోఫా", status: "pending" },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent/30 selection:text-primary">
      <AnimatedBackground />
      <CursorGlow />
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface border border-glass-border backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono uppercase text-secondary tracking-wider">
                Room-Across-Room (RxR) Benchmark Formulation
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-primary leading-[1.08]">
                Teaching machines to understand the world,{" "}
                <span className="text-accent font-serif italic font-normal">one instruction at a time.</span>
              </h1>
              <p className="text-lg md:text-xl text-secondary max-w-2xl font-light leading-relaxed">
                An intelligent navigation research platform connecting multilingual natural language, 3D visual perception, and sequential goal-based decision-making across Matterport3D environments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/studio">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Navigation
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="glass" leftIcon={<BarChart2 className="w-4 h-4" />}>
                  View Research
                </Button>
              </Link>
              <Link href="/documentation">
                <Button size="lg" variant="outline">
                  Documentation
                </Button>
              </Link>
            </div>

            {/* Scientific Credentials Strip */}
            <div className="pt-8 border-t border-glass-border/60 grid grid-cols-3 gap-6 font-mono text-xs">
              <div>
                <span className="block text-accent text-xl font-bold tracking-tight">RxR + MP3D</span>
                <span className="text-muted text-[11px] uppercase tracking-wider">Benchmark Core</span>
              </div>
              <div>
                <span className="block text-sand text-xl font-bold tracking-tight">EN · HI · TE</span>
                <span className="text-muted text-[11px] uppercase tracking-wider">Native Languages</span>
              </div>
              <div>
                <span className="block text-primary text-xl font-bold tracking-tight">SPL &amp; OSR</span>
                <span className="text-muted text-[11px] uppercase tracking-wider">Rigorous Metrics</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Hero Preview */}
          <div className="lg:col-span-5 h-[520px] relative">
            <EnvironmentViewer
              nodes={DEMO_NODES}
              edges={DEMO_EDGES}
              currentViewpointId="vp_06"
              goalViewpointId="vp_07"
              startViewpointId="vp_01"
              visitedTrajectory={["vp_01", "vp_02", "vp_06"]}
              optimalPath={["vp_01", "vp_02", "vp_06", "vp_07"]}
              currentHeading={90}
              className="h-full w-full rounded-3xl"
            />
            {/* Live Telemetry Floating Pill */}
            <div className="absolute -bottom-5 left-6 right-6 p-4 rounded-2xl bg-surface/90 border border-glass-border backdrop-blur-xl shadow-glass flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-muted block text-[10px]">CURRENT ACTION</span>
                <span className="text-accent font-semibold">TURN_LEFT → LIVING_ROOM</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">CONFIDENCE</span>
                <span className="text-primary font-semibold">0.91 CALIBRATED</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">SPL SCORE</span>
                <span className="text-sand font-semibold">0.942 OPTIMAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCROLL STORYTELLING: THE 4 PILLARS OF VLN */}
      <section id="architecture" className="py-24 px-6 max-w-7xl mx-auto border-t border-glass-border/60">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="accent">Scientific Architecture</Badge>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            How Vision-and-Language Navigation Works
          </h2>
          <p className="text-secondary text-base leading-relaxed font-light">
            An end-to-end modular pipeline transforming unstructured natural language into spatial topological traversal through photorealistic 3D space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <Card className="p-6 space-y-4 hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Globe2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-accent uppercase tracking-wider">Stage 01</span>
            <h3 className="text-xl font-medium text-primary">Multilingual Intent</h3>
            <p className="text-secondary text-xs leading-relaxed">
              Decomposes natural language instructions across English, Hindi, and Telugu into sequential spatial sub-goals, identifying landmarks and movement orientations.
            </p>
          </Card>

          {/* Pillar 2 */}
          <Card className="p-6 space-y-4 hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sand/15 border border-sand/30 flex items-center justify-center text-sand">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-sand uppercase tracking-wider">Stage 02</span>
            <h3 className="text-xl font-medium text-primary">Visual Perception</h3>
            <p className="text-secondary text-xs leading-relaxed">
              Encodes 3D viewpoint visual observations and detects salient landmarks to establish multi-modal visual-language alignment at each navigable node.
            </p>
          </Card>

          {/* Pillar 3 */}
          <Card className="p-6 space-y-4 hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-glass-border flex items-center justify-center text-primary">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-primary uppercase tracking-wider">Stage 03</span>
            <h3 className="text-xl font-medium text-primary">Decision Policy</h3>
            <p className="text-secondary text-xs leading-relaxed">
              An instruction-conditioned policy scores candidate graph actions against geometry, orientation, and landmarks, choosing valid movements or issuing STOP.
            </p>
          </Card>

          {/* Pillar 4 */}
          <Card className="p-6 space-y-4 hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-accent uppercase tracking-wider">Stage 04</span>
            <h3 className="text-xl font-medium text-primary">Evaluation &amp; SPL</h3>
            <p className="text-secondary text-xs leading-relaxed">
              Rigorous benchmarking calculates Navigation Error, Oracle Success Rate, and Success weighted by Path Length (SPL) to measure genuine navigation efficiency.
            </p>
          </Card>
        </div>
      </section>

      {/* INTERACTIVE MULTILINGUAL GROUNDING SHOWCASE */}
      <section id="multilingual" className="py-24 px-6 bg-surface/30 border-y border-glass-border/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="sand">Multilingual Grounding</Badge>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-primary">
                Cross-Lingual Spatial Grounding
              </h2>
              <p className="text-secondary text-sm leading-relaxed">
                Experience how WAYFINDER processes identical spatial intentions across diverse linguistic syntax and scripts.
              </p>
            </div>

            {/* Language Selector Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-glass-border font-mono text-xs">
              <button
                onClick={() => setSelectedLang("en")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedLang === "en" ? "bg-accent text-background font-semibold" : "text-secondary hover:text-primary"
                }`}
              >
                English (en)
              </button>
              <button
                onClick={() => setSelectedLang("hi")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedLang === "hi" ? "bg-accent text-background font-semibold" : "text-secondary hover:text-primary"
                }`}
              >
                हिन्दी (hi)
              </button>
              <button
                onClick={() => setSelectedLang("te")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedLang === "te" ? "bg-accent text-background font-semibold" : "text-secondary hover:text-primary"
                }`}
              >
                తెలుగు (te)
              </button>
            </div>
          </div>

          <Card className="p-8 space-y-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                Raw Input Instruction
              </span>
              <p className="text-2xl md:text-3xl font-light text-primary italic">
                &ldquo;{sampleInstructions[selectedLang].text}&rdquo;
              </p>
            </div>

            <div className="pt-6 border-t border-glass-border/60">
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider block mb-4">
                Structured Sequential Sub-Goals Decomposed by AI Parser
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleInstructions[selectedLang].subgoals.map((sg) => (
                  <div
                    key={sg.step}
                    className="p-4 rounded-xl border border-glass-border bg-background/60 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-accent font-bold">STEP 0{sg.step}</span>
                      <Badge
                        variant={sg.status === "completed" ? "success" : sg.status === "active" ? "accent" : "neutral"}
                        size="sm"
                      >
                        {sg.status}
                      </Badge>
                    </div>
                    <div className="text-primary font-medium">{sg.action}</div>
                    <div className="text-muted text-[11px]">Landmark: {sg.landmark}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center space-y-8">
        <Badge variant="accent">Ready For Deployment</Badge>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-primary">
          Begin Autonomous Navigation Research
        </h2>
        <p className="text-secondary text-base max-w-xl mx-auto font-light leading-relaxed">
          Step into the Navigation Studio to run live sequential decision episodes, inspect confidence calibrations, or benchmark policies across RxR environments.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/studio">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Launch Navigation Studio
            </Button>
          </Link>
          <Link href="/simulator">
            <Button size="lg" variant="glass">
              Open 3D Simulator
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-glass-border/60 py-12 px-6 text-xs font-mono text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <span className="text-primary font-semibold">WAYFINDER</span>
            <span>— Multilingual Vision-and-Language Navigation Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/documentation" className="hover:text-primary transition-colors">
              Documentation
            </Link>
            <Link href="/evaluations" className="hover:text-primary transition-colors">
              Benchmark
            </Link>
            <Link href="/settings" className="hover:text-primary transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
