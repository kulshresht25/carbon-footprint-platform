"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FootprintRecord {
  id: string;
  sustainabilityScore: number;
  monthlyEmissions: number;
  yearlyEmissions: number;
  transportEmissions: number;
  foodEmissions: number;
  energyEmissions: number;
  shoppingEmissions: number;
  wasteEmissions: number;
  transport: string;
  foodHabits: string;
  createdAt: string; // ISO date string
}

export interface SessionProfile {
  displayName: string;
  ecoPoints: number;
  level: string;
  levelIcon: string;
  streak: number;
  totalSaved: number;
  carbonScore: number;
  footprints: FootprintRecord[];
  joinedAt: string; // ISO date string
  lastActiveAt?: string; // ISO date string for streak calculation
}

interface SessionContextType {
  profile: SessionProfile;
  loading: boolean;
  updateProfile: (data: Partial<SessionProfile>) => void;
  saveFootprint: (entry: Omit<FootprintRecord, "id" | "createdAt">) => void;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const defaultProfile: SessionProfile = {
  displayName: "Eco Warrior",
  ecoPoints: 0,
  level: "Seed",
  levelIcon: "🌱",
  streak: 0,
  totalSaved: 0,
  carbonScore: 50,
  footprints: [],
  joinedAt: new Date().toISOString(),
};

const STORAGE_KEY = "ecotrack_session";

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function calculateLevel(ecoPoints: number): { level: string; levelIcon: string } {
  if (ecoPoints >= 15000) return { level: "Climate Hero", levelIcon: "🏆" };
  if (ecoPoints >= 5000) return { level: "Earth Guardian", levelIcon: "🌳" };
  if (ecoPoints >= 1000) return { level: "Green Warrior", levelIcon: "🌿" };
  return { level: "Seed", levelIcon: "🌱" };
}

function loadSession(): SessionProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw) as SessionProfile;
    return { ...defaultProfile, ...parsed };
  } catch {
    return defaultProfile;
  }
}

function saveSession(profile: SessionProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // storage quota exceeded — ignore
  }
}

// ─── Streak Helper ─────────────────────────────────────────────────────────────

export function updateStreakAndLastActive(prevProfile: SessionProfile): Partial<SessionProfile> {
  const now = new Date();
  const todayStr = now.toISOString();
  
  if (!prevProfile.lastActiveAt) {
    // First time tracking daily streak
    return {
      streak: 1,
      lastActiveAt: todayStr,
    };
  }

  const lastActive = new Date(prevProfile.lastActiveAt);
  
  // Strip time parts to compare calendar days in local time
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  
  const diffTime = todayDate.getTime() - lastActiveDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Active yesterday, increment streak!
    return {
      streak: prevProfile.streak + 1,
      lastActiveAt: todayStr,
    };
  } else if (diffDays > 1) {
    // Missed a day (or more), reset streak to 1
    return {
      streak: 1,
      lastActiveAt: todayStr,
    };
  }
  
  // Already active today, or timezone anomaly -> do nothing
  return {};
}

// ─── Context ───────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextType | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<SessionProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = loadSession();
    const streakUpdates = updateStreakAndLastActive(stored);
    const updatedProfile = { ...stored, ...streakUpdates };
    
    // Save back if there were changes
    if (Object.keys(streakUpdates).length > 0) {
      saveSession(updatedProfile);
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(updatedProfile);
    setLoading(false);
  }, []);

  const updateProfile = useCallback((data: Partial<SessionProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...data };
      saveSession(next);
      return next;
    });
  }, []);

  const saveFootprint = useCallback(
    (entry: Omit<FootprintRecord, "id" | "createdAt">) => {
      setProfile((prev) => {
        const record: FootprintRecord = {
          ...entry,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        // Update points (+50 per calculation)
        const newPoints = prev.ecoPoints + 50;
        const { level, levelIcon } = calculateLevel(newPoints);
        const next: SessionProfile = {
          ...prev,
          ecoPoints: newPoints,
          level,
          levelIcon,
          carbonScore: entry.sustainabilityScore,
          totalSaved: Math.round(entry.monthlyEmissions * 0.15),
          footprints: [record, ...prev.footprints].slice(0, 20),
        };
        saveSession(next);
        return next;
      });
    },
    []
  );

  return (
    <SessionContext.Provider value={{ profile, loading, updateProfile, saveFootprint }}>
      {children}
    </SessionContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
