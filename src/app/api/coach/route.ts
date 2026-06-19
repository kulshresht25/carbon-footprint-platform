import { NextResponse } from "next/server";
import { z } from "zod";
import { getFallbackTips, type EmissionBreakdown } from "@/lib/fallbackTips";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const RecommendationSchema = z.object({
  category: z.string(),
  action: z.string(),
  estimatedSavingKg: z.number(),
});

const RecommendationsResponseSchema = z.array(RecommendationSchema);

// ─── In-Memory Rate Limiter ──────────────────────────────────────────────────
// Note: This rate limiter is in-memory/single-instance and would need a shared store (e.g. Redis) for multi-instance deployment.
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}
const rateLimitMap = new Map<string, TokenBucket>();
const BUCKET_LIMIT = 10;
const REFILL_INTERVAL_MS = 60000; // 1 minute
const REFILL_RATE = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { tokens: BUCKET_LIMIT - 1, lastRefill: now });
    return false;
  }

  const bucket = rateLimitMap.get(ip)!;
  const elapsedTime = now - bucket.lastRefill;
  const refilledTokens = Math.floor(elapsedTime / REFILL_INTERVAL_MS) * REFILL_RATE;

  if (refilledTokens > 0) {
    bucket.tokens = Math.min(BUCKET_LIMIT, bucket.tokens + refilledTokens);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    return true;
  }

  bucket.tokens -= 1;
  return false;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // 1. IP Determination & Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before requesting AI advice again." },
      { status: 429 }
    );
  }

  let breakdown: EmissionBreakdown = {
    transportEmissions: 0,
    foodEmissions: 0,
    energyEmissions: 0,
    shoppingEmissions: 0,
    wasteEmissions: 0,
  };

  try {
    const body = await request.json();
    breakdown = {
      transportEmissions: Number(body.transportEmissions || 0),
      foodEmissions: Number(body.foodEmissions || 0),
      energyEmissions: Number(body.energyEmissions || 0),
      shoppingEmissions: Number(body.shoppingEmissions || 0),
      wasteEmissions: Number(body.wasteEmissions || 0),
    };
  } catch (err) {
    console.error("Failed to parse request JSON body:", err);
    // Bad request body, but return fallback instead of crashing
    return NextResponse.json(getFallbackTips(breakdown));
  }

  // 2. Query Gemini with Timeout & Schema constraint
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_firebase_api_key_here") {
    console.warn("Gemini API key is not configured. Falling back to rule-engine.");
    return NextResponse.json(getFallbackTips(breakdown));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const prompt = `You are a professional carbon reduction expert.
Given the user's monthly carbon footprint breakdown (kg CO2/month):
- Transport: ${breakdown.transportEmissions} kg
- Food: ${breakdown.foodEmissions} kg
- Energy: ${breakdown.energyEmissions} kg
- Shopping: ${breakdown.shoppingEmissions} kg
- Waste: ${breakdown.wasteEmissions} kg

Provide exactly 3 custom, actionable, high-impact recommendations to lower their emissions.
You must return a JSON array of objects matching this schema:
[
  {
    "category": string,
    "action": string,
    "estimatedSavingKg": number
  }
]
Use appropriate categories from: Transport, Energy, Food, Shopping, Waste.
For estimatedSavingKg, estimate a realistic saving (integer) based on the action and user's emissions.`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING" },
              action: { type: "STRING" },
              estimatedSavingKg: { type: "INTEGER" },
            },
            required: ["category", "action", "estimatedSavingKg"],
          },
        },
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API returned status code: ${response.status}`);
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error("Gemini returned an empty candidates structure.");
    }

    const parsedJson = JSON.parse(textOutput.trim());
    const validatedTips = RecommendationsResponseSchema.parse(parsedJson);

    return NextResponse.json(validatedTips);
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    console.error("AI Coach recommendation call failed. Reason:", errorName === "AbortError" ? "Timeout" : errorMessage);
    
    // Graceful fallback to rule-engine
    const fallbackTips = getFallbackTips(breakdown);
    return NextResponse.json(fallbackTips);
  }
}
