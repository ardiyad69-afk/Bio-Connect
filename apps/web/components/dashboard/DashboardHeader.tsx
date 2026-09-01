"use client";

import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export function DashboardHeader({ username }: { username: string }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 pb-4">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-white/50">bioconnect.app/{username}</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/${username}`}
          target="_blank"
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          Lihat halaman <ExternalLink size={14} />
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >
            <LogOut size={14} /> Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
