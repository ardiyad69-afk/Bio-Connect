"use client";

import { useEffect, useOptimistic, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { CreateLinkInput, Link as LinkModel, UpdateLinkInput } from "@repo/shared";
import { AddLinkForm } from "./AddLinkForm";
import { LinkListItem } from "./LinkListItem";
import { createLinkAction, updateLinkAction, deleteLinkAction, reorderLinksAction } from "@/lib/actions/links";

type LinkAction =
  | { type: "add"; link: LinkModel }
  | { type: "update"; id: string; patch: Partial<LinkModel> }
  | { type: "remove"; id: string }
  | { type: "reorder"; ids: string[] };

function reducer(state: LinkModel[], action: LinkAction): LinkModel[] {
  switch (action.type) {
    case "add":
      return [...state, action.link];
    case "update":
      return state.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l));
    case "remove":
      return state.filter((l) => l.id !== action.id);
    case "reorder":
      return action.ids
        .map((id, index) => {
          const link = state.find((l) => l.id === id);
          return link ? { ...link, sortOrder: index } : null;
        })
        .filter((l): l is LinkModel => l !== null);
    default:
      return state;
  }
}

export function LinkEditor({
  username,
  links,
  onChange,
}: {
  username: string;
  links: LinkModel[];
  onChange: (links: LinkModel[]) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticLinks, applyOptimistic] = useOptimistic(links, reducer);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Mirrors the optimistic view up to DashboardShell so the live preview
  // animates in lockstep with the editor, not one render behind it.
  useEffect(() => {
    onChange(optimisticLinks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimisticLinks]);

  const sorted = [...optimisticLinks].sort((a, b) => a.sortOrder - b.sortOrder);

  function handleAdd(input: CreateLinkInput) {
    startTransition(async () => {
      const optimisticId = `optimistic-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      applyOptimistic({
        type: "add",
        link: {
          id: optimisticId,
          profileId: "",
          title: input.title,
          url: input.url,
          icon: null,
          sortOrder: optimisticLinks.length,
          isActive: true,
          isFeatured: input.isFeatured ?? false,
          clickCount: 0,
          createdAt: now,
          updatedAt: now,
        },
      });

      const result = await createLinkAction(username, input);
      if (result.data) onChange([...links, result.data]);
    });
  }

  function handleUpdate(id: string, patch: UpdateLinkInput) {
    startTransition(async () => {
      applyOptimistic({ type: "update", id, patch });
      const result = await updateLinkAction(username, id, patch);
      if (result.data) onChange(links.map((l) => (l.id === id ? result.data! : l)));
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: "remove", id });
      const result = await deleteLinkAction(username, id);
      if (result.data) onChange(links.filter((l) => l.id !== id));
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((l) => l.id === active.id);
    const newIndex = sorted.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex);
    const ids = reordered.map((l) => l.id);

    startTransition(async () => {
      applyOptimistic({ type: "reorder", ids });
      const result = await reorderLinksAction(username, ids);
      if (result.data) {
        onChange(
          ids
            .map((id, index) => {
              const link = links.find((l) => l.id === id);
              return link ? { ...link, sortOrder: index } : null;
            })
            .filter((l): l is LinkModel => l !== null)
        );
      }
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="font-semibold">Link</h2>
      <AddLinkForm onAdd={handleAdd} disabled={isPending} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sorted.map((link) => (
              <LinkListItem key={link.id} link={link} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
            {sorted.length === 0 && (
              <p className="py-6 text-center text-sm text-white/40">Belum ada link. Tambahkan di atas.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
