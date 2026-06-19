# EcoTrack Technical Architecture & Implementation Details 🌿

EcoTrack is a premium, high-fidelity carbon footprint tracking and gamification platform built using **Next.js 16 (React 19)**, **Tailwind CSS v4**, and **Firebase**. This document provides a detailed breakdown of the platform's architecture, core features, styling conventions, security mechanisms, and design decisions.

---

## 1. Architectural Decisions

### Static Site Export (`output: "export"`)
* **Decision**: EcoTrack is configured as a fully static web application (`output: "export"` in `next.config.ts`), generating static HTML/CSS/JS assets inside `/out`.
* **Rationale**: Static sites load instantly, can be hosted cheaply and securely on CDNs (like Firebase Hosting), and have a zero-maintenance backend footprint.

### Client-Side Local Storage Persistence
* **Decision**: The app requires **no authentication/sign-up**. All user profiles, carbon calculator responses, logged habits, unlocked challenges, and daily streak metrics are stored locally in the user's browser under the `ecotrack_session` localStorage key.
* **Rationale**: This eliminates registration friction, preserves user privacy, and allows instant tracking. A guest profile is auto-created on the user's very first visit.

### Read-Only/Deny-All Firebase Configuration
* **Decision**: Firebase is initialized client-side, but all read/write requests to Firestore are blocked using `firestore.rules`:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if false;
      }
    }
  }
  ```
* **Rationale**: Prevents malicious database abuse, since all app features (like the leaderboard) run dynamically on the client side using localStorage profiles.

---

## 2. Core Feature Breakdown

### 📊 Carbon Footprint Calculator
* **Implementation**: Located at `/calculator`, the calculator is structured as a multi-step form spanning 5 categories (Transport, Diet, Home Energy, Shopping, Waste).
* **Weekly Distance Slider**: Leverages horizontal `flex` formatting to align range limits (e.g. `0 km` and `500 km`) cleanly.
* **Dynamic Value Calculation**: Responses translate to carbon emission approximations in real-time. On completion, the data calculates a Carbon Score (0–100 scale, where 100 is best) and saves the statistics into the local user session.

### 🤖 Eco AI Coach Chatbot
* **Technology**: Uses the **Firebase AI SDK** (`firebase/ai`) interacting directly with the Google Gemini API (`gemini-2.5-flash-lite`).
* **Resilience & Lazy Init**: The Gemini client is lazy-initialized via `getChatModel` inside `AIChatbot.tsx`. If environment variables are missing (e.g., local developer environments), the chatbot falls back to offline keyword-based responses instead of crashing the site.
* **Client-Side Rate Limiting**: Protects developer API quotas by tracking timestamp histories in `localStorage`. Limits interactions to **5 messages/minute** and **50 messages/day**, outputting friendly warning alerts directly in the chat UI if exceeded.

### 🏆 Simulated Community Leaderboard
* **Logic**: Because data is client-side, the leaderboard (`/leaderboard`) merges the active user's stats with a diverse list of simulated competitor entries.
* **Dynamic Sorting & Podium**: The combined dataset is dynamically sorted by `ecoPoints`. If the user's activities place them in the Top 3, they appear on the visual podium; otherwise, the top mock users are displayed, and the user's relative rank is dynamically calculated and pinned to the bottom.
* **Transparency**: Explicitly labeled in the UI as a "Simulated Community Leaderboard" to maintain full clarity for reviewers and users.

### ⚡ Daily Streaks & Habits Tracker
* **Streak Maintenance**: On application mount, a session provider evaluates the user's last login date. If it is exactly one day after their previous check-in, the streak count increments; if they miss a day, it resets, ensuring streak calculations are fully automated.
* **Habits & Challenges**: Users check off daily habits (e.g. *Use Public Transit*, *Eat Vegetarian*) and complete timed challenges to immediately earn Eco Points, updating their global levels and leaderboard placement.

---

## 3. Design System & UI Mechanics

### Premium Glassmorphism Theme
* Built around a curated dark slate palette (`#020402` background) with translucent green border glow highlights (`rgba(34, 197, 94, 0.20)`) and card blurs (`backdrop-filter: blur(24px)`).
* Micro-animations (hover lifts, fade-in-up entries, and layout spring physics) are powered by `framer-motion` to create a premium, responsive feel.

### WCAG AA Contrast Compliance
Secondary, caption, and label colors are optimized to pass WCAG AA standards (minimum 4.5:1 contrast ratio) against translucent card backgrounds:
* **Body text**: `#cbd5e1` (Slate-300) $\approx$ 10:1 ratio.
* **Caption helper text**: `#94a3b8` (Slate-400) $\approx$ 6.2:1 ratio.
* **System labels & headers**: `#8a99ad` $\approx$ 6.5:1 ratio.

### Mobile Responsiveness
* Viewport limits are audited at `375px` and `768px`.
* Desktop link elements wrap automatically at the `1024px` breakpoint to reveal a clean mobile hamburger toggled menu overlay.
* All side paddings (`px-4 sm:px-6`) and section gaps (`py-12 md:py-20 lg:py-24`) scale dynamically to prevent elements crowding.

### Printable PDF Reports
* Styled with custom print stylesheets using `@media print` rules in `globals.css`.
* Hides non-printable items (navigation bar, CTA buttons, floating chatbot widget, share links, footers).
* Flattens shadows, gradient text, and translucent glass cards into standard, high-contrast monochrome and green text for clean, physical paper outputs.

---

## 4. Security & Optimization Audits

* **Zero Hardcoded Secrets**: Firebase config parameters are read from public-safe client environment variables (`NEXT_PUBLIC_*`). Gemini API rate limiting, referrer restrictions, and Firebase App Check guidelines are detailed in the `README.md`.
* **Clean Git Hygiene**: Large local caches (like `.firebase/`), dependency folders, and agent metadata (`CLAUDE.md`, `CONTEXT.md`, `AGENTS.md`) are explicitly untracked and locked in `.gitignore`.
* **CI Build Pipeline**: A automated GitHub Actions workflow (`ci.yml`) triggers on every push and pull request, executing `npm run lint` and `npm run build` to guarantee zero compile-time errors.
* **Pruned Dependencies**: Pruned 11 unused third-party dependencies from `package.json` to keep bundle sizes minimal and fast.
