import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { calculateLevel } from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  ecoPoints: number;
  level: string;
  levelIcon: string;
  streak: number;
  totalSaved: number;
  carbonScore: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FootprintEntry {
  id?: string;
  uid: string;
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
  createdAt?: Timestamp;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      ecoPoints: 0,
      level: "Seed 🌱",
      levelIcon: "🌱",
      streak: 0,
      totalSaved: 0,
      carbonScore: 50,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...data,
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// ─── Footprint Entries ────────────────────────────────────────────────────────

export async function saveFootprintEntry(entry: Omit<FootprintEntry, "id" | "createdAt">) {
  const col = collection(db, "users", entry.uid, "footprints");
  const docRef = await addDoc(col, {
    ...entry,
    createdAt: serverTimestamp(),
  });

  // Update user's carbonScore with latest sustainability score
  await updateUserProfile(entry.uid, {
    carbonScore: entry.sustainabilityScore,
    totalSaved: Math.round(entry.monthlyEmissions * 0.15), // 15% saving assumption
  });

  return docRef.id;
}

export async function getUserFootprints(uid: string, count = 10): Promise<FootprintEntry[]> {
  const col = collection(db, "users", uid, "footprints");
  const q = query(col, orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FootprintEntry));
}

export async function getLatestFootprint(uid: string): Promise<FootprintEntry | null> {
  const entries = await getUserFootprints(uid, 1);
  return entries[0] ?? null;
}

// Level calculation is imported from ./utils
