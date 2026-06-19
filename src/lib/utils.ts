import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
}

export function getScoreBg(score: number): string {
  if (score >= 70) return "from-green-500 to-emerald-600";
  if (score >= 40) return "from-yellow-500 to-orange-500";
  return "from-red-500 to-rose-600";
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

export const LEVEL_THRESHOLDS = {
  SEED: 0,
  WARRIOR: 1000,
  GUARDIAN: 5000,
  HERO: 15000,
} as const;

export function calculateLevel(ecoPoints: number): { level: string; levelIcon: string } {
  if (ecoPoints >= LEVEL_THRESHOLDS.HERO) return { level: "Climate Hero", levelIcon: "🏆" };
  if (ecoPoints >= LEVEL_THRESHOLDS.GUARDIAN) return { level: "Earth Guardian", levelIcon: "🌳" };
  if (ecoPoints >= LEVEL_THRESHOLDS.WARRIOR) return { level: "Green Warrior", levelIcon: "🌿" };
  return { level: "Seed", levelIcon: "🌱" };
}

export interface LeaderboardUser {
  name: string;
  avatar: string;
  score: number;
  saved: number;
  points: number;
  isMe: boolean;
  rank?: number;
}

export function getRankedLeaderboard(
  displayName: string,
  carbonScore: number,
  totalSaved: number,
  ecoPoints: number,
  mockList: { name: string; avatar: string; score: number; saved: number; points: number; rank?: number }[]
) {
  const userEntry: LeaderboardUser = {
    name: displayName || "You",
    avatar: displayName
      ? displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "ME",
    score: carbonScore,
    saved: totalSaved,
    points: ecoPoints,
    isMe: true,
  };

  const entries: LeaderboardUser[] = [
    ...mockList.filter((u) => u.rank !== 4).map((u) => ({ ...u, isMe: false })),
    userEntry,
  ];

  entries.sort((a, b) => b.points - a.points);

  const ranked = entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const myRank = ranked.findIndex((u) => u.isMe) + 1;
  const totalCompetitors = ranked.length;
  const rankPercentile = Math.max(1, Math.round((myRank / totalCompetitors) * 100));

  return {
    ranked,
    myRank,
    rankPercentile,
  };
}
