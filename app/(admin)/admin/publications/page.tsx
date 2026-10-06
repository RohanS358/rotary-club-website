"use client";

import { useState, useEffect, useRef } from "react";
import { storageKey } from "@/lib/utils";
import { Plus, Edit, Trash2, BookOpen, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Publication } from "@/lib/types";

const CATEGORIES = ["Newsletter", "Annual Report", "Bulletin", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  Newsletter: "#17458f", "Annual Report": "#f7a800", Bulletin: "#16a34a", Other: "#7c3aed",
};

type FormState = {
  title: string; description: string; cover_image_url: string;
  category: string; published: boolean; published_at: string; file_url: string;
};
const EMPTY: FormState = {
  title: "", description: "", cover_image_url: "",
  category: "Newsletter", published: false, published_at: "", file_url: "",
};

export default function AdminPublicationsPage() {
  const [pubs, setPubs]         = useState<Publication[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isOpen, setIsOpen]     = useState(false);
  const [editing, setEditing]   = useState<Publication | null>(null);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]         = useState<FormState>(EMPTY);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchPubs = async () => {
    const { data } = await supabase
      .from("publications").select("*").order("created_at", { ascending: false });
    if (data) setPubs(data);
    setLoading(false);
  };

  useEffect(() => { fetchPubs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditing(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit   = (p: Publication) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description ?? "", cover_image_url: p.cover_image_url ?? "",
      category: p.category, published: p.published, file_url: p.file_url ?? "",
      published_at: p.published_at ? p.published_at.slice(0, 10) : "",
    });
    setIsOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) { toast.error("Only PDF files are allowed"); return; }
    setUploading(true);
    const path = storageKey(file.name);
    const { data, error } = await supabase.storage.from("publications").upload(path, file);
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("publications").getPublicUrl(data.path);
    setForm(f => ({ ...f, file_url: publicUrl }));
    toast.success("PDF uploaded");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title, description: form.description || null,
        cover_image_url: form.cover_image_url || null, category: form.category,
        published: form.published, file_url: form.file_url || null,
        published_at: form.published_at ? new Date(form.published_at).toISOString()
          : (form.published ? new Date().toISOString() : null),
      };
      if (editing) {
        await supabase.from("publications").update(payload).eq("id", editing.id);
        toast.success("Publication updated");
      } else {
        await supabase.from("publications").insert(payload);
        toast.success("Publication added");
      }
      setIsOpen(false);
      fetchPubs();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error saving");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("publications").delete().eq("id", id);
    toast.success("Publication deleted");
    fetchPubs();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Publications</h1>
          <p className="text-muted-foreground text-sm">{pubs.length} publications</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Add Publication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Publication" : "New Publication"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[72vh] overflow-y-auto pr-1">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1.5" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Publish Date</Label>
                  <Input type="date" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input value={form.cover_image_url} onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))} className="mt-1.5" placeholder="https://..." />
              </div>

              {/* PDF upload */}
              <div>
                <Label>PDF File</Label>
                <div className="mt-1.5 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={form.file_url}
                      onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
                      placeholder="Paste URL or upload below"
                      className="flex-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                      className="gap-2"
                    >
                      {uploading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                        : <><Upload className="w-3.5 h-3.5" /> Upload PDF</>
                      }
                    </Button>
                    {form.file_url && (
                      <a href={form.file_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary underline">Preview</a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={form.published} onCheckedChange={v => setForm(f => ({ ...f, published: v }))} />
                <Label>Published</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? "Update" : "Add Publication"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {pubs.map(p => {
          const color = CATEGORY_COLORS[p.category] ?? "#17458f";
          return (
            <div key={p.id} className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: color }}>
                {p.title.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm truncate max-w-xs">{p.title}</p>
                  {p.published
                    ? <Badge className="text-xs bg-green-500 text-white">Published</Badge>
                    : <Badge variant="outline" className="text-xs">Draft</Badge>
                  }
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="text-xs text-white" style={{ backgroundColor: color }}>{p.category}</Badge>
                  {p.file_url && <span className="text-xs text-muted-foreground">PDF attached</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Publication?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &quot;{p.title}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>

      {pubs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No publications yet</p>
        </div>
      )}
    </div>
  );
}
