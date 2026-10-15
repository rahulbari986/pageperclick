"use client";

import { LucideProps } from "lucide-react";
import React from "react";
import { SpotlightCard } from "@/components/animations/SpotlightCard";
import { motion } from "framer-motion";

interface ServiceCardProps {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
  title: string;
  description: string;
}

export const ServiceCard = ({ icon: Icon, title, description }: ServiceCardProps) => {
  return (
    <SpotlightCard
      className="h-full flex flex-col p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl group border-2 border-border/70 hover:border-primary/60 transition-all duration-300"
      spotlightColor="rgba(168, 85, 247, 0.22)"
    >
      <div className="flex flex-col h-full space-y-4 sm:space-y-5">
        <motion.div
          whileHover={{ scale: 1.12, rotate: 6 }}
          transition={{ type: "spring", stiffness: 350, damping: 15 }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg shadow-primary/25 border border-white/10 shrink-0"
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform duration-300 group-hover:scale-105" />
        </motion.div>

        <div className="flex-grow">
          <h3 className="text-xl sm:text-2xl font-heading mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300 tracking-tight">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {description}
          </p>
        </div>

        {/* Subtle glowing bottom indicator on card hover */}
        <div className="pt-2">
          <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out" />
        </div>
      </div>
    </SpotlightCard>
  );
};