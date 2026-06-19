"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingDown, TrendingUp, Target, Award,
  BarChart3, Leaf, ArrowRight,
} from "lucide-react";
import { mockMonthlyData, mockCategoryData } from "@/lib/mockData";

const weeklyComparisonData = [
  { week: "W1", thisMonth: 80, lastMonth: 95 },
  { week: "W2", thisMonth: 72, lastMonth: 88 },
  { week: "W3", thisMonth: 68, lastMonth: 82 },
  { week: "W4", thisMonth: 65, lastMonth: 78 },
];

const goalData = [
  { category: "Transport", target: 40, actual: 35 },
  { category: "Food",      target: 60, actual: 75 },
  { category: "Energy",    target: 50, actual: 42 },
  { category: "Shopping",  target: 30, actual: 28 },
  { category: "Waste",     target: 10, actual: 8  },
];

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

const legendStyle = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  paddingTop: "1.25rem",
};

const fade = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: i * 0.05 },
});

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const bestMonth   = mockMonthlyData.reduce((a, b) => (a.savings   > b.savings   ? a : b));
  const worstMonth  = mockMonthlyData.reduce((a, b) => (a.emissions > b.emissions ? a : b));
  const avgEmissions = Math.round(
    mockMonthlyData.reduce((s, d) => s + d.emissions, 0) / mockMonthlyData.length
  );

  const kpis = [
    {
      label: "Best Month",
      value: bestMonth.month,
      sub: `Saved ${bestMonth.savings} kg`,
      icon: Award,
      color: "text-green-400",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    {
      label: "Worst Month",
      value: worstMonth.month,
      sub: `${worstMonth.emissions} kg emitted`,
      icon: TrendingUp,
      color: "text-red-400",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
    },
    {
      label: "Monthly Average",
      value: `${avgEmissions} kg`,
      sub: "vs 400 kg global avg",
      icon: Target,
      color: "text-teal-400",
      iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    },
    {
      label: "Year Reduction",
      value: "31%",
      sub: "vs last year",
      icon: TrendingDown,
      color: "text-violet-400",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="page">
      <div className="page-inner section-gap">

        {/* â”€â”€ Page Header â”€â”€ */}
        <div className="page-header">
          <div className="badge badge-green mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics & Insights
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Your <span className="gradient-text">Emission Trends</span>
          </h1>
          <p className="text-body-custom mt-2 max-w-lg">
            Deep dive into your carbon footprint patterns over time
          </p>
        </div>

        {/* â”€â”€ KPI Cards â”€â”€ */}
        <div className="kpi-grid">
          {kpis.map(({ label, value, sub, icon: Icon, color, iconBg }, i) => (
            <motion.div key={label} {...fade(i)} className="kpi-card">
              <div className={`kpi-card-icon ${iconBg} shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className={`kpi-card-value ${color}`}>{value}</div>
                <div className="text-white text-sm font-semibold tracking-tight mt-0.5">{label}</div>
                <div className="text-label mt-1.5">{sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* â”€â”€ 12-Month Trend â”€â”€ */}
        <motion.div {...fade(2)} className="chart-card">
          <div className="chart-card-header">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-green-400" />
            </div>
            <h2 className="chart-card-title">12-Month Emissions & Savings Trend</h2>
          </div>
            {/* Screen reader fallback table */}
            <table className="sr-only">
              <caption>12-Month Carbon Emissions and Savings Trend</caption>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Emissions (kg CO2)</th>
                  <th scope="col">CO2 Saved (kg CO2)</th>
                </tr>
              </thead>
              <tbody>
                {mockMonthlyData.map((m: any) => (
                  <tr key={m.month}>
                    <td>{m.month}</td>
                    <td>{m.emissions}</td>
                    <td>{m.savings}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          <div className="h-chart-xl" aria-hidden="true">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMonthlyData} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="svArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" />
                  <XAxis dataKey="month" stroke="#0f172a" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                  <YAxis                stroke="#0f172a" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={legendStyle} />
                  <Area
                    type="monotone" dataKey="emissions" name="Emissions"
                    stroke="#ef4444" strokeWidth={2.5}
                    fill="url(#emArea)"
                    dot={{ fill: "#ef4444", strokeWidth: 1.5, r: 3.5 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                  <Area
                    type="monotone" dataKey="savings" name="CO₂ Saved"
                    stroke="#22c55e" strokeWidth={2.5}
                    fill="url(#svArea)"
                    dot={{ fill: "#22c55e", strokeWidth: 1.5, r: 3.5 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* â”€â”€ Weekly Comparison + Category Pie â”€â”€ */}
        <div className="col-2">
          {/* Weekly Bar */}
          <motion.div {...fade(3)} className="chart-card">
            <div className="chart-card-header">
              <h2 className="chart-card-title">Weekly Comparison</h2>
            </div>
              {/* Screen reader fallback table */}
              <table className="sr-only">
                <caption>Weekly Carbon Emissions Comparison</caption>
                <thead>
                  <tr>
                    <th scope="col">Week</th>
                    <th scope="col">This Month (kg CO2)</th>
                    <th scope="col">Last Month (kg CO2)</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyComparisonData.map((w: any) => (
                    <tr key={w.week}>
                      <td>{w.week}</td>
                      <td>{w.thisMonth}</td>
                      <td>{w.lastMonth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            <div className="h-chart-md" aria-hidden="true">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyComparisonData}
                    barCategoryGap="28%"
                    margin={{ left: -10, right: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" />
                    <XAxis dataKey="week" stroke="#0f172a" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                    <YAxis              stroke="#0f172a" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={legendStyle} />
                    <Bar dataKey="thisMonth" name="This Month" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastMonth" name="Last Month" fill="#334155" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Category Pie */}
          <motion.div {...fade(3)} className="chart-card">
            <div className="chart-card-header">
              <h2 className="chart-card-title">Emissions by Category</h2>
            </div>
              {/* Screen reader fallback table */}
              <table className="sr-only">
                <caption>Carbon Emissions by Category</caption>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Emissions Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCategoryData.map((c: any) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td>{c.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            <div className="h-chart-md" aria-hidden="true">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockCategoryData}
                      cx="50%" cy="50%"
                      outerRadius={86}
                      dataKey="value"
                      strokeWidth={0}
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {mockCategoryData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-5">
              {mockCategoryData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-slate-400 text-xs font-semibold flex-1 truncate">{name}</span>
                  <span className="text-white text-xs font-black">{value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* â”€â”€ Goal Completion â”€â”€ */}
        <motion.div {...fade(4)} className="chart-card">
          <div className="chart-card-header mb-6">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="chart-card-title">Monthly Goal Completion</h2>
          </div>
          <div className="flex flex-col gap-6">
            {goalData.map(({ category, target, actual }) => {
              const pct = Math.round((actual / target) * 100);
              const ok  = actual <= target;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-slate-200 font-bold text-sm">{category}</span>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-slate-500">Target: {target} kg</span>
                      <span className={ok ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                        {ok ? "✓" : "✗"} Actual: {actual} kg
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar-track">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(pct, 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className={`progress-bar-fill ${!ok ? "bg-orange-500" : ""}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* â”€â”€ Carbon Offset Recommendations â”€â”€ */}
        <motion.div
          {...fade(5)}
          className="chart-card"
          style={{ borderColor: "rgba(34,197,94,0.10)" }}
        >
          <div className="chart-card-header mb-2">
            <span className="text-2xl">🌍</span>
            <h3 className="chart-card-title">Carbon Offset Recommendations</h3>
          </div>
          <p className="text-body-custom text-sm mb-8">
            Your 285 kg monthly emissions are equivalent to:
          </p>

          {/* Equivalents */}
          <div className="col-3 mb-10">
            {[
              { emoji: "🌳", value: "18 trees",   label: "needed to plant" },
              { emoji: "🚗", value: "1,357 km",    label: "car travel equivalent" },
              { emoji: "💡", value: "3,476 hrs",   label: "LED bulb usage" },
            ].map(({ emoji, value, label }) => (
              <div
                key={label}
                className="p-6 rounded-2xl border border-white/[0.045] bg-slate-950/25 text-center flex flex-col items-center gap-3"
              >
                <div className="text-4xl">{emoji}</div>
                <div className="text-2xl font-black text-white tracking-tight leading-none">{value}</div>
                <div className="text-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Action cards */}
          <div className="col-3">
            {[
              { title: "🌱 Plant Trees",    desc: "Offset 14 kg CO₂ per tree per year through verified reforestation.",  action: "Browse Programs" },
              { title: "⚡ Solar Energy",   desc: "Switch to 100% renewable electricity with green energy providers.",    action: "Get Quote"       },
              { title: "💳 Carbon Credits", desc: "Purchase verified offset certificates from certified projects.",       action: "Explore"         },
            ].map(({ title, desc, action }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-white/[0.045] bg-slate-950/15 hover:border-green-500/20 hover:bg-slate-900/10 cursor-pointer group transition-all duration-300 flex flex-col justify-between gap-5"
              >
                <div>
                  <h4 className="text-white font-bold text-sm mb-2">{title}</h4>
                  <p className="text-body-custom text-xs leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold transition-colors group-hover:text-green-300">
                  {action}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

