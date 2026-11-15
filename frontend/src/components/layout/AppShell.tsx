"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { CursorGlow } from "@/components/common/CursorGlow";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-primary flex flex-col font-sans selection:bg-accent/30 selection:text-primary">
      <AnimatedBackground />
      <CursorGlow />
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
