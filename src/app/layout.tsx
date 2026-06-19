import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/contexts/SessionContext";
import { Navbar } from "@/components/layout/Navbar";
import { AIChatbot } from "@/components/chat/AIChatbot";

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
        <SessionProvider>
          <div className="min-h-screen app-bg">
            <Navbar />
            <main className="w-full">{children}</main>
            <AIChatbot />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
