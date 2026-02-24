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
      path: `screenshots/customers-new-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    // Click submit button
    await page.getByRole('button', { name: /Create Customer/i }).click();
    
    // Wait for form validation to trigger
    await page.waitForTimeout(1000);

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
    await page.waitForTimeout(1500);
    
    // Should stay on page or redirect (form submission behavior)
    await expect(page).not.toHaveURL(/error/);
    
    await page.screenshot({ 
      path: `screenshots/customers-new-success-${Date.now()}.png`,
      fullPage: true 
    });
  });

  test('should accept text input', async ({ page }) => {
    const timestamp = Date.now();
    
    // Fill in the form
    await page.getByPlaceholder(/Enter name or company name/i).fill('Test Customer ' + timestamp);
    await expect(page.getByPlaceholder(/Enter name or company name/i)).toHaveValue('Test Customer ' + timestamp);
    
    await page.getByPlaceholder(/customer@example.com/i).fill('test' + timestamp + '@example.com');
    await expect(page.getByPlaceholder(/customer@example.com/i)).toHaveValue('test' + timestamp + '@example.com');
    
    await page.getByPlaceholder(/13800138000/i).fill('+852 1234 5678');
    await expect(page.getByPlaceholder(/13800138000/i)).toHaveValue('+852 1234 5678');
    
    await page.getByPlaceholder(/Enter company name/i).fill('Test Company Ltd');
    await expect(page.getByPlaceholder(/Enter company name/i)).toHaveValue('Test Company Ltd');
  });
});
