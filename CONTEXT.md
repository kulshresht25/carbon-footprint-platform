# EcoTrack — AI Context File

> **Purpose of this file**: Drop this single file into your AI chat (or paste its contents) to give any model full context about this project. No need to read individual source files.

---

## 1. Project Overview

**EcoTrack** is a carbon footprint tracking web application. Users answer questions about their lifestyle (transport, food, energy, shopping, waste) and receive a sustainability score plus AI-powered improvement suggestions.

- **Live URL**: https://ecotrack-kul25.web.app
- **Firebase Project**: `ecotrack-kul25`
- **Local dev**: `npm run dev` → http://localhost:3000

### Key Design Decisions
- **No authentication** — session data stored in `localStorage` under key `ecotrack_session`. Guest profile is auto-created on first visit. No login/signup flow exists.
- **No Firestore reads/writes** — Firestore is configured but all rules deny access (`allow read, write: if false`). The app is fully client-side.
- **Static export** — `next.config.ts` uses `output: "export"`. All pages are pre-rendered as static HTML into `out/`. Deployed via Firebase Hosting.

---

## 2. Tech Stack

| Layer       | Technology |
|-------------|------------|
| Framework   | Next.js 16 (App Router, `"use client"` components) |
| Language    | TypeScript |
| Styling     | Tailwind CSS v4 + custom `globals.css` design system |
| Charts      | Recharts (`AreaChart`, `BarChart`, `PieChart`) |
| Animations  | Framer Motion (minimal — mostly fade/slide-in) |
| Icons       | Lucide React |
| Fonts       | Inter (Google Fonts, loaded via `next/font`) |
| Hosting     | Firebase Hosting |
| State       | React Context (`SessionContext`) + `localStorage` |

---

## 3. Directory Structure

```
carbon-footprint-platform/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout — wraps everything in SessionProvider + Navbar
│   │   ├── globals.css             # Design system (tokens, card, badge, page, stat-card, etc.)
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── dashboard/page.tsx      # Dashboard (/dashboard)
│   │   ├── calculator/page.tsx     # Carbon calculator (/calculator)
│   │   ├── profile/page.tsx        # User profile (/profile)
│   │   ├── analytics/page.tsx      # Charts & trends (/analytics)
│   │   ├── leaderboard/page.tsx    # Global leaderboard (/leaderboard)
│   │   └── auth/page.tsx           # Redirects → /dashboard (auth removed)
│   │
│   ├── contexts/
│   │   └── SessionContext.tsx      # THE session layer — reads/writes localStorage
│   │
│   ├── components/
│   │   ├── layout/Navbar.tsx       # Sticky top nav — logo, links, guest name chip
│   │   ├── chat/AIChatbot.tsx      # Floating AI chat widget (Gemini API)
│   │   └── providers/              # (legacy — unused after auth removal)
│   │
│   └── lib/
│       ├── calculator.ts           # Carbon footprint calculation logic + types
│       ├── mockData.ts             # Mock data for charts, leaderboard, habits, challenges
│       ├── utils.ts                # cn(), getScoreColor(), getScoreBg(), getScoreLabel()
│       ├── firebase.ts             # Firebase app init (config from .env.local)
│       └── firestore.ts            # Firestore helpers (NOT used — kept for reference)
│
├── firebase.json                   # Hosting only — public: "out", cleanUrls: true
├── .firebaserc                     # { "default": "ecotrack-kul25" }
├── firestore.rules                 # Deny all — app uses localStorage
├── next.config.ts                  # { output: "export", reactStrictMode: true }
├── tailwind.config.ts              # (minimal — most styles in globals.css)
├── .env.local                      # Firebase config keys (NEXT_PUBLIC_FIREBASE_*)
└── CONTEXT.md                      # This file
```

---

## 4. SessionContext — The Core Data Layer

**File**: `src/contexts/SessionContext.tsx`

This replaces Firebase Auth entirely. It reads/writes to `localStorage['ecotrack_session']`.

### `SessionProfile` type
```ts
interface SessionProfile {
  displayName: string;    // Default: "Eco Warrior" — editable on Profile page
  ecoPoints: number;      // Increases by +50 on each calculator submission
  level: string;          // "Seed" | "Green Warrior" | "Earth Guardian" | "Climate Hero"
  levelIcon: string;      // "🌱" | "🌿" | "🌳" | "🏆"
  streak: number;         // Days streak (manual tracking, not auto-incremented yet)
  totalSaved: number;     // CO₂ kg saved (estimated from calculator result)
  carbonScore: number;    // 0–100 sustainability score from last calculator run
  footprints: FootprintRecord[];  // Array of calculator results (max 20, newest first)
  joinedAt: string;       // ISO date string
}
```

