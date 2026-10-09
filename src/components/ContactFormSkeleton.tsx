import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 3.2 Dynamic Skeleton Screen for ContactForm
 * Mimics exact form geometry to eliminate cumulative layout shift (CLS).
 */
export function ContactFormSkeleton() {
  return (
    <div className="relative max-w-2xl mx-auto p-8 md:p-10 rounded-3xl border-2 border-primary/20 bg-card/50 backdrop-blur-xl space-y-6">
      {/* 2-column input row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* 2-column input row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Services dropdown row */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Message textarea row */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-28 w-full rounded-md" />
      </div>

      {/* Button & Captcha row */}
      <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
        <Skeleton className="h-12 w-full md:w-[200px] rounded-xl" />
        <Skeleton className="h-14 w-[304px] rounded-md" />
      </div>
    </div>
  );
}

export default ContactFormSkeleton;
