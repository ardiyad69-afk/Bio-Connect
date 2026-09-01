"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { signupAction } from "@/lib/actions/auth";
import { eden } from "@/lib/eden";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data } = await eden.profile["check-username"].get({ query: { u: username } });
      setUsernameStatus(data?.available ? "available" : "taken");
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signupAction({ email, password, username });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <h1 className="text-xl font-semibold">Buat akun BioConnect</h1>

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm text-white/70">Username</label>
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-violet-500">
            <span className="text-white/40">bioconnect.app/</span>
            <input
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full bg-transparent py-2 outline-none"
            />
          </div>
          {usernameStatus === "checking" && <p className="text-xs text-white/40">Mengecek...</p>}
          {usernameStatus === "available" && <p className="text-xs text-emerald-400">Tersedia</p>}
          {usernameStatus === "taken" && <p className="text-xs text-red-400">Sudah dipakai</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-white/70">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-white/70">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isPending || usernameStatus === "taken"}
          className="w-full rounded-lg bg-violet-600 py-2 font-medium transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Daftar"}
        </button>

        <p className="text-center text-sm text-white/50">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-violet-400 underline underline-offset-4">
            Masuk
          </Link>
        </p>
      </form>
    </main>
  );
}
