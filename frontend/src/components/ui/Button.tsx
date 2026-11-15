"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-6 py-2.5 text-base rounded-xl gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-accent text-background font-semibold hover:bg-accent-hover shadow-glow-accent/20 hover:shadow-glow-accent",
    secondary:
      "bg-sand text-background font-semibold hover:bg-sand-hover shadow-glow-sand/20 hover:shadow-glow-sand",
    glass:
      "bg-glass-bg hover:bg-surface-hover text-primary border border-glass-border hover:border-glass-border-hover backdrop-blur-md shadow-glass-sm",
    outline:
      "bg-transparent text-secondary hover:text-primary border border-glass-border hover:border-accent/40",
    danger:
      "bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/60",
  };

  return (
    <button
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
