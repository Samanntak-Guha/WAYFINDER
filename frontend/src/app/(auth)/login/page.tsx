"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("researcher@wayfinder.ai");
  const [password, setPassword] = useState("Wayfinder2026!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/studio");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <AnimatedBackground />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-9 h-9 rounded-xl bg-surface border border-accent/40 flex items-center justify-center text-accent shadow-glow-accent/20">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </div>
            <span className="font-mono font-semibold tracking-widest text-primary text-base">
              WAYFINDER
            </span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Sign In to Research Platform
          </h1>
          <p className="text-xs text-secondary">
            Access navigation studio, 3D simulation, and model evaluations
          </p>
        </div>

        <Card variant="glass">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="researcher@institute.edu"
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between text-xs font-mono">
                <Link
                  href="/forgot-password"
                  className="text-secondary hover:text-accent transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Enter Platform
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center font-mono text-xs text-muted">
          Need access credentials?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Register Researcher Account
          </Link>
        </div>
      </div>
    </div>
  );
}
