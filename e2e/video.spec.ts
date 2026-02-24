// @ts-check
/**
 * Video Recording Test Suite
 * Records video of key user flows for Discord sharing.
 * 
 * Run with: npx playwright test video.spec.ts --project=chromium --reporter=list
 */

const { test, expect } = require('@playwright/test');

// Helper function to wait for page
async function waitForApp(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe.configure({
  mode: 'serial',
  timeout: 60000,
});

test('1. Dashboard Page', async ({ page }) => {
  await page.goto('/');
  await waitForApp(page);
  await expect(page).toHaveTitle(/omb-accounting/);
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  console.log('✅ Dashboard page recorded');
});

test('2. Customer Creation Page', async ({ page }) => {
  await page.goto('/customers/new');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: /Create New Customer/i })).toBeVisible();
  console.log('✅ Customer creation page recorded');
});

test('3. Quotation Creation Page', async ({ page }) => {
  await page.goto('/quotations/new');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: /Create Quotation/i })).toBeVisible();
  await page.getByRole('button', { name: /Add Item/i }).click();
  await page.waitForTimeout(500);
  console.log('✅ Quotation creation page recorded');
});

test('4. Invoices Page', async ({ page }) => {
  await page.goto('/invoices');
  await waitForApp(page);
  console.log('✅ Invoices page recorded');
});

test('5. Mobile Responsive View', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await waitForApp(page);
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  console.log('✅ Mobile view recorded');
});
