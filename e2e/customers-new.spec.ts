// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Customer New Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customers/new');
  });

  test('should render without errors', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/omb-accounting/);

    // Check heading is visible
    const heading = page.getByRole('heading', { name: /創建新客戶/i });
    await expect(heading).toBeVisible();

    // Check form fields are present
    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Phone/i)).toBeVisible();
    await expect(page.getByLabel(/Company Name/i)).toBeVisible();
    await expect(page.getByLabel(/Address/i)).toBeVisible();
    await expect(page.getByLabel(/Tax ID/i)).toBeVisible();
    await expect(page.getByLabel(/Notes/i)).toBeVisible();

    // Check buttons are present
    await expect(page.getByRole('button', { name: /Create Customer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();

    // Take screenshot
    await page.screenshot({ 
      path: `screenshots/customers-new-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    // Click submit button
    await page.click('button[type="submit"]');

    // Wait a bit for validation
    await page.waitForTimeout(1000);

    // Check validation messages
    const nameError = page.getByText(/Name is required/i);
    await expect(nameError).toBeVisible();

    const emailError = page.getByText(/Email is required/i);
    await expect(emailError).toBeVisible();

    // Take screenshot of validation state
    await page.screenshot({ 
      path: `screenshots/customers-new-validation-${Date.now()}.png`,
      fullPage: true 
    });
  });
});
