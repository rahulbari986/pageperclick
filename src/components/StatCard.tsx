"use client";

import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { SpotlightCard } from "@/components/animations/SpotlightCard";

interface StatCardProps {
  value: string;
  label: string;
}

export const StatCard = ({ value, label }: StatCardProps) => {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl blur-xl opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
      <SpotlightCard className="p-5 sm:p-7 md:p-8 text-center rounded-2xl sm:rounded-3xl" spotlightColor="rgba(168, 85, 247, 0.28)">
        <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-1.5 sm:mb-2 bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent font-heading tracking-tight">
          <AnimatedCounter value={value} duration={2.2} />
        </div>
        <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium mt-1">
          {label}
        </div>
      </SpotlightCard>
    </div>
  );
};
