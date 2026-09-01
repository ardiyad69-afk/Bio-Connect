"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, Trash2 } from "lucide-react";
import type { Link as LinkModel, UpdateLinkInput } from "@repo/shared";

export function LinkListItem({
  link,
  onUpdate,
  onDelete,
}: {
  link: LinkModel;
  onUpdate: (id: string, patch: UpdateLinkInput) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : link.isActive ? 1 : 0.5,
  };

  function commitTitle() {
    if (title.trim() && title !== link.title) onUpdate(link.id, { title: title.trim() });
  }

  function commitUrl() {
    if (url.trim() && url !== link.url) onUpdate(link.id, { url: url.trim() });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-white/30 hover:text-white/60"
        aria-label="Seret untuk mengubah urutan"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex flex-1 flex-col gap-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          className="rounded bg-transparent text-sm font-medium outline-none focus:bg-white/5"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={commitUrl}
          className="rounded bg-transparent text-xs text-white/50 outline-none focus:bg-white/5"
        />
      </div>

      <button
        type="button"
        onClick={() => onUpdate(link.id, { isFeatured: !link.isFeatured })}
        aria-pressed={link.isFeatured}
        aria-label="Jadikan featured"
        className={link.isFeatured ? "text-amber-400" : "text-white/25 hover:text-white/50"}
      >
        <Star size={18} fill={link.isFeatured ? "currentColor" : "none"} />
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={link.isActive}
        onClick={() => onUpdate(link.id, { isActive: !link.isActive })}
        className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          link.isActive ? "bg-violet-600" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            link.isActive ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => onDelete(link.id)}
        aria-label="Hapus link"
        className="text-white/30 hover:text-red-400"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
