import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionProvider, useSession } from "./SessionContext";
import { describe, it, expect, beforeEach } from "vitest";

const TestComponent = () => {
  const { profile, loading, updateProfile, saveFootprint } = useSession();

  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }

  return (
    <div>
      <div data-testid="displayName">{profile.displayName}</div>
      <div data-testid="ecoPoints">{profile.ecoPoints}</div>
      <div data-testid="level">{profile.level}</div>
      <div data-testid="levelIcon">{profile.levelIcon}</div>
      <div data-testid="streak">{profile.streak}</div>
      <div data-testid="carbonScore">{profile.carbonScore}</div>
      <div data-testid="footprintCount">{profile.footprints.length}</div>
      
      <button
        data-testid="updateNameBtn"
        onClick={() => updateProfile({ displayName: "Jane Doe" })}
      >
        Update Name
      </button>

      <button
        data-testid="saveFootprintBtn"
        onClick={() =>
          saveFootprint({
            sustainabilityScore: 85,
            monthlyEmissions: 120,
            yearlyEmissions: 1440,
            transportEmissions: 30,
            foodEmissions: 40,
            energyEmissions: 20,
            shoppingEmissions: 10,
            wasteEmissions: 20,
            transport: "bus",
            foodHabits: "vegetarian",
          })
        }
      >
        Save Footprint
      </button>
    </div>
  );
};

describe("SessionContext Persistence Layer", () => {
  const STORAGE_KEY = "ecotrack_session";

  beforeEach(() => {
    localStorage.clear();
  });

  it("loads default profile when no local storage exists", async () => {
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    // Initial state before effects run might show loading
    const loadingEl = screen.queryByTestId("loading");
    if (loadingEl) {
      await screen.findByTestId("displayName");
    }

    expect(screen.getByTestId("displayName").textContent).toBe("Eco Warrior");
    expect(screen.getByTestId("ecoPoints").textContent).toBe("0");
    expect(screen.getByTestId("level").textContent).toBe("Seed");
    expect(screen.getByTestId("levelIcon").textContent).toBe("🌱");
    expect(screen.getByTestId("streak").textContent).toBe("1"); // Streak helper auto-initiates to 1
  });

  it("loads and merges existing profile data from localStorage", async () => {
    const existingProfile = {
      displayName: "Green Master",
      ecoPoints: 1200,
      level: "Green Warrior",
      levelIcon: "🌿",
      streak: 5,
      lastActiveAt: new Date().toISOString(), // active today, streak shouldn't increment
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingProfile));

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    await screen.findByTestId("displayName");

    expect(screen.getByTestId("displayName").textContent).toBe("Green Master");
    expect(screen.getByTestId("ecoPoints").textContent).toBe("1200");
    expect(screen.getByTestId("level").textContent).toBe("Green Warrior"); // Recalculated based on 1200 pts
    expect(screen.getByTestId("levelIcon").textContent).toBe("🌿");
    expect(screen.getByTestId("streak").textContent).toBe("5"); // Retained from existing
  });

  it("recovers gracefully to defaults if localStorage data is corrupted", async () => {
    localStorage.setItem(STORAGE_KEY, "{corrupt_json: true");

    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    await screen.findByTestId("displayName");

    expect(screen.getByTestId("displayName").textContent).toBe("Eco Warrior");
    expect(screen.getByTestId("ecoPoints").textContent).toBe("0");
  });

  it("saves updates to profile in state and localStorage", async () => {
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    await screen.findByTestId("displayName");
    const updateBtn = screen.getByTestId("updateNameBtn");
    await user.click(updateBtn);

    expect(screen.getByTestId("displayName").textContent).toBe("Jane Doe");

    const saved = localStorage.getItem(STORAGE_KEY);
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.displayName).toBe("Jane Doe");
  });

  it("updates points, level, and footprints in state and localStorage when footprint is saved", async () => {
    const user = userEvent.setup();
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

    await screen.findByTestId("displayName");
    const saveBtn = screen.getByTestId("saveFootprintBtn");
    await user.click(saveBtn);

    // Points should go up by 50
    expect(screen.getByTestId("ecoPoints").textContent).toBe("50");
    // Carbon score should become the saved score (85)
    expect(screen.getByTestId("carbonScore").textContent).toBe("85");
    // Footprints count should become 1
    expect(screen.getByTestId("footprintCount").textContent).toBe("1");

    const saved = localStorage.getItem(STORAGE_KEY);
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.ecoPoints).toBe(50);
    expect(parsed.carbonScore).toBe(85);
    expect(parsed.footprints.length).toBe(1);
    expect(parsed.footprints[0].sustainabilityScore).toBe(85);
    expect(parsed.footprints[0].transport).toBe("bus");
  });
});
