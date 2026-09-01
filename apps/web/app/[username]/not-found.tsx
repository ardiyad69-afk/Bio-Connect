import Link from "next/link";

export default function UsernameNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-white">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="text-white/60">Username ini belum terdaftar di BioConnect.</p>
      <Link href="/" className="text-sm text-violet-400 underline underline-offset-4">
        Kembali ke beranda
      </Link>
    </main>
  );
}
