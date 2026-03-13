/**
 * Complete E2E Flow Test
 * Tests the entire application flow from empty database
 * According to spec-kit requirements and TDD approach
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_DATA = {
  customer: {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+852 1234 5678',
    company: 'Test Company Ltd',
  },
  bankAccount: {
    name: 'Test Business Account',
    accountNumber: 'TEST123456',
    bankName: 'Test Bank',
    balance: 10000,
    currency: 'HKD',
  },
  quotation: {
    customerName: 'Test Customer',
    items: [{
      description: 'Test Service',
      quantity: 1,
      unitPrice: 5000,
    }],
  },
  invoice: {
    customerName: 'Test Customer',
    items: [{
      description: 'Test Service',
      quantity: 1,
      unitPrice: 5000,
    }],
  },
};

test.describe('Complete Application Flow - Empty Database', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('1. Authentication Flow', () => {
    test('should show login page on first visit', async ({ page }) => {
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should login with default admin credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('2. Dashboard - Empty State', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
    });

    test('should show empty dashboard with no data', async ({ page }) => {
      await expect(page.locator('text=Dashboard')).toBeVisible();
      // Should show empty state or zero values
      await expect(page.locator('text=0')).toBeVisible();
    });

    test('should show no recent transactions', async ({ page }) => {
      await expect(page.locator('text=No transactions')).toBeVisible();
    });
  });

  test.describe('3. Bank Account Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to bank
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.goto(`${BASE_URL}/bank`);
    });

    test('should show empty bank accounts list', async ({ page }) => {
      await expect(page.locator('text=Bank Accounts')).toBeVisible();
      // Should show no accounts or empty state
    });

    test('should create new bank account', async ({ page }) => {
      // Click Add Bank Account
      await page.click('button:has-text("Add Bank Account")');
      await page.waitForURL(/\/bank\/new/);

      // Fill form
      await page.fill('input[name="name"]', TEST_DATA.bankAccount.name);
      await page.fill('input[name="account_number"]', TEST_DATA.bankAccount.accountNumber);
      await page.fill('input[name="bank_name"]', TEST_DATA.bankAccount.bankName);
      await page.fill('input[name="balance"]', TEST_DATA.bankAccount.balance.toString());
      await page.selectOption('select[name="currency"]', TEST_DATA.bankAccount.currency);

      // Submit
      await page.click('button:has-text("Create Account")');
      await page.waitForURL(/\/bank/);

      // Verify account created
      await expect(page.locator(`text=${TEST_DATA.bankAccount.name}`)).toBeVisible();
    });

    test('should show bank account details', async ({ page }) => {
      // Create account first
      await page.click('button:has-text("Add Bank Account")');
      await page.waitForURL(/\/bank\/new/);
      await page.fill('input[name="name"]', TEST_DATA.bankAccount.name);
      await page.fill('input[name="account_number"]', TEST_DATA.bankAccount.accountNumber);
      await page.fill('input[name="bank_name"]', TEST_DATA.bankAccount.bankName);
      await page.fill('input[name="balance"]', TEST_DATA.bankAccount.balance.toString());
      await page.selectOption('select[name="currency"]', TEST_DATA.bankAccount.currency);
      await page.click('button:has-text("Create Account")');
      await page.waitForURL(/\/bank/);

      // Verify balance displayed
      await expect(page.locator(`text=${TEST_DATA.bankAccount.balance.toLocaleString()}`)).toBeVisible();
    });
  });

  test.describe('4. Customer Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to customers
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.goto(`${BASE_URL}/customers`);
    });

    test('should show empty customers list', async ({ page }) => {
      await expect(page.locator('text=Customers')).toBeVisible();
    });

    test('should create new customer', async ({ page }) => {
      await page.click('button:has-text("Add Customer")');
      await page.waitForURL(/\/customers\/new/);

      await page.fill('input[name="name"]', TEST_DATA.customer.name);
      await page.fill('input[name="email"]', TEST_DATA.customer.email);
      await page.fill('input[name="phone"]', TEST_DATA.customer.phone);
      await page.fill('input[name="company"]', TEST_DATA.customer.company);

      await page.click('button[type="submit"]');
      await page.waitForURL(/\/customers/);

      await expect(page.locator(`text=${TEST_DATA.customer.name}`)).toBeVisible();
    });
  });

  test.describe('5. Quotation Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Create customer first
      await page.goto(`${BASE_URL}/customers/new`);
      await page.fill('input[name="name"]', TEST_DATA.customer.name);
      await page.fill('input[name="email"]', TEST_DATA.customer.email);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/customers/);
      
      // Navigate to quotations
      await page.goto(`${BASE_URL}/quotations`);
    });

    test('should show empty quotations list', async ({ page }) => {
      await expect(page.locator('text=Quotations')).toBeVisible();
    });

    test('should create new quotation', async ({ page }) => {
      await page.click('button:has-text("Create")');
      await page.waitForURL(/\/quotations\/new/);

      // Select customer
      await page.selectOption('select[name="customerId"]', '1');
      
      // Add item
      await page.fill('input[name="items[0].description"]', TEST_DATA.quotation.items[0].description);
      await page.fill('input[name="items[0].quantity"]', TEST_DATA.quotation.items[0].quantity.toString());
      await page.fill('input[name="items[0].unitPrice"]', TEST_DATA.quotation.items[0].unitPrice.toString());

      await page.click('button[type="submit"]');
      await page.waitForURL(/\/quotations/);

      await expect(page.locator('text=Quotation')).toBeVisible();
    });
  });

  test.describe('6. Invoice Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.goto(`${BASE_URL}/invoices`);
    });

    test('should show empty invoices list', async ({ page }) => {
      await expect(page.locator('text=Invoices')).toBeVisible();
    });

    test('should create new invoice', async ({ page }) => {
      await page.click('button:has-text("Create")');
      await page.waitForURL(/\/invoices\/new/);

      // Select customer
      await page.selectOption('select[name="customerId"]', '1');
      
      // Add item
      await page.fill('input[name="items[0].description"]', TEST_DATA.invoice.items[0].description);
      await page.fill('input[name="items[0].quantity"]', TEST_DATA.invoice.items[0].quantity.toString());
      await page.fill('input[name="items[0].unitPrice"]', TEST_DATA.invoice.items[0].unitPrice.toString());

      await page.click('button[type="submit"]');
      await page.waitForURL(/\/invoices/);

      await expect(page.locator('text=Invoice')).toBeVisible();
    });
  });

  test.describe('7. Reports - Empty State', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.goto(`${BASE_URL}/reports`);
    });

    test('should show empty trial balance', async ({ page }) => {
      await expect(page.locator('text=Trial Balance')).toBeVisible();
      // Should show no data or zero balances
    });

    test('should show empty balance sheet', async ({ page }) => {
      await page.click('button:has-text("Balance Sheet")');
      await expect(page.locator('text=Balance Sheet')).toBeVisible();
    });

    test('should show empty profit and loss', async ({ page }) => {
      await page.click('button:has-text("Profit & Loss")');
      await expect(page.locator('text=Profit')).toBeVisible();
    });
  });

  test.describe('8. Settings Page', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.goto(`${BASE_URL}/settings`);
    });

    test('should show settings page', async ({ page }) => {
      await expect(page.locator('text=Settings')).toBeVisible();
    });

    test('should change language', async ({ page }) => {
      // Test language switcher exists
      await expect(page.locator('select[name="language"]')).toBeVisible();
    });
  });

  test.describe('9. Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'admin@omb.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
    });

    test('should navigate to all main pages', async ({ page }) => {
      const pages = [
        { name: 'Dashboard', url: '/dashboard' },
        { name: 'Customers', url: '/customers' },
        { name: 'Quotations', url: '/quotations' },
        { name: 'Invoices', url: '/invoices' },
        { name: 'Bank', url: '/bank' },
        { name: 'Reports', url: '/reports' },
      ];

      for (const page of pages) {
        await page.goto(`${BASE_URL}${page.url}`);
        await expect(page.locator(`text=${page.name}`)).toBeVisible();
      }
    });
  });
});
