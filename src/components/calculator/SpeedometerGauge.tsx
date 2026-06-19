"use client";

import { motion } from "framer-motion";

interface SpeedometerGaugeProps {
  score: number;
}

export function SpeedometerGauge({ score }: SpeedometerGaugeProps) {
  const radius = 64;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative w-56 h-32 flex flex-col items-center justify-end overflow-hidden select-none"
      role="img"
      aria-label={`Sustainability Score Gauge showing ${score} out of 100`}
    >
      <svg className="w-56 h-56 -rotate-180 absolute -bottom-28" viewBox="0 0 150 150" aria-hidden="true">
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          fill="none"
          strokeLinecap="round"
        />
        <motion.circle
          cx="75"
          cy="75"
          r={radius}
          stroke="url(#scoreGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          fill="none"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10 mb-2">
        <div className="text-6xl font-black text-white tracking-tighter leading-none" aria-hidden="true">
          {score}
        </div>
        <div className="text-label mt-2" aria-hidden="true">
          Sustainability Score
        </div>
      </div>
    </div>
  );
}
