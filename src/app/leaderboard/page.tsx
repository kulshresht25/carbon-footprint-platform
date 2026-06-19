"use client";

import { motion } from "framer-motion";
import { Trophy, Leaf, TrendingDown } from "lucide-react";
import { mockLeaderboard } from "@/lib/mockData";
import { cn } from "@/lib/utils";

import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";

const rankColors: Record<number, string> = {
  1: "from-yellow-400 to-amber-500",
  2: "from-slate-300 to-slate-400",
  3: "from-amber-600 to-amber-700",
};

const rankMedals: Record<number, string> = {
  1: "gold",
  2: "silver",
  3: "bronze",
};

export default function LeaderboardPage() {
  const { profile } = useSession();

  // Create dynamic leaderboard entry for current user
  const userEntry = {
    name: profile.displayName || "You",
    avatar: profile.displayName 
      ? profile.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() 
      : "ME",
    score: profile.carbonScore,
    saved: profile.totalSaved,
    points: profile.ecoPoints,
    isMe: true
  };

  // Combine mock users (excluding the dummy rank 4 placeholder) with current user
  const leaderboardEntries = [
    ...mockLeaderboard.filter(u => u.rank !== 4).map(u => ({ ...u, isMe: false })),
    userEntry
  ];

  // Sort descending by points
  leaderboardEntries.sort((a, b) => b.points - a.points);

  // Assign ranks dynamically
  const rankedLeaderboard = leaderboardEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

  const top3 = rankedLeaderboard.slice(0, 3);

  return (
    <div className="page">
      <div className="page-inner section-gap">

        {/* Page Header */}
        <div className="page-header text-center flex flex-col items-center">
          <div className="badge badge-yellow mb-4">
            <Trophy className="w-3.5 h-3.5" />
            Global Leaderboard
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            Eco <span className="gradient-text">Champions</span>
          </h1>
          <p className="text-body-custom max-w-md">
            Ranked by lifetime Eco Points. Complete daily habits and challenges to rise higher.
          </p>
        </div>

        {/* Podium - Top 3 */}
        <div className="flex flex-col items-center w-full" style={{ maxWidth: "36rem", margin: "0 auto" }}>
          <div className="flex items-end justify-center gap-5 w-full">

            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="text-3xl mb-2">🥈</div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-black text-xl shadow-lg mb-3">
                {top3[1].avatar}
              </div>
              <div className="text-white font-bold text-sm text-center truncate w-full px-1">{top3[1].name.split(" ")[0]}</div>
              <div className="text-slate-400 text-xs font-bold mb-4">{top3[1].points.toLocaleString()} pts</div>
              <div
                className="w-full rounded-t-2xl flex items-center justify-center text-2xl font-black text-slate-300"
                style={{ height: "6rem", background: "linear-gradient(to bottom, #1e293b, #0f172a)", border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none", boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04)" }}
              >
                2
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="text-4xl mb-2">🥇</div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-yellow-500/15 mb-3 animate-pulse-slow">
                {top3[0].avatar}
              </div>
              <div className="text-white font-extrabold text-base text-center truncate w-full px-1">{top3[0].name.split(" ")[0]}</div>
              <div className="text-yellow-400 text-sm font-extrabold mb-4">{top3[0].points.toLocaleString()} pts</div>
              <div
                className="w-full rounded-t-2xl flex items-center justify-center text-3xl font-black text-yellow-500 relative overflow-hidden"
                style={{ height: "8rem", background: "linear-gradient(to bottom, #1e293b, #0f172a)", border: "1px solid rgba(234,179,8,0.25)", borderBottom: "none", boxShadow: "inset 0 1px 0 0 rgba(234,179,8,0.15), 0 0 30px rgba(234,179,8,0.05)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent pointer-events-none" />
                1
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-col items-center flex-1"
            >
              <div className="text-3xl mb-2">🥉</div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-black text-xl shadow-lg mb-3">
                {top3[2].avatar}
              </div>
              <div className="text-white font-bold text-sm text-center truncate w-full px-1">{top3[2].name.split(" ")[0]}</div>
              <div className="text-slate-400 text-xs font-bold mb-4">{top3[2].points.toLocaleString()} pts</div>
              <div
                className="w-full rounded-t-2xl flex items-center justify-center text-2xl font-black text-amber-600"
                style={{ height: "5rem", background: "linear-gradient(to bottom, #1e293b, #0f172a)", border: "1px solid rgba(255,255,255,0.05)", borderBottom: "none" }}
              >
                3
              </div>
            </motion.div>
          </div>

          {/* Reflective floor */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          <div className="w-full h-5 bg-gradient-to-b from-slate-900/25 to-transparent blur-sm rounded-full -mt-1" />
        </div>

        {/* Full Leaderboard Table */}
        <div className="chart-card" style={{ padding: 0, overflow: "hidden" }}>

          {/* Table header */}
          <div
            className="grid items-center border-b border-white/[0.045]"
            style={{ gridTemplateColumns: "3rem 1fr 5rem 7rem 5.5rem", padding: "var(--space-4) var(--space-6)" }}
          >
            <div className="text-label">Rank</div>
            <div className="text-label">Member</div>
            <div className="text-label text-right hidden sm:block">Score</div>
            <div className="text-label text-right hidden sm:block">CO2 Saved</div>
            <div className="text-label text-right">Points</div>
          </div>

          {/* Rows */}
          <div>
            {rankedLeaderboard.map((entry, i) => {
              const { rank, name, avatar, score, saved, points, isMe } = entry;
              const isTop3 = rank <= 3;
              return (
                <motion.div
                  key={rank}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.025 * i }}
                  className={cn(
                    "grid items-center border-b border-white/[0.03] last:border-b-0 transition-colors duration-200",
                    isMe ? "bg-green-950/15" : "hover:bg-slate-900/20"
                  )}
                  style={{
                    gridTemplateColumns: "3rem 1fr 5rem 7rem 5.5rem",
                    padding: "var(--space-4) var(--space-6)",
                    boxShadow: isMe ? "inset 0 0 0 1px rgba(34,197,94,0.16)" : undefined,
                  }}
                >
                  <div>
                    {isTop3 ? (
                      <span className="text-xl leading-none">
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      <span className={cn("font-bold text-sm tabular-nums", isMe ? "text-green-400" : "text-slate-500")}>
                        #{rank}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0",
                        isTop3 ? `bg-gradient-to-br ${rankColors[rank]} shadow-md` : "bg-slate-900 border border-white/[0.06]"
                      )}
                    >
                      {avatar}
                    </div>
                    <div className="min-w-0">
                      <div className={cn("font-bold text-sm truncate leading-tight", isMe ? "text-green-400" : "text-white")}>
                        {name}{isMe && <span className="text-xs font-normal text-green-500/50 ml-1.5">(You)</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Leaf className="w-3 h-3 text-green-500 shrink-0" />
                        <span className="text-[0.65rem] font-semibold text-slate-500 uppercase tracking-wider">Score {score}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className={cn("text-sm font-black tracking-tight tabular-nums", score >= 85 ? "text-green-400" : score >= 70 ? "text-emerald-400" : "text-yellow-400")}>
                      {score}/100
                    </span>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-teal-400 text-sm font-bold inline-flex items-center justify-end gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                      {saved.toLocaleString()} kg
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-black text-sm leading-tight tabular-nums">{points.toLocaleString()}</div>
                    <div className="text-label mt-0.5">pts</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="chart-card flex flex-col lg:flex-row items-center justify-between gap-8"
          style={{ borderColor: "rgba(34,197,94,0.10)" }}
        >
          <div className="flex items-center gap-5">
            <div className="text-5xl shrink-0">🚀</div>
            <div>
              <h3 className="text-white font-extrabold text-lg tracking-tight mb-1.5">Ready to Climb the Ranks?</h3>
              <p className="text-body-custom text-sm max-w-md">Complete daily habits and weekly challenges to earn Eco Points and move up the leaderboard!</p>
            </div>
          </div>
          <a href="/dashboard" className="btn-base btn-primary shrink-0" style={{ paddingLeft: "var(--space-8)", paddingRight: "var(--space-8)" }}>
            <Trophy className="w-4 h-4" />
            Go to Dashboard
          </a>
        </motion.div>

      </div>
    </div>
  );
}
