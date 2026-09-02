"use client";

import { useEffect, useRef, useState } from "react";
import type { Profile, ProfileTheme, Socials } from "@repo/shared";
import { updateProfileAction } from "@/lib/actions/profile";
import { Input, Textarea } from "@/components/ui/input";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const THEME_OPTIONS: { value: ProfileTheme; label: string; description: string }[] = [
  { value: "default", label: "Default", description: "Glass gelap, lembut" },
  { value: "neo-brutalism", label: "Neo-Brutalism", description: "Border tebal, bayangan keras" },
];

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
        theme: form.theme,
        socials: form.socials,
      });
      setStatus(result.error ? "error" : "saved");
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.displayName, form.bio, form.avatarUrl, form.themeColor, form.theme, form.socials]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateSocial(key: keyof Socials, value: string) {
    setForm((f) => ({ ...f, socials: { ...f.socials, [key]: value || undefined } }));
  }

  return (
    <section className="space-y-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold tracking-tight">Profil</h2>
        <SaveIndicator status={status} />
      </div>

      <Field label="Nama tampilan">
        <Input
          value={form.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          maxLength={60}
        />
      </Field>

      <Field label="Bio">
        <Textarea
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          maxLength={280}
          rows={3}
        />
      </Field>

      <Field label="URL Avatar">
        <Input
          value={form.avatarUrl ?? ""}
          onChange={(e) => update("avatarUrl", e.target.value)}
          placeholder="https://..."
        />
      </Field>

      <Field label="Warna tema">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.themeColor}
            onChange={(e) => update("themeColor", e.target.value)}
            className="h-9 w-14 cursor-pointer rounded border border-foreground/10 bg-transparent"
          />
          <span className="text-sm text-foreground/50">{form.themeColor}</span>
        </div>
      </Field>

      <Field label="Tema halaman">
        <div className="grid grid-cols-2 gap-3">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update("theme", opt.value)}
              aria-pressed={form.theme === opt.value}
              className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                form.theme === opt.value
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-foreground/10 hover:border-foreground/25"
              }`}
            >
              <ThemeSwatch value={opt.value} />
              <span className="text-xs font-medium text-foreground">{opt.label}</span>
              <span className="text-[11px] text-foreground/50">{opt.description}</span>
            </button>
          ))}
        </div>
      </Field>

      <div className="space-y-2 border-t border-foreground/10 pt-4">
        <p className="text-sm text-foreground/70">Media sosial</p>
        <div className="grid grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input
                value={form.socials[key] ?? ""}
                onChange={(e) => updateSocial(key, e.target.value)}
                placeholder={placeholder}
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
      <span className="text-sm text-foreground/70">{label}</span>
      {children}
    </label>
  );
}

function ThemeSwatch({ value }: { value: ProfileTheme }) {
  if (value === "neo-brutalism") {
    return (
      <div className="h-10 w-14 border-2 border-black bg-[#FDF6E9] shadow-[2px_2px_0_0_#000]" aria-hidden />
    );
  }
  return (
    <div className="relative h-10 w-14 overflow-hidden rounded-lg border border-white/10 bg-zinc-900" aria-hidden>
      <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-violet-500 blur-md" />
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const text = { saving: "Menyimpan...", saved: "Tersimpan", error: "Gagal menyimpan" }[status];
  const color = { saving: "text-foreground/40", saved: "text-emerald-400", error: "text-red-400" }[status];
  return <span className={`text-xs ${color}`}>{text}</span>;
}
