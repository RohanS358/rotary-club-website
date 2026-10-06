"use client";

import { useState, useEffect, useRef } from "react";
import { storageKey } from "@/lib/utils";
import Image from "@/components/ui/SmartImage";
import { Plus, Edit, Trash2, Newspaper, Loader2, Upload } from "lucide-react";
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
import type { NewsPost } from "@/lib/types";

const CATEGORIES = ["General", "Club Update", "Community", "Health", "Education", "Environment"];

type FormState = {
  title: string; slug: string; excerpt: string; body: string;
  cover_image_url: string; category: string; author: string;
  published: boolean; published_at: string;
};

const EMPTY: FormState = {
  title: "", slug: "", excerpt: "", body: "", cover_image_url: "",
  category: "General", author: "Rotary Club", published: false, published_at: "",
};

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminNewsPage() {
  const [posts, setPosts]     = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen]   = useState(false);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]         = useState<FormState>(EMPTY);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = storageKey(file.name, "news/");
    const { data, error } = await supabase.storage.from("news-images").upload(path, file);
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("news-images").getPublicUrl(data.path);
    setForm(f => ({ ...f, cover_image_url: publicUrl }));
    toast.success("Image uploaded");
    setUploading(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("news_posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditing(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit   = (p: NewsPost) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", body: p.body ?? "",
      cover_image_url: p.cover_image_url ?? "", category: p.category, author: p.author,
      published: p.published, published_at: p.published_at ? p.published_at.slice(0, 16) : "",
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.slug.trim())  { toast.error("Slug is required");  return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title, slug: form.slug,
        excerpt: form.excerpt || null, body: form.body || null,
        cover_image_url: form.cover_image_url || null,
        category: form.category, author: form.author,
        published: form.published,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : (form.published ? new Date().toISOString() : null),
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from("news_posts").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Post updated");
      } else {
        const { error } = await supabase.from("news_posts").insert(payload);
        if (error) throw error;
        toast.success("Post created");
      }
      setIsOpen(false);
      fetchPosts();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error saving post");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("news_posts").delete().eq("id", id);
    toast.success("Post deleted");
    fetchPosts();
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
          <h1 className="text-2xl font-bold">News</h1>
          <p className="text-muted-foreground text-sm">{posts.length} posts</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Add Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 max-h-[72vh] overflow-y-auto pr-1">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={e => {
                    const title = e.target.value;
                    setForm(f => ({ ...f, title, slug: editing ? f.slug : toSlug(title) }));
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                  className="mt-1.5 font-mono text-sm"
                  placeholder="url-friendly-slug"
                />
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
                  <Label>Author</Label>
                  <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="mt-1.5" />
                </div>
              </div>
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
                      : <><Upload className="w-3.5 h-3.5" /> {form.cover_image_url ? "Replace Image" : "Upload Image"}</>
                    }
                  </Button>
                  {form.cover_image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <Image src={form.cover_image_url} alt="Preview" fill sizes="400px" className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="mt-1.5" rows={2} placeholder="Short summary..." />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="mt-1.5" rows={8} placeholder="Full article content..." />
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <Switch checked={form.published} onCheckedChange={v => setForm(f => ({ ...f, published: v }))} />
                  <Label>Published</Label>
                </div>
                <div>
                  <Label>Publish Date/Time</Label>
                  <Input type="datetime-local" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} className="mt-1.5 text-sm" />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {posts.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              {p.cover_image_url ? (
                <Image src={p.cover_image_url} alt={p.title} width={48} height={48} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#17458f] flex items-center justify-center text-white font-bold text-sm">
                  {p.title.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{p.title}</p>
                {p.published
                  ? <Badge className="text-xs bg-green-500 text-white">Published</Badge>
                  : <Badge variant="outline" className="text-xs">Draft</Badge>
                }
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Badge className="text-xs text-white bg-[#17458f]">{p.category}</Badge>
                <span className="text-xs text-muted-foreground">by {p.author}</span>
                {p.published_at && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.published_at).toLocaleDateString()}
                  </span>
                )}
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
                    <AlertDialogTitle>Delete Post?</AlertDialogTitle>
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
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No posts yet</p>
        </div>
      )}
    </div>
  );
}
