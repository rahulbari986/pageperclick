"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Inbox,
  RotateCw,
  Sparkles,
  Clock,
  Phone,
  Mail,
  Search,
  Building2,
  Check,
  Copy,
  Edit3,
  Trash2,
  ExternalLink,
  Download,
  ChevronDown,
  X,
  MessageCircle,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  status: "NEW" | "PENDING" | "CONTACTED";
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
  pendingCount: number;
  contactedCount: number;
}

export const STATUS_CONFIG: Record<
  "NEW" | "PENDING" | "CONTACTED",
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dotColor: string;
    activeMenuBg: string;
  }
> = {
  NEW: {
    label: "NEW",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-[#e11d48]",
    badgeBorder: "border-rose-400/40",
    dotColor: "bg-[#e11d48]",
    activeMenuBg: "bg-rose-500/10",
  },
  PENDING: {
    label: "PENDING",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-[#f97316]",
    badgeBorder: "border-orange-400/40",
    dotColor: "bg-[#f97316]",
    activeMenuBg: "bg-orange-500/10",
  },
  CONTACTED: {
    label: "CONTACTED",
    badgeBg: "bg-slate-500/15",
    badgeText: "text-[#94a3b8]",
    badgeBorder: "border-slate-500/30",
    dotColor: "bg-[#64748b]",
    activeMenuBg: "bg-slate-500/10",
  },
};

export default function AdminPage() {
  const [contacts, setContacts] = useState<ContactLead[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalAll: 0,
    newCount: 0,
    pendingCount: 0,
    contactedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Filter & Search
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Lead Detail Drawer State
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerNotes, setDrawerNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Edit Lead Modal State
  const [editTarget, setEditTarget] = useState<ContactLead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    status: "NEW" as "NEW" | "PENDING" | "CONTACTED",
    adminNotes: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Alert State
  const [deleteTarget, setDeleteTarget] = useState<ContactLead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selected Row Checkbox state
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch leads from MongoDB Atlas API
  const fetchContacts = useCallback(
    async (showFullLoading = true) => {
      try {
        if (showFullLoading) setLoading(true);
        setIsRefreshing(true);

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("search", searchTerm.trim());

        // Status mapping
        if (statusFilter !== "ALL") {
          params.set("status", statusFilter);
        }

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
        setCountdown(10);
      }
    },
    [searchTerm, statusFilter]
  );

  // Initial load & search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchContacts]);

  useEffect(() => {
    fetchContacts(true);
  }, [fetchContacts]);

  // Auto-refresh countdown interval (10s)
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchContacts(false);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchContacts]);

  // Card filter synchronization
  const handleCardClick = (cardType: string, filterStatus: string) => {
    setSelectedCardFilter(cardType);
    setStatusFilter(filterStatus);
  };

  // Tab filter click
  const handleTabClick = (tabStatus: string) => {
    setStatusFilter(tabStatus);
    if (tabStatus === "ALL") setSelectedCardFilter("ALL");
    else if (tabStatus === "NEW") setSelectedCardFilter("NEW");
    else if (tabStatus === "PENDING") setSelectedCardFilter("PENDING");
    else if (tabStatus === "CONTACTED") setSelectedCardFilter("CONTACTED");
    else setSelectedCardFilter("");
  };

  // Copy feedback
  const handleCopy = (text: string, identifier: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(identifier);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Quick Inline Status Update (Optimistic)
  const handleInlineStatusChange = async (leadId: string, newStatus: "NEW" | "PENDING" | "CONTACTED") => {
    const originalLead = contacts.find((c) => c._id === leadId);
    if (!originalLead || originalLead.status === newStatus) return;

    // Optimistically update
    setContacts((prev) =>
      prev.map((c) => (c._id === leadId ? { ...c, status: newStatus } : c))
    );
    if (selectedLead && selectedLead._id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
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
      console.error(err);
      // Rollback
      setContacts((prev) =>
        prev.map((c) => (c._id === leadId ? { ...c, status: originalLead.status } : c))
      );
      toast.error("Network error updating status");
    }
  };

  // Open Lead Drawer
  const handleOpenDrawer = (lead: ContactLead) => {
    setSelectedLead(lead);
    setDrawerNotes(lead.adminNotes || "");
    setIsDrawerOpen(true);
  };

  // Save Notes in Drawer
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
        toast.success("Notes saved successfully");
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

  // Open Edit Modal
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

  // Save Full Lead Edit Form
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
        const updatedStatus = editForm.status;
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
      toast.error("Network error saving lead details");
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
      "Submission Date",
      "Sender Name",
      "Company",
      "Email",
      "Phone",
      "Subject / Service",
      "Status",
      "Internal Notes",
      "Message",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
    ];

    const rows = contacts.map((c) => [
      `"${new Date(c.createdAt).toLocaleString("en-IN")}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.service.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${(c.adminNotes || "").replace(/"/g, '""')}"`,
      `"${c.message.replace(/"/g, '""')}"`,
      `"${(c.utm_source || "").replace(/"/g, '""')}"`,
      `"${(c.utm_medium || "").replace(/"/g, '""')}"`,
      `"${(c.utm_campaign || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${contacts.length} inquiries as CSV`);
  };

  // Checkbox select all
  const isAllSelected = useMemo(() => {
    if (contacts.length === 0) return false;
    return contacts.every((c) => selectedRows[c._id]);
  }, [contacts, selectedRows]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows({});
    } else {
      const newSel: Record<string, boolean> = {};
      contacts.forEach((c) => {
        newSel[c._id] = true;
      });
      setSelectedRows(newSel);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Ambient Glows matching PagePerClick project */}
      <div className="inset-0 pointer-events-none fixed overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[130px] animate-float" />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[140px] animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Top Header with Project Logo and Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-transform hover:scale-105">
              <img
                src="/header.png"
                alt="Page Per Click Logo"
                className="w-28 h-12 md:w-36 md:h-14 object-contain"
              />
            </Link>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                Customer Inquiries
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time MongoDB Atlas Leads & Form Entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Live Auto-Refresh Button */}
            <button
              onClick={() => fetchContacts(false)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/60 backdrop-blur-md border border-border text-xs font-medium text-foreground hover:border-primary/50 hover:bg-card shadow-sm transition-all active:scale-95"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-primary ${isRefreshing ? "animate-spin text-accent" : ""}`}
              />
              <span>Refresh ({countdown}s)</span>
            </button>

            {/* Quick Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card/60 backdrop-blur-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-card shadow-sm transition-all"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5 text-secondary" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Back to Live Site */}
            <Button variant="outline" size="sm" asChild className="h-9 rounded-xl border-primary/50 text-xs text-primary hover:bg-primary hover:text-white">
              <Link href="/" target="_blank">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span>Live Site</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 Metric Cards Row (Matching user's EXACT 3 statuses: NEW, PENDING, CONTACTED) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: TOTAL INQUIRIES */}
          <div
            onClick={() => handleCardClick("ALL", "ALL")}
            className={`p-5 rounded-2xl bg-card/65 backdrop-blur-md transition-all cursor-pointer relative group ${
              selectedCardFilter === "ALL"
                ? "border-2 border-primary shadow-lg shadow-primary/20 bg-card/90"
                : "border border-border hover:border-primary/50 hover:bg-card/85"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-sans">
                TOTAL INQUIRIES
              </span>
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {stats.totalAll}
            </div>
          </div>

          {/* Card 2: NEW MESSAGES (NEW) */}
          <div
            onClick={() => handleCardClick("NEW", "NEW")}
            className={`p-5 rounded-2xl bg-card/65 backdrop-blur-md transition-all cursor-pointer relative group ${
              selectedCardFilter === "NEW"
                ? "border-2 border-[#e11d48] shadow-lg shadow-rose-500/20 bg-card/90"
                : "border border-border hover:border-[#e11d48]/50 hover:bg-card/85"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-sans">
                NEW MESSAGES
              </span>
              <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-[#e11d48] group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#e11d48] tracking-tight font-heading">
              {stats.newCount}
            </div>
          </div>

          {/* Card 3: PENDING REVIEW (PENDING) */}
          <div
            onClick={() => handleCardClick("PENDING", "PENDING")}
            className={`p-5 rounded-2xl bg-card/65 backdrop-blur-md transition-all cursor-pointer relative group ${
              selectedCardFilter === "PENDING"
                ? "border-2 border-[#f97316] shadow-lg shadow-orange-500/20 bg-card/90"
                : "border border-border hover:border-[#f97316]/50 hover:bg-card/85"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-sans">
                PENDING REVIEW
              </span>
              <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#f97316] group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#f97316] tracking-tight font-heading">
              {stats.pendingCount}
            </div>
          </div>

          {/* Card 4: CONTACTED (CONTACTED) */}
          <div
            onClick={() => handleCardClick("CONTACTED", "CONTACTED")}
            className={`p-5 rounded-2xl bg-card/65 backdrop-blur-md transition-all cursor-pointer relative group ${
              selectedCardFilter === "CONTACTED"
                ? "border-2 border-[#64748b] shadow-lg shadow-slate-500/20 bg-card/90"
                : "border border-border hover:border-[#64748b]/50 hover:bg-card/85"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-sans">
                CONTACTED
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-[#94a3b8] group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#94a3b8] tracking-tight font-heading">
              {stats.contactedCount}
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar Container (Only NEW, PENDING, CONTACTED) */}
        <div className="p-3 bg-card/65 backdrop-blur-md rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Segmented Filter Pills */}
          <div className="inline-flex items-center bg-background/80 border border-border/60 p-1 rounded-xl text-xs font-medium self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => handleTabClick("ALL")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({stats.totalAll})
            </button>
            <button
              onClick={() => handleTabClick("NEW")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "NEW"
                  ? "bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              New
            </button>
            <button
              onClick={() => handleTabClick("PENDING")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "PENDING"
                  ? "bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleTabClick("CONTACTED")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "CONTACTED"
                  ? "bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Contacted
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8 h-10 bg-background/70 border-border text-xs text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Customer Inquiries Table Container */}
        <div className="bg-card/65 backdrop-blur-md rounded-2xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-card/80 border-b border-border">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12 py-3.5 pl-5">
                  <button
                    onClick={toggleSelectAll}
                    className="w-4 h-4 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-primary transition-colors"
                  >
                    {isAllSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                  DATE
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                  SENDER
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                  CONTACT
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                  SUBJECT
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                  STATUS
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-3.5 pr-5 text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-border/60">
                    <TableCell className="pl-5 py-4">
                      <Skeleton className="w-4 h-4 rounded-full bg-muted/40" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-20 h-4 bg-muted/40" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-28 h-4 bg-muted/40" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-36 h-4 bg-muted/40" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-40 h-4 bg-muted/40" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-16 h-6 rounded-full bg-muted/40" />
                    </TableCell>
                    <TableCell className="py-4 pr-5 text-right">
                      <Skeleton className="w-16 h-7 rounded ml-auto bg-muted/40" />
                    </TableCell>
                  </TableRow>
                ))
              ) : contacts.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={7} className="h-72 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-inner">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        No submissions found
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        New contact form entries will show up here.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                contacts.map((lead) => {
                  const statusConf = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                  const isChecked = !!selectedRows[lead._id];

                  return (
                    <TableRow
                      key={lead._id}
                      className="group hover:bg-card/90 border-border/60 transition-colors"
                    >
                      {/* Checkbox circle */}
                      <TableCell className="py-3.5 pl-5">
                        <button
                          onClick={() => toggleSelectRow(lead._id)}
                          className="w-4 h-4 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-primary transition-colors"
                        >
                          {isChecked && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </button>
                      </TableCell>

                      {/* DATE */}
                      <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        <span className="font-medium text-foreground">
                          {format(new Date(lead.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {format(new Date(lead.createdAt), "h:mm a")}
                        </span>
                      </TableCell>

                      {/* SENDER */}
                      <TableCell className="py-3.5">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleOpenDrawer(lead)}
                        >
                          <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                            {lead.fullName}
                          </div>
                          {lead.company ? (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-muted-foreground" />
                              <span>{lead.company}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Client</span>
                          )}
                        </div>
                      </TableCell>

                      {/* CONTACT */}
                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3 text-secondary shrink-0" />
                            <a
                              href={`mailto:${lead.email}`}
                              className="hover:text-primary hover:underline max-w-[160px] truncate"
                              title={lead.email}
                            >
                              {lead.email}
                            </a>
                            <button
                              onClick={() => handleCopy(lead.email, `email-${lead._id}`, "Email")}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              title="Copy email"
                            >
                              {copiedId === `email-${lead._id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                            <a
                              href={`tel:${lead.phone}`}
                              className="hover:text-primary hover:underline"
                            >
                              {lead.phone}
                            </a>
                            <button
                              onClick={() => handleCopy(lead.phone, `phone-${lead._id}`, "Phone")}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              title="Copy phone"
                            >
                              {copiedId === `phone-${lead._id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </TableCell>

                      {/* SUBJECT */}
                      <TableCell className="py-3.5 max-w-[240px]">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleOpenDrawer(lead)}
                        >
                          <div className="font-medium text-xs text-foreground truncate">
                            {lead.service}
                          </div>
                          <p
                            className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5"
                            title={lead.message}
                          >
                            {lead.message || "No message body"}
                          </p>
                        </div>
                      </TableCell>

                      {/* STATUS (Matching User's Uploaded Dropdown EXACTLY) */}
                      <TableCell className="py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${statusConf.badgeBg} ${statusConf.badgeText} ${statusConf.badgeBorder} hover:brightness-110 shadow-xs`}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusConf.dotColor}`} />
                              <span className="tracking-wide">{statusConf.label}</span>
                              <ChevronDown className="w-3 h-3 opacity-70 ml-0.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-44 bg-card border-border rounded-2xl p-1.5 shadow-2xl text-foreground"
                          >
                            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              UPDATE STATUS
                            </div>

                            {/* Option 1: NEW */}
                            <DropdownMenuItem
                              onClick={() => handleInlineStatusChange(lead._id, "NEW")}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                lead.status === "NEW"
                                  ? "bg-rose-500/10 text-[#e11d48]"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
                              <span>NEW</span>
                              {lead.status === "NEW" && (
                                <Check className="w-4 h-4 ml-auto text-[#e11d48]" />
                              )}
                            </DropdownMenuItem>

                            {/* Option 2: PENDING */}
                            <DropdownMenuItem
                              onClick={() => handleInlineStatusChange(lead._id, "PENDING")}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                lead.status === "PENDING"
                                  ? "bg-orange-500/10 text-[#f97316]"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                              <span>PENDING</span>
                              {lead.status === "PENDING" && (
                                <Check className="w-4 h-4 ml-auto text-[#f97316]" />
                              )}
                            </DropdownMenuItem>

                            {/* Option 3: CONTACTED */}
                            <DropdownMenuItem
                              onClick={() => handleInlineStatusChange(lead._id, "CONTACTED")}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                lead.status === "CONTACTED"
                                  ? "bg-slate-500/15 text-[#94a3b8]"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
                              <span>CONTACTED</span>
                              {lead.status === "CONTACTED" && (
                                <Check className="w-4 h-4 ml-auto text-[#94a3b8]" />
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="py-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDrawer(lead)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="Edit Inquiry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setDeleteTarget(lead);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Slide-Over Drawer: Full Lead Details & Internal Notes */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-md w-full bg-card border-l border-border text-foreground p-0 flex flex-col justify-between overflow-y-auto shadow-2xl">
          {selectedLead && (
            <div className="p-6 space-y-6 flex-1">
              <SheetHeader className="pb-4 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Inquiry Details
                    </span>
                    <SheetTitle className="text-xl font-bold text-foreground mt-1 font-heading">
                      {selectedLead.fullName}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedLead.company || "Individual Inquirer"}
                    </p>
                  </div>

                  {/* Status Dropdown in Drawer */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          STATUS_CONFIG[selectedLead.status]?.badgeBg
                        } ${STATUS_CONFIG[selectedLead.status]?.badgeText} ${
                          STATUS_CONFIG[selectedLead.status]?.badgeBorder
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            STATUS_CONFIG[selectedLead.status]?.dotColor
                          }`}
                        />
                        <span>{STATUS_CONFIG[selectedLead.status]?.label}</span>
                        <ChevronDown className="w-3 h-3 opacity-70 ml-0.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-44 bg-card border-border rounded-2xl p-1.5 shadow-2xl text-foreground"
                    >
                      <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        UPDATE STATUS
                      </div>
                      {(["NEW", "PENDING", "CONTACTED"] as const).map((key) => {
                        const conf = STATUS_CONFIG[key];
                        return (
                          <DropdownMenuItem
                            key={key}
                            onClick={() => handleInlineStatusChange(selectedLead._id, key)}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                              selectedLead.status === key
                                ? `${conf.activeMenuBg} ${conf.badgeText}`
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${conf.dotColor}`} />
                            <span>{conf.label}</span>
                            {selectedLead.status === key && (
                              <Check className={`w-4 h-4 ml-auto ${conf.badgeText}`} />
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Quick Outreach Actions */}
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-secondary" />
                    Email
                  </a>
                </div>
              </SheetHeader>

              {/* Contact Information */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Contact Information
                </span>
                <div className="p-4 rounded-xl bg-background/60 border border-border space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-mono text-foreground">{selectedLead.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <Badge variant="outline" className="bg-card border-border text-foreground">
                      {selectedLead.service}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="text-muted-foreground">
                      {new Date(selectedLead.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Customer Message
                </span>
                <div className="p-4 rounded-xl bg-background/60 border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message || "No message provided."}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Internal Notes
                  </span>
                  <span className="text-[10px] text-muted-foreground">Team private</span>
                </div>
                <Textarea
                  rows={4}
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  placeholder="Record client discussions, budget notes, follow-up dates..."
                  className="bg-background/60 border-border text-xs text-foreground focus-visible:ring-1 focus-visible:ring-primary resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="cta"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || drawerNotes === (selectedLead.adminNotes || "")}
                    className="h-8 text-xs font-medium"
                  >
                    {isSavingNotes ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Drawer Footer Actions */}
          {selectedLead && (
            <div className="p-4 border-t border-border bg-card flex items-center justify-between">
              <button
                onClick={() => {
                  setDeleteTarget(selectedLead);
                  setIsDeleteDialogOpen(true);
                }}
                className="text-xs text-destructive hover:underline font-medium"
              >
                Delete Record
              </button>

              <Button
                size="sm"
                onClick={() => handleOpenEdit(selectedLead)}
                className="h-8 bg-primary hover:bg-primary/90 text-white text-xs"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit Details
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Details Dialog Modal (Only NEW, PENDING, CONTACTED) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-card border border-border text-foreground rounded-2xl shadow-2xl">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2 font-heading">
              <Edit3 className="w-4 h-4 text-primary" />
              Edit Customer Inquiry
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEditSubmit} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-name" className="text-xs text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="h-9 bg-background/70 border-border text-xs text-foreground focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="h-9 bg-background/70 border-border text-xs text-foreground focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-xs text-muted-foreground">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="h-9 bg-background/70 border-border text-xs text-foreground font-mono focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-company" className="text-xs text-muted-foreground">
                  Company
                </Label>
                <Input
                  id="edit-company"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Optional"
                  className="h-9 bg-background/70 border-border text-xs text-foreground focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-service" className="text-xs text-muted-foreground">
                  Subject / Service
                </Label>
                <Input
                  id="edit-service"
                  value={editForm.service}
                  onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                  required
                  className="h-9 bg-background/70 border-border text-xs text-foreground focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-status" className="text-xs text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val: "NEW" | "PENDING" | "CONTACTED") =>
                    setEditForm({ ...editForm, status: val })
                  }
                >
                  <SelectTrigger id="edit-status" className="h-9 bg-background/70 border-border text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-xs text-foreground">
                    <SelectItem value="NEW" className="text-[#e11d48] font-bold">
                      NEW
                    </SelectItem>
                    <SelectItem value="PENDING" className="text-[#f97316] font-bold">
                      PENDING
                    </SelectItem>
                    <SelectItem value="CONTACTED" className="text-[#94a3b8] font-bold">
                      CONTACTED
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-notes" className="text-xs text-muted-foreground">
                Internal Admin Notes
              </Label>
              <Textarea
                id="edit-notes"
                rows={3}
                placeholder="Record notes..."
                value={editForm.adminNotes}
                onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                className="bg-background/70 border-border text-xs text-foreground focus:border-primary resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(false)}
                className="h-8 border-border bg-card hover:bg-muted text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="cta"
                size="sm"
                disabled={isSavingEdit}
                className="h-8 text-xs font-semibold"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border text-foreground max-w-sm rounded-2xl shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground font-heading">
              Delete Submission?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete the submission from{" "}
              <strong className="text-foreground">{deleteTarget?.fullName}</strong>? This action
              cannot be undone.
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
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="h-8 text-xs bg-destructive hover:bg-destructive/90 text-white font-semibold"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
