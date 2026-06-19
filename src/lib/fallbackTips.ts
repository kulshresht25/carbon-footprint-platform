export interface EmissionBreakdown {
  transportEmissions: number;
  foodEmissions: number;
  energyEmissions: number;
  shoppingEmissions: number;
  wasteEmissions: number;
}

export interface Recommendation {
  category: string;
  action: string;
  estimatedSavingKg: number;
}

/**
 * Returns deterministic fallback recommendations derived from emissions thresholds.
 * Covers every category of the carbon calculator.
 */
export function getFallbackTips(breakdown: EmissionBreakdown): Recommendation[] {
  const tips: Recommendation[] = [];

  // 1. Transport Rule
  if (breakdown.transportEmissions > 100) {
    tips.push({
      category: "Transport",
      action: "Switch to public transport, carpool, or work remotely 3 days a week.",
      estimatedSavingKg: Math.round(breakdown.transportEmissions * 0.45),
    });
  } else if (breakdown.transportEmissions > 0) {
    tips.push({
      category: "Transport",
      action: "Walk or bike for short trips under 3 km instead of driving.",
      estimatedSavingKg: Math.round(breakdown.transportEmissions * 0.20),
    });
  } else {
    tips.push({
      category: "Transport",
      action: "Maintain zero transport emissions by using active travel like cycling and walking.",
      estimatedSavingKg: 0,
    });
  }

  // 2. Energy Rule
  if (breakdown.energyEmissions > 150) {
    tips.push({
      category: "Energy",
      action: "Switch to a green energy plan provider or check solar panels eligibility.",
      estimatedSavingKg: Math.round(breakdown.energyEmissions * 0.50),
    });
  } else if (breakdown.energyEmissions > 50) {
    tips.push({
      category: "Energy",
      action: "Unplug idle appliances, use LED bulbs, and lower your thermostat by 1-2°C.",
      estimatedSavingKg: Math.round(breakdown.energyEmissions * 0.15),
    });
  } else {
    tips.push({
      category: "Energy",
      action: "Continue monitoring household grid draw to sustain low energy footprint.",
      estimatedSavingKg: 0,
    });
  }

  // 3. Food Rule
  if (breakdown.foodEmissions > 100) {
    tips.push({
      category: "Food",
      action: "Substitute high-impact meat (beef/lamb) with plant-based options or poultry.",
      estimatedSavingKg: Math.round(breakdown.foodEmissions * 0.35),
    });
  } else if (breakdown.foodEmissions > 55) {
    tips.push({
      category: "Food",
      action: "Introduce 'Meatless Mondays' and buy locally grown seasonal ingredients.",
      estimatedSavingKg: Math.round(breakdown.foodEmissions * 0.15),
    });
  } else {
    tips.push({
      category: "Food",
      action: "Superb plant-based diet! Keep prioritizing low food-mile items.",
      estimatedSavingKg: 0,
    });
  }

  // 4. Shopping Rule
  if (breakdown.shoppingEmissions > 60) {
    tips.push({
      category: "Shopping",
      action: "Try a shopping fast, opt for pre-loved clothing, or buy second-hand gear.",
      estimatedSavingKg: Math.round(breakdown.shoppingEmissions * 0.30),
    });
  } else if (breakdown.shoppingEmissions > 30) {
    tips.push({
      category: "Shopping",
      action: "Wait 48 hours before non-essential purchases to reduce manufacturing demand.",
      estimatedSavingKg: Math.round(breakdown.shoppingEmissions * 0.15),
    });
  } else {
    tips.push({
      category: "Shopping",
      action: "Minimalist buying habits! Focus on repairing and reusing over replacing.",
      estimatedSavingKg: 0,
    });
  }

  // 5. Waste Rule
  if (breakdown.wasteEmissions > 15) {
    tips.push({
      category: "Waste",
      action: "Separate recyclables regularly and start composting organic kitchen scraps.",
      estimatedSavingKg: Math.round(breakdown.wasteEmissions * 0.40),
    });
  } else if (breakdown.wasteEmissions > 12) {
    tips.push({
      category: "Waste",
      action: "Reduce single-use plastic cups, straws, and carrier bags.",
      estimatedSavingKg: Math.round(breakdown.wasteEmissions * 0.20),
    });
  } else {
    tips.push({
      category: "Waste",
      action: "Outstanding low-waste lifestyle! Continue packaging-free shopping and zero landfill waste.",
      estimatedSavingKg: 0,
    });
  }

  return tips;
}
