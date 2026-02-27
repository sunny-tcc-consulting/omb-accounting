/**
 * QA Test Cases for omb-accounting
 * Testing all major pages and functionality
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const SCREENSHOTS_DIR = path.join(__dirname, 'qa-screenshots');

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(page, testName) {
  const filename = `${testName.replace(/[^a-z0-9]/gi, '_')}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function testPage(page, url, testName, checks = []) {
  const test = { name: testName, status: 'pending', checks: [], screenshot: null, errors: [] };
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    // Wait for React to hydrate
    await delay(2000);
    test.status = 'loaded';
    
    for (const check of checks) {
      try {
        await page.waitForSelector(check.selector, { timeout: 5000 });
        test.checks.push({ name: check.name, status: 'passed' });
      } catch (e) {
        test.checks.push({ name: check.name, status: 'failed', error: e.message });
        test.errors.push(`${check.name}: ${e.message}`);
      }
    }
    
    test.screenshot = await captureScreenshot(page, testName);
    test.status = test.errors.length === 0 ? 'passed' : 'failed';
    
  } catch (e) {
    test.status = 'failed';
    test.errors.push(`Page load error: ${e.message}`);
    test.screenshot = await captureScreenshot(page, `${testName}_error`);
  }
  
  if (test.status === 'passed') results.passed++;
  else results.failed++;
  
  results.tests.push(test);
  return test;
}

async function runTests() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  console.log('🧪 Starting QA Tests for omb-accounting\n');
  console.log('='.repeat(60));

  // 1. Dashboard Page
  console.log('\n📊 Testing Dashboard Page...');
  await testPage(page, BASE_URL, 'dashboard', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Content container', selector: '.max-w-7xl' },
    { name: 'Search input', selector: 'input[type="text"]' }
  ]);

  // 2. Customers List Page
  console.log('\n👥 Testing Customers Page...');
  await testPage(page, `${BASE_URL}/customers`, 'customers_list', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Content container', selector: '.max-w-7xl' },
    { name: 'Buttons', selector: 'button' }
  ]);

  // 3. New Customer Page
  console.log('\n➕ Testing New Customer Page...');
  await testPage(page, `${BASE_URL}/customers/new`, 'customers_new', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Form elements', selector: 'form' },
    { name: 'Submit button', selector: 'button[type="submit"]' }
  ]);

  // 4. Quotations List Page
  console.log('\n📄 Testing Quotations Page...');
  await testPage(page, `${BASE_URL}/quotations`, 'quotations_list', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Content container', selector: '.max-w-7xl' },
    { name: 'Buttons', selector: 'button' }
  ]);

  // 5. New Quotation Page
  console.log('\n✏️ Testing New Quotation Page...');
  await testPage(page, `${BASE_URL}/quotations/new`, 'quotations_new', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Form elements', selector: 'form' },
    { name: 'Select element', selector: 'select' },
    { name: 'Submit button', selector: 'button[type="submit"]' }
  ]);

  // 6. Invoices List Page
  console.log('\n🧾 Testing Invoices Page...');
  await testPage(page, `${BASE_URL}/invoices`, 'invoices_list', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Content container', selector: '.max-w-7xl' },
    { name: 'Buttons', selector: 'button' }
  ]);

  // 7. New Invoice Page
  console.log('\n📝 Testing New Invoice Page...');
  await testPage(page, `${BASE_URL}/invoices/new`, 'invoices_new', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Form elements', selector: 'form' },
    { name: 'Submit button', selector: 'button[type="submit"]' }
  ]);

  // 8. Reports Page
  console.log('\n📈 Testing Reports Page...');
  await testPage(page, `${BASE_URL}/reports`, 'reports', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Content container', selector: '.max-w-7xl' },
    { name: 'Interactive elements', selector: 'input, select, button' }
  ]);

  // 9. Bank Reconciliation Page
  console.log('\n🏦 Testing Bank Page...');
  await testPage(page, `${BASE_URL}/bank`, 'bank', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Content container', selector: '.max-w-7xl' },
    { name: 'Interactive elements', selector: 'input, select, button' }
  ]);

  // 10. Users Management Page
  console.log('\n👤 Testing Users Page...');
  await testPage(page, `${BASE_URL}/users`, 'users', [
    { name: 'Page title', selector: 'h1' },
    { name: 'Content container', selector: '.max-w-7xl' },
    { name: 'Interactive elements', selector: 'input, select, button' }
  ]);

  // Check for console errors on each page
  console.log('\n🔍 Console Error Check...');
  const errorCount = errors.length;
  console.log(`Total console errors found: ${errorCount}`);
  if (errorCount > 0) {
    console.log('\nErrors:');
    errors.forEach((err, i) => console.log(`  ${i+1}. ${err}`));
  }

  await browser.close();

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 QA Test Results Summary');
  console.log('-'.repeat(40));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  console.log('\nDetailed Results:');
  
  results.tests.forEach((test, i) => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    console.log(`\n${icon} ${i+1}. ${test.name} (${test.status})`);
    if (test.checks.length > 0) {
      test.checks.forEach(check => {
        const checkIcon = check.status === 'passed' ? '✓' : '✗';
        console.log(`   ${checkIcon} ${check.name}`);
      });
    }
    if (test.errors.length > 0) {
      console.log(`   Errors: ${test.errors.join(', ')}`);
    }
    console.log(`   Screenshot: ${path.basename(test.screenshot)}`);
  });

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      failed: results.failed,
      total: results.passed + results.failed
    },
    tests: results.tests,
    consoleErrors: errors
  };
  
  fs.writeFileSync(
    path.join(SCREENSHOTS_DIR, 'qa-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log(`📄 Report saved to: ${path.join(SCREENSHOTS_DIR, 'qa-report.json')}`);

  return results;
}

runTests().catch(console.error);
