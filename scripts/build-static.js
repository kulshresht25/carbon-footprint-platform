const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const apiRouteDir = path.join(__dirname, "../src/app/api/coach");
const apiRouteFile = path.join(apiRouteDir, "route.ts");
const backupFile = path.join(__dirname, "../route.ts.backup");

let moved = false;

try {
  // Clean Next.js cache first to avoid stale type validation errors for the moved API route
  const nextCacheDir = path.join(__dirname, "../.next");
  if (fs.existsSync(nextCacheDir)) {
    console.log("Cleaning Next.js build cache...");
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
  }

  if (fs.existsSync(apiRouteFile)) {
    console.log("Temporarily moving API route file to prevent static export failure...");
    fs.renameSync(apiRouteFile, backupFile);
    moved = true;
  }

  console.log("Running static export build...");
  execSync("next build", {
    env: { ...process.env, EXPORT_STATIC: "true" },
    stdio: "inherit",
  });

  console.log("Static export build completed successfully!");
} catch (error) {
  console.error("Static export build failed:", error);
  process.exit(1);
} finally {
  if (moved && fs.existsSync(backupFile)) {
    console.log("Restoring API route file...");
    if (!fs.existsSync(apiRouteDir)) {
      fs.mkdirSync(apiRouteDir, { recursive: true });
    }
    fs.renameSync(backupFile, apiRouteFile);
  }
}
