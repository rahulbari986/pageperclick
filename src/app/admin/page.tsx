"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy-load Three.js canvas to prevent SSR crash
const ThreeParticleField = dynamic(
  () =>
    import("@/components/admin/ThreeParticleField").then(
      (m) => m.ThreeParticleField
    ),
  { ssr: false }
);
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
  User,
  Calendar,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Globe,
  Compass,
  Target,
  Megaphone,
  Activity,
  Layers,
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
  ResponsiveModal,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/admin/ResponsiveModal";
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
import { BulkDeleteBar } from "@/components/admin/BulkDeleteBar";
import { AdminPasscodeGate } from "@/components/admin/AdminPasscodeGate";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { decodeHtmlEntities } from "@/lib/security";

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
    badgeBg: "bg-white/10",
    badgeText: "text-white",
    badgeBorder: "border-white/30",
    dotColor: "bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]",
    activeMenuBg: "bg-white/10",
  },
  PENDING: {
    label: "PENDING",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-[#f97316]",
    badgeBorder: "border-orange-400/40",
    dotColor: "bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.7)]",
    activeMenuBg: "bg-orange-500/10",
  },
  CONTACTED: {
    label: "CONTACTED",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/30",
    dotColor: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]",
    activeMenuBg: "bg-emerald-500/10",
  },
};

export function getSourceInfo(source?: string | null, medium?: string | null) {
  const s = (source || "").trim().toLowerCase();
  const m = (medium || "").trim().toLowerCase();

  if (!s || s === "direct" || s === "none" || s === "null" || s === "undefined") {
    return {
      label: "Direct",
      badgeBg: "bg-slate-500/15",
      badgeText: "text-slate-300",
      badgeBorder: "border-slate-500/30",
      dotColor: "bg-slate-400",
      channel: "Direct",
    };
  }

  if (s.includes("google") || s.includes("gads") || s.includes("adwords")) {
    return {
      label: "Google",
      badgeBg: "bg-blue-500/15",
      badgeText: "text-blue-400",
      badgeBorder: "border-blue-500/30",
      dotColor: "bg-blue-400",
      channel: "Google",
    };
  }

  if (s.includes("facebook") || s.includes("meta") || s.includes("fb")) {
    return {
      label: "Facebook",
      badgeBg: "bg-indigo-500/15",
      badgeText: "text-indigo-400",
      badgeBorder: "border-indigo-500/30",
      dotColor: "bg-indigo-400",
      channel: "Meta",
    };
  }

  if (s.includes("instagram") || s.includes("ig")) {
    return {
      label: "Instagram",
      badgeBg: "bg-pink-500/15",
      badgeText: "text-pink-400",
      badgeBorder: "border-pink-500/30",
      dotColor: "bg-pink-400",
      channel: "Instagram",
    };
  }

  if (s.includes("linkedin")) {
    return {
      label: "LinkedIn",
      badgeBg: "bg-sky-500/15",
      badgeText: "text-sky-400",
      badgeBorder: "border-sky-500/30",
      dotColor: "bg-sky-400",
      channel: "LinkedIn",
    };
  }

  if (s.includes("twitter") || s === "x" || s.includes("x.com")) {
    return {
      label: "X (Twitter)",
      badgeBg: "bg-neutral-500/15",
      badgeText: "text-neutral-300",
      badgeBorder: "border-neutral-500/30",
      dotColor: "bg-neutral-400",
      channel: "Twitter",
    };
  }

  if (s.includes("youtube") || s.includes("yt")) {
    return {
      label: "YouTube",
      badgeBg: "bg-rose-500/15",
      badgeText: "text-rose-400",
      badgeBorder: "border-rose-500/30",
      dotColor: "bg-rose-400",
      channel: "YouTube",
    };
  }

  if (s.includes("organic") || m.includes("organic") || s.includes("seo")) {
    return {
      label: "Organic Search",
      badgeBg: "bg-emerald-500/15",
      badgeText: "text-emerald-400",
      badgeBorder: "border-emerald-500/30",
      dotColor: "bg-emerald-400",
      channel: "Organic",
    };
  }

  if (s.includes("email") || m.includes("email") || s.includes("newsletter")) {
    return {
      label: "Email",
      badgeBg: "bg-amber-500/15",
      badgeText: "text-amber-400",
      badgeBorder: "border-amber-500/30",
      dotColor: "bg-amber-400",
      channel: "Email",
    };
  }

  const rawClean = source!.trim();
  const formatted = rawClean.charAt(0).toUpperCase() + rawClean.slice(1);
  return {
    label: formatted,
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-300",
    badgeBorder: "border-purple-500/30",
    dotColor: "bg-purple-400",
    channel: formatted,
  };
}

/**
 * Modern crystal harmonic chime for incoming leads (Web Audio API)
 */
