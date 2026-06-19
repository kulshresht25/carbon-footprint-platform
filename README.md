# EcoTrack 🌿

EcoTrack is a premium, high-fidelity carbon footprint tracking and gamified sustainability platform built on Next.js 16 (React 19), Tailwind CSS v4, and Firebase. It empowers individuals to calculate, analyze, and reduce their carbon footprint through daily habits, eco challenges, and an interactive AI Sustainability Coach.

🌐 **Live Deployment**: [ecotrack-kul25.web.app](https://ecotrack-kul25.web.app)

---

## 📸 Interface Preview

<div align="center">
  <!-- Place your screenshots/GIFs here -->
  <img src="public/assets/dashboard-preview.png" alt="EcoTrack Dashboard" width="800px" style="border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
  <p><em>EcoTrack Premium Glassmorphic Dashboard & Carbon Footprint Metrics</em></p>
</div>

---

## ✨ Features

- 📊 **Interactive Dashboard & Analytics**: Get immediate, visual insights into your carbon score, lifetime CO2 saved, and monthly emissions trends using rich, interactive Recharts visualizations.
- 🧮 **Carbon Footprint Calculator**: A detailed, multi-step calculation system analyzing transportation, diet, home energy usage, waste production, and shopping habits to compute an accurate sustainability score.
- 🤖 **Eco AI Coach Chatbot**: Powered by the Gemini API (`gemini-2.5-flash-lite`) via `firebase/ai`. Streams expert, context-aware answers to help you adopt sustainable lifestyles in real-time.
- ⚡ **Daily Streak & Habit Tracker**: Automatically updates your daily activity streak upon visiting, encouraging consistent green habits.
- 🏆 **Gamified Leaderboard**: Compete with a dynamic community where ranks shift dynamically based on points earned from completing habits and challenges.
- 🏅 **Achievements & Challenges**: Unlock unique, visual badges and complete timed challenges (e.g., *Plastic-Free Week*, *Vegetarian Weekend*) to earn Eco Points.
- 🖨️ **Printable PDF Reports**: Perfectly styled `@media print` layout that allows users to export a professional, clean, two-page carbon footprint report card.
- 🔗 **Social Sharing**: Share profile highlights (Carbon Score, CO2 saved, points) directly using the Web Share API or copy them to the clipboard with custom toast notifications.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Static Export)
- **Library**: React 19 (Hooks, Context API)
- **Styling**: Tailwind CSS v4 (Custom dark mode / glassmorphic UI design tokens)
- **Animations**: Framer Motion
- **AI Integration**: Firebase AI SDK (`firebase/ai`) + Google Gemini API (`gemini-2.5-flash-lite`)
- **Hosting**: Firebase Hosting

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd carbon-footprint-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure local environment variables**:
   Create a `.env.local` file in the root directory (matching [.env.example](.env.example)):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Firebase & Gemini Client Security

Since this application is compiled as a static client-side web application, configuration variables prefixed with `NEXT_PUBLIC_` are exposed in public client bundles. To prevent unauthorized API abuse and ensure resources are safeguarded, follow these production security practices:

1. **API Key Restriction**:
   - In the [Google Cloud Console API Credentials](https://console.cloud.google.com/apis/credentials), locate your Firebase API Key.
   - Set **API restrictions** to only allow specific APIs required by your application (e.g., `Generative Language API`, `Firebase Hosting API`).
   - Set **Application restrictions** to `HTTP referrers (web sites)` and add your production domain (`https://ecotrack-kul25.web.app/*`).

2. **Firebase App Check**:
   - Enforce **App Check** in the Firebase Console. App Check protects your Firebase resources from abuse by verifying that incoming traffic originates from your verified app instance.
   - For web apps, register your site with **reCAPTCHA Enterprise** or **reCAPTCHA v3** within App Check settings.

3. **Quota & Rate Limits**:
   - Limit the rate quotas for the `Generative Language API` in the Google Cloud Console to prevent denial of service (DoS) or unexpected billing spikes from brute-forced chatbot messages.

---

## 📦 Building & Deploying

To compile the project and build the optimized static production export:

```bash
npm run build
```

To deploy the static assets to Firebase Hosting:

```bash
npx firebase-tools deploy --only hosting
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 🏷️ Repository Metadata

- **Description**: A premium, gamified Next.js carbon footprint tracker featuring an interactive Eco AI Coach powered by the Gemini API.
- **Topics**: `nextjs`, `react`, `tailwind-css`, `gemini-api`, `firebase-hosting`, `sustainability`, `carbon-calculator`, `gamification`, `dashboard`, `portfolio`
