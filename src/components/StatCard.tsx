interface StatCardProps {
  value: string;
  label: string;
}

export const StatCard = ({ value, label }: StatCardProps) => {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="relative text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary transition-all hover:scale-105 duration-300">
        <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent font-heading">
          {value}
        </div>
        <div className="text-sm md:text-base text-muted-foreground font-medium">{label}</div>
      </div>
    </div>
  );
};
