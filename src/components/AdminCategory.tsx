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
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string | null;
};

type Feedback = { text: string; type: "success" | "error" } | null;

const emptyForm = { name: "", description: "" };

export default function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
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
        setFeedback({ text: data.error || "Failed to load categories", type: "error" });
      }
    } catch {
      setFeedback({ text: "Could not load categories", type: "error" });
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
    setFeedback(null);

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
        setFeedback({
          text: editingId ? "Category updated" : "Category created",
          type: "success",
        });
        resetForm();
        await loadCategories();
      } else {
        setFeedback({ text: data.error || "Request failed", type: "error" });
      }
    } catch {
      setFeedback({ text: "An unexpected error occurred", type: "error" });
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
    setFeedback(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;

    setDeletingId(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/category/admin/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.ok) {
        setFeedback({ text: "Category deleted", type: "success" });
        if (editingId === id) resetForm();
        await loadCategories();
      } else {
        setFeedback({ text: data.error || "Failed to delete", type: "error" });
      }
    } catch {
      setFeedback({ text: "An unexpected error occurred", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-black">Categories</h1>
        <p className="text-sm text-zinc-500">
          Manage labels used to classify encrypted mail. Changes apply for all users.
        </p>
      </div>

      <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-black">
          {editingId ? "Edit category" : "Add category"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Invoices"
                className="h-10 px-3 text-black"
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
                className="w-full resize-none rounded-xl border border-border/10 px-3 py-2 text-sm text-black outline-0 focus:border-black/25"
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-2xl border p-3 text-sm ${
                feedback.type === "success"
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-red-600 bg-red-600 text-white"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckIcon className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
              )}
              {feedback.text}
            </div>
          )}

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
        <div className="border-b border-black/10 px-6 py-4">
          <h2 className="text-sm font-medium text-black">All categories</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-zinc-500">No categories yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black/10 hover:bg-transparent">
                <TableHead className="px-6 text-black">Name</TableHead>
                <TableHead className="hidden text-black sm:table-cell">Description</TableHead>
                <TableHead className="w-[120px] px-6 text-right text-black">Actions</TableHead>
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
                  <TableCell className="px-6 font-medium text-black">{cat.name}</TableCell>
                  <TableCell className="hidden max-w-xs truncate text-zinc-500 sm:table-cell">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell className="px-6 text-right">
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
        )}
      </section>
    </div>
  );
}
