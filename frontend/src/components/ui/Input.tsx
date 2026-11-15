"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono text-secondary mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full rounded-xl bg-surface/80 border border-glass-border px-3.5 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 transition-all duration-200",
              leftIcon && "pl-10",
              error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400 mt-1 font-mono">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
