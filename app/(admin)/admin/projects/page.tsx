"use client";

import { useState, useEffect, useRef } from "react";
import { storageKey } from "@/lib/utils";
import Image from "@/components/ui/SmartImage";
import { Plus, Edit, Trash2, FolderOpen, Loader2, Upload, Link2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Switch } from "@/components/ui/switch";
import type { Project } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  "Maternal and Child Health": "#e74c3c",
  "Basic Education and Literacy": "#3b82f6",
  "Economic and Community Development": "#16a34a",
  "Peace and Conflict Prevention": "#7c3aed",
  "Disease Prevention and Treatment": "#ea580c",
  "Water and Sanitation": "#0891b2",
  "Others": "#17458f",
};

type FormState = {
  title: string;
  description: string;
  category: string;
  date: string;
  impact_metric: string;
  featured: boolean;
  image_url: string;
  facebook_url: string;
};

const EMPTY_FORM: FormState = {
  title: "", description: "", category: "Maternal and Child Health",
  date: "", impact_metric: "", featured: false,
  image_url: "", facebook_url: "",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("date", { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scrapes the district site for projects + member photos. Takes a minute or so.
  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Fetching from the Rotary district site\u2026");
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      const skipped = data.skipped?.length ? ` \u00b7 ${data.skipped.length} skipped` : "";
      toast.success(
        `${data.projects} projects synced \u00b7 ${data.photosUpdated} member photos \u00b7 ${data.membersAdded} new members${skipped}`,
        { id: toastId }
      );
      if (data.skipped?.length) console.warn("Sync skipped:", data.skipped);
      fetchProjects();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Sync failed", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setIsOpen(true); };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description || "", category: p.category,
      date: p.date || "", impact_metric: p.impact_metric || "", featured: p.featured,
      image_url: p.image_url || "", facebook_url: p.facebook_url || "",
    });
    setIsOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = storageKey(file.name, "projects/");
    const { data, error } = await supabase.storage.from("project-images").upload(path, file);
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(data.path);
    setForm(f => ({ ...f, image_url: publicUrl }));
    toast.success("Image uploaded");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category as Project["category"],
        date: form.date || null,
        impact_metric: form.impact_metric || null,
        featured: form.featured,
        image_url: form.image_url || null,
        facebook_url: form.facebook_url || null,
        active: true,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase.from("projects").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Project updated");
      } else {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) throw error;
        toast.success("Project added");
      }
      setIsOpen(false);
      fetchProjects();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error saving project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("projects").update({ active: false }).eq("id", id);
    toast.success("Project removed");
    fetchProjects();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm">{projects.length} projects</p>
        </div>
        <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleSync} disabled={syncing} className="gap-2">
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {syncing ? "Syncing\u2026" : "Sync from Rotary site"}
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2 max-h-[72vh] overflow-y-auto pr-1">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Maternal and Child Health", "Basic Education and Literacy", "Economic and Community Development", "Peace and Conflict Prevention", "Disease Prevention and Treatment", "Water and Sanitation", "Others"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Impact Metric</Label>
                <Input value={form.impact_metric} onChange={(e) => setForm({ ...form, impact_metric: e.target.value })} placeholder="e.g., 50+ beneficiaries" className="mt-1.5" />
              </div>

              {/* Cover image */}
              <div>
                <Label>Cover Image</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button
                    type="button" variant="outline" size="sm"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="gap-2"
                  >
                    {uploading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                      : <><Upload className="w-3.5 h-3.5" /> {form.image_url ? "Replace Image" : "Upload Image"}</>
                    }
                  </Button>
                  {form.image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <Image src={form.image_url} alt="Preview" fill sizes="400px" className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Facebook URL */}
              <div>
                <Label>Facebook Link</Label>
                <div className="relative mt-1.5">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.facebook_url}
                    onChange={(e) => setForm(f => ({ ...f, facebook_url: e.target.value }))}
                    placeholder="https://facebook.com/..."
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured on Home Page</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? "Update" : "Add Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {projects.map((p) => {
          const color = CATEGORY_COLORS[p.category] || "#17458f";
          return (
            <div key={p.id} className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
              {/* Thumbnail or letter icon */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.title} width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: color }}>
                    {p.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{p.title}</p>
                  {p.featured && <Badge className="text-xs bg-[#f7a800] text-white">Featured</Badge>}
                  {p.facebook_url && (
                    <a href={p.facebook_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                      <Link2 className="w-3 h-3" /> FB
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="text-xs text-white" style={{ backgroundColor: color }}>{p.category}</Badge>
                  {p.date && <span className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString()}</span>}
                  {p.impact_metric && <span className="text-xs text-primary font-medium">{p.impact_metric}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(p)}><Edit className="w-3.5 h-3.5" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/5"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Project?</AlertDialogTitle>
                      <AlertDialogDescription>This will hide &quot;{p.title}&quot; from the public site.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No projects yet</p>
        </div>
      )}
    </div>
  );
}
