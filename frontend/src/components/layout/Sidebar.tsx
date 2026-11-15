"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Box,
  Cpu,
  Database,
  BarChart3,
  History,
  Settings,
  User,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio", label: "Navigation Studio", icon: Compass, badge: "CORE" },
  { href: "/simulator", label: "3D Simulator", icon: Box },
  { href: "/agent-lab", label: "Agent Laboratory", icon: Cpu },
  { href: "/datasets", label: "Dataset Explorer", icon: Database },
  { href: "/evaluations", label: "Evaluation Lab", icon: BarChart3 },
  { href: "/experiments", label: "Experiment History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/documentation", label: "Documentation", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-glass-border bg-background/95 backdrop-blur-2xl flex flex-col justify-between shrink-0 h-[calc(100vh-57px)] sticky top-[57px] select-none">
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-muted uppercase">
          Research Environment
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group",
                isActive
                  ? "bg-accent/15 text-accent font-semibold border border-accent/30 shadow-glow-accent/10"
                  : "text-secondary hover:text-primary hover:bg-surface/80"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-accent" : "text-muted group-hover:text-primary"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-accent/20 text-accent uppercase">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Telemetry Footer */}
      <div className="p-4 border-t border-glass-border/60 bg-surface/30">
        <div className="rounded-xl border border-glass-border p-3 bg-glass-bg/60 space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between text-muted">
            <span>ACTIVE POLICY</span>
            <span className="text-accent">INSTRUCTION-VLN</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>BENCHMARK</span>
            <span className="text-sand">RxR (EN/HI/TE)</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>DEVICE</span>
            <span className="text-secondary">RTX 4050 6GB</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
