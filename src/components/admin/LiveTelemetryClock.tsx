"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Live Quantum Telemetry Clock Widget
 * Sleek dark-glass telemetry pill with pulsing emerald beacon,
 * live local date and real-time digital monospace clock.
 */
export function LiveTelemetryClock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/70 backdrop-blur-xl border border-white/10 shadow-sm text-xs select-none group hover:border-primary/40 transition-colors ${className}`}
      title="Live Network Sync Active"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>

      {date && (
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
          {date}
        </span>
      )}

      {date && <span className="text-muted-foreground/30 hidden sm:inline">•</span>}

      <span className="font-mono text-[11px] sm:text-xs font-semibold text-foreground/90 tracking-wider">
        {time || "••:••:••"}
      </span>
    </motion.div>
  );
}
