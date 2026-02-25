import { test, expect } from '@playwright/test';

test.describe('E2E Video Tests - omb-accounting', () => {
  
  test('1. Create Quotation Page - Form Structure', async ({ page }) => {
    await page.goto('/quotations/new');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check main heading exists somewhere on page
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check form container exists
    await expect(page.locator('form').first()).toBeVisible();
    
    console.log('Create Quotation page loaded successfully');
  });

  test('2. Quotation List Page - Table & Actions', async ({ page }) => {
    await page.goto('/quotations');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check main heading exists
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check New Quotation button exists
    await expect(page.getByRole('button', { name: /new/i }).or(page.getByRole('button', { name: /create/i })).first()).toBeVisible();
    
    console.log('Quotation List page loaded successfully');
  });

  test('3. Invoice List Page - Table & Actions', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check main heading exists
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check Create Invoice button exists
    await expect(page.getByRole('button', { name: /create/i }).first()).toBeVisible();
    
    console.log('Invoice List page loaded successfully');
  });

  test('4. Complete Business Workflow - All Pages Demo', async ({ page }) => {
    // Start from Dashboard
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check page has content (any text visible)
    await expect(page.locator('body').first()).toContainText('omb');
    console.log('✓ Dashboard loaded');
    
    // Navigate to Customers
    await page.goto('/customers');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check Customers page
    await expect(page.locator('body').first()).toContainText('Customer');
    console.log('✓ Customers page loaded');
    
    // Navigate to Quotations
    await page.goto('/quotations');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check Quotations page
    await expect(page.locator('body').first()).toContainText('Quotation');
    console.log('✓ Quotations page loaded');
    
    // Navigate to Invoices
    await page.goto('/invoices');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check Invoices page
    await expect(page.locator('body').first()).toContainText('Invoice');
    console.log('✓ Invoices page loaded');
    
    // Navigate to Bank
    await page.goto('/bank');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Check Bank page - use body text check
    await expect(page.locator('body').first()).toContainText('Bank');
    console.log('✓ Bank page loaded');
    
    // Navigate to Settings (if exists)
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Check Settings page
    await expect(page.locator('body').first()).toContainText('Setting');
    console.log('✓ Settings page loaded');
    
    console.log('✓ Complete business workflow test passed');
  });

});
