/**
 * QA Test Suite for OMB Accounting Application
 * Tests all major pages for proper rendering and functionality
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000';
const SCREENSHOTS_DIR = path.join(__dirname, 'qa-screenshots');
const DELAY_MS = 3000; // Wait for React hydration

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const routes = [
  { path: '/', name: 'Dashboard', checkElements: ['Dashboard', '財務', 'Overview'] },
  { path: '/customers', name: 'Customers List', checkElements: ['Customers', '客戶', 'Add Customer'] },
  { path: '/customers/new', name: 'New Customer', checkElements: ['Customer', 'New Customer', 'Name'] },
  { path: '/quotations', name: 'Quotations List', checkElements: ['Quotations', '報價', 'Create'] },
  { path: '/quotations/new', name: 'New Quotation', checkElements: ['Quotation', 'New Quotation', 'Customer'] },
  { path: '/invoices', name: 'Invoices List', checkElements: ['Invoices', '發票', 'Create'] },
  { path: '/invoices/new', name: 'New Invoice', checkElements: ['Invoice', 'New Invoice', 'Customer'] },
  { path: '/reports', name: 'Reports', checkElements: ['Reports', '報告', 'Trial Balance'] },
  { path: '/bank', name: 'Bank Reconciliation', checkElements: ['Bank', '銀行', 'Reconciliation'] },
  { path: '/users', name: 'Users Management', checkElements: ['Users', '用戶', 'Management'] },
];

async function testPage(browser, route) {
  const page = await browser.newPage();
  const errors = [];
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${route.name.replace(/\s+/g, '-').toLowerCase()}.png`);

  try {
    console.log(`\n🧪 Testing: ${route.name} (${route.path})`);
    
    // Navigate to page
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for React hydration
    await delay(DELAY_MS);
    
    // Check for console errors
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    // Get page title
    const title = await page.title();
    console.log(`   📄 Title: ${title}`);
    
    // Check for required elements
    let elementsFound = 0;
    for (const element of route.checkElements) {
      // Use evaluate for better compatibility across Puppeteer versions
      const found = await page.evaluate((text) => {
        const allElements = Array.from(document.querySelectorAll('*'));
        let count = 0;
        allElements.forEach(el => {
          if (el.textContent && el.textContent.includes(text)) count++;
        });
        return count;
      }, element);
      
      if (found > 0) {
        elementsFound++;
        console.log(`   ✅ Found: "${element}"`);
      } else {
        console.log(`   ❌ Missing: "${element}"`);
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   📸 Screenshot: ${screenshotPath}`);
    
    // Report console errors
    if (consoleMessages.length > 0) {
      console.log(`   ⚠️ Console errors: ${consoleMessages.length}`);
      consoleMessages.forEach(err => console.log(`      - ${err.substring(0, 100)}`));
      errors.push(...consoleMessages);
    }
    
    const status = elementsFound === route.checkElements.length && errors.length === 0 ? 'PASS' : 'FAIL';
    console.log(`   📊 Status: ${status}`);
    
    return {
      route: route.name,
      path: route.path,
      status,
      title,
      elementsFound: `${elementsFound}/${route.checkElements.length}`,
      errors: errors.length,
      screenshot: screenshotPath
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      route: route.name,
      path: route.path,
      status: 'ERROR',
      error: error.message
    };
  } finally {
    await page.close();
  }
}

async function runQATests() {
  console.log('🚀 Starting QA Test Suite');
  console.log('='.repeat(50));
  console.log(`🌐 URL: ${BASE_URL}`);
  console.log(`📁 Screenshot Directory: ${SCREENSHOTS_DIR}`);
  console.log('='.repeat(50));
  
  let browser;
  const results = [];
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    // Test all routes
    for (const route of routes) {
      const result = await testPage(browser, route);
      results.push(result);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR').length;
    
    console.log(`✅ Passed: ${passed}/${routes.length}`);
    console.log(`❌ Failed: ${failed}/${routes.length}`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      results.filter(r => r.status !== 'PASS').forEach(r => {
        console.log(`  - ${r.route}: ${r.status}`);
        if (r.error) console.log(`    Error: ${r.error}`);
      });
    }
    
    // Save JSON report
    const reportPath = path.join(__dirname, 'qa-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      totalTests: routes.length,
      passed,
      failed,
      results
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 JSON Report: ${reportPath}`);
    
    console.log('\n✨ QA Test Suite Complete!');
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(`\n❌ Fatal Error: ${error.message}`);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

// Run the tests
runQATests();
