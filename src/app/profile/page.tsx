"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Calendar, TrendingDown, CheckCircle2,
  Share2, Download, History, Edit2, Check, Lock,
} from "lucide-react";
import Link from "next/link";
import { mockChallenges } from "@/lib/mockData";
import { cn, getScoreBg, getScoreColor, getScoreLabel, LEVEL_THRESHOLDS } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";

export default function ProfilePage() {
  const { profile, updateProfile } = useSession();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.displayName);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const [toastTimeoutId, setToastTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }
    setToast({ message, visible: true });
    const id = setTimeout(() => {
      setToast({ message: "", visible: false });
    }, 3000);
    setToastTimeoutId(id);
  };

  const handleShare = async () => {
    const shareText = `Hey! Check out my EcoTrack profile:
• Carbon Score: ${profile.carbonScore}/100
• CO2 Saved: ${profile.totalSaved} kg
• Eco Points: ${profile.ecoPoints}
Join me in tracking and reducing your carbon footprint!`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "My EcoTrack Profile",
          text: shareText,
          url: window.location.origin
        });
        showToast("Profile shared successfully!");
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("Profile summary copied to clipboard!");
      } catch (err) {
        showToast("Failed to copy profile summary.");
        console.error("Clipboard write failed:", err);
      }
    } else {
      showToast("Sharing is not supported on this browser.");
    }
  };


  const {
    displayName, ecoPoints, level, levelIcon, streak,
    totalSaved, carbonScore, footprints, joinedAt,
  } = profile;

  const joinDate = new Date(joinedAt);
  const nextLevelPoints = LEVEL_THRESHOLDS.GUARDIAN;
  const progressPct = Math.min(Math.round((ecoPoints / nextLevelPoints) * 100), 100);

  const achievements = [
    { title: "First Step",    emoji: "🌱", unlocked: true },
    { title: "Carbon Cutter", emoji: "✂️", unlocked: ecoPoints > 0 },
    { title: "Eco Warrior",   emoji: "⚔️", unlocked: ecoPoints >= 1000 },
    { title: "Champion",      emoji: "🏆", unlocked: ecoPoints >= 5000 },
    { title: "Planet Saver",  emoji: "🌍", unlocked: ecoPoints >= 10000 },
    { title: "Climate Hero",  emoji: "🦸", unlocked: ecoPoints >= 15000 },
  ];

  const saveName = () => {
    if (nameInput.trim()) updateProfile({ displayName: nameInput.trim() });
    setEditingName(false);
  };

  const profileStats = [
    { label: "Eco Points",   value: ecoPoints.toLocaleString(), color: "text-green-400"  },
    { label: "CO2 Saved",    value: `${totalSaved} kg`,          color: "text-teal-400"   },
    { label: "Day Streak",   value: `${streak}`,                 color: "text-orange-400" },
    { label: "Carbon Score", value: `${carbonScore}/100`,        color: getScoreColor(carbonScore) },
  ];

  return (
    <div className="page">
      <div className="page-inner section-gap">

        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="chart-card">
            <div className="flex flex-col md:flex-row items-start gap-6">

              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-4xl shrink-0 shadow-inner"
              >
                {levelIcon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 w-full">
                {/* Name row */}
                <div className="flex items-center gap-3 mb-3">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        className="auth-input text-lg font-bold h-10"
                        style={{ width: "14rem" }}
                        autoFocus
                      />
                      <button
                        onClick={saveName}
                        className="btn-base btn-icon btn-icon-sm bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-extrabold text-white tracking-tight truncate">{displayName}</h1>
                      <button
                        onClick={() => { setEditingName(true); setNameInput(displayName); }}
                        className="btn-base btn-ghost btn-icon-sm text-slate-500 hover:text-slate-300"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-5">
                  <span className="text-green-400 text-sm font-bold tracking-wide">{level}</span>
                  <span className="w-px h-3.5 bg-slate-800" />
                  <span className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {joinDate.toLocaleDateString("en", { month: "long", year: "numeric" })}
                  </span>
                </div>

                {/* Level progress */}
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-400">Progress to 🌳 Earth Guardian</span>
                    <span className="text-green-400 font-bold">{ecoPoints.toLocaleString()} / {nextLevelPoints.toLocaleString()} pts</span>
                  </div>
                  <div className="progress-bar-track">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 shrink-0 self-start share-export-buttons">
                <button
                  onClick={handleShare}
                  className="btn-base btn-secondary btn-sm"
                  title="Share Profile"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="btn-base btn-secondary btn-sm"
                  title="Download Report"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.045]">
              {profileStats.map(({ label, value, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className={`text-xl font-black tracking-tight leading-none ${color}`}>{value}</span>
                  <span className="text-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Carbon Score + Achievements Row */}
        <div className="col-2">

          {/* Carbon Score Ring */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="chart-card items-center text-center">
            <div className="chart-card-header justify-center" style={{ marginBottom: "var(--space-6)" }}>
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h2 className="chart-card-title">Carbon Score</h2>
            </div>

            <div className="relative w-36 h-36 mb-5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="43" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="43"
                  stroke={carbonScore >= 70 ? "#22c55e" : carbonScore >= 40 ? "#eab308" : "#ef4444"}
                  strokeWidth="10" fill="none" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 43}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 43 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 43 * (1 - carbonScore / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-black gradient-text tracking-tighter">{carbonScore}</div>
                <div className="text-label mt-0.5">/ 100</div>
              </div>
            </div>

            <div className={cn("inline-block px-5 py-1.5 rounded-full text-white font-extrabold text-xs uppercase tracking-widest mb-4", getScoreBg(carbonScore))}>
              {getScoreLabel(carbonScore)}
            </div>
            <p className="text-body-custom text-xs">
              {footprints.length > 0
                ? `Based on ${footprints.length} calculation${footprints.length !== 1 ? "s" : ""}`
                : "Run the calculator to update your score"}
            </p>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="chart-card">
            <div className="flex items-center justify-between mb-6">
              <div className="chart-card-header" style={{ marginBottom: 0 }}>
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                </div>
                <h2 className="chart-card-title">Achievements</h2>
              </div>
              <span className="text-slate-500 text-sm font-semibold">
                {achievements.filter((a) => a.unlocked).length} / {achievements.length}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {achievements.map(({ title, emoji, unlocked }) => (
                <div
                  key={title}
                  className="relative flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-900 bg-slate-950/20 text-center overflow-hidden"
                  style={{ minHeight: "96px", justifyContent: "center" }}
                >
                  {!unlocked && (
                    <div className="locked-achievement-cover">
                      <Lock className="w-4 h-4 text-slate-500 mb-1" />
                      <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">Locked</span>
                    </div>
                  )}
                  <span className="text-2xl leading-none">{emoji}</span>
                  <span className="text-[0.65rem] font-bold text-slate-300 leading-tight">{title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footprint History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="chart-card">
          <div className="flex items-center justify-between mb-6">
            <div className="chart-card-header" style={{ marginBottom: 0 }}>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <History className="w-4 h-4 text-teal-400" />
              </div>
              <h2 className="chart-card-title">Footprint History</h2>
            </div>
            <span className="text-slate-500 text-sm font-semibold">
              {footprints.length} record{footprints.length !== 1 ? "s" : ""}
            </span>
          </div>

          {footprints.length === 0 ? (
            <div className="text-center py-14 flex flex-col items-center gap-4">
              <div className="text-4xl">📋</div>
              <p className="text-slate-400 text-sm font-semibold">No calculations yet.</p>
              <Link href="/calculator" className="btn-base btn-secondary">
                Calculate Your First Footprint →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {footprints.map((fp, i) => (
                <div
                  key={fp.id ?? i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-900/60 bg-slate-950/20 hover:border-slate-800/70 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0", getScoreBg(fp.sustainabilityScore))}>
                      {fp.sustainabilityScore}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-bold text-sm mb-1.5 flex items-center gap-2 flex-wrap">
                        {fp.monthlyEmissions.toLocaleString()} kg CO2/month
                        <span className={cn("text-xs font-bold", getScoreColor(fp.sustainabilityScore))}>
                          {getScoreLabel(fp.sustainabilityScore)}
                        </span>
                      </div>
                      <div className="text-slate-500 text-xs font-semibold flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-900/80">🚗 {fp.transport}</span>
                        <span className="bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-900/80">🥗 {fp.foodHabits}</span>
                        <span className="flex items-center gap-1 text-teal-400">
                          <TrendingDown className="w-3 h-3" /> {fp.yearlyEmissions.toLocaleString()} kg/yr
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-label sm:text-right shrink-0">
                    {new Date(fp.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Completed Challenges */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="chart-card">
          <div className="chart-card-header mb-6">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <h2 className="chart-card-title">Completed Challenges</h2>
          </div>

          <div className="col-3">
            {mockChallenges.filter((c) => c.completed).map(({ id, title, icon, points, category, difficulty }) => (
              <div
                key={id}
                className="flex items-center gap-4 p-5 rounded-2xl border border-green-500/10 bg-green-500/4 hover:border-green-500/18 transition-all duration-300"
              >
                <span className="text-3xl shrink-0 leading-none">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate mb-2">{title}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{category}</span>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border",
                      difficulty === "Easy"   && "bg-green-500/10 text-green-400 border-green-500/12",
                      difficulty === "Medium" && "bg-yellow-500/10 text-yellow-400 border-yellow-500/12",
                      difficulty === "Hard"   && "bg-red-500/10 text-red-400 border-red-500/12"
                    )}>
                      {difficulty}
                    </span>
                    <span className="text-green-400 text-xs font-bold ml-auto">+{points} pts</span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-950/90 border border-green-500/30 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-400" />
            </div>
            <span className="text-sm font-semibold text-slate-200">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
