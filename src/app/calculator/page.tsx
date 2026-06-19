"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, Bike, Bus, Train, Plane, Footprints, Zap, Leaf,
  ShoppingBag, Trash2, CheckCircle2, ChevronRight, ChevronLeft,
  RefreshCw, CheckCheck, BarChart2, Brain,
} from "lucide-react";
import { calculateCarbonFootprint, type CalculatorData } from "@/lib/calculator";
import { cn, getScoreBg, getScoreLabel } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";

const STEPS = [
  { id: 1, title: "Transportation", icon: Car,        desc: "How do you get around?",     tip: "Transportation accounts for 27% of average household emissions. Sustainable options make the biggest impact." },
  { id: 2, title: "Energy",         icon: Zap,        desc: "Your electricity usage",      tip: "Average household grids emit 0.82 kg CO2/kWh. Renewable energy switches offset this significantly." },
  { id: 3, title: "Food",           icon: Leaf,       desc: "Your dietary choices",        tip: "Heavy meat diets produce 4x the emissions of plant-based options due to supply chains." },
  { id: 4, title: "Shopping",       icon: ShoppingBag,desc: "Your purchase habits",        tip: "New manufacturing accounts for substantial emissions. Opting for essentials reduces demand." },
  { id: 5, title: "Waste",          icon: Trash2,     desc: "Waste & recycling",           tip: "Recycling and composting can prevent up to 8 kg of monthly CO2 emissions from landfills." },
];

const TRANSPORT_OPTIONS = [
  { value: "car",     label: "Car",      icon: Car,        co2: "High",     co2Class: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "bike",    label: "Bicycle",  icon: Bike,       co2: "Zero",     co2Class: "text-green-400 bg-green-500/10 border-green-500/20"   },
  { value: "bus",     label: "Bus",      icon: Bus,        co2: "Low",      co2Class: "text-teal-400 bg-teal-500/10 border-teal-500/20"      },
  { value: "train",   label: "Train",    icon: Train,      co2: "Very Low", co2Class: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"      },
  { value: "metro",   label: "Metro",    icon: Train,      co2: "Minimal",  co2Class: "text-blue-400 bg-blue-500/10 border-blue-500/20"      },
  { value: "flight",  label: "Flight",   icon: Plane,      co2: "V. High",  co2Class: "text-red-400 bg-red-500/10 border-red-500/20"         },
  { value: "walking", label: "Walking",  icon: Footprints, co2: "Zero",     co2Class: "text-green-400 bg-green-500/10 border-green-500/20"   },
];

const FOOD_OPTIONS = [
  { value: "vegan",      label: "Vegan",       emoji: "🌿", desc: "Plant-based only"         },
  { value: "vegetarian", label: "Vegetarian",  emoji: "🥗", desc: "No meat, includes dairy"  },
  { value: "mixed",      label: "Mixed Diet",  emoji: "🍽️", desc: "Occasional meat"          },
  { value: "heavy-meat", label: "Heavy Meat",  emoji: "🥩", desc: "Daily meat consumption"   },
];

const SHOPPING_OPTIONS = [
  { value: "low",    label: "Minimal",  emoji: "💚", desc: "Only essentials"            },
  { value: "medium", label: "Moderate", emoji: "🛍️", desc: "Regular monthly purchases" },
  { value: "high",   label: "Frequent", emoji: "🛒", desc: "Heavy shopper"             },
];

const SpeedometerGauge = ({ score }: { score: number }) => {
  const radius = 64;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-56 h-32 flex flex-col items-center justify-end overflow-hidden select-none">
      <svg className="w-56 h-56 -rotate-180 absolute -bottom-28" viewBox="0 0 150 150">
        <circle
          cx="75" cy="75" r={radius}
          stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          fill="none" strokeLinecap="round"
        />
        <motion.circle
          cx="75" cy="75" r={radius}
          stroke="url(#scoreGrad)" strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          fill="none" strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#ef4444" />
            <stop offset="60%"  stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10 mb-2">
        <div className="text-6xl font-black text-white tracking-tighter leading-none">{score}</div>
        <div className="text-label mt-2">Sustainability Score</div>
      </div>
    </div>
  );
};

