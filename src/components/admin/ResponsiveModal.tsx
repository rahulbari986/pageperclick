"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  showGrabHandle?: boolean;
}

/**
 * ResponsiveModal:
 * - On Mobile view (< 768px): Pops up smoothly from the bottom as a sheet/drawer with rounded top corners and grab handle.
 * - On Desktop & Tablet views (>= 768px): Center pop-up modal dialog with rounded corners on all sides and backdrop blur.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  className,
  showGrabHandle = true,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 w-full max-w-4xl mx-auto overflow-hidden rounded-t-3xl sm:rounded-t-[32px] rounded-b-none border-t-2 border-x border-b-0 border-border/80 bg-card/98 backdrop-blur-2xl text-foreground p-4 sm:p-6 shadow-[0_-20px_60px_rgba(0,0,0,0.7)] [&>button]:text-muted-foreground [&>button]:hover:text-foreground [&>button]:top-4 sm:[&>button]:top-5 [&>button]:right-4 sm:[&>button]:right-5",
            className
          )}
        >
          {showGrabHandle && (
            <div className="flex justify-center -mt-1 mb-3">
              <div className="w-12 sm:w-16 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors cursor-grab" />
            </div>
          )}
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl lg:max-w-4xl overflow-hidden rounded-2xl md:rounded-3xl border border-border/80 bg-card/98 backdrop-blur-2xl text-foreground p-6 sm:p-7 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] [&>button]:text-muted-foreground [&>button]:hover:text-foreground [&>button]:top-5 [&>button]:right-5",
          className
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

export const ResponsiveModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground font-heading tracking-tight",
      className
    )}
    {...props}
  />
));
ResponsiveModalTitle.displayName = "ResponsiveModalTitle";

export const ResponsiveModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-xs text-muted-foreground mt-1", className)}
    {...props}
  />
));
ResponsiveModalDescription.displayName = "ResponsiveModalDescription";
