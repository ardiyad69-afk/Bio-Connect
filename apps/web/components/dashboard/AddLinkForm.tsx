"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CreateLinkInput } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Judul link"
        className="flex-1"
      />
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="flex-1"
      />
      <Button type="submit" disabled={disabled} size="sm">
        <Plus size={16} /> Tambah
      </Button>
    </form>
  );
}
