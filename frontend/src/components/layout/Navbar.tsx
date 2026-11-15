"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Sparkles, Activity, BookOpen, Layers, Terminal, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full px-6 py-3.5 backdrop-blur-xl bg-background/70 border-b border-glass-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-surface border border-accent/40 flex items-center justify-center text-accent group-hover:border-accent transition-colors shadow-glow-accent/20">
            <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-primary tracking-widest text-sm flex items-center gap-1.5 font-mono">
              WAYFINDER
              <span className="text-[10px] text-accent uppercase font-sans font-normal tracking-normal px-1 py-0.2 rounded bg-accent/10 border border-accent/20">
                RxR VLN
              </span>
            </span>
          </div>
        </Link>

        {/* Center Links (on landing page) */}
        {isLanding ? (
          <nav className="hidden md:flex items-center gap-7 text-xs font-mono tracking-wider text-secondary">
            <Link href="#architecture" className="hover:text-primary transition-colors">
              ARCHITECTURE
            </Link>
            <Link href="#multilingual" className="hover:text-primary transition-colors">
              MULTILINGUAL
            </Link>
            <Link href="#benchmark" className="hover:text-primary transition-colors">
              RxR BENCHMARK
            </Link>
            <Link href="/documentation" className="hover:text-primary transition-colors">
              DOCS
            </Link>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NVIDIA NIM / AI INFERENCE: ONLINE</span>
          </div>
        )}

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/studio">
                <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
                  Studio
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="glass" size="sm">
                  Dashboard
                </Button>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/studio">
                <Button variant="primary" size="sm" rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Launch Studio
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
