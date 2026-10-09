"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  Building,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface ContactLead {
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
  createdAt: string;
}

interface StatsData {
  totalAll: number;
  newCount: number;
  contactedCount: number;
  qualifiedCount: number;
  convertedCount: number;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactLead[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalAll: 0,
    newCount: 0,
    contactedCount: 0,
    qualifiedCount: 0,
    convertedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");

  // Edit Modal State
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    status: "NEW",
    adminNotes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch leads from MongoDB Atlas API
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
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
        toast({
          title: "Failed to load leads",
          description: data.error || "Could not retrieve records from MongoDB.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Connection Error",
        description: "Unable to reach database API endpoint.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, serviceFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchContacts]);

  // Open Edit Modal
  const handleOpenEdit = (lead: ContactLead) => {
    setSelectedLead(lead);
    setEditForm({
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || "",
      service: lead.service,
      status: lead.status,
      adminNotes: lead.adminNotes || "",
    });
    setIsEditOpen(true);
  };

  // Submit Lead Updates
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/contacts/${selectedLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Lead Updated",
          description: `Successfully updated ${editForm.fullName}'s profile.`,
        });
        setIsEditOpen(false);
        fetchContacts();
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Could not save changes.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Error",
        description: "Network error while saving changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Lead
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the lead from "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/contacts/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Lead Deleted",
          description: "Record removed from MongoDB Atlas.",
        });
        fetchContacts();
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || "Could not delete lead.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to connect to delete endpoint.",
        variant: "destructive",
      });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      toast({ title: "No Data", description: "No records to export." });
      return;
    }

    const headers = ["Full Name", "Email", "Phone", "Company", "Service", "Status", "Notes", "Message", "Created At"];
    const rows = contacts.map((c) => [
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${c.service.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${(c.adminNotes || "").replace(/"/g, '""')}"`,
      `"${c.message.replace(/"/g, '""')}"`,
      `"${new Date(c.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pageperclick_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Downloaded ${contacts.length} leads as CSV.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20">NEW</Badge>;
      case "CONTACTED":
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20">CONTACTED</Badge>;
      case "QUALIFIED":
        return <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20">QUALIFIED</Badge>;
      case "CONVERTED":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">CONVERTED</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-800">ARCHIVED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              P
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white">PagePerClick</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold tracking-wide">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-xs text-muted-foreground">MongoDB Atlas Leads & Submissions Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Atlas Connected</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContacts}
              disabled={loading}
              className="border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="cta"
              size="sm"
              asChild
              className="shadow-sm"
            >
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Live Website
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Total Leads</span>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
                {stats.totalAll}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Lifetime form inquiries</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>New Inquiries</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-cyan-400 tracking-tight">
                {stats.newCount}
              </div>
              <p className="mt-1 text-xs text-cyan-400/80">Pending outreach</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>In Discussion</span>
                <Phone className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-amber-400 tracking-tight">
                {stats.contactedCount + stats.qualifiedCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Contacted & Qualified</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Converted Clients</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-emerald-400 tracking-tight">
                {stats.convertedCount}
              </div>
              <p className="mt-1 text-xs text-emerald-400/80">
                {stats.totalAll > 0
                  ? `${((stats.convertedCount / stats.totalAll) * 100).toFixed(1)}% Conversion Rate`
                  : "0% Conversion Rate"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls & Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/90 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-950/80 border-slate-800 text-sm focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter Dropdown */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-slate-950 border-slate-800 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="CONVERTED">Converted</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Service Filter Dropdown */}
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[160px] bg-slate-950 border-slate-800 text-xs">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Services</SelectItem>
                <SelectItem value="PPC">PPC Advertising</SelectItem>
                <SelectItem value="Content">Content Writing</SelectItem>
                <SelectItem value="Design">Graphic Design</SelectItem>
                <SelectItem value="Local">Local SEO</SelectItem>
                <SelectItem value="Social">Social Media</SelectItem>
              </SelectContent>
            </Select>

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-xs text-slate-200"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
          <Table>
            <TableHeader className="bg-slate-950/80 border-b border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-xs uppercase font-semibold text-slate-400 py-4">Client Contact</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-slate-400 py-4">Company</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-slate-400 py-4">Service</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-slate-400 py-4">Message & Notes</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-slate-400 py-4">Status</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-slate-400 py-4">Date</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-slate-400 py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/60">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading form details from MongoDB Atlas...
                  </TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    No leads found matching your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((lead) => (
                  <TableRow key={lead._id} className="hover:bg-slate-800/25 border-slate-800/60 transition-colors">
                    <TableCell className="py-4">
                      <div className="font-semibold text-white tracking-tight">{lead.fullName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-cyan-400" />
                        <a href={`mailto:${lead.email}`} className="hover:text-cyan-400 hover:underline">
                          {lead.email}
                        </a>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <a href={`tel:${lead.phone}`} className="hover:text-emerald-400 hover:underline font-mono">
                          {lead.phone}
                        </a>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-sm font-medium text-slate-200">
                      {lead.company ? (
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-muted-foreground" />
                          {lead.company}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge variant="outline" className="bg-slate-950 border-slate-700 text-xs text-slate-300">
                        {lead.service}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 max-w-xs">
                      <p className="text-xs text-slate-300 line-clamp-2" title={lead.message}>
                        {lead.message}
                      </p>
                      {lead.adminNotes && (
                        <p className="mt-1 text-[11px] text-amber-400 line-clamp-1 font-mono">
                          📝 {lead.adminNotes}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      {getStatusBadge(lead.status)}
                    </TableCell>

                    <TableCell className="py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    <TableCell className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(lead)}
                          className="h-8 px-2.5 text-xs text-slate-200 hover:text-cyan-400 hover:bg-slate-800"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lead._id, lead.fullName)}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Edit Lead Dialog Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl bg-slate-950 border-slate-800 text-slate-100 rounded-2xl shadow-2xl">
          <DialogHeader className="border-b border-slate-800 pb-4">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Edit className="w-4 h-4 text-cyan-400" />
              Edit Lead Details & Status
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs text-slate-300">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-800 text-sm focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-email" className="text-xs text-slate-300">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-800 text-sm focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs text-slate-300">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-800 text-sm focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-company" className="text-xs text-slate-300">Company Name</Label>
                <Input
                  id="edit-company"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Optional"
                  className="bg-slate-900 border-slate-800 text-sm focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-service" className="text-xs text-slate-300">Service Interested</Label>
                <Input
                  id="edit-service"
                  value={editForm.service}
                  onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-800 text-sm focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-xs text-slate-300">Lead Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger id="edit-status" className="bg-slate-900 border-slate-800 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW" className="text-cyan-400 font-medium">NEW (Uncontacted)</SelectItem>
                    <SelectItem value="CONTACTED" className="text-amber-400 font-medium">CONTACTED</SelectItem>
                    <SelectItem value="QUALIFIED" className="text-indigo-400 font-medium">QUALIFIED</SelectItem>
                    <SelectItem value="CONVERTED" className="text-emerald-400 font-medium">CONVERTED</SelectItem>
                    <SelectItem value="ARCHIVED" className="text-slate-400 font-medium">ARCHIVED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-notes" className="text-xs text-slate-300">Internal Strategist / Admin Notes</Label>
              <Textarea
                id="edit-notes"
                rows={3}
                placeholder="Log call updates, follow-up dates, budget estimations..."
                value={editForm.adminNotes}
                onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                className="bg-slate-900 border-slate-800 text-sm focus:border-cyan-500"
              />
            </div>

            {selectedLead?.message && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <span className="font-semibold text-slate-400 block mb-1">Original Client Message:</span>
                <p className="text-slate-300 italic">{selectedLead.message}</p>
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="cta"
                disabled={isSaving}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
