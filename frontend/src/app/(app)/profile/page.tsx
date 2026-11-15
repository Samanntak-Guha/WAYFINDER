"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  User as UserIcon,
  Building2,
  Mail,
  Shield,
  Activity,
  CheckCircle2,
  Save,
  Key,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "Dr. Elena Vance");
  const [organization, setOrganization] = useState(user?.organization || "Vision-and-Language Navigation Lab");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ full_name: fullName, organization });
      await refreshUser();
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-1 uppercase tracking-wider">
            <span>Identity</span>
            <span>/</span>
            <span className="text-accent">Researcher Profile</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            Researcher Profile
          </h1>
        </div>

        {savedMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile updated successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Bio Card */}
          <Card className="p-6 space-y-4 md:col-span-1 text-center">
            <div className="w-20 h-20 rounded-full bg-surface border-2 border-accent/40 mx-auto flex items-center justify-center text-accent text-2xl font-bold font-mono shadow-glow-accent/20">
              {fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary">{fullName}</h2>
              <p className="text-xs text-muted font-mono">{user?.role || "Lead Researcher"}</p>
            </div>
            <Badge variant="accent" size="sm">Active Credentials</Badge>

            <div className="pt-4 border-t border-glass-border/60 text-left font-mono text-[11px] space-y-2 text-muted">
              <div>Email: <span className="text-secondary">{user?.email || "researcher@wayfinder.ai"}</span></div>
              <div>Affiliation: <span className="text-secondary">{organization}</span></div>
            </div>
          </Card>

          {/* Edit Profile Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your academic identity and institution details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<UserIcon className="w-4 h-4" />}
                />

                <Input
                  label="Research Institution / Lab"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />

                <Input
                  label="Email Address"
                  value={user?.email || "researcher@wayfinder.ai"}
                  disabled
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
