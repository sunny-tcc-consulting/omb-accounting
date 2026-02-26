const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8000';
const TIMEOUT = 30000;
const SCREENSHOT_DIR = './qa-screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  pages: []
};

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📋';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function testPage(browser, pageName, urlPath, checks = []) {
  const pageData = {
    name: pageName,
    url: `${BASE_URL}${urlPath}`,
    passed: true,
    consoleErrors: [],
    checks: [],
    screenshot: null
  };

  try {
    const page = await browser.newPage();
    
    // Collect console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageData.consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      pageData.consoleErrors.push(err.toString());
    });

    log(`Testing: ${pageName} (${urlPath})`);
    
    await page.goto(pageData.url, { waitUntil: 'networkidle2', timeout: TIMEOUT });
    
    // Wait a bit for dynamic content
    await new Promise(r => setTimeout(r, 2000));

    // Run checks
    for (const check of checks) {
      try {
        const result = await page.evaluate(check.selector);
        if (result) {
          pageData.checks.push({ name: check.name, passed: true });
          testResults.passed++;
        } else {
          pageData.checks.push({ name: check.name, passed: false });
          pageData.passed = false;
          testResults.failed++;
        }
      } catch (err) {
        pageData.checks.push({ name: check.name, passed: false, error: err.message });
        pageData.passed = false;
        testResults.failed++;
      }
    }

    // Take screenshot
    const screenshotPath = `${SCREENSHOT_DIR}/${pageName.replace(/\//g, '-')}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    pageData.screenshot = screenshotPath;

    // Check for console errors
    if (pageData.consoleErrors.length > 0) {
      pageData.passed = false;
      pageData.consoleErrors.forEach(err => {
        log(`  Console Error: ${err}`, 'error');
        testResults.errors.push({ page: pageName, error: err });
      });
    }

    if (pageData.passed) {
      log(`  ✅ ${pageName} - All checks passed`, 'success');
    } else {
      log(`  ❌ ${pageName} - Some checks failed`, 'error');
    }

    await page.close();
    testResults.pages.push(pageData);

  } catch (err) {
    log(`  ❌ ${pageName} - Error: ${err.message}`, 'error');
    testResults.errors.push({ page: pageName, error: err.message });
    testResults.failed++;
    testResults.pages.push({
      name: pageName,
      url: `${BASE_URL}${urlPath}`,
      passed: false,
      error: err.message
    });
  }
}

async function runQA() {
  log('🚀 Starting QA Test for omb-accounting');
  log('==========================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const pagesToTest = [
    // Dashboard
    {
      name: 'Dashboard',
      path: '/',
      checks: [
        { name: 'Page title contains accounting', selector: "document.title.includes('accounting')" },
        { name: 'Dashboard heading exists', selector: "document.querySelector('h1, h2')?.textContent?.length > 0" },
        { name: 'Navigation exists', selector: "document.querySelector('nav, .sidebar, [class*=nav]')" },
        { name: 'No critical console errors', selector: "!document.body.innerHTML.includes('Error:')" }
      ]
    },
    // Customers
    {
      name: 'Customers-List',
      path: '/customers',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Customers heading or table exists', selector: "document.querySelector('h1, h2, table, [class*=table]')" },
        { name: 'Add button or link exists', selector: "document.querySelector('a[href*=\"new\"], button')" }
      ]
    },
    {
      name: 'Customers-New',
      path: '/customers/new',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Form or input fields exist', selector: "document.querySelector('form, input, [class*=form]')" },
        { name: 'Submit button exists', selector: "document.querySelector('button[type=\"submit\"], [type=\"submit\"]')" }
      ]
    },
    // Quotations
    {
      name: 'Quotations-List',
      path: '/quotations',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Quotations heading or table exists', selector: "document.querySelector('h1, h2, table, [class*=table]')" },
        { name: 'Create button exists', selector: "document.querySelector('a[href*=\"new\"], button')" }
      ]
    },
    {
      name: 'Quotations-New',
      path: '/quotations/new',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Form fields exist', selector: "document.querySelector('form, input, select, [class*=form]')" },
        { name: 'Customer selector exists', selector: "document.querySelector('select, [class*=select]')" }
      ]
    },
    // Invoices
    {
      name: 'Invoices-List',
      path: '/invoices',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Invoices heading or table exists', selector: "document.querySelector('h1, h2, table, [class*=table]')" },
        { name: 'Create button exists', selector: "document.querySelector('a[href*=\"new\"], button')" }
      ]
    },
    {
      name: 'Invoices-New',
      path: '/invoices/new',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Form fields exist', selector: "document.querySelector('form, input, select, [class*=form]')" },
        { name: 'Line items section exists', selector: "document.querySelector('[class*=item], table, [class*=line]')" }
      ]
    },
    // Reports (single page with tabs)
    {
      name: 'Reports',
      path: '/reports',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Report heading exists', selector: "document.querySelector('h1, h2')?.textContent?.length > 0" },
        { name: 'Filter controls exist', selector: "document.querySelector('input, select, [class*=filter]')" },
        { name: 'Tabs exist', selector: "document.querySelector('button, a, [role=tab]')" }
      ]
    },
    // Bank
    {
      name: 'Bank-Overview',
      path: '/bank',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Bank overview exists', selector: "document.querySelector('h1, h2, [class*=bank]')" },
        { name: 'Account list exists', selector: "document.querySelector('table, [class*=account]')" }
      ]
    },
    // Users (might need auth)
    {
      name: 'Users-List',
      path: '/users',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Users heading exists', selector: "document.querySelector('h1, h2')?.textContent?.length > 0" }
      ]
    },
    // Auth Pages
    {
      name: 'Auth-Login',
      path: '/auth/login',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Login form exists', selector: "document.querySelector('form')" },
        { name: 'Email input exists', selector: "document.querySelector('input[type=\"email\"], input#email')" }
      ]
    },
    {
      name: 'Auth-Register',
      path: '/auth/register',
      checks: [
        { name: 'Page loads', selector: "document.body.innerHTML.length > 100" },
        { name: 'Register form exists', selector: "document.querySelector('form, input')" }
      ]
    }
  ];

  for (const testCase of pagesToTest) {
    await testPage(browser, testCase.name, testCase.path, testCase.checks);
  }

  await browser.close();

  // Generate Report
  log('\n==========================================');
  log('📊 QA Test Summary');
  log('==========================================');
  log(`Total Pages Tested: ${testResults.pages.length}`);
  log(`✅ Passed: ${testResults.passed}`);
  log(`❌ Failed: ${testResults.failed}`);
  log(`⚠️ Console Errors Found: ${testResults.errors.length}`);

  if (testResults.errors.length > 0) {
    log('\n📋 Pages with Console Errors:');
    testResults.errors.forEach(err => {
      log(`  - ${err.page}: ${err.error.substring(0, 100)}...`, 'warning');
    });
  }

  const failedPages = testResults.pages.filter(p => !p.passed);
  if (failedPages.length > 0) {
    log('\n❌ Failed Pages:');
    failedPages.forEach(p => {
      log(`  - ${p.name}`);
      if (p.checks) {
        p.checks.filter(c => !c.passed).forEach(c => {
          log(`    - Check failed: ${c.name}`);
        });
      }
    });
  }

  // Save detailed report
  const reportPath = `${SCREENSHOT_DIR}/qa-report.json`;
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`);
  log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);

  return testResults;
}

runQA()
  .then(results => {
    console.log('\n🚀 QA Testing Complete!');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(err => {
    console.error('QA Test failed:', err);
    process.exit(1);
  });
