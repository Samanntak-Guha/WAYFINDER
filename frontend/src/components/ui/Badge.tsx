"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "accent" | "sand" | "neutral" | "success" | "warning" | "danger";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] tracking-wider",
    md: "px-2.5 py-1 text-xs tracking-wide",
  };

  const variantClasses = {
    accent: "bg-accent/10 text-accent border border-accent/30",
    sand: "bg-sand/10 text-sand border border-sand/30",
    neutral: "bg-white/5 text-secondary border border-glass-border",
    success: "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40",
    warning: "bg-amber-950/40 text-amber-300 border border-amber-800/40",
    danger: "bg-red-950/40 text-red-300 border border-red-800/40",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-medium rounded-full uppercase select-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
