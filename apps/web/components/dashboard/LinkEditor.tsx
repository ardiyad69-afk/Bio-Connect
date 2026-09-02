"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { AnimatePresence } from "motion/react";
import type { CreateLinkInput, Link as LinkModel, UpdateLinkInput } from "@repo/shared";
import { AddLinkForm } from "./AddLinkForm";
import { LinkListItem } from "./LinkListItem";

export function LinkEditor({
  links,
  isPending,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: {
  links: LinkModel[];
  isPending: boolean;
  onAdd: (input: CreateLinkInput) => void;
  onUpdate: (id: string, patch: UpdateLinkInput) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const sorted = [...links].sort((a, b) => a.sortOrder - b.sortOrder);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((l) => l.id === active.id);
    const newIndex = sorted.findIndex((l) => l.id === over.id);
    onReorder(arrayMove(sorted, oldIndex, newIndex).map((l) => l.id));
  }

  return (
    <section className="space-y-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
      <h2 className="font-semibold tracking-tight">Link</h2>
      <AddLinkForm onAdd={onAdd} disabled={isPending} />

      <DndContext
        id="link-editor"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sorted.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {sorted.map((link) => (
                <LinkListItem key={link.id} link={link} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
            </AnimatePresence>
            {sorted.length === 0 && (
              <p className="py-6 text-center text-sm text-foreground/40">Belum ada link. Tambahkan di atas.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
