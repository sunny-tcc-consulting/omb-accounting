import { test } from "@playwright/test";
import type { Page } from "@playwright/test";

// Helper function for random delay between 1-3 seconds
function randomDelay(page: Page) {
  const delay = Math.floor(Math.random() * 2000) + 1000;
  return page.waitForTimeout(delay);
}

test.describe("Business Workflow Video Recordings", () => {
  test("1. Customer Management - Create & Edit Customer", async ({ page }) => {
    // Start at Dashboard
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    randomDelay(page);
    console.log("📍 Dashboard loaded");

    // Navigate to Customers
    await page.goto("/customers");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("📍 Customers list page");

    // Click New Customer
    const newButton = page.getByRole("button", { name: /new customer/i });
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForLoadState("domcontentloaded");
      await randomDelay(page);
      console.log("📍 Customer form opened");
    }

    // Fill form
    const nameInput = page.getByLabel(/name/i).first();
    const emailInput = page.getByLabel(/email/i).first();

    if (await nameInput.isVisible()) {
      await nameInput.fill("Video Test Customer");
      console.log("📍 Filled customer name");
    }
    if (await emailInput.isVisible()) {
      await emailInput.fill("video-test@example.com");
      console.log("📍 Filled customer email");
    }

    await randomDelay(page);

    // Save
    const saveButton = page.getByRole("button", { name: /save/i }).first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await randomDelay(page);
      console.log("📍 Customer saved");
    }

    console.log("✅ Customer Management Video Complete");
  });

  test("2. Quotation Workflow - Create to Convert", async ({ page }) => {
    // Navigate to Quotations
    await page.goto("/quotations");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("📍 Quotations list");

    // Click New Quotation
    await page.goto("/quotations/new");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("📍 New quotation form");

    // Select customer
    const customerSelect = page.getByLabel(/customer/i).first();
    if (await customerSelect.isVisible()) {
      await customerSelect.click();
      await randomDelay(page);
      console.log("📍 Customer dropdown opened");
    }

    // Fill quotation details
    await randomDelay(page);

    // Add line item
    const addItemButton = page
      .getByRole("button", { name: /add item/i })
      .first();
    if (await addItemButton.isVisible()) {
      await addItemButton.click();
      await randomDelay(page);
      console.log("📍 Adding line item");
    }

    // Fill item details
    const descInput = page.getByLabel(/description/i).first();
    if (await descInput.isVisible()) {
      await descInput.fill("Web Development Services");
      console.log("📍 Added service description");
    }

    await randomDelay(page);

    // Save quotation
    const saveButton = page.getByRole("button", { name: /save/i }).first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await randomDelay(page);
      console.log("📍 Quotation saved");
    }

    // Navigate to Bank Reconciliation
    await page.goto("/bank");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("📍 Bank reconciliation page");

    console.log("✅ Quotation Workflow Video Complete");
  });

  test("3. Invoice Workflow - Create to Payment", async ({ page }) => {
    // Navigate to Invoices
    await page.goto("/invoices");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("📍 Invoices list");

    // Click New Invoice
    await page.goto("/invoices/new");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("📍 New invoice form");

    // Select customer
    const customerSelect = page.getByLabel(/customer/i).first();
    if (await customerSelect.isVisible()) {
      await customerSelect.click();
      await randomDelay(page);
      console.log("📍 Customer selected");
    }

    await randomDelay(page);

    // Add line items
    const addItemButton = page
      .getByRole("button", { name: /add item/i })
      .first();
    if (await addItemButton.isVisible()) {
      await addItemButton.click();
      await randomDelay(page);
      console.log("📍 Adding line item");
    }

    const descInput = page.getByLabel(/description/i).first();
    if (await descInput.isVisible()) {
      await descInput.fill("Consulting Services");
      await randomDelay(page);
      console.log("📍 Service description added");
    }

    // Save invoice
    const saveButton = page.getByRole("button", { name: /save/i }).first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await randomDelay(page);
      console.log("📍 Invoice saved");
    }

    console.log("✅ Invoice Workflow Video Complete");
  });

  test("4. Bank Reconciliation - Add Account & Reconcile", async ({ page }) => {
    // Navigate to Bank
    await page.goto("/bank");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("📍 Bank reconciliation page");

    // Check for heading
    const h1 = page.locator("h1").first();
    if (await h1.isVisible()) {
      console.log(`📍 Page title: ${await h1.textContent()}`);
    }

    // Look for bank accounts section
    const bankAccounts = page
      .locator('.bank-accounts, section[class*="account"]')
      .first();
    if (await bankAccounts.isVisible()) {
      console.log("📍 Bank accounts section visible");
    }

    // Look for transactions
    const transactions = page.locator("table").first();
    if (await transactions.isVisible()) {
      console.log("📍 Transactions table visible");
    }

    await randomDelay(page);

    // Check for reconciliation status
    const status = page.locator('.status, [class*="reconciliation"]').first();
    if (await status.isVisible()) {
      console.log("📍 Reconciliation status visible");
    }

    console.log("✅ Bank Reconciliation Video Complete");
  });

  test("5. Full Business Day - Complete Workflow Demo", async ({ page }) => {
    // Start from Dashboard
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("✅ 1. Dashboard loaded");

    // Navigate to Customers
    await page.goto("/customers");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("✅ 2. Customers page");

    // Navigate to Quotations
    await page.goto("/quotations");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("✅ 3. Quotations page");

    // Navigate to Invoices
    await page.goto("/invoices");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("✅ 4. Invoices page");

    // Navigate to Bank
    await page.goto("/bank");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("✅ 5. Bank reconciliation page");

    // Navigate to Settings
    await page.goto("/settings");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("✅ 6. Settings page");

    // Return to Dashboard
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
    console.log("✅ 7. Returned to Dashboard");

    console.log("🎬 Complete Business Day Workflow Demo Complete");
  });
});
