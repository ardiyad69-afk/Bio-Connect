"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { CreateLinkInput, Link as LinkModel, Profile, UpdateLinkInput } from "@repo/shared";
import { DashboardHeader } from "./DashboardHeader";
import { ProfileForm } from "./ProfileForm";
import { LinkEditor } from "./LinkEditor";
import { LivePreview } from "./LivePreview";
import { createLinkAction, updateLinkAction, deleteLinkAction, reorderLinksAction } from "@/lib/actions/links";

type LinkOptimisticAction =
  | { type: "add"; link: LinkModel }
  | { type: "update"; id: string; patch: Partial<LinkModel> }
  | { type: "remove"; id: string }
  | { type: "reorder"; ids: string[] };

function reducer(state: LinkModel[], action: LinkOptimisticAction): LinkModel[] {
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

export function DashboardShell({
  initialProfile,
  initialLinks,
}: {
  initialProfile: Profile;
  initialLinks: LinkModel[];
}) {
  const [profile, setProfile] = useState(initialProfile);
  // `links` only ever changes from a server action's *confirmed* result —
  // never from the optimistic value itself. Feeding the optimistic value
  // back in here would make it the new base for useOptimistic, so a still-
  // pending action gets replayed on top of it and the temp entry doubles up
  // (this shipped once: "duplicate key" on an `optimistic-<uuid>` link id).
  const [links, setLinks] = useState(initialLinks);
  const [isPending, startTransition] = useTransition();
  const [optimisticLinks, applyOptimistic] = useOptimistic(links, reducer);

  function handleAddLink(input: CreateLinkInput) {
    startTransition(async () => {
      const now = new Date().toISOString();
      applyOptimistic({
        type: "add",
        link: {
          id: `optimistic-${crypto.randomUUID()}`,
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

      const result = await createLinkAction(profile.username, input);
      if (result.data) setLinks((prev) => [...prev, result.data!]);
    });
  }

  function handleUpdateLink(id: string, patch: UpdateLinkInput) {
    startTransition(async () => {
      applyOptimistic({ type: "update", id, patch });
      const result = await updateLinkAction(profile.username, id, patch);
      if (result.data) setLinks((prev) => prev.map((l) => (l.id === id ? result.data! : l)));
    });
  }

  function handleDeleteLink(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: "remove", id });
      const result = await deleteLinkAction(profile.username, id);
      if (result.data) setLinks((prev) => prev.filter((l) => l.id !== id));
    });
  }

  function handleReorderLinks(ids: string[]) {
    startTransition(async () => {
      applyOptimistic({ type: "reorder", ids });
      const result = await reorderLinksAction(profile.username, ids);
      if (result.data) {
        setLinks((prev) =>
          ids
            .map((id, index) => {
              const link = prev.find((l) => l.id === id);
              return link ? { ...link, sortOrder: index } : null;
            })
            .filter((l): l is LinkModel => l !== null)
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <DashboardHeader username={profile.username} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <ProfileForm profile={profile} onChange={setProfile} />
            <LinkEditor
              links={optimisticLinks}
              isPending={isPending}
              onAdd={handleAddLink}
              onUpdate={handleUpdateLink}
              onDelete={handleDeleteLink}
              onReorder={handleReorderLinks}
            />
          </div>

          <div className="lg:sticky lg:top-6 lg:h-fit">
            <LivePreview profile={profile} links={optimisticLinks} />
          </div>
        </div>
      </div>
    </div>
  );
}
