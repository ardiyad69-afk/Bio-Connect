"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
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

  // Opacity is owned entirely by Framer's animate prop below (dnd-kit only
  // needs transform/transition here) — mixing an inline `style.opacity`
  // with Framer's own opacity animation is a footgun, since both write to
  // the same property through different mechanisms.
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const targetOpacity = isDragging ? 0.5 : link.isActive ? 1 : 0.5;

  function commitTitle() {
    if (title.trim() && title !== link.title) onUpdate(link.id, { title: title.trim() });
  }

  function commitUrl() {
    if (url.trim() && url !== link.url) onUpdate(link.id, { url: url.trim() });
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: targetOpacity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/5 p-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded text-foreground/30 hover:text-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        aria-label="Seret untuk mengubah urutan"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex flex-1 flex-col gap-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          className="rounded bg-transparent text-sm font-medium text-foreground outline-none transition-colors focus:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-violet-400"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={commitUrl}
          className="rounded bg-transparent text-xs text-foreground/50 outline-none transition-colors focus:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-violet-400"
        />
      </div>

      <button
        type="button"
        onClick={() => onUpdate(link.id, { isFeatured: !link.isFeatured })}
        aria-pressed={link.isFeatured}
        aria-label="Jadikan featured"
        className={`rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
          link.isFeatured ? "text-amber-400" : "text-foreground/25 hover:text-foreground/50"
        }`}
      >
        <Star size={18} fill={link.isFeatured ? "currentColor" : "none"} />
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={link.isActive}
        onClick={() => onUpdate(link.id, { isActive: !link.isActive })}
        className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          link.isActive ? "bg-violet-600" : "bg-foreground/15"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            link.isActive ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => onDelete(link.id)}
        aria-label="Hapus link"
        className="rounded text-foreground/30 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <Trash2 size={18} />
      </button>
    </motion.div>
  );
}
