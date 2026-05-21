"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "@/lib/toast";

type Category = {
  id: string;
  name: string;
  description: string | null;
};

const emptyForm = { name: "", description: "" };

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/category/admin");
      const data = await res.json();
      if (data.ok) {
        setItems(data.categories ?? []);
      } else {
        toast.error(data.error || "Failed to load categories");
      }
    } catch {
      toast.error("Could not load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    };

    try {
      const url = editingId
        ? `/api/category/admin/${editingId}`
        : "/api/category/admin";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok) {
        toast.success(editingId ? "Category updated" : "Category created");
        resetForm();
        await loadCategories();
      } else {
        toast.error(data.error || "Request failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/category/admin/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.ok) {
        toast.success("Category deleted");
        if (editingId === id) resetForm();
        await loadCategories();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-8">
      <div className="space-y-0.5 sm:space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-black sm:text-2xl">Categories</h1>
        <p className="text-xs text-zinc-500 sm:text-sm">
          Manage labels used to classify encrypted mail. Changes apply for all users.
        </p>
      </div>

      <section className="rounded-xl border border-black/10 bg-white p-3 shadow-sm sm:p-6">
        <h2 className="text-xs font-medium text-black sm:text-sm">
          {editingId ? "Edit category" : "Add category"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Invoices"
                className="h-9 px-2.5 text-sm text-black sm:h-10 sm:px-3"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category-description">
                Description <span className="font-normal text-zinc-400">(optional)</span>
              </Label>
              <textarea
                id="category-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What belongs in this category?"
                rows={2}
                className="w-full resize-none rounded-xl border border-border/10 px-2.5 py-1.5 text-xs text-black outline-0 focus:border-black/25 sm:px-3 sm:py-2 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="accent"
              disabled={saving || !form.name.trim()}
            >
              {saving ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : editingId ? (
                <CheckIcon className="mr-2 h-4 w-4" />
              ) : (
                <PlusIcon className="mr-2 h-4 w-4" />
              )}
              {editingId ? "Save" : "Add"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={resetForm} disabled={saving}>
                <XIcon className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="border-b border-black/10 px-3 py-2.5 sm:px-6 sm:py-4">
          <h2 className="text-xs font-medium text-black sm:text-sm">All categories</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-zinc-500 sm:py-12 sm:text-sm">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-zinc-500 sm:px-6 sm:py-12 sm:text-sm">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black/10 hover:bg-transparent">
                <TableHead className="px-2 text-[10px] text-black sm:px-6 sm:text-xs">Name</TableHead>
                <TableHead className="hidden text-[10px] text-black md:table-cell sm:text-xs">Description</TableHead>
                <TableHead className="w-[88px] px-2 text-right text-[10px] text-black sm:w-[120px] sm:px-6 sm:text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((cat) => (
                <TableRow
                  key={cat.id}
                  className={`border-b border-black/5 ${
                    editingId === cat.id ? "bg-zinc-50" : ""
                  }`}
                >
                  <TableCell className="max-w-[52vw] truncate px-2 text-xs font-medium text-black sm:max-w-none sm:px-6 sm:text-sm">{cat.name}</TableCell>
                  <TableCell className="hidden max-w-xs truncate px-2 text-xs text-zinc-500 md:table-cell sm:px-6 sm:text-sm">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell className="px-2 text-right sm:px-6">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(cat)}
                        aria-label={`Edit ${cat.name}`}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={deletingId === cat.id}
                        onClick={() => handleDelete(cat.id, cat.name)}
                        aria-label={`Delete ${cat.name}`}
                      >
                        {deletingId === cat.id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2Icon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </section>
    </div>
  );
}
