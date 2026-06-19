import { vi, describe, it, expect, beforeEach } from "vitest";
import { getFallbackTips } from "./fallbackTips";
import { POST } from "@/app/api/coach/route";

describe("getFallbackTips (Rule Engine)", () => {
  it("generates correct fallback recommendations based on emission thresholds", () => {
    // 1. Test High Emissions case
    const highBreakdown = {
      transportEmissions: 120,
      foodEmissions: 150,
      energyEmissions: 200,
      shoppingEmissions: 70,
      wasteEmissions: 25,
    };
    const highTips = getFallbackTips(highBreakdown);
    expect(highTips).toHaveLength(5);
    expect(highTips[0]).toEqual({
      category: "Transport",
      action: "Switch to public transport, carpool, or work remotely 3 days a week.",
      estimatedSavingKg: 54, // 120 * 0.45 = 54
    });
    expect(highTips[1]).toEqual({
      category: "Energy",
      action: "Switch to a green energy plan provider or check solar panels eligibility.",
      estimatedSavingKg: 100, // 200 * 0.50 = 100
    });
    expect(highTips[2]).toEqual({
      category: "Food",
      action: "Substitute high-impact meat (beef/lamb) with plant-based options or poultry.",
      estimatedSavingKg: 53, // 150 * 0.35 = 52.5 => rounds to 53
    });
    expect(highTips[3]).toEqual({
      category: "Shopping",
      action: "Try a shopping fast, opt for pre-loved clothing, or buy second-hand gear.",
      estimatedSavingKg: 21, // 70 * 0.30 = 21
    });
    expect(highTips[4]).toEqual({
      category: "Waste",
      action: "Separate recyclables regularly and start composting organic kitchen scraps.",
      estimatedSavingKg: 10, // 25 * 0.40 = 10
    });

    // 2. Test Low/Moderate Emissions case
    const lowBreakdown = {
      transportEmissions: 20,
      foodEmissions: 60,
      energyEmissions: 80,
      shoppingEmissions: 40,
      wasteEmissions: 14,
    };
    const lowTips = getFallbackTips(lowBreakdown);
    expect(lowTips).toHaveLength(5);
    expect(lowTips[0].action).toContain("Walk or bike for short trips");
    expect(lowTips[1].action).toContain("Unplug idle appliances");
    expect(lowTips[2].action).toContain("Introduce 'Meatless Mondays'");
    expect(lowTips[3].action).toContain("Wait 48 hours before non-essential purchases");
    expect(lowTips[4].action).toContain("Reduce single-use plastic cups");

    // 3. Test Zero Emissions case
    const zeroBreakdown = {
      transportEmissions: 0,
      foodEmissions: 0,
      energyEmissions: 0,
      shoppingEmissions: 0,
      wasteEmissions: 0,
    };
    const zeroTips = getFallbackTips(zeroBreakdown);
    expect(zeroTips).toHaveLength(5);
    zeroTips.forEach((tip) => {
      expect(tip.estimatedSavingKg).toBe(0);
    });
  });
});

describe("AI Coach API Route Handler (POST)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = "mock_key";
  });

  const createMockRequest = (body: any, ip: string = "127.0.0.1") => {
    return new Request("http://localhost/api/coach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    });
  };

  it("returns successfully validated recommendations from Gemini", async () => {
    const mockGeminiOutput = [
      { category: "Transport", action: "Carpool to work", estimatedSavingKg: 30 },
      { category: "Energy", action: "Unplug chargers", estimatedSavingKg: 10 },
      { category: "Food", action: "Eat vegetables", estimatedSavingKg: 20 },
    ];

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(mockGeminiOutput) }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = createMockRequest({
      transportEmissions: 100,
      foodEmissions: 50,
      energyEmissions: 80,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual(mockGeminiOutput);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("falls back to rule engine if Gemini API fails", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = createMockRequest({
      transportEmissions: 100,
    });
    const res = await POST(req);
    expect(res.status).toBe(200); // Should resolve with 200 despite AI error

    const json = await res.json();
    // Verify fallback tips are returned
    expect(json).toHaveLength(5);
    expect(json[0].category).toBe("Transport");
  });

  it("falls back to rule engine if Gemini API times out (AbortError)", async () => {
    const mockFetch = vi.fn().mockRejectedValueOnce(new DOMException("Aborted", "AbortError"));
    vi.stubGlobal("fetch", mockFetch);

    const req = createMockRequest({
      transportEmissions: 100,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveLength(5);
  });

  it("falls back to rule engine if Gemini API response fails Zod validation", async () => {
    // Malformed JSON response schema missing estimatedSavingKg
    const malformedOutput = [
      { category: "Transport", action: "Carpool to work" },
    ];

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(malformedOutput) }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const req = createMockRequest({
      transportEmissions: 100,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    // Zod validation should fail, triggering fallback tips
    expect(json).toHaveLength(5);
  });

  it("enforces rate-limiting (429 status code) when request limits are exceeded", async () => {
    const uniqueIp = "192.168.1.100";
    // Send 10 successful mocked requests
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify([]) }],
            },
          },
        ],
      }),
    }));

    for (let i = 0; i < 10; i++) {
      const req = createMockRequest({ transportEmissions: 50 }, uniqueIp);
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // The 11th request from the same IP should trigger a 429
    const req11 = createMockRequest({ transportEmissions: 50 }, uniqueIp);
    const res11 = await POST(req11);
    expect(res11.status).toBe(429);
    
    const body = await res11.json();
    expect(body.error).toContain("Too many requests");
  });
});
