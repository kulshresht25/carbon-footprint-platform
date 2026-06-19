"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <div className="text-6xl mb-6">🌿</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Looks like this page wandered off into the wilderness. Let&apos;s get you back on the
          green path!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/30 hover:scale-105 transition-all"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}
