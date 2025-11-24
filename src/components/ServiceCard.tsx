import { LucideProps } from "lucide-react";
import React from "react";

interface ServiceCardProps {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
  title: string;
  description: string;
}

export const ServiceCard = ({ icon: Icon, title, description }: ServiceCardProps) => {
  return (
    // ✅ ADDED h-full and flex flex-col
    <div className="relative group h-full flex flex-col p-8 bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary transition-all rounded-3xl space-y-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-grow"> {/* This div makes the description push down */}
        <h3 className="text-2xl font-heading mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};