"use client";

import { useEffect, useRef, useState } from "react";
import type { Profile, Socials } from "@repo/shared";
import { updateProfileAction } from "@/lib/actions/profile";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const SOCIAL_FIELDS: { key: keyof Socials; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "username" },
  { key: "twitter", label: "X / Twitter", placeholder: "username" },
  { key: "tiktok", label: "TikTok", placeholder: "username" },
  { key: "youtube", label: "YouTube", placeholder: "handle" },
  { key: "github", label: "GitHub", placeholder: "username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "username" },
];

export function ProfileForm({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
}) {
  const [form, setForm] = useState(profile);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRender = useRef(true);

  useEffect(() => {
    onChange(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setStatus("saving");
    const timer = setTimeout(async () => {
      const result = await updateProfileAction(profile.username, {
        displayName: form.displayName,
        bio: form.bio,
        avatarUrl: form.avatarUrl ?? "",
        themeColor: form.themeColor,
        socials: form.socials,
      });
      setStatus(result.error ? "error" : "saved");
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.displayName, form.bio, form.avatarUrl, form.themeColor, form.socials]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateSocial(key: keyof Socials, value: string) {
    setForm((f) => ({ ...f, socials: { ...f.socials, [key]: value || undefined } }));
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Profil</h2>
        <SaveIndicator status={status} />
      </div>

      <Field label="Nama tampilan">
        <input
          value={form.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          maxLength={60}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500"
        />
      </Field>

      <Field label="Bio">
        <textarea
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          maxLength={280}
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500"
        />
      </Field>

      <Field label="URL Avatar">
        <input
          value={form.avatarUrl ?? ""}
          onChange={(e) => update("avatarUrl", e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500"
        />
      </Field>

      <Field label="Warna tema">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.themeColor}
            onChange={(e) => update("themeColor", e.target.value)}
            className="h-9 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
          />
          <span className="text-sm text-white/50">{form.themeColor}</span>
        </div>
      </Field>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <p className="text-sm text-white/70">Media sosial</p>
        <div className="grid grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input
                value={form.socials[key] ?? ""}
                onChange={(e) => updateSocial(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
            </Field>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-white/70">{label}</span>
      {children}
    </label>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const text = { saving: "Menyimpan...", saved: "Tersimpan", error: "Gagal menyimpan" }[status];
  const color = { saving: "text-white/40", saved: "text-emerald-400", error: "text-red-400" }[status];
  return <span className={`text-xs ${color}`}>{text}</span>;
}
