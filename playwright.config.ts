import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  snapshotDir: "./e2e/__snapshots__",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    // Enable trace for debugging
    trace: "on-first-retry",
    // Video storage
    video: "on",
  },
  // Output directory for test artifacts
  outputDir: "./test-results/",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-video",
      use: {
        ...devices["Desktop Chrome"],
        video: "on",
      },
      testMatch: /video\.spec\.ts$/,
    },
    {
      name: "business-video",
      use: {
        ...devices["Desktop Chrome"],
        video: {
          mode: "on",
          size: { width: 1280, height: 720 },
        },
      },
      testMatch: /business-video\.spec\.ts$/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