### `FootprintRecord` type
```ts
interface FootprintRecord {
  id: string;
  sustainabilityScore: number;
  monthlyEmissions: number;
  yearlyEmissions: number;
  transportEmissions: number;
  foodEmissions: number;
  energyEmissions: number;
  shoppingEmissions: number;
  wasteEmissions: number;
  transport: string;      // e.g. "car", "bike", "train"
  foodHabits: string;     // e.g. "vegan", "mixed", "heavy-meat"
  createdAt: string;      // ISO date string
}
```

### Hook usage
```tsx
import { useSession } from "@/contexts/SessionContext";

const { profile, loading, updateProfile, saveFootprint } = useSession();

// Update any field:
updateProfile({ displayName: "New Name" });

// Save a calculator result (also awards +50 eco points):
saveFootprint({ sustainabilityScore: 72, monthlyEmissions: 210, ... });
```

### Level thresholds
| Level          | Icon | Points needed |
|----------------|------|---------------|
| Seed           | 🌱   | 0             |
| Green Warrior  | 🌿   | 1,000         |
| Earth Guardian | 🌳   | 5,000         |
| Climate Hero   | 🏆   | 15,000        |

---

## 5. Calculator Logic

**File**: `src/lib/calculator.ts`

### Input (`CalculatorData`)
| Field               | Type    | Options / Range |
|---------------------|---------|-----------------|
| `transport`         | string  | `car` `bike` `bus` `train` `metro` `flight` `walking` |
| `weeklyDistance`    | number  | 0–500 km |
| `monthlyElectricity`| number  | 50–1000 kWh |
| `foodHabits`        | string  | `vegan` `vegetarian` `mixed` `heavy-meat` |
| `shoppingHabits`    | string  | `low` `medium` `high` |
| `recyclesRegularly` | boolean | saves ~5 kg/month |
| `composts`          | boolean | saves ~3 kg/month |
| `plasticUsage`      | string  | `low` `medium` `high` |

### Emission factors
- **Transport**: car=0.21, bus=0.089, train=0.041, metro=0.014, flight=0.255, bike/walking=0 kg CO₂/km
- **Electricity**: 0.82 kg CO₂/kWh (average grid)
- **Food**: vegan=55, vegetarian=75, mixed=130, heavy-meat=200 kg/month
- **Shopping**: low=30, medium=65, high=120 kg/month
- **Waste base**: 20 kg/month (reduced by recycling/composting, +3–8 for plastic)

### Score formula
```
score = clamp(0, 100,  round(100 - totalMonthlyEmissions / 6))
```

| Score | Label     |
|-------|-----------|
| 85+   | Excellent |
| 70+   | Good      |
| 55+   | Fair      |
| 40+   | Poor      |
| <40   | Critical  |

---

## 6. CSS Design System

**File**: `src/app/globals.css`

### Key classes
```css
/* Page layout — responsive padding conforming to 8-point system */
.page         { padding-top: 2rem; padding-bottom: 4rem; px: responsive; }
.page-inner   { max-width: 80rem; margin: 0 auto; } /* 1280px = max-w-7xl */

/* Cards */
.card         { background: dark-green; border: 1px subtle; border-radius: 1rem; }
.card-sm      { padding: 1rem; }     /* 16px */
.card-md      { padding: 1.5rem; }    /* 24px (standard) */
.card-lg      { padding: 2rem; }      /* 32px */

/* Stat displays */
.stat-card        { flex column; gap: 4px; padding: 16px 24px; border-radius: 16px; }
.stat-card-value  { font-size: 1.5rem; font-weight: 800; }
.stat-card-label  { font-size: 0.8125rem; color: slate-500; font-weight: 600; }

/* Progress bars */
.progress-bar-track  { height: 0.5rem; bg: white/6%; border-radius: 99px; overflow: hidden; }
.progress-bar-fill   { height: 100%; border-radius: 99px; background: green-500; }

/* Section heading (always with an icon) */
.section-title   { font-size: 1.125rem; font-weight: 600; color: #f1f5f9; }

/* Pill badges */
.badge           { inline-flex; gap: 0.375rem; padding: 0.3125rem 0.75rem; border-radius: 99px; }
.badge-green     { green tinted }
.badge-yellow    { yellow tinted }

/* Gradient text (headings) */
.gradient-text   { linear-gradient(130deg, #22c55e → #10b981), background-clip: text }
```

