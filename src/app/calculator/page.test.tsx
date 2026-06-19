import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalculatorPage from "./page";
import { SessionProvider } from "@/contexts/SessionContext";
import { describe, it, expect, vi } from "vitest";
import * as calculatorLib from "@/lib/calculator";

// Mock framer-motion to avoid animation issues
vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }: any, ref) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    button: React.forwardRef(({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }: any, ref) => (
      <button ref={ref} {...props}>{children}</button>
    )),
    circle: React.forwardRef(({ children, whileHover, whileTap, initial, animate, exit, transition, ...props }: any, ref) => (
      <circle ref={ref} {...props}>{children}</circle>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Spy/mock calculator calculation library
vi.mock("@/lib/calculator", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/calculator")>();
  return {
    ...actual,
    calculateCarbonFootprint: vi.fn(actual.calculateCarbonFootprint),
  };
});

describe("CalculatorPage Component", () => {
  it("navigates through steps correctly, updates slider inputs, and displays results", async () => {
    const user = userEvent.setup();
    
    render(
      <SessionProvider>
        <CalculatorPage />
      </SessionProvider>
    );

    // --- STEP 1: Transportation ---
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    expect(screen.getByText("Primary transport mode")).toBeInTheDocument();

    // Verify distance slider interaction
    const distanceSlider = screen.getByRole("slider");
    expect(distanceSlider).toHaveValue("50");
    fireEvent.change(distanceSlider, { target: { value: "120" } });
    expect(screen.getByText("120 km")).toBeInTheDocument();

    // Select Bicycle option
    const bikeOption = screen.getByRole("button", { name: /Bicycle Zero/i });
    await user.click(bikeOption);

    // Go to next step
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    const backBtn = screen.getByRole("button", { name: /Back/i });
    expect(backBtn).toBeDisabled();
    await user.click(nextBtn);

    // --- STEP 2: Energy ---
    expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
    expect(screen.getByText("Monthly electricity (kWh)")).toBeInTheDocument();

    const electricitySlider = screen.getByRole("slider");
    expect(electricitySlider).toHaveValue("200");
    fireEvent.change(electricitySlider, { target: { value: "450" } });
    expect(screen.getByText("450 kWh")).toBeInTheDocument();

    // Toggle solar panels checkbox
    const solarBtn = screen.getByRole("button", { name: /Solar Panels/i });
    await user.click(solarBtn);

    await user.click(nextBtn);

    // --- STEP 3: Food ---
    expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
    const veganOption = screen.getByRole("button", { name: /Vegan/i });
    await user.click(veganOption);
    await user.click(nextBtn);

    // --- STEP 4: Shopping ---
    expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
    const lowShopping = screen.getByRole("button", { name: /Minimal/i });
    await user.click(lowShopping);
    await user.click(nextBtn);

    // --- STEP 5: Waste ---
    expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
    
    // Toggle composts
    const compostsBtn = screen.getByRole("button", { name: /Composts Food/i });
    await user.click(compostsBtn);

    // Plastic usage low
    const plasticLowBtn = screen.getByRole("button", { name: /low/i });
    await user.click(plasticLowBtn);

    // Back button should navigate to step 4
    const backBtnStep5 = screen.getByRole("button", { name: /Back/i });
    await user.click(backBtnStep5);
    expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();
    await user.click(nextBtn);

    // Submit calculation
    const calculateBtn = screen.getByRole("button", { name: /Calculate/i });
    await user.click(calculateBtn);

    // Verify result is displayed
    expect(screen.getByText("Calculated Score")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save to Profile/i })).toBeInTheDocument();
  });

  it("correctly renders score display components for 0/100 (Critical) cases", async () => {
    // Force calculateCarbonFootprint to return a score of 0
    vi.mocked(calculatorLib.calculateCarbonFootprint).mockReturnValueOnce({
      monthlyEmissions: 1200,
      yearlyEmissions: 14400,
      sustainabilityScore: 0,
      transportEmissions: 500,
      foodEmissions: 200,
      energyEmissions: 300,
      shoppingEmissions: 120,
      wasteEmissions: 80,
    });

    const user = userEvent.setup();
    render(
      <SessionProvider>
        <CalculatorPage />
      </SessionProvider>
    );

    // Skip to Step 5 quickly
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);

    // Submit
    const calculateBtn = screen.getByRole("button", { name: /Calculate/i });
    await user.click(calculateBtn);

    // Verify 0 score and "Critical" rating label are displayed
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("correctly renders score display components for 100/100 (Excellent) cases", async () => {
    // Force calculateCarbonFootprint to return a score of 100
    vi.mocked(calculatorLib.calculateCarbonFootprint).mockReturnValueOnce({
      monthlyEmissions: 0,
      yearlyEmissions: 0,
      sustainabilityScore: 100,
      transportEmissions: 0,
      foodEmissions: 0,
      energyEmissions: 0,
      shoppingEmissions: 0,
      wasteEmissions: 0,
    });

    const user = userEvent.setup();
    render(
      <SessionProvider>
        <CalculatorPage />
      </SessionProvider>
    );

    // Skip to Step 5 quickly
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);

    // Submit
    const calculateBtn = screen.getByRole("button", { name: /Calculate/i });
    await user.click(calculateBtn);

    // Verify 100 score and "Excellent" rating label are displayed
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("correctly renders score display components for mid-range 60/100 (Fair) cases", async () => {
    // Force calculateCarbonFootprint to return a score of 60
    vi.mocked(calculatorLib.calculateCarbonFootprint).mockReturnValueOnce({
      monthlyEmissions: 240,
      yearlyEmissions: 2880,
      sustainabilityScore: 60,
      transportEmissions: 80,
      foodEmissions: 50,
      energyEmissions: 50,
      shoppingEmissions: 30,
      wasteEmissions: 30,
    });

    const user = userEvent.setup();
    render(
      <SessionProvider>
        <CalculatorPage />
      </SessionProvider>
    );

    // Skip to Step 5 quickly
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);
    await user.click(nextBtn);

    // Submit
    const calculateBtn = screen.getByRole("button", { name: /Calculate/i });
    await user.click(calculateBtn);

    // Verify 60 score and "Fair" rating label are displayed
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("Fair")).toBeInTheDocument();
  });
});
