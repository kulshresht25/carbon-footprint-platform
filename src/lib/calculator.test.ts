import { describe, it, expect } from "vitest";
import { calculateCarbonFootprint } from "./calculator";
import { calculateLevel, updateStreakAndLastActive, type SessionProfile } from "@/contexts/SessionContext";

describe("calculateCarbonFootprint", () => {
  it("calculates carbon footprint correctly for standard inputs", () => {
    const result = calculateCarbonFootprint({
      transport: "car",
      weeklyDistance: 100,
      monthlyElectricity: 250,
      foodHabits: "mixed",
      shoppingHabits: "medium",
      recyclesRegularly: true,
      composts: false,
      plasticUsage: "medium",
    });

    // Calculations:
    // Transport: car (0.21) * 100 * 4.33 = 90.93
    // Electricity: 250 * 0.82 = 205
    // Food: mixed = 130
    // Shopping: medium = 65
    // Waste: base 20 - 5 (recycle) + 3 (plastic medium) = 18
    // Total monthly = 90.93 + 205 + 130 + 65 + 18 = 508.93 => rounds to 509
    // Yearly: 508.93 * 12 = 6107.16 => rounds to 6107
    // Score: 100 - (508.93 / 6) = 100 - 84.82 = 15.17 => rounds to 15
    expect(result.monthlyEmissions).toBe(509);
    expect(result.yearlyEmissions).toBe(6107);
    expect(result.sustainabilityScore).toBe(15);
    expect(result.transportEmissions).toBe(91);
    expect(result.energyEmissions).toBe(205);
    expect(result.foodEmissions).toBe(130);
    expect(result.shoppingEmissions).toBe(65);
    expect(result.wasteEmissions).toBe(18);
  });

  it("handles zero/low emissions inputs correctly", () => {
    const result = calculateCarbonFootprint({
      transport: "bike",
      weeklyDistance: 0,
      monthlyElectricity: 0,
      foodHabits: "vegan",
      shoppingHabits: "low",
      recyclesRegularly: true,
      composts: true,
      plasticUsage: "low",
    });

    // Calculations:
    // Transport: bike (0) * 0 = 0
    // Electricity: 0 * 0.82 = 0
    // Food: vegan = 55
    // Shopping: low = 30
    // Waste: base 20 - 5 (recycle) - 3 (compost) + 0 (plastic low) = 12
    // Total monthly = 97
    // Score: 100 - (97 / 6) = 100 - 16.16 = 83.83 => rounds to 84
    expect(result.monthlyEmissions).toBe(97);
    expect(result.sustainabilityScore).toBe(84);
    expect(result.transportEmissions).toBe(0);
    expect(result.energyEmissions).toBe(0);
    expect(result.foodEmissions).toBe(55);
    expect(result.shoppingEmissions).toBe(30);
    expect(result.wasteEmissions).toBe(12);
  });

  it("handles fallback cases for invalid/unknown inputs", () => {
    const result = calculateCarbonFootprint({
      transport: "unknown_mode",
      weeklyDistance: 50,
      monthlyElectricity: 100,
      foodHabits: "invalid_diet",
      shoppingHabits: "invalid_shopping",
      recyclesRegularly: false,
      composts: false,
      plasticUsage: "invalid_plastic",
    });

    // Should use fallback values:
    // Transport: unknown -> defaults to car (0.21) => 50 * 0.21 * 4.33 = 45.465
    // Electricity: 100 * 0.82 = 82
    // Food: unknown -> defaults to mixed (130)
    // Shopping: unknown -> defaults to medium (65)
    // Waste: base 20 + plastic unknown (defaults to medium = 3) = 23
    // Total monthly = 45.465 + 82 + 130 + 65 + 23 = 345.465 => rounds to 345
    expect(result.monthlyEmissions).toBe(345);
    expect(result.foodEmissions).toBe(130);
    expect(result.shoppingEmissions).toBe(65);
    expect(result.wasteEmissions).toBe(23);
  });
});

describe("calculateLevel", () => {
  it("identifies level correctly at points thresholds", () => {
    expect(calculateLevel(0)).toEqual({ level: "Seed", levelIcon: "🌱" });
    expect(calculateLevel(999)).toEqual({ level: "Seed", levelIcon: "🌱" });
    expect(calculateLevel(1000)).toEqual({ level: "Green Warrior", levelIcon: "🌿" });
    expect(calculateLevel(4999)).toEqual({ level: "Green Warrior", levelIcon: "🌿" });
    expect(calculateLevel(5000)).toEqual({ level: "Earth Guardian", levelIcon: "🌳" });
    expect(calculateLevel(14999)).toEqual({ level: "Earth Guardian", levelIcon: "🌳" });
    expect(calculateLevel(15000)).toEqual({ level: "Climate Hero", levelIcon: "🏆" });
    expect(calculateLevel(100000)).toEqual({ level: "Climate Hero", levelIcon: "🏆" });
  });
});

describe("updateStreakAndLastActive", () => {
  const dummyProfile: SessionProfile = {
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

  it("sets streak to 1 when there is no lastActiveAt date", () => {
    const updates = updateStreakAndLastActive({ ...dummyProfile, lastActiveAt: undefined });
    expect(updates.streak).toBe(1);
    expect(updates.lastActiveAt).toBeDefined();
  });

  it("does not update anything if active today", () => {
    const todayStr = new Date().toISOString();
    const updates = updateStreakAndLastActive({
      ...dummyProfile,
      lastActiveAt: todayStr,
      streak: 3,
    });
    expect(updates).toEqual({});
  });

  it("increments streak if active yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const updates = updateStreakAndLastActive({
      ...dummyProfile,
      lastActiveAt: yesterday.toISOString(),
      streak: 3,
    });
    expect(updates.streak).toBe(4);
    expect(updates.lastActiveAt).toBeDefined();
  });

  it("resets streak to 1 if active more than 1 day ago", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const updates = updateStreakAndLastActive({
      ...dummyProfile,
      lastActiveAt: twoDaysAgo.toISOString(),
      streak: 3,
    });
    expect(updates.streak).toBe(1);
    expect(updates.lastActiveAt).toBeDefined();
  });
});