### Color palette
| Token   | Value     | Usage |
|---------|-----------|-------|
| App bg  | `#080d08` | Page background |
| Card bg | `rgba(13,20,13,0.85)` | All cards |
| Green   | `#22c55e` | Primary accent, CTA buttons, progress |
| Emerald | `#10b981` | Secondary green |
| Slate-400| `#94a3b8`| Body text |
| Slate-500| `#64748b`| Labels / muted text |

---

## 7. Pages Reference

### `/` — Landing Page (`app/page.tsx`)
- Hero with two CTA buttons (Calculate / Dashboard)
- "How It Works" — 3 steps
- Features grid — 6 cards
- CTA section + footer
- No auth, no session reads

### `/dashboard` — Dashboard (`app/dashboard/page.tsx`)
- Reads from `useSession()` for name, level, streak, eco points, carbon score
- Falls back to `mockWeeklyData` if no footprints recorded yet
- Sections: Header stats → 4 stat cards → Weekly chart + Pie → AI Insights + Daily Habits → Challenges + Achievements
- `mockAIInsights`, `mockHabits`, `mockChallenges` all come from `src/lib/mockData.ts`

### `/calculator` — Calculator (`app/calculator/page.tsx`)
- 5-step wizard: Transport → Energy → Food → Shopping → Waste
- On submit: calls `calculateCarbonFootprint()` → calls `saveFootprint()` → updates session
- Shows result with score, breakdown bars, equivalents (trees, km, LED hours)

### `/profile` — Profile (`app/profile/page.tsx`)
- Reads full session profile
- Inline display name edit (click pencil → type → Enter)
- Carbon Score ring (SVG animated circle)
- Achievements grid (unlocked by eco point thresholds)
- Footprint history (real data from session)
- Completed challenges from `mockChallenges`

### `/analytics` — Analytics (`app/analytics/page.tsx`)
- Uses `mockMonthlyData` for 12-month trend (AreaChart)
- Weekly comparison BarChart
- Category PieChart
- Goal completion with progress bars
- Carbon offset recommendations

### `/leaderboard` — Leaderboard (`app/leaderboard/page.tsx`)
- Uses `mockLeaderboard` — 10 entries
- Animated podium for top 3
- Full table with rank, name, score, CO₂ saved, points
- Rank 4 is highlighted as "You"

### `/auth` — Redirects to `/dashboard`
Auth was removed. This page just does `router.replace("/dashboard")`.

---

## 8. Navbar (`components/layout/Navbar.tsx`)

- Sticky, `slate-950/90` background, `backdrop-blur-md`
- Logo (green leaf icon + "EcoTrack")
- Nav links: Dashboard · Calculator · Analytics · Leaderboard · Profile
- Active link highlighted in green
- Guest chip: shows `profile.levelIcon` + `profile.displayName`
- Mobile: hamburger menu with full nav + user strip

---

## 9. Mock Data (`src/lib/mockData.ts`)

All mock data used when real session data isn't available:

| Export              | Used in |
|---------------------|---------|
| `mockWeeklyData`    | Dashboard weekly chart |
| `mockMonthlyData`   | Analytics trend chart |
| `mockCategoryData`  | Dashboard + Analytics pie chart |
| `mockLeaderboard`   | Leaderboard (10 entries) |
| `mockAIInsights`    | Dashboard AI insights panel |
| `mockHabits`        | Dashboard daily habits checklist |
| `mockChallenges`    | Dashboard challenges + Profile completed |

---

## 10. Environment Variables (`.env.local`)

All Firebase config keys are `NEXT_PUBLIC_*` so they're bundled client-side:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GEMINI_API_KEY=         ← Used by AIChatbot
```

> **Note**: Firebase is initialized in `src/lib/firebase.ts` but the app does not read or write Firestore. The chatbot uses the Gemini API key directly.

---

## 11. Deployment

```bash
# Build
npm run build          # outputs to /out

# Deploy (hosting only)
npx firebase-tools@latest deploy --only hosting --project ecotrack-kul25

# Dev server
npm run dev
```

- Firebase project: `ecotrack-kul25`
- Hosting URL: https://ecotrack-kul25.web.app
- Console: https://console.firebase.google.com/project/ecotrack-kul25

---

## 12. Things NOT Implemented (Future Work)

- Real leaderboard (currently all mock data — no backend)
- Real AI insights per-user (currently static mock)
- Streak auto-increment (streak value in session but not auto-updated daily)
- Social sharing (Share button exists on Profile but has no action)
- Push notifications / reminders
- Export report as PDF (Download button exists on Profile but has no action)
- Real challenges progress tracking (progress values are hardcoded in mock data)