function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Note 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B5 (987.77Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export default function AdminPage() {
  // Admin Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Real-time Database Status & Live Sync
  const [dbStatus, setDbStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [newIncomingId, setNewIncomingId] = useState<string | null>(null);

function getAdminAuthHeaders(extraHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...extraHeaders };
  try {
    const token =
      sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-admin-token"] = token;
    }
  } catch {
    // ignore
  }
  return headers;
}

  // Lock Admin Panel & Clear all session state
  const handleLockAdmin = useCallback(async () => {
    try {
      await fetch("/api/v1/admin/auth", {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
    } catch {
      // ignore
    }

    try {
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_passcode_auth");
      sessionStorage.removeItem("admin_username");
      sessionStorage.removeItem("admin_session_expires_at");
      sessionStorage.removeItem("admin_session_remember_me");
      sessionStorage.removeItem("admin_session_ip");

      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_passcode_auth");
      localStorage.removeItem("admin_username");
      localStorage.removeItem("admin_session_expires_at");
      localStorage.removeItem("admin_session_remember_me");
      localStorage.removeItem("admin_session_ip");
    } catch {
      // ignore
    }

    setIsAuthenticated(false);
    setContacts([]);
    toast.info("Admin panel locked.");
  }, []);

  // 1. Initial Authentication & Expiration Check
  useEffect(() => {
    let isCancelled = false;

    async function verifyAuth() {
      // Check if stored expiration timestamp is already in the past
      const expiresAtStr =
        sessionStorage.getItem("admin_session_expires_at") ||
        localStorage.getItem("admin_session_expires_at");

      if (expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10);
        if (!isNaN(expiresAt) && Date.now() >= expiresAt) {
          if (!isCancelled) {
            handleLockAdmin();
          }
          return;
        }
      }

      try {
        const headers = getAdminAuthHeaders();
        const res = await fetch("/api/v1/admin/auth", { headers });
        const data = await res.json().catch(() => ({}));

        if (!isCancelled) {
          if (res.ok && data.authenticated) {
            // Check if server-side session is expired
            if (data.expiresAt && Date.now() >= data.expiresAt) {
              handleLockAdmin();
              return;
            }
            if (data.expiresAt) {
              sessionStorage.setItem("admin_session_expires_at", data.expiresAt.toString());
            }
            setIsAuthenticated(true);
          } else {
            // Not authenticated by server — lock panel
            handleLockAdmin();
          }
        }
      } catch {
        if (!isCancelled) {
          // Offline verification with timestamp check
          if (expiresAtStr) {
            const expiresAt = parseInt(expiresAtStr, 10);
            if (!isNaN(expiresAt) && Date.now() >= expiresAt) {
              setIsAuthenticated(false);
              return;
            }
          }
          const sessionAuth = sessionStorage.getItem("admin_passcode_auth");
          const localAuth = localStorage.getItem("admin_passcode_auth");
          setIsAuthenticated(
            sessionAuth === "authenticated" || localAuth === "authenticated" || sessionAuth === "1998" || localAuth === "1998"
          );
        }
      }
    }

    verifyAuth();

    return () => {
      isCancelled = true;
    };
  }, [handleLockAdmin]);

  // 2. Active Session Auto-Lockout Watcher (Locks automatically after 1hr or 12hrs)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkLockout = () => {
      const expiresAtStr =
        sessionStorage.getItem("admin_session_expires_at") ||
        localStorage.getItem("admin_session_expires_at");

      if (expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10);
        if (!isNaN(expiresAt) && Date.now() >= expiresAt) {
          const isRememberMe =
            sessionStorage.getItem("admin_session_remember_me") === "true" ||
            localStorage.getItem("admin_session_remember_me") === "true";

          toast.error(
            isRememberMe
              ? "12-hour session expired. Admin locked automatically."
              : "1-hour session limit reached. Admin locked automatically."
          );
          handleLockAdmin();
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, handleLockAdmin]);

  const [contacts, setContacts] = useState<ContactLead[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalAll: 0,
    newCount: 0,
    pendingCount: 0,
    contactedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");

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
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Real-time acquisition source stats computed dynamically from leads
  const sourceStats = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      const src = getSourceInfo(c.utm_source, c.utm_medium).label;
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [contacts]);

  const latestLead = useMemo(() => {
    return contacts.length > 0 ? contacts[0] : null;
  }, [contacts]);

  // Fetch leads from MongoDB Atlas API
  const fetchContacts = useCallback(
    async (showFullLoading = true) => {
      if (isAuthenticated !== true) return;
      try {
        if (showFullLoading) setLoading(true);
        setIsRefreshing(true);

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("search", searchTerm.trim());

        // Status mapping
        if (statusFilter !== "ALL") {
          params.set("status", statusFilter);
        }

        // Source mapping
        if (sourceFilter !== "ALL") {
          params.set("source", sourceFilter);
        }

        const res = await fetch(`/api/v1/admin/contacts?${params.toString()}`, {
          cache: "no-store",
          headers: getAdminAuthHeaders(),
        });

        if (res.status === 401) {
          setIsAuthenticated(false);
          toast.error("Session expired. Please sign in again.");
          return;
        }

        const data = await res.json();

        if (data.success) {
          const cleanContacts = (data.contacts || []).map((c: ContactLead) => ({
            ...c,
            fullName: decodeHtmlEntities(c.fullName),
            company: decodeHtmlEntities(c.company || ""),
            service: decodeHtmlEntities(c.service),
            message: decodeHtmlEntities(c.message),
            adminNotes: decodeHtmlEntities(c.adminNotes || ""),
          }));
          setContacts(cleanContacts);
          if (data.stats) {
            setStats(data.stats);
          }
          setDbStatus("connected");
          setLastSyncTime(new Date());
        } else {
          setDbStatus("disconnected");
          toast.error(data.error || "Failed to retrieve contacts from database.");
        }
      } catch (err: unknown) {
        console.error(err);
        setDbStatus("disconnected");
        toast.error("Network error while connecting to database.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchTerm, statusFilter, sourceFilter, isAuthenticated]
  );

  // Initial load and debounced search/filter changes
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchContacts(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchContacts, isAuthenticated]);

  // Real-time Server-Sent Events (SSE) Stream + Resilient Auto-Sync
  useEffect(() => {
    if (!isAuthenticated) return;

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let isMounted = true;

    const connectStream = () => {
      try {
        eventSource = new EventSource("/api/v1/admin/stream");

        eventSource.onopen = () => {
          if (!isMounted) return;
          setDbStatus("connected");
          setLastSyncTime(new Date());
        };

        // Handshake & Pings
        eventSource.addEventListener("init", (e) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(e.data);
            setDbStatus(data.dbConnected ? "connected" : "disconnected");
            setLastSyncTime(new Date());
          } catch {
            // ignore
          }
        });

        eventSource.addEventListener("ping", (e) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(e.data);
            setDbStatus(data.dbConnected ? "connected" : "disconnected");
            setLastSyncTime(new Date());
          } catch {
            // ignore
          }
        });

        // Instant New Contact Submission Event
        eventSource.addEventListener("new-contact", (e) => {
          if (!isMounted) return;
          try {
            const rawLead = JSON.parse(e.data);
            const newLead: ContactLead = {
              ...rawLead,
              fullName: decodeHtmlEntities(rawLead.fullName || ""),
              company: decodeHtmlEntities(rawLead.company || ""),
              service: decodeHtmlEntities(rawLead.service || ""),
              message: decodeHtmlEntities(rawLead.message || ""),
              adminNotes: decodeHtmlEntities(rawLead.adminNotes || ""),
              status: rawLead.status || "NEW",
              createdAt: rawLead.createdAt || new Date().toISOString(),
              updatedAt: rawLead.updatedAt || new Date().toISOString(),
            };

            playNotificationChime();
            toast.success(`🚀 New Enquiry: ${newLead.fullName || "New Lead"}`, {
              description: newLead.service ? `Subject: ${newLead.service}` : undefined,
              duration: 5000,
            });

            if (newLead._id) {
              setNewIncomingId(newLead._id);
              setTimeout(() => setNewIncomingId(null), 5000);
            }

            // Real-time zero-latency optimistic update
            setContacts((prev) => {
              if (prev.some((c) => c._id === newLead._id)) return prev;
              return [newLead, ...prev];
            });
            setStats((prev) => ({
              ...prev,
              totalAll: prev.totalAll + 1,
              newCount: prev.newCount + 1,
            }));

            // Silent sync to update stats counters and reconcile with database
            fetchContacts(false);
          } catch (err) {
            console.error("Realtime new contact parse error:", err);
          }
        });

        // Contact updated (notes, status, details)
        eventSource.addEventListener("contact-updated", (e) => {
          if (!isMounted) return;
          try {
            const updated = JSON.parse(e.data);
            setContacts((prev) =>
              prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c))
            );
            setSelectedLead((prev) => (prev && prev._id === updated._id ? { ...prev, ...updated } : prev));
            fetchContacts(false);
          } catch {
            // ignore
          }
        });

        // Contact deleted
        eventSource.addEventListener("contact-deleted", (e) => {
          if (!isMounted) return;
          try {
            const { ids } = JSON.parse(e.data);
            if (Array.isArray(ids)) {
              setContacts((prev) => prev.filter((c) => !ids.includes(c._id)));
            }
            fetchContacts(false);
          } catch {
            // ignore
          }
        });

        eventSource.onerror = () => {
          if (!isMounted) return;
          setDbStatus("connecting");
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect with backoff
          reconnectTimer = setTimeout(connectStream, 4000);
        };
      } catch {
        if (!isMounted) return;
        setDbStatus("connecting");
        reconnectTimer = setTimeout(connectStream, 5000);
      }
    };

    connectStream();

    // Resilient background auto-poll every 8 seconds (ensures state never gets stale)
    const pollInterval = setInterval(() => {
      fetchContacts(false);
    }, 8000);

    // Auto-refresh when user switches back to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchContacts(false);
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(pollInterval);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [isAuthenticated, fetchContacts]);

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchContacts(false);
    toast.success("Client enquiries updated");
  };

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
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
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
    const cleanLead: ContactLead = {
      ...lead,
      fullName: decodeHtmlEntities(lead.fullName),
      company: decodeHtmlEntities(lead.company || ""),
      service: decodeHtmlEntities(lead.service),
      message: decodeHtmlEntities(lead.message),
      adminNotes: decodeHtmlEntities(lead.adminNotes || ""),
    };
    setSelectedLead(cleanLead);
    setDrawerNotes(cleanLead.adminNotes || "");
    setIsDrawerOpen(true);
  };

  // Save Notes in Drawer
  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/v1/admin/contacts/${selectedLead._id}`, {
        method: "PATCH",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
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
      fullName: decodeHtmlEntities(lead.fullName),
      email: lead.email,
      phone: lead.phone,
      company: decodeHtmlEntities(lead.company || ""),
      service: decodeHtmlEntities(lead.service),
      status: lead.status,
      adminNotes: decodeHtmlEntities(lead.adminNotes || ""),
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
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
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
        headers: getAdminAuthHeaders(),
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
      "IP Address",
    ];

    const rows = contacts.map((c) => [
      `"${new Date(c.createdAt).toLocaleString("en-IN")}"`,
      `"${decodeHtmlEntities(c.fullName).replace(/"/g, '""')}"`,
      `"${decodeHtmlEntities(c.company || "").replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${decodeHtmlEntities(c.service).replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${decodeHtmlEntities(c.adminNotes || "").replace(/"/g, '""')}"`,
      `"${decodeHtmlEntities(c.message).replace(/"/g, '""')}"`,
      `"${(c.utm_source || "").replace(/"/g, '""')}"`,
      `"${(c.utm_medium || "").replace(/"/g, '""')}"`,
      `"${(c.utm_campaign || "").replace(/"/g, '""')}"`,
      `"${(c.ipAddress || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `client_enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${contacts.length} client enquiries as CSV`);
  };

  // Checkbox select all
  const isAllSelected = useMemo(() => {
    if (contacts.length === 0) return false;
    return contacts.every((c) => selectedRows[c._id]);
  }, [contacts, selectedRows]);

  const selectedIds = useMemo(() => {
    return contacts.filter((c) => selectedRows[c._id]).map((c) => c._id);
  }, [contacts, selectedRows]);

  const selectedCount = selectedIds.length;

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

  // Bulk Delete Handler
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/v1/admin/contacts", {
        method: "DELETE",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Successfully deleted ${data.deletedCount} client enquiries`);
        setContacts((prev) => prev.filter((c) => !selectedRows[c._id]));
        setSelectedRows({});
        fetchContacts(false);
      } else {
        toast.error(data.error || "Failed to delete client enquiries");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error deleting enquiries");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-xs text-muted-foreground font-mono">Checking security credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminPasscodeGate
        onSuccess={() => {
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Three.js Particle Field — fullscreen fixed background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <ThreeParticleField
          className="w-full h-full"
          particleCount={200}
          primaryColor="#7c3aed"
          accentColor="#9333ea"
          showRing={false}
        />
      </div>

      {/* Ambient Glows */}
      <div className="inset-0 pointer-events-none fixed overflow-hidden z-[1]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-96 h-96 bg-primary/12 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ repeat: Infinity, duration: 11, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-accent/12 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.06, 0.14, 0.06] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Top Header matching exact position and container as entire project */}
      <header className="relative z-10 w-full">
        <div className="container mx-auto px-6 md:px-4 py-5 md:py-10 flex items-center justify-between">
          {/* Left: Clickable Logo with ADMIN WORKSPACE */}
          <div className="relative w-fit flex flex-col">
            <Link href="/" className="inline-block cursor-pointer">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                src="/header.png"
                alt="Page Per Click Logo"
                className="inline-block mt-0 md:mt-4 w-28 h-20 md:w-40 md:h-20 object-contain cursor-pointer"
              />
            </Link>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase mt-0.5 sm:mt-1">
              ADMIN WORKSPACE
            </span>
          </div>

          {/* Right: Sign out Squircle Button */}
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04 }}
              onClick={handleLockAdmin}
              className="flex flex-col items-center justify-center min-w-[68px] sm:min-w-[76px] h-[54px] sm:h-[60px] px-3.5 py-1 rounded-2xl bg-[#221238]/70 hover:bg-[#2c1748]/90 border border-purple-500/35 hover:border-purple-400/55 text-purple-300 hover:text-purple-100 shadow-md transition-all cursor-pointer group"
              title="Sign out of Admin Panel"
              aria-label="Sign out of Admin Panel"
            >
              <LogOut className="w-4 h-4 text-purple-300 group-hover:text-purple-100 transition-colors" />
              <span className="text-[10px] sm:text-xs font-medium text-purple-200 mt-0.5">
                Sign out
              </span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Body Container */}
      <div className="relative z-10 container mx-auto px-6 md:px-4 pb-[50vh] space-y-4 sm:space-y-6">
        {/* Full-width Horizontal Divider */}
        <div className="w-full h-px bg-white/[0.08]" />

        {/* Second Row: Client Enquiries & Database connected (Left) + Action Squircles (Right) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between gap-4"
        >
          {/* Left: Client Enquiries Title & Database connected */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight font-heading">
              Client Enquiries
            </h1>
            <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
              <div
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  dbStatus === "connected"
                    ? "text-emerald-400"
                    : dbStatus === "connecting"
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {dbStatus === "connected" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : dbStatus === "connecting" ? (
                  <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}

                <span>
                  {dbStatus === "connected"
                    ? "Database connected"
                    : dbStatus === "connecting"
                    ? "Connecting to database..."
                    : "Database disconnected"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Squircles (Refresh & Download) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Refresh Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#24133b]/60 hover:bg-[#2f184e]/90 border border-purple-500/30 hover:border-purple-400/50 flex items-center justify-center text-purple-300 hover:text-white shadow-sm transition-all cursor-pointer"
              title="Refresh Client Enquiries"
              aria-label="Refresh Client Enquiries"
            >
              <RotateCw
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? "animate-spin text-accent" : ""}`}
              />
            </motion.button>

            {/* Export CSV Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleExportCSV}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#132238]/60 hover:bg-[#1a304e]/90 border border-blue-500/30 hover:border-blue-400/50 flex items-center justify-center text-blue-300 hover:text-white shadow-sm transition-all cursor-pointer"
              title="Export CSV"
              aria-label="Export CSV"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* 4 Metric Cards Row (2x2 grid on mobile, 4 columns on large screens) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: TOTAL CLIENT ENQUIRIES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCardClick("ALL", "ALL")}
            className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer relative group overflow-hidden ${
              selectedCardFilter === "ALL"
                ? "border-2 border-primary shadow-[0_0_30px_rgba(147,51,234,0.3)] bg-primary/10"
                : "border border-border hover:border-primary/60 bg-card/65 hover:bg-card/85 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]"
            }`}
          >
            {/* Card shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2.5 }}
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-12 pointer-events-none z-10"
            />
            {/* Glow ring on icon */}
            {selectedCardFilter === "ALL" && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-primary/20 blur-md pointer-events-none"
              />
            )}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-sans truncate mr-1">
                TOTAL ENQUIRIES
              </span>
              <motion.div
                animate={selectedCardFilter === "ALL" ? { rotate: [0, 360] } : {}}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
              >
                <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.div>
            </div>
            <div className="relative z-10 mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              <AnimatedCounter value={String(stats.totalAll)} duration={1} />
            </div>
          </motion.div>

          {/* Card 2: NEW MESSAGES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCardClick("NEW", "NEW")}
            className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer relative group overflow-hidden ${
              selectedCardFilter === "NEW"
                ? "border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] bg-white/8"
                : "border border-border hover:border-white/40 bg-card/65 hover:bg-card/85 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            }`}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear", repeatDelay: 3 }}
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-12 pointer-events-none z-10"
            />
            {selectedCardFilter === "NEW" && (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 blur-md pointer-events-none"
              />
            )}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-sans truncate mr-1">
                NEW MESSAGES
              </span>
              <motion.div
                animate={selectedCardFilter === "NEW" ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-white group-hover:scale-110 transition-transform shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.div>
            </div>
            <div className="relative z-10 mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              <AnimatedCounter value={String(stats.newCount)} duration={1} />
            </div>
          </motion.div>

          {/* Card 3: PENDING REVIEW */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCardClick("PENDING", "PENDING")}
            className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer relative group overflow-hidden ${
              selectedCardFilter === "PENDING"
                ? "border-2 border-[#f97316] shadow-[0_0_30px_rgba(249,115,22,0.3)] bg-orange-500/8"
                : "border border-border hover:border-[#f97316]/50 bg-card/65 hover:bg-card/85 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
            }`}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "linear", repeatDelay: 2.8 }}
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent skew-x-12 pointer-events-none z-10"
            />
            {selectedCardFilter === "PENDING" && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-orange-500/20 blur-md pointer-events-none"
              />
            )}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-sans truncate mr-1">
                PENDING REVIEW
              </span>
              <motion.div
                animate={selectedCardFilter === "PENDING" ? { rotate: [-10, 10, -10] } : {}}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-[#f97316] group-hover:scale-110 transition-transform shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.25)]"
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.div>
            </div>
            <div className="relative z-10 mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold text-[#f97316] tracking-tight font-heading">
              <AnimatedCounter value={String(stats.pendingCount)} duration={1} />
            </div>
          </motion.div>

          {/* Card 4: CONTACTED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCardClick("CONTACTED", "CONTACTED")}
            className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer relative group overflow-hidden ${
              selectedCardFilter === "CONTACTED"
                ? "border-2 border-emerald-500 shadow-[0_0_30px_rgba(52,211,153,0.3)] bg-emerald-500/8"
                : "border border-border hover:border-emerald-500/50 bg-card/65 hover:bg-card/85 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]"
            }`}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "linear", repeatDelay: 3.2 }}
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent skew-x-12 pointer-events-none z-10"
            />
            {selectedCardFilter === "CONTACTED" && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-emerald-500/20 blur-md pointer-events-none"
              />
            )}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase font-sans truncate mr-1">
                CONTACTED
              </span>
              <motion.div
                animate={selectedCardFilter === "CONTACTED" ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.25)]"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.div>
            </div>
            <div className="relative z-10 mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-heading">
              <AnimatedCounter value={String(stats.contactedCount)} duration={1} />
            </div>
          </motion.div>
        </div>

        {/* Real-time Metadata & Traffic Sources Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-card/65 backdrop-blur-md border border-border shadow-sm relative overflow-hidden"
        >
          {/* Subtle gradient glow */}
          <div className="absolute top-0 right-0 w-64 h-24 bg-gradient-to-l from-primary/10 via-accent/5 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            {/* Left: Metadata Title & Interactive Realtime Source Filter Pills */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                  Realtime Metadata & Acquisition Channels
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live SSE Stream
                </span>
                {sourceFilter !== "ALL" && (
                  <button
                    onClick={() => setSourceFilter("ALL")}
                    className="text-[10px] text-primary hover:underline font-semibold ml-auto sm:ml-0 cursor-pointer"
                  >
                    Reset Filter ✕
                  </button>
                )}
              </div>

              {/* Source breakdown pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <button
                  onClick={() => setSourceFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    sourceFilter === "ALL"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/70"
                  }`}
                >
                  All Sources ({contacts.length})
                </button>

                {sourceStats.map(([srcLabel, count]) => {
                  const isSelected = sourceFilter === srcLabel;
                  const percentage = contacts.length > 0 ? Math.round((count / contacts.length) * 100) : 0;
                  return (
                    <button
                      key={srcLabel}
                      onClick={() => setSourceFilter(isSelected ? "ALL" : srcLabel)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-background/80 text-muted-foreground hover:text-foreground border-border/70 hover:border-primary/40"
                      }`}
                      title={`Filter by ${srcLabel} (${percentage}% of submissions)`}
                    >
                      <span>{srcLabel}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        {count}
                      </span>
                      <span className="text-[10px] opacity-70">({percentage}%)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Latest Inbound Metadata Pulse Card */}
            {latestLead ? (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/70 shrink-0 self-stretch lg:self-auto">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Latest Inbound:</span>
                    <span className="font-semibold text-foreground truncate max-w-[130px]">
                      {decodeHtmlEntities(latestLead.fullName)}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-primary font-medium">
                      <Globe className="w-3 h-3 shrink-0" />
                      {latestLead.utm_source || "Direct"}
                    </span>
                    <span>•</span>
                    <span className="text-muted-foreground/80 truncate max-w-[90px]">
                      {latestLead.utm_medium || "organic"}
                    </span>
                    {latestLead.ipAddress && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-muted-foreground/70">
                          {latestLead.ipAddress}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 p-2 rounded-xl bg-background/40 border border-border/50">
                <Activity className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>Awaiting inbound leads...</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs & Search Bar Container (Only NEW, PENDING, CONTACTED) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="p-2.5 sm:p-3 bg-card/65 backdrop-blur-md rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        >
          {/* Segmented Filter Pills with Smooth Sliding Spring Indicator */}
          <div className="inline-flex items-center bg-background/80 border border-border/60 p-1 rounded-xl text-xs font-medium w-full md:w-auto overflow-x-auto">
            {[
              { id: "ALL", label: `All (${stats.totalAll})` },
              { id: "NEW", label: "New" },
              { id: "PENDING", label: "Pending" },
              { id: "CONTACTED", label: "Contacted" },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id as typeof statusFilter)}
                  className="relative px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 whitespace-nowrap active:scale-95 cursor-pointer flex-1 md:flex-initial text-center"
                >
                  {isActive && (
                    <motion.div
                      layoutId="adminFilterTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg shadow-md shadow-primary/25"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive ? "text-white font-bold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8 h-10 bg-background/70 border-border text-xs text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Bulk Delete All Component (Visible when all or multiple items selected) */}
        <BulkDeleteBar
          selectedCount={selectedCount}
          totalCount={contacts.length}
          isAllSelected={isAllSelected}
          isDeleting={isBulkDeleting}
          onClearSelection={() => setSelectedRows({})}
          onConfirmDelete={handleBulkDeleteConfirm}
        />

        {/* Client Enquiries Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card/65 backdrop-blur-md rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          {/* Mobile Swipe Cue */}
          <div className="flex md:hidden items-center justify-between px-3.5 py-2 bg-muted/20 border-b border-border/60 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Swipe table horizontally to view all columns
            </span>
            <span className="text-[10px] text-primary font-semibold">Scroll →</span>
          </div>

          <div className="overflow-x-auto w-full">
            <Table className="min-w-[940px] md:min-w-full">
            <TableHeader className="bg-card/80 border-b border-border">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12 py-3.5 pl-5">
                  <button
                    onClick={toggleSelectAll}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      isAllSelected
                        ? "border-primary bg-primary/20"
                        : "border-muted-foreground/50 hover:border-primary"
                    }`}
                    title={isAllSelected ? "Deselect All" : "Select All"}
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
                  SOURCE
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
                      <Skeleton className="w-20 h-5 rounded-full bg-muted/40" />
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
                  <TableCell colSpan={8} className="h-72 text-center">
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
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className={`group border-b transition-all duration-500 ${
                        lead._id === newIncomingId
                          ? "bg-primary/25 border-primary shadow-[0_0_30px_rgba(147,51,234,0.4)] ring-1 ring-primary/60"
                          : "hover:bg-card/90 border-border/60"
                      }`}
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
                            {decodeHtmlEntities(lead.fullName)}
                          </div>
                          {lead.company ? (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-muted-foreground" />
                              <span>{decodeHtmlEntities(lead.company)}</span>
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
                            {decodeHtmlEntities(lead.service)}
                          </div>
                          <p
                            className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5"
                            title={decodeHtmlEntities(lead.message)}
                          >
                            {decodeHtmlEntities(lead.message) || "No message body"}
                          </p>
                        </div>
                      </TableCell>

                      {/* SOURCE */}
                      <TableCell className="py-3.5">
                        {(() => {
                          const srcInfo = getSourceInfo(lead.utm_source, lead.utm_medium);
                          const subtext = [lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" • ");
                          return (
                            <div className="flex flex-col gap-0.5 max-w-[140px]">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border w-fit ${srcInfo.badgeBg} ${srcInfo.badgeText} ${srcInfo.badgeBorder}`}
                                title={`Traffic Source: ${lead.utm_source || "Direct"}${lead.utm_medium ? ` | Medium: ${lead.utm_medium}` : ""}${lead.utm_campaign ? ` | Campaign: ${lead.utm_campaign}` : ""}${lead.ipAddress ? ` | IP: ${lead.ipAddress}` : ""}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${srcInfo.dotColor}`} />
                                <span className="truncate max-w-[95px]">{srcInfo.label}</span>
                              </span>
                              <span
                                className="text-[10px] text-muted-foreground truncate pl-1"
                                title={subtext || (lead.ipAddress ? `IP: ${lead.ipAddress}` : "Direct referral")}
                              >
                                {subtext || "direct"}
                              </span>
                            </div>
                          );
                        })()}
                      </TableCell>

                      {/* STATUS (Matching User's Uploaded Dropdown EXACTLY) */}
                      <TableCell className="py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${statusConf.badgeBg} ${statusConf.badgeText} ${statusConf.badgeBorder} hover:brightness-110 shadow-xs cursor-pointer active:scale-95`}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusConf.dotColor}`} />
                              <span className="tracking-wide">{statusConf.label}</span>
                              <ChevronDown className="w-3 h-3 opacity-70 ml-0.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
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
                                  ? "bg-white/10 text-white"
                                  : "text-slate-300 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
                              <span className="text-white">NEW</span>
                              {lead.status === "NEW" && (
                                <Check className="w-4 h-4 ml-auto text-white" />
                              )}
                            </DropdownMenuItem>

                            {/* Option 2: PENDING */}
                            <DropdownMenuItem
                              onClick={() => handleInlineStatusChange(lead._id, "PENDING")}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                lead.status === "PENDING"
                                  ? "bg-orange-500/15 text-[#f97316]"
                                  : "text-slate-300 hover:text-[#f97316] hover:bg-orange-500/10"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.7)]" />
                              <span className="text-[#f97316]">PENDING</span>
                              {lead.status === "PENDING" && (
                                <Check className="w-4 h-4 ml-auto text-[#f97316]" />
                              )}
                            </DropdownMenuItem>

                            {/* Option 3: CONTACTED */}
                            <DropdownMenuItem
                              onClick={() => handleInlineStatusChange(lead._id, "CONTACTED")}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                                lead.status === "CONTACTED"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                              <span className="text-emerald-400">CONTACTED</span>
                              {lead.status === "CONTACTED" && (
                                <Check className="w-4 h-4 ml-auto text-emerald-400" />
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
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                            title="Edit Client Enquiry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setDeleteTarget(lead);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </motion.div>
      </div>

      {/* Full Lead Details Pop-up (Opens from bottom on mobile, centered on desktop - Non-scrollable) */}
      <ResponsiveModal open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        {selectedLead && (
          <div className="space-y-3 sm:space-y-3.5">
            {/* Top Row: Status Badge Pill */}
            <div className="flex items-center justify-between">
              <div>
                {selectedLead.status === "NEW" && (
                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/30">
                    NEW
                  </span>
                )}
                {selectedLead.status === "PENDING" && (
                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-[#f97316] border border-orange-400/40">
                    PENDING
                  </span>
                )}
                {selectedLead.status === "CONTACTED" && (
                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    CONTACTED
                  </span>
                )}
              </div>
            </div>

            {/* Title: Service Name (e.g. Partnership) */}
            <div>
              <ResponsiveModalTitle className="text-xl sm:text-2xl font-extrabold text-foreground font-heading tracking-tight">
                {decodeHtmlEntities(selectedLead.service) || "Client Enquiry"}
              </ResponsiveModalTitle>

              {/* Timestamp with Calendar Icon */}
              <ResponsiveModalDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-sans font-medium">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>
                  Received on{" "}
                  {format(new Date(selectedLead.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                </span>
              </ResponsiveModalDescription>
            </div>

            {/* Gray Sender Info Card - 2-Column Layout */}
            <div className="bg-background/50 border border-border rounded-xl p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 sm:gap-y-3 gap-x-6 sm:gap-x-10">
                {/* SENDER NAME */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                    SENDER NAME
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-bold text-foreground">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="select-text break-words sm:whitespace-nowrap">{decodeHtmlEntities(selectedLead.fullName)}</span>
                  </div>
                </div>

                {/* EMAIL ADDRESS */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                    EMAIL ADDRESS
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-bold text-foreground">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="select-text break-all sm:break-normal">{selectedLead.email}</span>
                    <button
                      onClick={() => handleCopy(selectedLead.email, `pop-email-${selectedLead._id}`, "Email")}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors p-1 rounded-md shrink-0 inline-flex items-center"
                      title="Copy Email"
                    >
                      {copiedId === `pop-email-${selectedLead._id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                    PHONE NUMBER
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-bold text-foreground font-mono">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="select-text whitespace-nowrap">{selectedLead.phone}</span>
                    <button
                      onClick={() => handleCopy(selectedLead.phone, `pop-phone-${selectedLead._id}`, "Phone")}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors p-1 rounded-md shrink-0 inline-flex items-center"
                      title="Copy Phone"
                    >
                      {copiedId === `pop-phone-${selectedLead._id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* COMPANY (if present) */}
                {selectedLead.company && (
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                      COMPANY / ORGANIZATION
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-bold text-foreground">
                      <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="select-text break-words sm:whitespace-nowrap">{decodeHtmlEntities(selectedLead.company)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Realtime Metadata Card */}
            <div className="bg-background/50 border border-border rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/60">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Acquisition & System Metadata</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Realtime Captured
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {/* SOURCE */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                    SOURCE
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-foreground truncate" title={selectedLead.utm_source || "Direct"}>
                      {selectedLead.utm_source || "Direct"}
                    </span>
                  </div>
                </div>

                {/* MEDIUM */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                    MEDIUM
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Target className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-foreground truncate" title={selectedLead.utm_medium || "None"}>
                      {selectedLead.utm_medium || "None / Organic"}
                    </span>
                  </div>
                </div>

                {/* CAMPAIGN */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                    CAMPAIGN
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Megaphone className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-foreground truncate" title={selectedLead.utm_campaign || "None"}>
                      {selectedLead.utm_campaign || "Default / None"}
                    </span>
                  </div>
                </div>

                {/* IP ADDRESS */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                    IP ADDRESS
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-xs sm:text-sm font-bold text-foreground">
                    <span className="truncate">{selectedLead.ipAddress || "127.0.0.1"}</span>
                    {selectedLead.ipAddress && (
                      <button
                        onClick={() => handleCopy(selectedLead.ipAddress!, `pop-ip-${selectedLead._id}`, "IP Address")}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors p-1 rounded-md shrink-0 inline-flex items-center cursor-pointer"
                        title="Copy IP Address"
                      >
                        {copiedId === `pop-ip-${selectedLead._id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MESSAGE CONTENT */}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block mb-1">
                MESSAGE CONTENT
              </span>
              <div className="border border-border rounded-xl p-3 bg-background/60 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words select-text">
                {decodeHtmlEntities(selectedLead.message) || "No message body provided."}
              </div>
            </div>

            {/* Internal Notes Display (if present) */}
            {selectedLead.adminNotes && (
              <div>
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block mb-1">
                  INTERNAL ADMIN NOTES
                </span>
                <div className="p-2.5 rounded-xl bg-background/50 border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap select-text">
                  {decodeHtmlEntities(selectedLead.adminNotes)}
                </div>
              </div>
            )}

            {/* Bottom Footer Actions */}
            <div className="border-t border-border pt-3 sm:pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
              {/* Left: Change status pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-muted-foreground mr-0.5">
                  Change status:
                </span>
                {(["NEW", "PENDING", "CONTACTED"] as const).map((st) => {
                  const isCurrent = selectedLead.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => handleInlineStatusChange(selectedLead._id, st)}
                      className={`px-2.5 py-0.5 rounded-full text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-primary text-white font-bold shadow-xs"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 font-medium"
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>

              {/* Right: Edit & Close Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const target = selectedLead;
                    setIsDrawerOpen(false);
                    setTimeout(() => {
                      if (target) handleOpenEdit(target);
                    }, 120);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-all active:scale-95 cursor-pointer shadow-xs flex-1 sm:flex-initial"
                >
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-xs flex-1 sm:flex-initial text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Edit Details Pop-up (Opens from bottom on mobile, centered on desktop - Non-scrollable) */}
      <ResponsiveModal open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <div className="border-b border-border pb-2.5">
          <ResponsiveModalTitle className="text-xl sm:text-2xl font-extrabold text-foreground font-heading tracking-tight flex items-center gap-2">
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <span>Edit Client Enquiry</span>
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-muted-foreground mt-0.5">
            Update client enquiry details, service classification, status, and internal team notes.
          </ResponsiveModalDescription>
        </div>

        <form onSubmit={handleSaveEditSubmit} className="space-y-2.5 sm:space-y-3 pt-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Full Name
              </Label>
              <Input
                id="edit-name"
                autoComplete="name"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                required
                className="h-9 bg-background/70 border-border text-foreground rounded-xl px-3 text-xs sm:text-sm focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="edit-email"
                type="email"
                autoComplete="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
                className="h-9 bg-background/70 border-border text-foreground rounded-xl px-3 text-xs sm:text-sm focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Phone Number
              </Label>
              <Input
                id="edit-phone"
                autoComplete="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                required
                className="h-9 bg-background/70 border-border text-foreground font-mono rounded-xl px-3 text-xs sm:text-sm focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-company" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Company / Organization
              </Label>
              <Input
                id="edit-company"
                autoComplete="organization"
                value={editForm.company}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                placeholder="Optional company name"
                className="h-9 bg-background/70 border-border text-foreground rounded-xl px-3 text-xs sm:text-sm focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-service" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Subject / Service
              </Label>
              <Input
                id="edit-service"
                value={editForm.service}
                onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                required
                className="h-9 bg-background/70 border-border text-foreground rounded-xl px-3 text-xs sm:text-sm focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-status" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Current Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(val: "NEW" | "PENDING" | "CONTACTED") =>
                  setEditForm({ ...editForm, status: val })
                }
              >
                <SelectTrigger id="edit-status" className="h-9 bg-background/70 border-border text-foreground rounded-xl px-3 text-xs sm:text-sm focus:border-primary">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-xs sm:text-sm text-foreground rounded-xl shadow-xl">
                  <SelectItem value="NEW" className="font-bold text-white cursor-pointer">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>NEW</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="PENDING" className="font-bold text-[#f97316] cursor-pointer">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                      <span>PENDING</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="CONTACTED" className="font-bold text-emerald-400 cursor-pointer">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>CONTACTED</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-notes" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Internal Admin Notes
            </Label>
            <Textarea
              id="edit-notes"
              rows={2}
              placeholder="Record client discussions, budget notes, follow-up dates..."
              value={editForm.adminNotes}
              onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
              className="bg-background/60 border-border text-foreground rounded-xl p-2.5 text-xs sm:text-sm focus:border-primary resize-none leading-relaxed"
            />
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsEditDialogOpen(false)}
              className="px-3.5 sm:px-4 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:bg-muted transition-all active:scale-95 cursor-pointer flex-1 sm:flex-initial text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingEdit}
              className="px-4 sm:px-5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-50 flex-1 sm:flex-initial text-center"
            >
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </ResponsiveModal>

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
