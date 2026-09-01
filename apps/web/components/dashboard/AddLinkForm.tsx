"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CreateLinkInput } from "@repo/shared";

export function AddLinkForm({
  onAdd,
  disabled,
}: {
  onAdd: (input: CreateLinkInput) => void;
  disabled?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    onAdd({ title: title.trim(), url: url.trim(), isFeatured: false });
    setTitle("");
    setUrl("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul link"
        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
      />
      <button
        type="submit"
        disabled={disabled}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
      >
        <Plus size={16} /> Tambah
      </button>
    </form>
  );
}
