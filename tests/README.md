# OMB Accounting - Test Suite

Complete test suite for testing application from empty database state.

## Test Types

### 1. Unit Tests (Jest)
- Location: `src/**/*.test.ts`
- Run: `npm test`
- Tests individual functions and components

### 2. API Integration Tests (Jest)
- Location: `tests/api/*.test.ts`
- Run: `npm run test:api`
- Tests API endpoints with database

### 3. E2E Tests (Playwright)
- Location: `tests/e2e/*.spec.ts`
- Run: `npm run test:e2e`
- Tests complete user flows via browser

## Running Tests

### Prerequisites

1. Start the application:
```bash
./docker-init.sh empty --no-compose
```

2. Ensure application is running on `http://localhost:3000`

### Run All Tests

```bash
# Unit tests
npm test

# API integration tests
npm run test:api

# E2E tests (requires running app)
npm run test:e2e
```

### Run Specific Test

```bash
# Specific API test
npm run test:api -- bank-accounts.test.ts

# Specific E2E test
npm run test:e2e -- complete-flow.spec.ts
```

## Test Coverage

### Bank Account Module
- ✅ Create bank account from empty database
- ✅ Read bank accounts (list and single)
- ✅ Update bank account
- ✅ Delete bank account
- ✅ Validation (duplicate account number, required fields)
- ✅ Error handling

### Customer Module
- ✅ Create customer
- ✅ Read customers
- ✅ Update customer
- ✅ Delete customer

### Quotation Module
- ✅ Create quotation
- ✅ Convert quotation to invoice
- ✅ Read quotations
- ✅ Update quotation
- ✅ Delete quotation

### Invoice Module
- ✅ Create invoice
- ✅ Read invoices
- ✅ Update invoice
- ✅ Mark as paid
- ✅ Delete invoice

### Reports Module
- ✅ Trial Balance (empty state)
- ✅ Balance Sheet (empty state)
- ✅ Profit & Loss (empty state)

### Navigation & UI
- ✅ All pages accessible
- ✅ Empty states display correctly
- ✅ Language switching works
- ✅ Responsive design

## Test Data

Default test credentials:
- Email: `admin@omb.com`
- Password: `admin123`

Test data is created during tests and cleaned up automatically.

## CI/CD Integration

```yaml
# Example GitHub Actions
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - run: npm ci
    - run: npm test
    - run: npm run test:api
    - run: npm run build
    - run: npm run test:e2e
```

## Troubleshooting

### "unable to open database file"
- Ensure `/app/data` directory exists and has write permissions
- Check `DATABASE_PATH` environment variable

### "this.db.get is not a function"
- Rebuild Docker image: `docker-compose build --no-cache`
- Ensure `better-sqlite3` native bindings are compiled

### E2E tests fail
- Ensure application is running: `http://localhost:3000`
- Check if default admin account exists
- Verify no other tests are running simultaneously

## Writing New Tests

### API Test Template

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Module API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@omb.com', password: 'admin123' }),
    });
    const data = await response.json();
    authToken = data.token;
  });

  it('should do something', async () => {
    const response = await fetch('http://localhost:3000/api/endpoint', {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    expect(response.status).toBe(200);
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@omb.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
  });

  test('should work', async ({ page }) => {
    await page.goto('http://localhost:3000/feature');
    await expect(page.locator('text=Feature')).toBeVisible();
  });
});
```

## Test Results

After running tests, check:
- `coverage/` - Code coverage reports
- `test-results/` - E2E test screenshots and videos
- Console output - Detailed test results

## Continuous Testing

For development, run tests in watch mode:

```bash
# Unit tests watch mode
npm run test:watch

# E2E tests with UI
npm run test:e2e:ui
```
