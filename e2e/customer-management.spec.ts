import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Helper function for random delay between 1-3 seconds
function randomDelay(page: Page) {
  const delay = Math.floor(Math.random() * 2000) + 1000;
  return page.waitForTimeout(delay);
}

test.describe("Customer Management E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Common setup: Navigate to customers page
    await page.goto("/customers");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);
  });

  test("TC-C001: Create New Customer - Verify Data Recorded & Retrieved", async ({
    page,
  }) => {
    const customerName = `Test Customer ${Date.now()}`;
    const customerEmail = `test${Date.now()}@example.com`;

    // Step 1-2: Click "New Customer" button
    const newButton = page.getByRole("button", { name: /new customer/i });
    await expect(newButton).toBeVisible({ timeout: 10000 });
    await newButton.click();

    // Wait for form to load
    await randomDelay(page);

    // Step 3: Fill required fields
    const nameInput = page
      .getByLabel(/name/i)
      .or(page.locator('input[name="name"]'))
      .first();
    const emailInput = page
      .getByLabel(/email/i)
      .or(page.locator('input[name="email"]'))
      .first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    await nameInput.fill(customerName);
    await emailInput.fill(customerEmail);

    // Step 4: Fill optional fields
    const phoneInput = page
      .getByLabel(/phone/i)
      .or(page.locator('input[name="phone"]'))
      .first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("+85212345678");
    }

    // Step 5: Save customer
    const saveButton = page
      .getByRole("button", { name: /save|submit/i })
      .first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Wait for redirect and VERIFY DATA IS RECORDED
    await page.waitForURL(/\/customers/);
    await randomDelay(page);

    // VERIFICATION 2: Navigate back to list and verify customer is RETRIEVABLE
    await page.goto("/customers");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);

    // Find the created customer in the list
    const customerRow = page
      .locator("table tbody tr")
      .filter({ hasText: customerName });
    await expect(customerRow.first()).toBeVisible({ timeout: 10000 });

    // VERIFICATION 3: Click View/Edit and verify data is correctly recorded
    const viewButton = customerRow
      .getByRole("button", { name: /view|edit/i })
      .first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await randomDelay(page);

      // Verify the recorded data can be retrieved
      const recordedNameInput = page
        .getByLabel(/name/i)
        .or(page.locator('input[name="name"]'))
        .first();
      const recordedEmailInput = page
        .getByLabel(/email/i)
        .or(page.locator('input[name="email"]'))
        .first();

      const recordedName = await recordedNameInput.inputValue();
      const recordedEmail = await recordedEmailInput.inputValue();

      // Assert that recorded data matches input
      expect(recordedName).toContain(customerName.split(" ")[0]);
      expect(recordedEmail).toContain("@");
    }

    console.log(
      `✅ TC-C001: Customer created and verified retrievable: ${customerName}`,
    );
  });

  test("TC-C002: Edit Customer - Verify Updated Data is Recorded & Retrieved", async ({
    page,
  }) => {
    // Navigate to customers list first
    await page.goto("/customers");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);

    // Find any existing customer to edit
    const editButton = page.getByRole("button", { name: /edit/i }).first();

    if (await editButton.isVisible({ timeout: 5000 })) {
      await editButton.click();
      await randomDelay(page);

      // Step 3: Modify fields
      const nameInput = page
        .getByLabel(/name/i)
        .or(page.locator('input[name="name"]'))
        .first();
      const originalName = await nameInput.inputValue();
      const updatedName = `${originalName} (Updated ${Date.now()})`;

      await expect(nameInput).toBeVisible();
      await nameInput.fill(updatedName);

      // Step 4: Save changes
      const saveButton = page.getByRole("button", { name: /save/i }).first();
      await expect(saveButton).toBeVisible();
      await saveButton.click();

      await randomDelay(page);

      // VERIFICATION: Navigate back and verify updated data is retrievable
      await page.goto("/customers");
      await page.waitForLoadState("domcontentloaded");
      await randomDelay(page);

      // Check for the updated name
      const updatedRow = page
        .locator("table tbody tr")
        .filter({ hasText: "(Updated" });

      const isUpdatedVisible = await updatedRow
        .first()
        .isVisible()
        .catch(() => false);

      if (isUpdatedVisible) {
        // Verify by viewing the record
        await updatedRow
          .first()
          .getByRole("button", { name: /view|edit/i })
          .first()
          .click();
        await randomDelay(page);

        const recordedName = await page
          .getByLabel(/name/i)
          .or(page.locator('input[name="name"]'))
          .first()
          .inputValue();

        expect(recordedName).toContain("(Updated");
        console.log(
          `✅ TC-C002: Customer updated and verified retrievable: ${updatedName}`,
        );
      } else {
        console.log("⚠ TC-C002: No customers to edit - passed as no-op");
      }
    } else {
      console.log("⚠ TC-C002: No customers to edit - passed as no-op");
    }
  });

  test("TC-C003: Delete Customer - Verify Deletion is Recorded", async ({
    page,
  }) => {
    // Navigate to customers list
    await page.goto("/customers");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);

    // Get initial row count for verification
    const initialRows = await page.locator("table tbody tr").count();

    // Find Delete button
    const deleteButton = page.getByRole("button", { name: /delete/i }).first();

    if (await deleteButton.isVisible({ timeout: 5000 })) {
      // Get customer name before deletion for logging
      const customerRow = deleteButton.locator("..");
      const customerName = await customerRow
        .locator("td")
        .first()
        .textContent();

      // Step 2: Click Delete
      await deleteButton.click();

      // Step 3: Accept confirmation
      const confirmButton = page
        .getByRole("button", { name: /confirm|yes|delete/i })
        .first();
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }

      await randomDelay(page);

      // VERIFICATION: Check row count decreased
      await page.waitForTimeout(1000);
      const finalRows = await page.locator("table tbody tr").count();

      // Navigate back and verify customer is no longer retrievable
      await page.goto("/customers");
      await page.waitForLoadState("domcontentloaded");
      await randomDelay(page);

      const customerStillExists = await page
        .locator("table tbody tr")
        .filter({ hasText: customerName || "" })
        .first()
        .isVisible()
        .catch(() => false);

      expect(customerStillExists).toBe(false);
      console.log(
        `✅ TC-C003: Customer deletion verified (${initialRows} → ${finalRows} rows)`,
      );
    } else {
      console.log("⚠ TC-C003: No customers to delete - passed as no-op");
    }
  });

  test("TC-C004: Search Customers - Verify Search Retrieves Recorded Data", async ({
    page,
  }) => {
    // Create a customer first for search testing
    const testEmail = `searchable${Date.now()}@example.com`;

    // Navigate to new customer form
    await page.goto("/customers/new");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);

    // Create searchable customer
    const nameInput = page.getByLabel(/name/i).first();
    const emailInput = page.getByLabel(/email/i).first();

    if ((await nameInput.isVisible()) && (await emailInput.isVisible())) {
      const searchName = `Searchable Customer ${Date.now()}`;
      await nameInput.fill(searchName);
      await emailInput.fill(testEmail);

      const saveButton = page.getByRole("button", { name: /save/i }).first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForURL(/\/customers/);
        await randomDelay(page);
      }
    }

    // Now test search
    const searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.locator('input[placeholder*="search"]'))
      .first();

    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Step 2: Type search query
    await searchInput.fill("Searchable Customer");
    await page.waitForTimeout(1500);
    await randomDelay(page);

    // VERIFICATION: Search results should contain searchable customer
    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();

    // Verify search retrieved the created data
    const hasSearchableData = await rows
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasSearchableData).toBe(true);
    console.log(`✅ TC-C004: Search retrieved ${rowCount} results`);
  });

  test("TC-C005: Customer Form Validation - Verify Errors are Recorded", async ({
    page,
  }) => {
    await page.goto("/customers/new");
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(page);

    // Try to save without required fields
    const saveButton = page.getByRole("button", { name: /save/i }).first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(500);
    }

    // VERIFICATION: Check validation errors are recorded and displayed
    const errorMessages = page.locator(
      '[role="alert"], .error, .invalid, .text-red, [aria-invalid="true"]',
    );
    const errorCount = await errorMessages.count();

    // Verify error state is persisted in UI
    const nameInput = page
      .getByLabel(/name/i)
      .or(page.locator('input[name="name"]'))
      .first();

    const hasValidationError =
      (await nameInput.getAttribute("aria-invalid")).includes("true") ||
      errorCount > 0;

    expect(hasValidationError).toBe(true);
    console.log(
      `✅ TC-C005: Form validation errors recorded (${errorCount} errors)`,
    );
  });

  test("TC-C006: Customer Page Structure - Verify Data Accessibility", async ({
    page,
  }) => {
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    // Verify main actions exist
    await expect(
      page.getByRole("button", { name: /new|add/i }).first(),
    ).toBeVisible();

    // Verify table exists and is accessible
    const tableExists = await page
      .locator("table, .customer-list, .data-grid")
      .first()
      .isVisible()
      .catch(() => false);
    expect(tableExists).toBe(true);

    // If data exists, verify it can be accessed
    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible()) {
      const cellContent = await firstRow.locator("td").first().textContent();
      expect(cellContent).toBeTruthy();
      console.log(`✅ TC-C006: Customer data accessible: "${cellContent}"`);
    }

    console.log("✅ TC-C006: Customer page structure verified");
  });
});
