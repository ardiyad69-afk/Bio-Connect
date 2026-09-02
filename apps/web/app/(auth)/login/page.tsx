"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuthGradientBackground } from "@/components/ui/auth-gradient-background";
import { fadeUp } from "@/lib/motion";

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
        <h1 className="text-xl font-semibold tracking-tight">Masuk ke LinkStart</h1>

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

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Memproses..." : "Masuk"}
        </Button>

        <p className="text-center text-sm text-foreground/50">
          Belum punya akun?{" "}
          <Link href="/signup" className="text-violet-400 underline underline-offset-4">
            Daftar
          </Link>
        </p>
      </motion.form>
    </main>
  );
}