export default function CalculatorPage() {
  const { saveFootprint } = useSession();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CalculatorData>({
    transport: "car", weeklyDistance: 50, monthlyElectricity: 200,
    foodHabits: "mixed", shoppingHabits: "medium",
    recyclesRegularly: false, composts: false, plasticUsage: "medium",
  });
  const [result, setResult] = useState<ReturnType<typeof calculateCarbonFootprint> | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = () => {
    const r = calculateCarbonFootprint(data);
    setResult(r);
    setShowResult(true);
  };

  const reset = () => {
    setShowResult(false);
    setResult(null);
    setStep(0);
    setSaved(false);
  };

  const handleSave = () => {
    if (result) {
      saveFootprint({
        ...result,
        transport: data.transport,
        foodHabits: data.foodHabits,
      });
      setSaved(true);
    }
  };

  const currentStep = STEPS[step];
  const StepIcon = currentStep?.icon;

  return (
    <div className="page">
      <div className="page-inner section-gap">

        {/* Page Header */}
        <div className="page-header">
          <div className="badge badge-green mb-4">
            <Zap className="w-3.5 h-3.5" />
            Carbon Calculator
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Calculate Your <span className="gradient-text">Footprint</span>
          </h1>
          <p className="text-body-custom mt-2">
            5 quick steps to understand your environmental impact
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="calculator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Stepper */}
              <div className="mb-12 max-w-3xl mx-auto">
                <div className="relative flex items-center justify-between w-full">
                  {/* Background Track Line */}
                  <div className="absolute left-[18px] right-[18px] top-[18px] -translate-y-1/2 h-[2px] bg-white/[0.06] -z-10">
                    {/* Active progress bar */}
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                    />
                  </div>

                  {STEPS.map((s, i) => {
                    const isCompleted = i < step;
                    const isActive    = i === step;
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (i <= step) setStep(i);
                          }}
                          disabled={i > step}
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-green-500/30",
                            isCompleted
                              ? "bg-green-500 text-white cursor-pointer"
                              : isActive
                              ? "bg-slate-950 border-2 border-green-500 text-green-400 cursor-default"
                              : "bg-slate-950 border border-white/[0.06] text-slate-500 cursor-not-allowed"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          className={cn(
                            "text-[0.65rem] font-bold uppercase tracking-wider leading-tight text-center hidden sm:block",
                            isActive ? "text-green-400" : isCompleted ? "text-slate-400" : "text-slate-600"
                          )}
                        >
                          {s.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-label text-center">Step {step + 1} of {STEPS.length}</div>
              </div>

              {/* Step Card */}
              <div className="chart-card">
                {/* Step header */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-8 pb-6 border-b border-white/[0.045]">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 shadow-inner">
                    {StepIcon && <StepIcon className="w-6 h-6 text-green-400" />}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white tracking-tight mb-1">{currentStep.title}</h2>
                    <p className="text-body-custom text-sm">{currentStep.desc}</p>
                  </div>
                  {/* Tip callout */}
                  <div
                    className="p-4 rounded-xl border border-green-500/12 bg-green-500/5 flex gap-3 max-w-sm"
                    style={{ alignSelf: "flex-start" }}
                  >
                    <span className="text-green-400 mt-0.5 shrink-0">💡</span>
                    <p className="text-slate-400 text-xs leading-relaxed">{currentStep.tip}</p>
                  </div>
                </div>

                {/* ── Step 1: Transport ── */}
                {step === 0 && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <div className="text-label mb-4">Primary transport mode</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {TRANSPORT_OPTIONS.map(({ value, label, icon: Icon, co2, co2Class }) => (
                          <button
                            key={value}
                            onClick={() => setData((d) => ({ ...d, transport: value as CalculatorData["transport"] }))}
                            className={cn(
                              "flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-left outline-none focus-visible:ring-2 focus-visible:ring-green-500/30",
                              data.transport === value
                                ? "border-green-500/30 bg-green-500/6 shadow-inner"
                                : "border-white/[0.05] hover:border-slate-700/60 hover:bg-slate-900/20"
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <Icon className={cn("w-5 h-5", data.transport === value ? "text-green-400" : "text-slate-400")} />
                              {data.transport === value && (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <div>
                              <div className={cn("font-bold text-sm", data.transport === value ? "text-white" : "text-slate-300")}>{label}</div>
                              <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1 inline-block ${co2Class}`}>{co2}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-label">Weekly distance</div>
                        <span className="text-green-400 font-black text-sm">{data.weeklyDistance} km</span>
                      </div>
                      <div className="slider-container">
                        <input
                          type="range" min={0} max={500} step={5}
                          value={data.weeklyDistance}
                          onChange={(e) => setData((d) => ({ ...d, weeklyDistance: +e.target.value }))}
                          className="range-slider-custom"
                        />
                        <div className="flex justify-between text-label mt-2" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                          <span>0 km</span>
                          <span>500 km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Energy ── */}
                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-label">Monthly electricity (kWh)</div>
                        <span className="text-green-400 font-black text-sm">{data.monthlyElectricity} kWh</span>
                      </div>
                      <div className="slider-container">
                        <input
                          type="range" min={0} max={1000} step={10}
                          value={data.monthlyElectricity}
                          onChange={(e) => setData((d) => ({ ...d, monthlyElectricity: +e.target.value }))}
                          className="range-slider-custom"
                        />
                        <div className="flex justify-between text-label mt-2" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                          <span>0 kWh</span>
                          <span>1,000 kWh</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "solarPanels",     label: "Solar Panels",       desc: "You have solar panels installed" },
                        { key: "greenEnergyPlan",  label: "Green Energy Plan",  desc: "Renewable electricity provider"  },
                      ].map(({ key, label, desc }) => (
                        <button
                          key={key}
                          onClick={() => setData((d) => ({ ...d, [key]: !d[key as keyof CalculatorData] }))}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 outline-none",
                            (data as unknown as Record<string, boolean | string>)[key]
                              ? "border-green-500/25 bg-green-500/6"
                              : "border-white/[0.05] hover:border-slate-700/50"
                          )}
                        >
                          <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all", (data as unknown as Record<string, boolean | string>)[key] ? "bg-green-500 border-green-500" : "border-slate-700")}>
                            {(data as unknown as Record<string, boolean | string>)[key] && <span className="text-white text-[10px] font-black">✓</span>}
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm">{label}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Food ── */}
                {step === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FOOD_OPTIONS.map(({ value, label, emoji, desc }) => (
                      <button
                        key={value}
                        onClick={() => setData((d) => ({ ...d, foodHabits: value as CalculatorData["foodHabits"] }))}
                        className={cn(
                          "flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-green-500/30",
                          data.foodHabits === value
                            ? "border-green-500/25 bg-green-500/6"
                            : "border-white/[0.05] hover:border-slate-700/50 hover:bg-slate-900/15"
                        )}
                      >
                        <span className="text-3xl shrink-0">{emoji}</span>
                        <div className="flex-1">
                          <div className={cn("font-bold text-sm", data.foodHabits === value ? "text-white" : "text-slate-300")}>{label}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{desc}</div>
                        </div>
                        {data.foodHabits === value && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Step 4: Shopping ── */}
                {step === 3 && (
                  <div className="flex flex-col gap-4">
                    {SHOPPING_OPTIONS.map(({ value, label, emoji, desc }) => (
                      <button
                        key={value}
                        onClick={() => setData((d) => ({ ...d, shoppingHabits: value as CalculatorData["shoppingHabits"] }))}
                        className={cn(
                          "flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200 outline-none",
                          data.shoppingHabits === value
                            ? "border-green-500/25 bg-green-500/6"
                            : "border-white/[0.05] hover:border-slate-700/50 hover:bg-slate-900/15"
                        )}
                      >
                        <span className="text-3xl shrink-0">{emoji}</span>
                        <div className="flex-1">
                          <div className={cn("font-bold text-sm", data.shoppingHabits === value ? "text-white" : "text-slate-300")}>{label}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{desc}</div>
                        </div>
                        {data.shoppingHabits === value && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Step 5: Waste ── */}
                {step === 4 && (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "recyclesRegularly", label: "Recycles Regularly", desc: "Separate paper, plastic, glass" },
                        { key: "composts",           label: "Composts Food",     desc: "Composting organic waste"       },
                      ].map(({ key, label, desc }) => (
                        <button
                          key={key}
                          onClick={() => setData((d) => ({ ...d, [key]: !d[key as keyof CalculatorData] }))}
                          className={cn(
                            "flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200 outline-none",
                            (data as unknown as Record<string, boolean | string>)[key]
                              ? "border-green-500/25 bg-green-500/6"
                              : "border-white/[0.05] hover:border-slate-700/50"
                          )}
                        >
                          <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center shrink-0", (data as unknown as Record<string, boolean | string>)[key] ? "bg-green-500 border-green-500" : "border-slate-700")}>
                            {(data as unknown as Record<string, boolean | string>)[key] && <span className="text-white text-[10px] font-black">✓</span>}
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm">{label}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div>
                      <div className="text-label mb-4">Single-use plastic usage</div>
                      <div className="flex gap-3">
                        {(["low", "medium", "high"] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => setData((d) => ({ ...d, plasticUsage: v }))}
                            className={cn(
                              "flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all duration-200 outline-none",
                              data.plasticUsage === v
                                ? "border-green-500/25 bg-green-500/8 text-green-400"
                                : "border-white/[0.05] text-slate-400 hover:border-slate-700/50"
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-10 pt-6 border-t border-white/[0.045]">
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    disabled={step === 0}
                    className="btn-base btn-secondary disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  {step < STEPS.length - 1 ? (
                    <button onClick={() => setStep((s) => s + 1)} className="btn-base btn-primary">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={handleSubmit} className="btn-base btn-primary">
                      <Zap className="w-4 h-4" /> Calculate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Results screen */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-8"
            >
              {/* Save banner */}
              {!saved && result && (
                <div className="chart-card flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(34,197,94,0.14)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="text-white font-bold text-sm">Save these results?</div>
                      <div className="text-body-custom text-xs">Your footprint will be added to your profile and analytics.</div>
                    </div>
                  </div>
                  <button onClick={handleSave} className="btn-base btn-primary shrink-0">
                    <CheckCheck className="w-4 h-4" /> Save to Profile
                  </button>
                </div>
              )}
              {saved && (
                <div className="flex items-center gap-3 p-5 rounded-2xl border border-green-500/22 bg-green-500/5 text-green-400 font-bold text-sm">
                  <CheckCheck className="w-5 h-5 shrink-0" />
                  Results saved to your session!
                </div>
              )}

              {/* Main results grid */}
              <div className="grid lg:grid-cols-5 gap-8 items-start">

                {/* Left: Score gauge + monthly/yearly numbers */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="chart-card items-center text-center">
                    <p className="text-label mb-6">Calculated Score</p>
                    <SpeedometerGauge score={result!.sustainabilityScore} />
                    <div className={cn("inline-block px-5 py-2 rounded-full text-white font-extrabold text-xs uppercase tracking-widest mt-6 mb-5", getScoreBg(result!.sustainabilityScore))}>
                      {getScoreLabel(result!.sustainabilityScore)}
                    </div>
                    <p className="text-body-custom text-xs leading-relaxed max-w-xs">
                      Your score indicates {getScoreLabel(result!.sustainabilityScore).toLowerCase()} sustainability habits. Keep going!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Monthly CO2", value: result!.monthlyEmissions },
                      { label: "Yearly CO2",  value: result!.yearlyEmissions  },
                    ].map(({ label, value }) => (
                      <div key={label} className="chart-card items-center text-center gap-1">
                        <div className="text-label">{label}</div>
                        <div className="text-2xl font-black text-white tracking-tight mt-1">{value.toLocaleString()}</div>
                        <div className="text-label">kg</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Breakdown + Equivalents */}
                <div className="lg:col-span-3 flex flex-col gap-6">

                  {/* Breakdown */}
                  <div className="chart-card">
                    <div className="chart-card-header">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <BarChart2 className="w-4 h-4 text-green-400" />
                      </div>
                      <h3 className="chart-card-title">Emissions Breakdown</h3>
                    </div>
                    <div className="flex flex-col gap-5">
                      {[
                        { label: "Transport", value: result!.transportEmissions, emoji: "🚗", color: "bg-green-500"  },
                        { label: "Food",      value: result!.foodEmissions,      emoji: "🥗", color: "bg-teal-500"   },
                        { label: "Energy",    value: result!.energyEmissions,    emoji: "⚡", color: "bg-violet-500" },
                        { label: "Shopping",  value: result!.shoppingEmissions,  emoji: "🛍️", color: "bg-yellow-500" },
                        { label: "Waste",     value: result!.wasteEmissions,     emoji: "♻️", color: "bg-red-500"    },
                      ].map(({ label, value, emoji, color }) => {
                        const pct = Math.round((value / result!.monthlyEmissions) * 100);
                        return (
                          <div key={label}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-300 font-bold text-sm flex items-center gap-2">
                                <span>{emoji}</span> {label}
                              </span>
                              <span className="text-white font-extrabold text-sm">
                                {value.toLocaleString()} kg
                                <span className="text-slate-500 font-medium ml-1">({pct}%)</span>
                              </span>
                            </div>
                            <div className="progress-bar-track">
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`progress-bar-fill ${color}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Equivalents */}
                  <div className="chart-card">
                    <div className="chart-card-header">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="chart-card-title">Equivalent To</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { emoji: "🌳", value: Math.round(result!.monthlyEmissions / 14),    label: "Trees to offset" },
                        { emoji: "🚗", value: Math.round(result!.monthlyEmissions / 0.21),  label: "km by car"       },
                        { emoji: "💡", value: Math.round(result!.monthlyEmissions / 0.082), label: "LED hours"       },
                      ].map(({ emoji, value, label }) => (
                        <div key={label} className="p-4 rounded-xl bg-slate-950/25 border border-white/[0.04] text-center flex flex-col items-center gap-2">
                          <div className="text-3xl">{emoji}</div>
                          <div className="text-xl font-black text-white tracking-tight">{value.toLocaleString()}</div>
                          <div className="text-label leading-tight">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Tip */}
                  <div className="p-5 rounded-2xl border border-violet-500/15 bg-violet-500/5 flex gap-4 items-start">
                    <Brain className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-bold text-sm mb-1">AI Recommendation</div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Based on your profile, switching to public transport 3x/week and adopting a mixed-to-vegetarian diet could reduce your footprint by up to 35%.
                      </p>
                    </div>
                  </div>

                  <button onClick={reset} className="btn-base btn-secondary w-full">
                    <RefreshCw className="w-4 h-4" /> Recalculate Footprint
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}


