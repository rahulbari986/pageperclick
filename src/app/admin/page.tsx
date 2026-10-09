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
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dotColor: string;
  }
> = {
  NEW: {
    label: "New",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  QUALIFIED: {
    label: "Pending",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    dotColor: "bg-amber-500",
  },
  CONTACTED: {
    label: "Contacted",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
    dotColor: "bg-blue-500",
  },
  CONVERTED: {
    label: "Converted",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    dotColor: "bg-purple-500",
  },
  ARCHIVED: {
    label: "Archived",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-600",
    badgeBorder: "border-slate-200",
    dotColor: "bg-slate-400",
  },
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
    status: "NEW",
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
    else if (tabStatus === "QUALIFIED") setSelectedCardFilter("PENDING");
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
  const handleInlineStatusChange = async (leadId: string, newStatus: string) => {
    const originalLead = contacts.find((c) => c._id === leadId);
    if (!originalLead || originalLead.status === newStatus) return;

    const validStatus = newStatus as ContactLead["status"];

    // Optimistically update
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-rose-100 selection:text-rose-700">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight font-heading">
              Customer Inquiries
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Live Auto-Refresh Button (matching screenshot) */}
            <button
              onClick={() => fetchContacts(false)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? "animate-spin text-rose-500" : ""}`}
              />
              <span>Refresh ({countdown}s)</span>
            </button>

            {/* Quick Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Back to Live Site */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Live Site</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards Row (matching screenshot exact styling) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: TOTAL INQUIRIES */}
          <div
            onClick={() => handleCardClick("ALL", "ALL")}
            className={`p-5 rounded-2xl bg-white shadow-sm transition-all cursor-pointer relative ${
              selectedCardFilter === "ALL"
                ? "border-2 border-rose-500 shadow-rose-100"
                : "border border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                TOTAL INQUIRIES
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#111827] tracking-tight">
              {stats.totalAll}
            </div>
          </div>

          {/* Card 2: NEW MESSAGES */}
          <div
            onClick={() => handleCardClick("NEW", "NEW")}
            className={`p-5 rounded-2xl bg-white shadow-sm transition-all cursor-pointer relative ${
              selectedCardFilter === "NEW"
                ? "border-2 border-emerald-500 shadow-emerald-100"
                : "border border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                NEW MESSAGES
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#111827] tracking-tight">
              {stats.newCount}
            </div>
          </div>

          {/* Card 3: PENDING REVIEW */}
          <div
            onClick={() => handleCardClick("PENDING", "QUALIFIED")}
            className={`p-5 rounded-2xl bg-white shadow-sm transition-all cursor-pointer relative ${
              selectedCardFilter === "PENDING"
                ? "border-2 border-amber-500 shadow-amber-100"
                : "border border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                PENDING REVIEW
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-100/80 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#111827] tracking-tight">
              {stats.qualifiedCount}
            </div>
          </div>

          {/* Card 4: CONTACTED */}
          <div
            onClick={() => handleCardClick("CONTACTED", "CONTACTED")}
            className={`p-5 rounded-2xl bg-white shadow-sm transition-all cursor-pointer relative ${
              selectedCardFilter === "CONTACTED"
                ? "border-2 border-blue-500 shadow-blue-100"
                : "border border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                CONTACTED
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-100/80 flex items-center justify-center text-blue-600">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#111827] tracking-tight">
              {stats.contactedCount}
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar Container (matching screenshot exact styling) */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Segmented Filter Pills */}
          <div className="inline-flex items-center bg-[#f1f5f9] p-1 rounded-xl text-xs font-medium self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => handleTabClick("ALL")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-white text-[#111827] font-semibold shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({stats.totalAll})
            </button>
            <button
              onClick={() => handleTabClick("NEW")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "NEW"
                  ? "bg-white text-[#111827] font-semibold shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              New
            </button>
            <button
              onClick={() => handleTabClick("QUALIFIED")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "QUALIFIED"
                  ? "bg-white text-[#111827] font-semibold shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleTabClick("CONTACTED")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "CONTACTED"
                  ? "bg-white text-[#111827] font-semibold shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Contacted
            </button>
            <button
              onClick={() => handleTabClick("CONVERTED")}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                statusFilter === "CONVERTED"
                  ? "bg-white text-[#111827] font-semibold shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Converted
            </button>
          </div>

          {/* Search Input Bar (matching screenshot exact styling) */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8 h-10 bg-[#f8fafc] border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:ring-1 focus-visible:ring-rose-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Customer Inquiries Table Container (matching screenshot exact layout) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-white border-b border-slate-200/80">
              <TableRow className="border-slate-200/80 hover:bg-transparent">
                <TableHead className="w-12 py-3.5 pl-5">
                  <button
                    onClick={toggleSelectAll}
                    className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                  >
                    {isAllSelected && <div className="w-2 h-2 rounded-full bg-slate-800" />}
                  </button>
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">
                  DATE
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">
                  SENDER
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">
                  CONTACT
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">
                  SUBJECT
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5">
                  STATUS
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 py-3.5 pr-5 text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100">
                    <TableCell className="pl-5 py-4">
                      <Skeleton className="w-4 h-4 rounded-full bg-slate-100" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-20 h-4 bg-slate-100" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-28 h-4 bg-slate-100" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-36 h-4 bg-slate-100" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-40 h-4 bg-slate-100" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="w-16 h-6 rounded-full bg-slate-100" />
                    </TableCell>
                    <TableCell className="py-4 pr-5 text-right">
                      <Skeleton className="w-16 h-7 rounded ml-auto bg-slate-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : contacts.length === 0 ? (
                // Empty State (matching screenshot exact styling)
                <TableRow>
                  <TableCell colSpan={7} className="h-72 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100/90 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        No submissions found
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
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
                      className="group hover:bg-slate-50/70 border-slate-100 transition-colors"
                    >
                      {/* Checkbox circle */}
                      <TableCell className="py-3.5 pl-5">
                        <button
                          onClick={() => toggleSelectRow(lead._id)}
                          className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                        >
                          {isChecked && <div className="w-2 h-2 rounded-full bg-slate-800" />}
                        </button>
                      </TableCell>

                      {/* DATE */}
                      <TableCell className="py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        <span className="font-medium">
                          {format(new Date(lead.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {format(new Date(lead.createdAt), "h:mm a")}
                        </span>
                      </TableCell>

                      {/* SENDER */}
                      <TableCell className="py-3.5">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleOpenDrawer(lead)}
                        >
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-rose-600 transition-colors">
                            {lead.fullName}
                          </div>
                          {lead.company ? (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{lead.company}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Client</span>
                          )}
                        </div>
                      </TableCell>

                      {/* CONTACT */}
                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${lead.email}`}
                              className="hover:text-rose-600 hover:underline max-w-[160px] truncate"
                              title={lead.email}
                            >
                              {lead.email}
                            </a>
                            <button
                              onClick={() => handleCopy(lead.email, `email-${lead._id}`, "Email")}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title="Copy email"
                            >
                              {copiedId === `email-${lead._id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <a
                              href={`tel:${lead.phone}`}
                              className="hover:text-rose-600 hover:underline"
                            >
                              {lead.phone}
                            </a>
                            <button
                              onClick={() => handleCopy(lead.phone, `phone-${lead._id}`, "Phone")}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title="Copy phone"
                            >
                              {copiedId === `phone-${lead._id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
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
                          <div className="font-medium text-xs text-slate-800 truncate">
                            {lead.service}
                          </div>
                          <p
                            className="text-[11px] text-slate-500 line-clamp-1 mt-0.5"
                            title={lead.message}
                          >
                            {lead.message || "No message body"}
                          </p>
                        </div>
                      </TableCell>

                      {/* STATUS (With Direct 1-Click Dropdown Changer) */}
                      <TableCell className="py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${statusConf.badgeBg} ${statusConf.badgeText} ${statusConf.badgeBorder} hover:shadow-xs`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor}`} />
                              <span>{statusConf.label}</span>
                              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-36 bg-white border-slate-200 text-xs shadow-md"
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                              <DropdownMenuItem
                                key={key}
                                onClick={() => handleInlineStatusChange(lead._id, key)}
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50"
                              >
                                <span className={`w-2 h-2 rounded-full ${conf.dotColor}`} />
                                <span className={lead.status === key ? "font-bold text-slate-900" : "text-slate-700"}>
                                  {conf.label}
                                </span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell className="py-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDrawer(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit Inquiry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setDeleteTarget(lead);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
        <SheetContent className="sm:max-w-md w-full bg-white border-l border-slate-200 text-slate-800 p-0 flex flex-col justify-between overflow-y-auto shadow-2xl">
          {selectedLead && (
            <div className="p-6 space-y-6 flex-1">
              <SheetHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Inquiry Details
                    </span>
                    <SheetTitle className="text-xl font-bold text-slate-900 mt-1">
                      {selectedLead.fullName}
                    </SheetTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedLead.company || "Individual Inquirer"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      STATUS_CONFIG[selectedLead.status]?.badgeBg
                    } ${STATUS_CONFIG[selectedLead.status]?.badgeText} ${
                      STATUS_CONFIG[selectedLead.status]?.badgeBorder
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        STATUS_CONFIG[selectedLead.status]?.dotColor
                      }`}
                    />
                    {STATUS_CONFIG[selectedLead.status]?.label}
                  </span>
                </div>

                {/* Quick Outreach Actions */}
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    Email
                  </a>
                </div>
              </SheetHeader>

              {/* Contact Information */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Contact Information
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-800">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-slate-800">{selectedLead.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Service:</span>
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-700">
                      {selectedLead.service}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Submitted:</span>
                    <span className="text-slate-600">
                      {new Date(selectedLead.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Customer Message
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message || "No message provided."}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Internal Notes
                  </span>
                  <span className="text-[10px] text-slate-400">Team private</span>
                </div>
                <Textarea
                  rows={4}
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  placeholder="Record client discussions, budget notes, follow-up dates..."
                  className="bg-slate-50 border-slate-200 text-xs text-slate-800 focus-visible:ring-1 focus-visible:ring-rose-500 resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || drawerNotes === (selectedLead.adminNotes || "")}
                    className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium"
                  >
                    {isSavingNotes ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Drawer Footer Actions */}
          {selectedLead && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setDeleteTarget(selectedLead);
                  setIsDeleteDialogOpen(true);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                Delete Record
              </button>

              <Button
                size="sm"
                onClick={() => handleOpenEdit(selectedLead)}
                className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit Details
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Details Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-xl">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-rose-600" />
              Edit Customer Inquiry
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEditSubmit} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-name" className="text-xs text-slate-600">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-800 focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-email" className="text-xs text-slate-600">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-800 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-xs text-slate-600">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-800 font-mono focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-company" className="text-xs text-slate-600">
                  Company
                </Label>
                <Input
                  id="edit-company"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Optional"
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-800 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-service" className="text-xs text-slate-600">
                  Subject / Service
                </Label>
                <Input
                  id="edit-service"
                  value={editForm.service}
                  onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                  required
                  className="h-9 bg-slate-50 border-slate-200 text-xs text-slate-800 focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-status" className="text-xs text-slate-600">
                  Status
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger id="edit-status" className="h-9 bg-slate-50 border-slate-200 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-xs">
                    {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                      <SelectItem key={key} value={key} className={conf.badgeText}>
                        {conf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-notes" className="text-xs text-slate-600">
                Internal Admin Notes
              </Label>
              <Textarea
                id="edit-notes"
                rows={3}
                placeholder="Record notes..."
                value={editForm.adminNotes}
                onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                className="bg-slate-50 border-slate-200 text-xs text-slate-800 focus:border-rose-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(false)}
                className="h-8 border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingEdit}
                className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-slate-200 text-slate-800 max-w-sm rounded-2xl shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete Submission?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete the submission from{" "}
              <strong className="text-slate-800">{deleteTarget?.fullName}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-slate-100">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-8 text-xs border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
