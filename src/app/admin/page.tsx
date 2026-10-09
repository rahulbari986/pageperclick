"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  Download,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  Trash2,
  Edit3,
  MessageSquare,
  Globe,
  SlidersHorizontal,
  X,
  ExternalLink,
  ShieldCheck,
  User,
  ArrowUpRight,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Skeleton } from "@/components/ui/skeleton";

export interface ContactLead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "ARCHIVED";
  adminNotes?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatsData {
  totalAll: number;
  newCount: number;
  contactedCount: number;
  qualifiedCount: number;
  convertedCount: number;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  NEW: {
    label: "New",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
  CONTACTED: {
    label: "Contacted",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  QUALIFIED: {
    label: "Qualified",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/30",
    dot: "bg-violet-400",
  },
  CONVERTED: {
    label: "Converted",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  ARCHIVED: {
    label: "Archived",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
  },
};

const getInitials = (name: string): string => {
  if (!name) return "L";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AdminPage() {
  const [contacts, setContacts] = useState<ContactLead[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalAll: 0,
    newCount: 0,
    contactedCount: 0,
    qualifiedCount: 0,
    convertedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  // Lead Detail Drawer State
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerNotes, setDrawerNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Lead Edit Dialog State
  const [editTarget, setEditTarget] = useState<ContactLead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    status: "NEW",
    adminNotes: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Alert Dialog State
  const [deleteTarget, setDeleteTarget] = useState<ContactLead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy state for feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch leads from MongoDB Atlas API
  const fetchContacts = useCallback(
    async (showFullLoading = true) => {
      try {
        if (showFullLoading) setLoading(true);
        setIsRefreshing(true);

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("search", searchTerm.trim());
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        if (serviceFilter !== "ALL") params.set("service", serviceFilter);

        const res = await fetch(`/api/v1/admin/contacts?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          setContacts(data.contacts || []);
          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          toast.error(data.error || "Failed to retrieve contacts from database.");
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error("Network error while connecting to database.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchTerm, statusFilter, serviceFilter]
  );

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchContacts]);

  // Initial load
  useEffect(() => {
    fetchContacts(true);
  }, [fetchContacts]);

  // Quick Copy with instant feedback
  const handleCopy = (text: string, identifier: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(identifier);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Inline Quick Status Update (Optimistic)
  const handleInlineStatusChange = async (leadId: string, newStatus: string) => {
    const originalLead = contacts.find((c) => c._id === leadId);
    if (!originalLead || originalLead.status === newStatus) return;

    const validStatus = newStatus as ContactLead["status"];

    // Optimistically update table
    setContacts((prev) =>
      prev.map((c) => (c._id === leadId ? { ...c, status: validStatus } : c))
    );
    if (selectedLead && selectedLead._id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: validStatus } : null));
    }

    try {
      const res = await fetch(`/api/v1/admin/contacts/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        fetchContacts(false);
      } else {
        // Rollback
        setContacts((prev) =>
          prev.map((c) => (c._id === leadId ? { ...c, status: originalLead.status } : c))
        );
        toast.error(data.error || "Failed to update status");
      }
    } catch (err) {
      // Rollback
      setContacts((prev) =>
        prev.map((c) => (c._id === leadId ? { ...c, status: originalLead.status } : c))
      );
      toast.error("Network error updating status");
    }
  };

  // Open Lead Detail Drawer
  const handleOpenDrawer = (lead: ContactLead) => {
    setSelectedLead(lead);
    setDrawerNotes(lead.adminNotes || "");
    setIsDrawerOpen(true);
  };

  // Save Notes from Drawer
  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/v1/admin/contacts/${selectedLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: drawerNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Internal notes saved");
        setContacts((prev) =>
          prev.map((c) => (c._id === selectedLead._id ? { ...c, adminNotes: drawerNotes } : c))
        );
        setSelectedLead((prev) => (prev ? { ...prev, adminNotes: drawerNotes } : null));
      } else {
        toast.error(data.error || "Failed to save notes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (lead: ContactLead) => {
    setEditTarget(lead);
    setEditForm({
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || "",
      service: lead.service,
      status: lead.status,
      adminNotes: lead.adminNotes || "",
    });
    setIsEditDialogOpen(true);
  };

  // Save Full Lead Edit
  const handleSaveEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/v1/admin/contacts/${editTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Lead details updated successfully");
        setIsEditDialogOpen(false);
        const updatedStatus = editForm.status as ContactLead["status"];
        setContacts((prev) =>
          prev.map((c) =>
            c._id === editTarget._id ? { ...c, ...editForm, status: updatedStatus } : c
          )
        );
        if (selectedLead && selectedLead._id === editTarget._id) {
          setSelectedLead((prev) =>
            prev ? { ...prev, ...editForm, status: updatedStatus } : null
          );
        }
        fetchContacts(false);
      } else {
        toast.error(data.error || "Failed to update lead");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving lead");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Lead Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/contacts/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Lead permanently deleted");
        setContacts((prev) => prev.filter((c) => c._id !== deleteTarget._id));
        if (selectedLead && selectedLead._id === deleteTarget._id) {
          setIsDrawerOpen(false);
          setSelectedLead(null);
        }
        setIsDeleteDialogOpen(false);
        setDeleteTarget(null);
        fetchContacts(false);
      } else {
        toast.error(data.error || "Failed to delete lead");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error deleting lead");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      toast.info("No records to export.");
      return;
    }

    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "Company",
      "Service Requested",
      "Status",
      "Internal Notes",
      "Original Message",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "IP Address",
      "Submission Date",
    ];

    const rows = contacts.map((c) => [
      `"${c._id}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${c.service.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${(c.adminNotes || "").replace(/"/g, '""')}"`,
      `"${c.message.replace(/"/g, '""')}"`,
      `"${(c.utm_source || "").replace(/"/g, '""')}"`,
      `"${(c.utm_medium || "").replace(/"/g, '""')}"`,
      `"${(c.utm_campaign || "").replace(/"/g, '""')}"`,
      `"${c.ipAddress || ""}"`,
      `"${new Date(c.createdAt).toLocaleString("en-IN")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pageperclick_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${contacts.length} leads as CSV`);
  };

  // Conversion rate calculation
  const conversionRate = useMemo(() => {
    if (!stats.totalAll) return "0.0%";
    return `${((stats.convertedCount / stats.totalAll) * 100).toFixed(1)}%`;
  }, [stats.totalAll, stats.convertedCount]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#090d16]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Context */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/10 hover:opacity-90 transition-opacity"
            >
              P
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-white tracking-tight">PagePerClick</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Leads CRM
                </span>
              </div>
            </div>
          </div>

          {/* Database Live Ping & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-white/[0.06] text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Atlas Live</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchContacts(false)}
              disabled={isRefreshing}
              className="h-8 border-white/[0.08] bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8 border-white/[0.08] bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 border-white/[0.08] bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs gap-1.5"
            >
              <Link href="/" target="_blank">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Site</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* KPI Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Volume */}
          <div
            onClick={() => setStatusFilter("ALL")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/5"
                : "bg-slate-900/40 border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900/60"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span>All Inquiries</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.totalAll}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-400">
              <span>Total recorded leads</span>
            </div>
          </div>

          {/* Card 2: New Inquiries */}
          <div
            onClick={() => setStatusFilter("NEW")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "NEW"
                ? "bg-slate-900/90 border-sky-500/40 shadow-lg shadow-sky-500/5"
                : "bg-slate-900/40 border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900/60"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-sky-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                New Leads
              </span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-sky-400 tracking-tight">
              {stats.newCount}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-sky-400/80">
              <span>Requires outreach</span>
            </div>
          </div>

          {/* Card 3: In Pipeline */}
          <div
            onClick={() => setStatusFilter("CONTACTED")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "CONTACTED" || statusFilter === "QUALIFIED"
                ? "bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5"
                : "bg-slate-900/40 border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900/60"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-amber-400">
              <span>In Pipeline</span>
              <Phone className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight">
              {stats.contactedCount + stats.qualifiedCount}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-400">
              <span>{stats.contactedCount} contacted, {stats.qualifiedCount} qualified</span>
            </div>
          </div>

          {/* Card 4: Converted Clients */}
          <div
            onClick={() => setStatusFilter("CONVERTED")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "CONVERTED"
                ? "bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                : "bg-slate-900/40 border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900/60"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
              <span>Converted</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
              {stats.convertedCount}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-emerald-400/80">
              <span>{conversionRate} conversion rate</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Toolbar */}
        <div className="space-y-3">
          {/* Status Tabs Bar */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/60 border border-white/[0.06] text-xs">
              {[
                { id: "ALL", label: "All Leads", count: stats.totalAll },
                { id: "NEW", label: "New", count: stats.newCount },
                { id: "CONTACTED", label: "Contacted", count: stats.contactedCount },
                { id: "QUALIFIED", label: "Qualified", count: stats.qualifiedCount },
                { id: "CONVERTED", label: "Converted", count: stats.convertedCount },
                { id: "ARCHIVED", label: "Archived", count: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    statusFilter === tab.id
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        statusFilter === tab.id
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Service & Search Filters */}
            <div className="flex items-center gap-2">
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="h-9 w-[150px] bg-slate-900/60 border-white/[0.08] text-xs text-slate-200">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/[0.08] text-xs text-slate-200">
                  <SelectItem value="ALL">All Services</SelectItem>
                  <SelectItem value="PPC">PPC Advertising</SelectItem>
                  <SelectItem value="Content">Content Writing</SelectItem>
                  <SelectItem value="Design">Graphic Design</SelectItem>
                  <SelectItem value="Local">Local SEO</SelectItem>
                  <SelectItem value="Social">Social Media</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== "ALL" || serviceFilter !== "ALL" || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setServiceFilter("ALL");
                    setSearchTerm("");
                  }}
                  className="h-9 px-2.5 text-xs text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search leads by name, email, phone, company, or message inquiry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-9 h-10 bg-slate-900/40 border-white/[0.07] text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Lead Table / Data Grid */}
        <div className="rounded-xl border border-white/[0.07] bg-slate-900/30 overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-slate-900/80 border-b border-white/[0.06]">
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-3.5 pl-5">
                  Prospect
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-3.5">
                  Contact Info
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-3.5">
                  Service
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-3.5">
                  Inquiry & Notes
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-3.5">
                  Pipeline Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-3.5">
                  Received
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-3.5 pr-5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/[0.04]">
              {loading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-white/[0.04]">
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full bg-slate-800" />
                        <div className="space-y-1.5">
                          <Skeleton className="w-28 h-4 bg-slate-800" />
                          <Skeleton className="w-20 h-3 bg-slate-800" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1.5">
                        <Skeleton className="w-36 h-3 bg-slate-800" />
                        <Skeleton className="w-28 h-3 bg-slate-800" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-24 h-5 rounded bg-slate-800" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-48 h-4 bg-slate-800" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-20 h-6 rounded-full bg-slate-800" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-16 h-3 bg-slate-800" />
                    </TableCell>
                    <TableCell className="py-4 pr-5 text-right">
                      <Skeleton className="w-8 h-8 rounded ml-auto bg-slate-800" />
                    </TableCell>
                  </TableRow>
                ))
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-1">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-slate-200">No leads match your criteria</p>
                      <p className="text-xs text-slate-400">
                        Try clearing filters or search terms to see all inquiries.
                      </p>
                      {(statusFilter !== "ALL" || serviceFilter !== "ALL" || searchTerm) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStatusFilter("ALL");
                            setServiceFilter("ALL");
                            setSearchTerm("");
                          }}
                          className="mt-3 h-8 text-xs border-white/[0.08] bg-slate-800 text-slate-200"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((lead) => {
                  const statusConf = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                  return (
                    <TableRow
                      key={lead._id}
                      className="group border-white/[0.04] hover:bg-slate-800/30 transition-colors"
                    >
                      {/* 1. Prospect Name & Company */}
                      <TableCell className="py-3.5 pl-5">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => handleOpenDrawer(lead)}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 shadow-sm group-hover:border-cyan-500/40 transition-colors">
                            {getInitials(lead.fullName)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors">
                              {lead.fullName}
                            </div>
                            {lead.company ? (
                              <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-slate-500" />
                                <span>{lead.company}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500">Individual Lead</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Contact Info (Email & Phone with instant copy) */}
                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                            <a
                              href={`mailto:${lead.email}`}
                              className="hover:text-cyan-300 hover:underline max-w-[170px] truncate"
                              title={lead.email}
                            >
                              {lead.email}
                            </a>
                            <button
                              onClick={() => handleCopy(lead.email, `email-${lead._id}`, "Email")}
                              className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors"
                              title="Copy email"
                            >
                              {copiedId === `email-${lead._id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                            <Phone className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                            <a
                              href={`tel:${lead.phone}`}
                              className="hover:text-emerald-300 hover:underline"
                            >
                              {lead.phone}
                            </a>
                            <button
                              onClick={() => handleCopy(lead.phone, `phone-${lead._id}`, "Phone")}
                              className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors"
                              title="Copy phone"
                            >
                              {copiedId === `phone-${lead._id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </TableCell>

                      {/* 3. Service Requested */}
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className="bg-slate-900/80 border-white/[0.08] text-xs font-normal text-slate-300 px-2.5 py-1 whitespace-nowrap"
                        >
                          {lead.service}
                        </Badge>
                      </TableCell>

                      {/* 4. Inquiry & Notes */}
                      <TableCell className="py-3.5 max-w-[220px]">
                        <p
                          className="text-xs text-slate-300 line-clamp-1 cursor-pointer hover:text-white"
                          title={lead.message}
                          onClick={() => handleOpenDrawer(lead)}
                        >
                          {lead.message || "No message provided."}
                        </p>
                        {lead.adminNotes && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400 line-clamp-1">
                            <MessageSquare className="w-3 h-3 shrink-0" />
                            <span className="truncate">{lead.adminNotes}</span>
                          </div>
                        )}
                      </TableCell>

                      {/* 5. Pipeline Status with Direct Dropdown Changer */}
                      <TableCell className="py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${statusConf.bg} ${statusConf.text} ${statusConf.border} hover:opacity-90`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                              <span>{statusConf.label}</span>
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-40 bg-slate-900 border-white/[0.08] text-xs text-slate-200"
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                              <DropdownMenuItem
                                key={key}
                                onClick={() => handleInlineStatusChange(lead._id, key)}
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-800"
                              >
                                <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                                <span className={lead.status === key ? "font-bold text-white" : ""}>
                                  {conf.label}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* 6. Submission Date */}
                      <TableCell className="py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        <div title={new Date(lead.createdAt).toLocaleString("en-IN")}>
                          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>

                      {/* 7. Action Menu */}
                      <TableCell className="py-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDrawer(lead)}
                            className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                          >
                            View
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-slate-900 border-white/[0.08] text-xs text-slate-200"
                            >
                              <DropdownMenuItem
                                onClick={() => handleOpenDrawer(lead)}
                                className="cursor-pointer hover:bg-slate-800"
                              >
                                <User className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                                Full Details & Notes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(lead)}
                                className="cursor-pointer hover:bg-slate-800"
                              >
                                <Edit3 className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                                Edit Lead Fields
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/[0.06]" />
                              <DropdownMenuItem asChild>
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="cursor-pointer flex items-center hover:bg-slate-800"
                                >
                                  <Phone className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                                  Call ({lead.phone})
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="cursor-pointer flex items-center hover:bg-slate-800"
                                >
                                  <Mail className="w-3.5 h-3.5 mr-2 text-sky-400" />
                                  Send Email
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="cursor-pointer flex items-center hover:bg-slate-800"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                                  WhatsApp Message
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/[0.06]" />
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteTarget(lead);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Slide-Over Drawer: Complete Lead Inspector */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-lg w-full bg-[#0d131f] border-l border-white/[0.08] text-slate-100 p-0 flex flex-col justify-between overflow-y-auto">
          {selectedLead && (
            <div className="p-6 space-y-6 flex-1">
              {/* Header Info */}
              <div className="space-y-3 pb-5 border-b border-white/[0.08]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                      {getInitials(selectedLead.fullName)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        {selectedLead.fullName}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedLead.company || "Individual Client"}
                      </p>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          STATUS_CONFIG[selectedLead.status]?.bg
                        } ${STATUS_CONFIG[selectedLead.status]?.text} ${
                          STATUS_CONFIG[selectedLead.status]?.border
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedLead.status]?.dot}`}
                        />
                        <span>{STATUS_CONFIG[selectedLead.status]?.label}</span>
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 bg-slate-900 border-white/[0.08] text-xs text-slate-200"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleInlineStatusChange(selectedLead._id, key)}
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-800"
                        >
                          <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                          <span className={selectedLead.status === key ? "font-bold text-white" : ""}>
                            {conf.label}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Quick Outreach Action Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 border-white/[0.08] bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-200"
                  >
                    <a href={`tel:${selectedLead.phone}`}>
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      Call
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 border-white/[0.08] bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-200"
                  >
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      WhatsApp
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 border-white/[0.08] bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-200"
                  >
                    <a href={`mailto:${selectedLead.email}`}>
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>

              {/* Contact Card Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Lead Information
                </h3>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.06] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <div className="flex items-center gap-1.5 font-medium text-slate-200">
                      <span>{selectedLead.email}</span>
                      <button
                        onClick={() => handleCopy(selectedLead.email, "drawer-email", "Email")}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        {copiedId === "drawer-email" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-200">
                      <span>{selectedLead.phone}</span>
                      <button
                        onClick={() => handleCopy(selectedLead.phone, "drawer-phone", "Phone")}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        {copiedId === "drawer-phone" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="text-slate-200">{selectedLead.company || "Not specified"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Service:</span>
                    <Badge variant="outline" className="bg-slate-950 border-white/[0.08] text-cyan-300">
                      {selectedLead.service}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Submitted:</span>
                    <span className="text-slate-300">
                      {new Date(selectedLead.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inquiry Message */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Client Inquiry Message
                </h3>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs text-slate-200 leading-relaxed italic whitespace-pre-wrap">
                  "{selectedLead.message || "No initial message text."}"
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Internal Sales Notes
                  </h3>
                  <span className="text-[11px] text-slate-500">Visible only to team</span>
                </div>
                <div className="space-y-2">
                  <Textarea
                    rows={4}
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    placeholder="Log client call discussions, follow-up dates, proposed budget..."
                    className="bg-slate-900/60 border-white/[0.08] text-xs text-slate-200 focus-visible:ring-1 focus-visible:ring-cyan-500 resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes || drawerNotes === (selectedLead.adminNotes || "")}
                      className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                    >
                      {isSavingNotes ? "Saving..." : "Save Note"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Campaign Attribution & Technical Context */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Attribution & Technical Context
                </h3>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06] grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">UTM Source:</span>
                    <span className="text-slate-300 font-mono">
                      {selectedLead.utm_source || "Direct / None"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">UTM Medium:</span>
                    <span className="text-slate-300 font-mono">
                      {selectedLead.utm_medium || "Direct / None"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">UTM Campaign:</span>
                    <span className="text-slate-300 font-mono">
                      {selectedLead.utm_campaign || "None"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Client IP:</span>
                    <span className="text-slate-300 font-mono">{selectedLead.ipAddress || "Unknown"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drawer Footer Actions */}
          {selectedLead && (
            <div className="p-4 border-t border-white/[0.08] bg-[#090d16] flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteTarget(selectedLead);
                  setIsDeleteDialogOpen(true);
                }}
                className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>

              <Button
                size="sm"
                onClick={() => handleOpenEdit(selectedLead)}
                className="h-8 bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit Lead Fields
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Details Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg bg-[#0d131f] border-white/[0.08] text-slate-100 rounded-xl shadow-2xl">
          <DialogHeader className="border-b border-white/[0.06] pb-3">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-400" />
              Edit Lead Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEditSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-name" className="text-xs text-slate-300">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="h-9 bg-slate-900 border-white/[0.08] text-xs text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-email" className="text-xs text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="h-9 bg-slate-900 border-white/[0.08] text-xs text-slate-100 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-xs text-slate-300">
                  Phone Number
                </Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="h-9 bg-slate-900 border-white/[0.08] text-xs text-slate-100 font-mono focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-company" className="text-xs text-slate-300">
                  Company Name
                </Label>
                <Input
                  id="edit-company"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Optional"
                  className="h-9 bg-slate-900 border-white/[0.08] text-xs text-slate-100 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-service" className="text-xs text-slate-300">
                  Service Requested
                </Label>
                <Input
                  id="edit-service"
                  value={editForm.service}
                  onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                  required
                  className="h-9 bg-slate-900 border-white/[0.08] text-xs text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-status" className="text-xs text-slate-300">
                  Pipeline Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger id="edit-status" className="h-9 bg-slate-900 border-white/[0.08] text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/[0.08] text-xs">
                    {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                      <SelectItem key={key} value={key} className={conf.text}>
                        {conf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-notes" className="text-xs text-slate-300">
                Internal Sales / Admin Notes
              </Label>
              <Textarea
                id="edit-notes"
                rows={3}
                placeholder="Log internal updates, discussion points..."
                value={editForm.adminNotes}
                onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                className="bg-slate-900 border-white/[0.08] text-xs text-slate-100 focus:border-cyan-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(false)}
                className="h-8 border-white/[0.08] bg-slate-900 hover:bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingEdit}
                className="h-8 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0d131f] border-white/[0.08] text-slate-100 max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              Delete Lead Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete the inquiry from{" "}
              <strong className="text-slate-200">{deleteTarget?.fullName}</strong>? This action
              will permanently remove the document from MongoDB Atlas and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-white/[0.06]">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-8 text-xs border-white/[0.08] bg-slate-900 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="h-8 text-xs bg-red-600 hover:bg-red-500 text-white font-semibold"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
