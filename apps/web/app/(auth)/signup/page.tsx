"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { signupAction } from "@/lib/actions/auth";
import { eden } from "@/lib/eden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuthGradientBackground } from "@/components/ui/auth-gradient-background";
import { fadeUp } from "@/lib/motion";

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

  const usernameStatusText = {
    checking: { text: "Mengecek...", className: "text-foreground/40" },
    available: { text: "Tersedia", className: "text-emerald-400" },
    taken: { text: "Sudah dipakai", className: "text-red-400" },
  } as const;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <AuthGradientBackground />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <ThemeToggle className="absolute right-6 top-6" />
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="relative w-full max-w-sm space-y-4 rounded-2xl border border-foreground/10 bg-background/70 p-8 backdrop-blur-xl"
      >
        <h1 className="text-xl font-semibold tracking-tight">Buat akun LinkStart</h1>

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm text-foreground/70">Username</label>
          <div className="flex items-center rounded-lg border border-foreground/10 bg-foreground/5 px-3 transition-colors focus-within:border-violet-500">
            <span className="text-foreground/40">linkstart.app/</span>
            <input
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full bg-transparent py-2 text-sm text-foreground outline-none"
            />
          </div>
          <AnimatePresence mode="wait">
            {usernameStatus !== "idle" && (
              <motion.p
                key={usernameStatus}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`text-xs ${usernameStatusText[usernameStatus].className}`}
              >
                {usernameStatusText[usernameStatus].text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-foreground/70">Email</label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-foreground/70">Password</label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" disabled={isPending || usernameStatus === "taken"} className="w-full">
          {isPending ? "Memproses..." : "Daftar"}
        </Button>

        <p className="text-center text-sm text-foreground/50">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-violet-400 underline underline-offset-4">
            Masuk
          </Link>
        </p>
      </motion.form>
    </main>
  );
}
