import { test, expect } from "@playwright/test";

test.describe("EcoTrack Core User Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto("/");
  });

  test("calculates footprint, saves results, and verifies dashboard points", async ({ page }) => {
    // 1. Start from Homepage and navigate to Calculator
    const calculateLink = page.getByRole("link", { name: /Calculator/i }).first();
    await calculateLink.click();
    await expect(page).toHaveURL(/.*calculator/);
    await expect(page.locator("h1")).toContainText("Calculate Your Footprint");

    // 2. Complete the 5-step calculator wizard using "Next" buttons
    // Step 1: Transport (initial step)
    await expect(page.locator("text=Step 1 of 5")).toBeVisible();
    await page.locator("button:has-text('Next')").click();

    // Step 2: Energy
    await expect(page.locator("text=Step 2 of 5")).toBeVisible();
    await page.locator("button:has-text('Next')").click();

    // Step 3: Food
    await expect(page.locator("text=Step 3 of 5")).toBeVisible();
    await page.locator("button:has-text('Next')").click();

    // Step 4: Shopping
    await expect(page.locator("text=Step 4 of 5")).toBeVisible();
    await page.locator("button:has-text('Next')").click();

    // Step 5: Waste
    await expect(page.locator("text=Step 5 of 5")).toBeVisible();
    
    // Perform calculation
    const calculateBtn = page.locator("button:has-text('Calculate')");
    await calculateBtn.click();

    // 3. Verify results screen is shown and save the calculation
    await expect(page.locator("text=Calculated Score")).toBeVisible();
    const scoreText = await page.locator(".text-6xl").textContent();

    expect(scoreText).not.toBeNull();
    const scoreValue = parseInt(scoreText || "0", 10);
    expect(scoreValue).toBeGreaterThanOrEqual(0);
    expect(scoreValue).toBeLessThanOrEqual(100);

    const saveBtn = page.locator("button:has-text('Save to Profile')");
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Confirm save confirmation banner appears
    await expect(page.locator("text=Results saved to your session!")).toBeVisible();

    // Wait for the navbar user points chip to update, stabilizing the layout
    await expect(page.locator("text=50 pts").first()).toBeVisible();

    // 4. Navigate to the Dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify Carbon Score KPI tile matches calculated score
    const scoreKpi = page.locator(".kpi-card", { hasText: "Carbon Score" });
    await expect(scoreKpi).toBeVisible();
    await expect(scoreKpi).toContainText(`${scoreValue}/100`);

    // Verify Eco Points has updated (starts at 0, +50 from saving footprint)
    const pointsCard = page.locator(".stat-card", { hasText: "Eco Points" });
    await expect(pointsCard).toBeVisible();
    await expect(pointsCard.locator(".stat-card-value")).toContainText("50");
  });

  test("toggles daily habits and checks points updates", async ({ page }) => {
    // Go directly to Dashboard
    const dashboardLink = page.getByRole("link", { name: /Dashboard/i }).first();
    await dashboardLink.click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify initial "Earned today" is +45 pts
    const earnedTodayPill = page.locator("span:has-text('Earned today') + span");
    await expect(earnedTodayPill).toContainText("+45 pts");

    // Click the first habit checklist item
    const firstHabit = page.locator(".col-2 button").first();
    await expect(firstHabit).toBeVisible();
    
    // Get points value associated with this habit
    const pointText = await firstHabit.locator("span").last().textContent();
    const pointValue = parseInt(pointText?.replace("+", "")?.replace("pt", "") || "0", 10);
    expect(pointValue).toBe(20); // First habit is worth 20 points

    // Click the habit to complete it
    await firstHabit.click();

    // Verify "Earned today" has updated to +65 pts (45 + 20)
    await expect(earnedTodayPill).toContainText("+65 pts");
  });
});
