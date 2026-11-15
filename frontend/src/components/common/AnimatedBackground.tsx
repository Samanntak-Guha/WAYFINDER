"use client";

import React from "react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-background">
      {/* Subtle architectural coordinates grid */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* GPU-efficient architectural ambient light fields in muted sage and sand (zero blur overhead) */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[60vw] h-[60vw] rounded-full opacity-[0.07] pointer-events-none"
        style={{
          background: "radial-gradient(circle at 45% 45%, #B7C5A5 0%, rgba(183, 197, 165, 0.3) 35%, transparent 70%)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      <div
        className="absolute top-[35%] -right-[15%] w-[55vw] h-[55vw] rounded-full opacity-[0.055] pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, #C7B99C 0%, rgba(199, 185, 156, 0.25) 35%, transparent 70%)",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      {/* Topographic architectural fine depth grain */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #F1F0E9 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
