"use client";

import { useState, useEffect } from "react";
import { storageKey } from "@/lib/utils";
import Image from "@/components/ui/SmartImage";
import { Plus, Trash2, Loader2, Image as ImageIcon, Upload } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GalleryItem } from "@/lib/types";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", category: "General", date: "", image_url: "" });
  const supabase = createClient();

  const fetchItems = async () => {
    const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = storageKey(file.name);
      const { error } = await supabase.storage.from("gallery-images").upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("gallery-images").getPublicUrl(fileName);
      setForm((f) => ({ ...f, image_url: publicUrl }));
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url) { toast.error("Title and image are required"); return; }
    setSaving(true);
    try {
      await supabase.from("gallery").insert({
        title: form.title,
        image_url: form.image_url,
        category: form.category as GalleryItem["category"],
        date: form.date || null,
      });
      toast.success("Image added to gallery");
      setIsOpen(false);
      setForm({ title: "", category: "General", date: "", image_url: "" });
      fetchItems();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, image_url: string) => {
    await supabase.from("gallery").delete().eq("id", id);
    toast.success("Image removed");
    fetchItems();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-muted-foreground text-sm">{items.length} images</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Image</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Gallery Image</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Education", "Health", "Empowerment", "Environment", "General"].map((c) => (
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
                <Label>Image *</Label>
                <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-4 text-center">
                  {form.image_url ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image src={form.image_url} alt="Preview" fill sizes="400px" className="object-cover" />
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                      <span className="text-sm">{uploading ? "Uploading..." : "Click to upload"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving || uploading || !form.image_url} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add to Gallery
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative rounded-xl overflow-hidden border border-border bg-[#f8faff] aspect-square">
            <Image src={item.image_url} alt={item.alt_text || item.title} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-end p-2 gap-1">
              <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 text-center line-clamp-2 transition-opacity">
                {item.title}
              </p>
              <Badge className="text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "#17458f" }}>
                {item.category}
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="w-full opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7 mt-1">
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Image?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently remove &quot;{item.title}&quot; from the gallery.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(item.id, item.image_url)} className="bg-destructive">Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No images yet</p>
        </div>
      )}
    </div>
  );
}
