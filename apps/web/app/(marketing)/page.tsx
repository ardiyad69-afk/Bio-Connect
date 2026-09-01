import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 px-6 text-center text-white">
      <div className="max-w-lg space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Satu link untuk semua kontenmu
        </h1>
        <p className="text-white/60">
          Buat halaman bio yang cepat, indah, dan mudah dikelola. Gratis untuk mulai.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-full bg-violet-600 px-6 py-3 font-medium transition-colors hover:bg-violet-500"
        >
          Mulai Gratis
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-white/20 px-6 py-3 font-medium transition-colors hover:bg-white/10"
        >
          Masuk
        </Link>
      </div>
    </main>
  );
}
