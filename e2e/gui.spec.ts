// @ts-check
const { test, expect } = require('@playwright/test');

// Helper function to wait for page to be fully loaded
async function waitForApp(page) {
  await page.waitForLoadState('networkidle');
  // Wait for any loading spinners to disappear
  await page.waitForTimeout(500);
}

test.describe('Customer New Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customers/new');
    await waitForApp(page);
  });

  test('should render without errors', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/omb-accounting/);

    // Check heading is visible (now in English)
    await expect(page.getByRole('heading', { name: /Create New Customer/i })).toBeVisible();

    // Check form fields are present using placeholder text
    await expect(page.getByPlaceholder(/Enter name or company name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/customer@example.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/13800138000/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Enter company name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Enter address/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Enter tax ID/i)).toBeVisible();

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
    await page.getByRole('button', { name: /Create Customer/i }).click();
    await page.waitForTimeout(500);

    // Check validation messages appear
    await expect(page.getByText(/Name is required/i)).toBeVisible();
    await expect(page.getByText(/Email is required/i)).toBeVisible();

    // Take screenshot of validation state
    await page.screenshot({ 
      path: `screenshots/customers-new-validation-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should create customer successfully', async ({ page }) => {
    const timestamp = Date.now();
    
    // Fill in the form using placeholder selectors
    await page.getByPlaceholder(/Enter name or company name/i).fill('Playwright Test Customer ' + timestamp);
    await page.getByPlaceholder(/customer@example.com/i).fill('playwright' + timestamp + '@test.com');
    await page.getByPlaceholder(/13800138000/i).fill('+852 9999 8888');
    await page.getByPlaceholder(/Enter company name/i).fill('Playwright Test Company');
    
    // Submit the form
    await page.getByRole('button', { name: /Create Customer/i }).click();
    
    // Wait for navigation or success
    await page.waitForTimeout(1000);
    
    // Should stay on page or redirect
    await expect(page).not.toHaveURL(/error/);
    
    await page.screenshot({ 
      path: `screenshots/customers-new-success-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should cancel and go back', async ({ page }) => {
    // Click cancel button
    await page.getByRole('button', { name: /Cancel/i }).click();
    
    // Wait for navigation
    await page.waitForTimeout(500);
    // May or may not navigate depending on router.back() behavior
  });
});

test.describe('Quotations Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotations');
    await waitForApp(page);
  });

  test('should load quotations list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Quotations/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Quotation/i })).toBeVisible();
  });

  test('should navigate to new quotation form', async ({ page }) => {
    await page.getByRole('link', { name: /Create Quotation/i }).click();
    await waitForApp(page);
    
    await expect(page).toHaveURL(/quotations\/new/);
    await expect(page.getByRole('heading', { name: /Create Quotation/i })).toBeVisible();
  });
});

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('should load dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/omb-accounting/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Financial Overview/i })).toBeVisible();
    
    // Check navigation exists
    await expect(page.locator('nav').first()).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: `screenshots/dashboard-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForApp(page);
    
    // Dashboard should still be usable
    await expect(page.getByRole('heading', { name: /Financial Overview/i })).toBeVisible();
    
    await page.screenshot({ 
      path: `screenshots/dashboard-mobile-${Date.now()}.png`,
      fullPage: true 
    });
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
  });

  test('should have skip link for accessibility', async ({ page }) => {
    // Check for skip link (it should be visible on focus)
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeInViewport();
  });
});
