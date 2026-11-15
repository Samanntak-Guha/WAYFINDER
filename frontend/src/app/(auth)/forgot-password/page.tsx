"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, ArrowRight, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message || "Password recovery instructions sent.");
    } catch (err: any) {
      setError(err.message || "Request failed.");
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
            Password Recovery
          </h1>
          <p className="text-xs text-secondary">
            Enter your email to receive recovery instructions
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

              {message && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <Input
                label="Registered Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="researcher@institute.edu"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Recovery Link
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center font-mono text-xs text-muted">
          Remember password?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
