export interface CalculatorData {
  transport: string;
  weeklyDistance: number;
  monthlyElectricity: number;
  foodHabits: string;
  shoppingHabits: string;
  recyclesRegularly: boolean;
  composts: boolean;
  plasticUsage: string;
}

export interface CarbonResult {
  monthlyEmissions: number;
  yearlyEmissions: number;
  sustainabilityScore: number;
  transportEmissions: number;
  foodEmissions: number;
  energyEmissions: number;
  shoppingEmissions: number;
  wasteEmissions: number;
}

export function calculateCarbonFootprint(data: CalculatorData): CarbonResult {
  // Transport emissions (kg CO2/km)
  const transportFactors: Record<string, number> = {
    car: 0.21,
    bike: 0,
    bus: 0.089,
    train: 0.041,
    metro: 0.014,
    flight: 0.255,
    walking: 0,
  };

  const weeklyKm = data.weeklyDistance;
  const transportFactor = transportFactors[data.transport] || 0.21;
  const transportEmissions = weeklyKm * transportFactor * 4.33; // monthly

  // Electricity emissions
  const electricityFactor = 0.82; // kg CO2/kWh (avg grid)
  const energyEmissions = data.monthlyElectricity * electricityFactor;

  // Food emissions (kg CO2/month)
  const foodFactors: Record<string, number> = {
    vegan: 55,
    vegetarian: 75,
    mixed: 130,
    "heavy-meat": 200,
  };
  const foodEmissions = foodFactors[data.foodHabits] || 130;

  // Shopping emissions
  const shoppingFactors: Record<string, number> = {
    low: 30,
    medium: 65,
    high: 120,
  };
  const shoppingEmissions = shoppingFactors[data.shoppingHabits] || 65;

  // Waste emissions
  let wasteEmissions = 20;
  if (data.recyclesRegularly) wasteEmissions -= 5;
  if (data.composts) wasteEmissions -= 3;
  const plasticPenalty: Record<string, number> = { low: 0, medium: 3, high: 8 };
  wasteEmissions += plasticPenalty[data.plasticUsage] ?? 3;

  const totalMonthly =
    transportEmissions + energyEmissions + foodEmissions + shoppingEmissions + wasteEmissions;

  // Score: lower emissions = higher score
  // Average person: ~400 kg/month = score 50
  // Score formula: 100 - (emissions / 8)
  const rawScore = Math.max(0, Math.min(100, Math.round(100 - totalMonthly / 6)));

  return {
    monthlyEmissions: Math.round(totalMonthly),
    yearlyEmissions: Math.round(totalMonthly * 12),
    sustainabilityScore: rawScore,
    transportEmissions: Math.round(transportEmissions),
    foodEmissions: Math.round(foodEmissions),
    energyEmissions: Math.round(energyEmissions),
    shoppingEmissions: Math.round(shoppingEmissions),
    wasteEmissions: Math.round(wasteEmissions),
  };
}
