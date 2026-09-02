"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ExternalLink, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { fadeUpFast } from "@/lib/motion";

export function DashboardHeader({ username }: { username: string }) {
  return (
    <motion.header
      variants={fadeUpFast}
      className="flex items-center justify-between border-b border-foreground/10 pb-4"
    >
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-foreground/50">linkstart.app/{username}</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href={`/${username}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Lihat halaman <ExternalLink size={14} />
        </Link>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut size={14} /> Keluar
          </Button>
        </form>
      </div>
    </motion.header>
  );
}
