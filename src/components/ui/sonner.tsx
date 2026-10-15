"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#170a27]/95 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-white group-[.toaster]:border-purple-500/35 group-[.toaster]:shadow-2xl group-[.toaster]:shadow-purple-950/40 group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:border",
          description: "group-[.toast]:text-muted-foreground/85 group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:rounded-xl font-medium",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl font-medium",
          error:
            "group-[.toaster]:border-rose-500/40 group-[.toaster]:bg-[#1c0a22]/95 group-[.toaster]:shadow-rose-950/40",
          success:
            "group-[.toaster]:border-emerald-500/40 group-[.toaster]:bg-[#0d1f1c]/95 group-[.toaster]:shadow-emerald-950/40",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
