"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginAction({ email, password });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
      >
        <h1 className="text-xl font-semibold">Masuk ke BioConnect</h1>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-violet-600 py-2 font-medium transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Masuk"}
        </button>

        <p className="text-center text-sm text-white/50">
          Belum punya akun?{" "}
          <Link href="/signup" className="text-violet-400 underline underline-offset-4">
            Daftar
          </Link>
        </p>
      </form>
    </main>
  );
}
