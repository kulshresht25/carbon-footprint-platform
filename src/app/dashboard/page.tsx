"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/contexts/SessionContext";
import {
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, Line,
} from "recharts";
import {
  TrendingDown, Leaf, Brain, CheckSquare, Trophy,
  Target, Flame, Zap, Star, ArrowRight,
} from "lucide-react";
import {
  mockWeeklyData, mockCategoryData, mockAIInsights,
  mockHabits, mockChallenges,
} from "@/lib/mockData";
import { cn, getScoreColor } from "@/lib/utils";

/* â”€â”€ Tooltip â”€â”€ */
const ChartTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="card card-sm shadow-xl"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(2,4,2,0.97)" }}
    >
      <p className="text-label mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-extrabold text-sm">
          {p.name}: {p.value.toLocaleString()} kg
        </p>
      ))}
    </div>
  );
};

/* â”€â”€ Animation helper â”€â”€ */
const fade = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: i * 0.05 },
});

export default function DashboardPage() {
  const { profile } = useSession();
  const [habits, setHabits] = useState(mockHabits);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const { displayName, ecoPoints, carbonScore, level, levelIcon, streak, totalSaved } = profile;

  const toggleHabit = (id: number) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)));

  const earnedPoints = habits.filter((h) => h.completed).reduce((s, h) => s + h.points, 0);

  const weeklyData =
    profile.footprints.length > 0
      ? profile.footprints
          .slice(0, 7)
          .reverse()
          .map((fp, i) => ({
            day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] ?? `D${i + 1}`,
            emissions: fp.monthlyEmissions,
            target: 250,
          }))
      : mockWeeklyData;

  const kpis = [
    { label: "Carbon Score",         value: `${carbonScore}/100`, icon: Leaf,        color: getScoreColor(carbonScore), bg: "bg-green-500/10 border-green-500/20"   },
    { label: "Weekly Average",       value: "9.8 kg/day",         icon: TrendingDown, color: "text-teal-400",           bg: "bg-teal-500/10 border-teal-500/20"    },
    { label: "This Month",           value: "285 kg",             icon: Zap,          color: "text-violet-400",         bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Challenges Completed", value: "2 / 4 Done",        icon: Trophy,       color: "text-yellow-400",         bg: "bg-yellow-500/10 border-yellow-500/20" },
  ];

  return (
    <div className="page">
      <div className="page-inner section-gap">

        {/* â”€â”€ Page Header â”€â”€ */}
        <div className="page-header flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="page-header-label">Welcome back</p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
              {displayName}
              <span className="animate-bounce-slow text-2xl leading-none">{levelIcon}</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-green-400 text-xs font-bold uppercase tracking-wider">{level}</span>
              <span className="w-px h-3 bg-slate-800" />
              <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />
                {streak}-day streak
              </span>
            </div>
          </div>

          {/* Header stat chips */}
          <div className="flex items-stretch gap-4 shrink-0">
            <div className="stat-card" style={{ minWidth: "9rem" }}>
              <span className="stat-card-value text-green-400">{ecoPoints.toLocaleString()}</span>
              <span className="stat-card-label">Eco Points</span>
            </div>
            <div className="stat-card" style={{ minWidth: "9rem" }}>
              <span className="stat-card-value text-emerald-400">{totalSaved} kg</span>
              <span className="stat-card-label">CO₂ Saved</span>
            </div>
            <div className="stat-card" style={{ minWidth: "9rem" }}>
              <span className="stat-card-value text-orange-400">{streak}</span>
              <span className="stat-card-label">Day Streak</span>
            </div>
          </div>
        </div>

        {/* â”€â”€ KPI Cards â”€â”€ */}
        <div className="kpi-grid">
          {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={label} {...fade(i)} className="kpi-card">
              <div className={`kpi-card-icon border ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className={`kpi-card-value ${color}`}>{value}</div>
                <div className="kpi-card-label">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        {mounted && <div className="col-2-1">

          {/* Weekly Emissions — 2/3 */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="chart-card-title">Weekly Emissions</h2>
            </div>
            <div className="h-chart-lg">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" />
                  <XAxis dataKey="day"  stroke="#0f172a" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                  <YAxis              stroke="#0f172a" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone" dataKey="emissions" name="Emissions"
                    stroke="#22c55e" strokeWidth={2.5}
                    fill="url(#emGrad)"
                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                  <Line
                    type="monotone" dataKey="target" name="Target"
                    stroke="#6366f1" strokeWidth={1.75} strokeDasharray="6 4" dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Pie â€” 1/3 */}
          <div className="chart-card justify-between">
            <div className="chart-card-header">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="chart-card-title">By Category</h2>
            </div>
            <div className="h-chart-md">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategoryData}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={78}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {mockCategoryData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto space-y-2.5 pt-4">
              {mockCategoryData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-slate-400 text-xs font-semibold">{name}</span>
                  </div>
                  <span className="text-white text-xs font-black">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {/* â”€â”€ Daily Habits â”€â”€ */}
        <div className="chart-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="chart-card-header" style={{ marginBottom: 0 }}>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-teal-400" />
              </div>
              <h2 className="chart-card-title">Daily Habits Checklist</h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-label">Earned today</span>
              <span
                className="text-green-400 font-black text-sm border border-green-500/15 bg-green-500/8 rounded-xl px-3 py-1"
              >
                +{earnedPoints} pts
              </span>
            </div>
          </div>

          <div className="col-2">
            {habits.map(({ id, icon, label, points, completed }) => (
              <button
                key={id}
                onClick={() => toggleHabit(id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-green-500/30",
                  completed
                    ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/8"
                    : "border-white/[0.05] hover:border-slate-700/60 hover:bg-slate-900/15"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-150",
                    completed ? "bg-green-500 border-green-500" : "border-slate-700"
                  )}
                >
                  {completed && <span className="text-white text-[10px] font-black">✓</span>}
                </div>
                <span className="text-2xl shrink-0 leading-none">{icon}</span>
                <span
                  className={cn(
                    "flex-1 text-sm font-semibold transition-all duration-150 text-left",
                    completed ? "text-slate-500 line-through" : "text-slate-200"
                  )}
                >
                  {label}
                </span>
                <span className="text-green-400 text-xs font-bold shrink-0 bg-green-500/8 border border-green-500/12 px-2.5 py-1 rounded-lg">
                  +{points}pt
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* â”€â”€ AI Insights + Right Column â”€â”€ */}
        <div className="col-2-1">

          {/* AI Insights */}
          <div className="chart-card">
            <div className="chart-card-header mb-6">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="chart-card-title">AI Insights</h2>
            </div>
            <div className="col-2">
              {mockAIInsights.map(({ id, icon, title, description, impact, saving }, i) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex flex-col justify-between p-5 rounded-2xl bg-slate-950/40 border border-white/[0.04] hover:border-slate-800/80 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-2xl shrink-0">{icon}</span>
                      <span
                        className={cn(
                          "text-[0.6875rem] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider shrink-0 border",
                          impact === "Very High" || impact === "High"
                            ? "bg-green-500/10 text-green-400 border-green-500/15"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/15"
                        )}
                      >
                        {impact}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-sm leading-snug mb-1.5">{title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
                  </div>
                  <p className="text-green-400 text-xs font-bold mt-4 flex items-center gap-1.5">
                    <span>💚</span> {saving}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Level + Challenges stacked */}
          <div className="flex flex-col gap-8">

            {/* Level Progress */}
            <div className="chart-card flex-1">
              <div className="chart-card-header mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Star className="w-4 h-4 text-orange-400" />
                </div>
                <h2 className="chart-card-title">Level Progress</h2>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/[0.04] mb-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl bg-slate-900/80 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/5"
                    >
                      {levelIcon}
                    </span>
                    <div>
                      <div className="text-white font-bold text-sm leading-tight">{level}</div>
                      <div className="text-label mt-0.5">Current Level</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-black text-xs bg-green-500/8 border border-green-500/12 px-2.5 py-1 rounded-xl">
                    {ecoPoints.toLocaleString()} pts
                  </div>
                </div>
                <div className="progress-bar-track mb-2">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((ecoPoints / 5000) * 100, 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-[0.65rem] font-bold text-slate-600 uppercase tracking-wider">
                  <span>0</span>
                  <span>Next: 🌳 5,000 pts</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: "🌱", unlocked: true },
                  { icon: "✂️", unlocked: ecoPoints > 0 },
                  { icon: "⚔️", unlocked: ecoPoints >= 1000 },
                  { icon: "🏆", unlocked: ecoPoints >= 5000 },
                  { icon: "🌍", unlocked: ecoPoints >= 10000 },
                  { icon: "🦸", unlocked: ecoPoints >= 15000 },
                ].map(({ icon, unlocked }, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "aspect-square flex items-center justify-center rounded-xl border transition-all duration-300",
                      unlocked
                        ? "border-green-500/20 bg-green-500/6"
                        : "border-slate-900/50 opacity-30 grayscale"
                    )}
                  >
                    <span className="text-xl leading-none">{icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Challenges */}
            <div className="chart-card flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="chart-card-header" style={{ marginBottom: 0 }}>
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  </div>
                  <h2 className="chart-card-title">Challenges</h2>
                </div>
                <span className="text-label">Active</span>
              </div>

              <div className="flex flex-col gap-3">
                {mockChallenges.slice(0, 3).map(({ id, title, icon, progress, completed }) => (
                  <div
                    key={id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                      completed
                        ? "border-green-500/18 bg-green-500/5"
                        : "border-white/[0.04] bg-slate-950/20"
                    )}
                  >
                    <span className="text-xl shrink-0 leading-none">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-xs truncate mb-2">{title}</div>
                      <div className="flex items-center gap-2.5">
                        <div className="progress-bar-track flex-1">
                          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-slate-500 text-[10px] font-bold w-8 text-right shrink-0">{progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="/leaderboard"
                className="mt-5 flex items-center justify-center gap-2 w-full btn-base btn-secondary btn-sm"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

