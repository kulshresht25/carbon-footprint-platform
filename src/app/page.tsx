"use client";

import Link from "next/link";
import {
  ArrowRight, Leaf, Calculator, Activity, Brain,
  Target, BarChart3, Users, TrendingDown,
} from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { mockLeaderboard } from "@/lib/mockData";
import { getRankedLeaderboard } from "@/lib/utils";


const features = [
  { icon: Calculator, title: "Carbon Calculator",       desc: "Measure your footprint across transport, food, energy and more in 5 quick steps.", color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"   },
  { icon: Activity,   title: "Daily Habit Tracker",     desc: "Log eco-friendly habits and earn Eco Points for sustainable daily choices.",         color: "text-teal-400",  bg: "bg-teal-500/10 border-teal-500/20"     },
  { icon: Brain,      title: "AI Sustainability Coach", desc: "Get personalised recommendations from our AI to reduce your environmental impact.",   color: "text-violet-400",bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: Target,     title: "Weekly Challenges",       desc: "Eco challenges designed to push your sustainability journey further every week.",      color: "text-orange-400",bg: "bg-orange-500/10 border-orange-500/20" },
  { icon: BarChart3,  title: "Progress Analytics",      desc: "Beautiful charts and insights showing your emission trends and savings over time.",    color: "text-blue-400",  bg: "bg-blue-500/10 border-blue-500/20"     },
  { icon: Users,      title: "Community Leaderboard",   desc: "See how you rank with other eco-warriors worldwide and climb to the top.",             color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20"   },
];

const steps = [
  { n: "01", icon: Calculator,   title: "Calculate",  desc: "Answer 5 quick questions about your lifestyle and daily habits." },
  { n: "02", icon: TrendingDown, title: "Discover",   desc: "See your full carbon breakdown with a personalised sustainability score." },
  { n: "03", icon: Target,       title: "Improve",    desc: "Get AI-powered tips and complete weekly eco challenges to level up." },
];

const stats = [
  { value: "127K+",  label: "Members" },
  { value: "847K kg", label: "CO₂ Saved" },
  { value: "42K",     label: "Trees Equivalent" },
];

export default function LandingPage() {
  const { profile } = useSession();
  const { displayName, ecoPoints, carbonScore, totalSaved, level, levelIcon } = profile;

  // Compute leaderboard and user percentile rank using the shared utility helper
  const { myRank, rankPercentile } = getRankedLeaderboard(
    displayName,
    carbonScore,
    totalSaved,
    ecoPoints,
    mockLeaderboard
  );
  return (
    <div className="min-h-screen app-bg">

      {/* ────────────────── Hero ────────────────── */}
      <section
        className="px-4 sm:px-6 py-12 md:py-20 lg:py-24"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
        }}
      >
        {/* Two-column layout on desktop: copy left, visual right */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — headline + CTAs */}
          <div className="flex flex-col items-start">
            <div className="badge badge-green mb-6">
              <Leaf className="w-3.5 h-3.5" />
              No account needed — start tracking instantly
            </div>

            <h1 className="text-hero mb-6 text-balance">
              <span className="gradient-text">Track Today.</span>
              <br />
              <span className="text-white">Save Tomorrow.</span>
            </h1>

            <p className="text-body-custom text-base mb-10 max-w-lg leading-relaxed">
              Understand your carbon footprint and build smarter habits with
              AI-powered insights. Your progress is saved locally — no sign-up required.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <Link href="/calculator" className="btn-base btn-primary btn-lg">
                <Calculator className="w-5 h-5" />
                Calculate My Footprint
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="btn-base btn-secondary btn-lg">
                View Dashboard
              </Link>
            </div>

            {/* Social proof stats with top border/divider */}
            <div className="w-full pt-8 border-t border-white/[0.06] mt-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Global Community Impact</div>
              <div
                className="card card-md max-w-md"
                style={{ borderColor: "rgba(255, 255, 255, 0.05)", background: "rgba(10, 18, 10, 0.25)" }}
              >
                <div className="grid grid-cols-3 gap-4">
                  {stats.map(({ value, label }) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-white font-black text-xl leading-none tracking-tight">{value}</span>
                      <span className="text-slate-500 text-[0.6875rem] font-bold uppercase tracking-wider mt-2 leading-none">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — floating stat cards visual */}
          <div className="hidden lg:flex flex-col gap-4 relative">
            <div
              className="card card-lg shadow-2xl"
              style={{ borderColor: "rgba(34,197,94,0.15)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {levelIcon}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Your Carbon Score</div>
                  <div className="text-slate-500 text-xs">Updated today</div>
                </div>
                <div className="ml-auto text-green-400 font-black text-2xl tracking-tight">{carbonScore}/100</div>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${carbonScore}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-slate-600 text-xs font-bold">0</span>
                <span className="text-green-500 text-xs font-bold">Target: 100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "CO₂ Saved", value: `${totalSaved} kg`, color: "text-emerald-400" },
                { label: "Eco Points", value: ecoPoints.toLocaleString(), color: "text-green-400" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="card card-lg"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <span className={`font-black text-2xl leading-none tracking-tight ${color}`}>{value}</span>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">{label}</span>
                </div>
              ))}
            </div>

            <div className="card card-lg flex flex-row items-center gap-4" style={{ borderColor: "rgba(234,179,8,0.12)" }}>
              <span className="text-3xl">🏆</span>
              <div>
                <div className="text-white font-bold text-sm">{level}</div>
                <div className="text-slate-500 text-xs">Rank #{myRank} on leaderboard</div>
              </div>
              <div className="ml-auto">
                <span className="badge badge-yellow text-[0.7rem]">Top {rankPercentile}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Horizontal Divider ── */}
      <div
        className="px-4 sm:px-6"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
        }}
      >
        <div className="divider" />
      </div>

      {/* ────────────────── How It Works ────────────────── */}
      <section
        className="px-4 sm:px-6 py-12 md:py-20"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
        }}
      >
        <div className="text-center mb-14">
          <div className="badge badge-green mb-4">Three Simple Steps</div>
          <h2 className="text-section-title mb-4">How It Works</h2>
          <p className="text-body-custom max-w-md mx-auto text-balance">
            From first click to sustainable habits in minutes — no sign-up required.
          </p>
        </div>

        <div className="col-3" style={{ alignItems: "stretch" }}>
          {steps.map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="card card-xl flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-inner shrink-0">
                  <Icon className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-green-500/40 text-5xl font-black tracking-tighter leading-none select-none">
                  {n}
                </span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2.5 tracking-tight">{title}</h3>
                <p className="text-body-custom leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div
        className="px-4 sm:px-6"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
        }}
      >
        <div className="divider" />
      </div>

      {/* ────────────────── Features ────────────────── */}
      <section
        className="px-4 sm:px-6 py-12 md:py-20"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
        }}
      >
        <div className="text-center mb-14">
          <div className="badge badge-green mb-4">Full Toolkit</div>
          <h2 className="text-section-title mb-4">Everything You Need</h2>
          <p className="text-body-custom max-w-md mx-auto text-balance">
            A complete sustainability platform in one place — beautiful, fast, and private.
          </p>
        </div>

        <div className="col-3" style={{ alignItems: "stretch" }}>
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="card card-xl flex flex-col gap-5 group"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} border flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-2 tracking-tight">{title}</h3>
                <p className="text-body-custom text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div
        className="px-4 sm:px-6"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
        }}
      >
        <div className="divider" />
      </div>

      {/* ────────────────── CTA Banner ────────────────── */}
      <section
        className="px-4 sm:px-6 py-12 md:py-20"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
        }}
      >
        <div
          className="card card-xl flex flex-col lg:flex-row items-center justify-between gap-10"
          style={{ borderColor: "rgba(34,197,94,0.12)", background: "rgba(10, 22, 12, 0.60)" }}
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 flex-1">
            <div className="text-5xl shrink-0">🌱</div>
            <div>
              <h2 className="text-section-title mb-3 text-balance">Ready to Start?</h2>
              <p className="text-body-custom max-w-lg leading-relaxed">
                Your data stays on your device. No account, no email — just start tracking and building greener habits today.
              </p>
            </div>
          </div>
          <Link href="/calculator" className="btn-base btn-primary btn-lg shrink-0">
            Start Free Today
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ────────────────── Footer Spacer ────────────────── */}
      <div className="border-t border-white/[0.045]">
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            maxWidth: "var(--container)",
            margin: "0 auto",
            padding: "var(--space-8) var(--space-6)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shadow-md shadow-green-500/15">
              <Leaf className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-white text-sm tracking-tight uppercase">EcoTrack</span>
          </div>

          {/* Copyright */}
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider text-center">
            © 2026 EcoTrack — Building a greener future 🌱
          </p>
        </div>
      </div>
    </div>
  );
}
