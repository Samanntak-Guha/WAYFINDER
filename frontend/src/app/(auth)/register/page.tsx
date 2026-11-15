"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, ArrowRight, Lock, Mail, User as UserIcon, Building2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(email, password, fullName, organization);
      router.push("/studio");
    } catch (err: any) {
      setError(err.message || "Failed to register account.");
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
            Register Researcher Account
          </h1>
          <p className="text-xs text-secondary">
            Join the research community to run VLN simulations and benchmark custom policies
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
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                leftIcon={<UserIcon className="w-4 h-4" />}
                placeholder="Dr. Jordan Hayes"
              />

              <Input
                label="Institution / Lab"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                leftIcon={<Building2 className="w-4 h-4" />}
                placeholder="Robotics & Vision Institute"
              />

              <Input
                label="Academic Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="j.hayes@institute.edu"
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

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center font-mono text-xs text-muted">
          Already registered?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
