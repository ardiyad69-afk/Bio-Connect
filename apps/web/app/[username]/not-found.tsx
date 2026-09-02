"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/motion";

export default function UsernameNotFound() {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={staggerContainer()}
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground"
    >
      <motion.h1 variants={fadeUp} className="text-2xl font-semibold">
        Halaman tidak ditemukan
      </motion.h1>
      <motion.p variants={fadeUp} className="text-foreground/60">
        Username ini belum terdaftar di LinkStart.
      </motion.p>
      <motion.div variants={fadeUp}>
        <Link href="/" className="text-sm text-violet-400 underline underline-offset-4">
          Kembali ke beranda
        </Link>
      </motion.div>
    </motion.main>
  );
}
