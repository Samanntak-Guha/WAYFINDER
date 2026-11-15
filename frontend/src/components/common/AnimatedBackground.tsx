"use client";

import React from "react";
import { motion } from "framer-motion";

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

      {/* Slow-moving architectural light fields in muted sage and sand */}
      <motion.div
        className="absolute -top-[25%] -left-[10%] w-[55vw] h-[55vw] rounded-full opacity-[0.06] blur-[140px]"
        style={{ background: "radial-gradient(circle, #B7C5A5 0%, transparent 70%)" }}
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] rounded-full opacity-[0.045] blur-[160px]"
        style={{ background: "radial-gradient(circle, #C7B99C 0%, transparent 70%)" }}
        animate={{
          x: [0, -35, 0],
          y: [0, -45, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Topographic architectural fine depth grain */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #F1F0E9 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
