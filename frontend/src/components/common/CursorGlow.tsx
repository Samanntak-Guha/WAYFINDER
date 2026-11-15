"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useSpring(0, { stiffness: 120, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 120, damping: 25 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed pointer-events-none -z-5 w-[400px] h-[400px] rounded-full opacity-[0.035] blur-[80px]"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, #B7C5A5 0%, transparent 70%)",
      }}
    />
  );
}
