import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/contexts/SessionContext";
import { Navbar } from "@/components/layout/Navbar";
import { AIChatbot } from "@/components/chat/AIChatbot";
import { AxeAudit } from "@/components/layout/AxeAudit";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoTrack - Carbon Footprint Tracker",
  description:
    "Track your carbon footprint, get AI-powered sustainability recommendations, and build eco-friendly habits. No sign-up required.",
  keywords: [
    "carbon footprint",
    "sustainability",
    "eco-friendly",
    "climate action",
    "green living",
  ],
  openGraph: {
    title: "EcoTrack - Carbon Footprint Tracker",
    description: "Track Today. Save Tomorrow.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AxeAudit />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-500 focus:text-white focus:rounded-lg focus:font-extrabold focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Skip to main content
        </a>
        <SessionProvider>
          <div className="min-h-screen app-bg flex flex-col">
            <Navbar />
            <main id="main-content" className="w-full flex-grow">{children}</main>
            <AIChatbot />
            <footer className="w-full py-6 border-t border-white/[0.045] bg-slate-950/20 backdrop-blur-sm mt-12">
              <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <p className="text-xs text-slate-500 font-medium">
                  &copy; {new Date().getFullYear()} EcoTrack. All rights reserved.
                </p>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                  <span className="text-slate-400 font-semibold">Privacy Note:</span> All footprint data and habits are stored locally on your device. We collect no personally identifiable information (PII) and no registration or account is required.
                </p>
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
