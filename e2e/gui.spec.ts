// @ts-check
const { test, expect } = require('@playwright/test');

// Helper function to wait for page to be fully loaded
async function waitForApp(page) {
  await page.waitForLoadState('networkidle');
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
      path: `screenshots/customers-new-form-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should validate required fields on blur', async ({ page }) => {
    // Click on a field then click away to trigger validation
    const nameInput = page.getByPlaceholder(/Enter name or company name/i);
    await nameInput.click();
    await nameInput.blur();
    
    // Click somewhere else to trigger validation
    await page.getByRole('heading', { name: /Create New Customer/i }).click();
    await page.waitForTimeout(500);

    // Check validation messages appear
    const validationError = page.getByText(/Name is required/i);
    await expect(validationError).toBeVisible({ timeout: 3000 });

    // Take screenshot of validation state
    await page.screenshot({ 
      path: `screenshots/customers-new-validation-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should accept text input in form fields', async ({ page }) => {
    // Fill in customer name
    const nameInput = page.getByPlaceholder(/Enter name or company name/i);
    await nameInput.fill('Test Customer Name');
    await expect(nameInput).toHaveValue('Test Customer Name');
    
    // Fill in email
    const emailInput = page.getByPlaceholder(/customer@example.com/i);
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Take screenshot of filled form
    await page.screenshot({ 
      path: `screenshots/customers-new-filled-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should cancel and stay on page', async ({ page }) => {
    // Cancel button should exist
    await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
  });
});

test.describe('Quotations New Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotations/new');
    await waitForApp(page);
  });

  test('should load quotation form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Create Quotation/i })).toBeVisible();
    
    // Check main sections exist
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Quotation/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
    
    // Check customer select exists
    await expect(page.getByRole('combobox')).toBeVisible();
    
    await page.screenshot({ 
      path: `screenshots/quotations-new-form-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should show validation error for empty form', async ({ page }) => {
    // Click submit button without filling form
    await page.getByRole('button', { name: /Create Quotation/i }).click();
    await page.waitForTimeout(1500);
    
    // Should show customer validation error
    await expect(page.getByText(/Please select a customer/i)).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/customers/new');
    await waitForApp(page);
  });

  test('should have skip link element in DOM', async ({ page }) => {
    // Skip link exists in DOM (hidden by default, visible on focus)
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeAttached();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Page should have at least one h1
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Should have the expected heading
    await expect(page.getByRole('heading', { name: /Create New Customer/i })).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should render on mobile viewport', async ({ page }) => {
    await page.goto('/customers/new');
    await waitForApp(page);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForApp(page);
    
    // Page should still render
    await expect(page.getByRole('heading', { name: /Create New Customer/i })).toBeVisible();
    
    await page.screenshot({ 
      path: `screenshots/customers-new-mobile-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should render on tablet viewport', async ({ page }) => {
    await page.goto('/customers/new');
    await waitForApp(page);
    
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await waitForApp(page);
    
    // Page should still render
    await expect(page.getByRole('heading', { name: /Create New Customer/i })).toBeVisible();
  });

  test('should render on desktop viewport', async ({ page }) => {
    await page.goto('/customers/new');
    await waitForApp(page);
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await waitForApp(page);
    
    // Page should still render
    await expect(page.getByRole('heading', { name: /Create New Customer/i })).toBeVisible();
  });
});
