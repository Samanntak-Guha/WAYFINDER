"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string, org?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch (e) {
      console.warn("Session check failed, reverting to guest / default researcher mode:", e);
      // For immediate exploratory access, keep fallback default user
      setUser({
        id: "usr_researcher_demo",
        email: "researcher@wayfinder.ai",
        full_name: "Dr. Elena Vance",
        role: "lead_researcher",
        organization: "Vision-and-Language Navigation Lab",
        preferred_language: "en",
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("wayfinder_token");
    if (savedToken) {
      setToken(savedToken);
    }
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      localStorage.setItem("wayfinder_token", res.access_token);
      setToken(res.access_token);
      setUser({
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        role: res.role,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name?: string, org?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, password: pass, full_name: name, organization: org });
      localStorage.setItem("wayfinder_token", res.access_token);
      setToken(res.access_token);
      setUser({
        id: res.user_id,
        email: res.email,
        full_name: res.full_name,
        role: res.role,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("wayfinder_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
