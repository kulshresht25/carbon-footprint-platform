"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Leaf,
  LayoutDashboard,
  Calculator,
  BarChart3,
  Trophy,
  User,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";

const navLinks = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/calculator",  label: "Calculator",  icon: Calculator },
  { href: "/analytics",   label: "Analytics",   icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile",     label: "Profile",     icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useSession();
  const isLanding = pathname === "/";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 bg-slate-950/75 backdrop-blur-xl",
        "border-b border-white/[0.045]"
      )}
      style={{ height: "var(--navbar-h)" }}
    >
      <div
        className="h-full flex items-center justify-between gap-6"
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          paddingLeft: "var(--space-6)",
          paddingRight: "var(--space-6)",
        }}
      >
        {/* â”€â”€ Logo â”€â”€ */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className="flex items-center justify-center rounded-xl bg-green-500 shadow-lg shadow-green-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-green-500/30"
            style={{ width: "2rem", height: "2rem" }}
          >
            <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[1.0625rem] font-black text-white tracking-tight uppercase leading-none">
            Eco<span className="text-green-400">Track</span>
          </span>
        </Link>

        {/* â”€â”€ Desktop Nav Links â”€â”€ */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (pathname.startsWith(href) && href !== "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200",
                  "px-3.5 py-2",
                  active
                    ? "bg-slate-900 text-green-400 shadow-inner"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* â”€â”€ Right side: User chip + Mobile toggle â”€â”€ */}
        <div className="flex items-center gap-3">
          {/* User chip */}
          <div
            className="hidden sm:flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-slate-900/50"
            style={{ padding: "0.375rem 0.75rem" }}
          >
            <div
              className="flex items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 text-sm shrink-0"
              style={{ width: "1.625rem", height: "1.625rem" }}
            >
              {profile.levelIcon}
            </div>
            <div className="flex flex-col">
              <span className="text-[0.75rem] font-bold text-slate-200 leading-tight uppercase tracking-wider">
                {profile.displayName}
              </span>
              <span className="text-[0.625rem] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                {profile.ecoPoints.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
            className={cn(
              "lg:hidden flex items-center justify-center rounded-xl border border-white/[0.06] text-slate-400 hover:text-white hover:bg-slate-900 transition-colors duration-200",
              "btn-icon"
            )}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* â”€â”€ Mobile Menu â”€â”€ */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-b border-white/[0.045] bg-slate-950/98 backdrop-blur-xl shadow-2xl">
          {/* User strip */}
          <div className="flex items-center gap-3 border-b border-white/[0.045]" style={{ padding: "var(--space-4) var(--space-5)" }}>
            <div
              className="flex items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 text-xl shrink-0"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              {profile.levelIcon}
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">{profile.displayName}</div>
              <div className="text-slate-500 text-[0.6875rem] font-bold uppercase tracking-wider mt-0.5">
                {profile.level} · {profile.ecoPoints.toLocaleString()} pts
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col" style={{ padding: "var(--space-3) var(--space-4) var(--space-5)" }}>
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl text-sm font-semibold transition-all duration-200",
                    "px-4 py-3",
                    active
                      ? "bg-slate-900 text-green-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

