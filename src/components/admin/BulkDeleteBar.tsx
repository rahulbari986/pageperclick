"use client";

import React, { useState } from "react";
import { Trash2, Check, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface BulkDeleteBarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isDeleting: boolean;
  onClearSelection: () => void;
  onConfirmDelete: () => Promise<void> | void;
}

export function BulkDeleteBar({
  selectedCount,
  totalCount,
  isAllSelected,
  isDeleting,
  onClearSelection,
  onConfirmDelete,
}: BulkDeleteBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Component for Delete All / Batch Selection Bar */}
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="p-3.5 sm:p-4 bg-card/90 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-inner">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              {isAllSelected ? (
                <>
                  <span>All</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[11px] border border-primary/30">
                    {selectedCount}
                  </span>
                  <span>Client Enquiries Selected</span>
                </>
              ) : (
                <>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[11px] border border-primary/30">
                    {selectedCount}
                  </span>
                  <span>of {totalCount} Selected</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isAllSelected
                ? "All items on this page are selected for bulk action"
                : "Select all checkbox in the table header to choose all records"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClearSelection}
            disabled={isDeleting}
            className="flex-1 sm:flex-initial text-center px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
          >
            Clear Selection
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            disabled={isDeleting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-center"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isAllSelected ? "Delete All" : `Delete Selected (${selectedCount})`}</span>
          </button>
        </div>
      </motion.div>

      {/* Confirmation Dialog for Bulk Delete */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground max-w-sm rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground font-heading">
              {isAllSelected ? "Delete All Enquiries?" : `Delete ${selectedCount} Enquiries?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">
                {isAllSelected ? `all ${selectedCount}` : selectedCount}
              </strong>{" "}
              selected client enquiries from MongoDB? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-border">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-8 text-xs border-border bg-card hover:bg-muted text-muted-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await onConfirmDelete();
                setIsOpen(false);
              }}
              disabled={isDeleting}
              className="h-8 text-xs bg-destructive hover:bg-destructive/90 text-white font-semibold"
            >
              {isDeleting ? "Deleting..." : isAllSelected ? "Yes, Delete All" : "Yes, Delete Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
