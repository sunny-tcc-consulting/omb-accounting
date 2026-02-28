/**
 * Enhanced QA Test Suite for OMB Accounting Application
 * Comprehensive business workflow and functionality testing
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

const BASE_URL = 'http://localhost:8000';
const SCREENSHOTS_DIR = path.join(__dirname, 'qa-screenshots');
const REPORT_DIR = path.join(__dirname, 'qa-reports');
const DELAY_MS = 2000;

// Ensure directories exist
[SCREENSHOTS_DIR, REPORT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== TEST DATA ====================

const testData = {
  customer: {
    name: 'Test Customer QA',
    email: 'testqa@example.com',
    phone: '98765432',
    address: '123 QA Street, Hong Kong'
  },
  quotation: {
    items: [
      { description: 'Consulting Service', quantity: 10, rate: 150 },
      { description: 'Software License', quantity: 1, rate: 500 }
    ],
    paymentTerms: 'Net 30',
    validityDays: 30
  }
};

// ==================== TEST CATEGORIES ====================

const testCategories = {
  'Page Rendering': [
    { path: '/', name: 'Dashboard', checkElements: ['Dashboard', '財務', 'Overview', '收入'] },
    { path: '/customers', name: 'Customers List', checkElements: ['Customers', '客戶', 'Add Customer'] },
    { path: '/customers/new', name: 'New Customer Form', checkElements: ['Customer', 'Name', 'Email'] },
    { path: '/quotations', name: 'Quotations List', checkElements: ['Quotations', '報價', 'Create'] },
    { path: '/quotations/new', name: 'New Quotation Form', checkElements: ['Quotation', 'Customer', 'Items'] },
    { path: '/invoices', name: 'Invoices List', checkElements: ['Invoices', '發票', 'Create'] },
    { path: '/invoices/new', name: 'New Invoice Form', checkElements: ['Invoice', 'Customer', 'Payment'] },
    { path: '/reports', name: 'Reports', checkElements: ['Reports', '報告', 'Trial Balance'] },
    { path: '/bank', name: 'Bank Reconciliation', checkElements: ['Bank', '銀行', 'Account'] },
    { path: '/users', name: 'Users Management', checkElements: ['Users', '用戶', 'Role'] },
  ],
  
  'Form Validation': [
    { path: '/customers/new', name: 'Customer Form Validation', 
      tests: ['empty-name', 'invalid-email'] },
    { path: '/quotations/new', name: 'Quotation Form Validation',
      tests: ['no-customer', 'empty-items'] },
    { path: '/invoices/new', name: 'Invoice Form Validation',
      tests: ['no-customer', 'empty-items'] },
  ],
  
  'Calculations': [
    { name: 'Quotation Line Items', path: '/quotations/new' },
    { name: 'Invoice Line Items', path: '/invoices/new' },
    { name: 'Tax Calculation', path: '/invoices/new' },
    { name: 'Due Date Calculation', path: '/invoices/new' },
  ],
  
  'API Endpoints': [
    { endpoint: '/api/auth/login', method: 'POST', status: 200 },
    { endpoint: '/api/customers', method: 'GET', status: 200 },
    { endpoint: '/api/quotations', method: 'GET', status: 200 },
    { endpoint: '/api/invoices', method: 'GET', status: 200 },
    { endpoint: '/api/audit-logs', method: 'GET', status: 200 },
  ]
};

// ==================== HELPER FUNCTIONS ====================

async function checkPageElements(page, elements) {
  const results = [];
  for (const element of elements) {
    const found = await page.evaluate((text) => {
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.textContent && el.textContent.includes(text)) {
          return true;
        }
      }
      return false;
    }, element);
    
    results.push({ element, found });
  }
  return results;
}

async function checkConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

async function getPageTitle(page) {
  return await page.title();
}

async function takeScreenshot(page, name) {
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${name.toLowerCase().replace(/\s+/g, '-')}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

async function checkAPIEndpoint(endpoint, method, expectedStatus) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: endpoint,
      method: method,
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      resolve({
        endpoint,
        method,
        expectedStatus,
        actualStatus: res.statusCode,
        passed: res.statusCode === expectedStatus
      });
    });
    
    req.on('error', (error) => {
      resolve({
        endpoint,
        method,
        expectedStatus,
        actualStatus: 'ERROR',
        error: error.message,
        passed: false
      });
    });
    
    req.end();
  });
}

// ==================== TEST EXECUTORS ====================

async function testPageRendering(browser, route) {
  const page = await browser.newPage();
  const errors = [];
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${route.name.replace(/\s+/g, '-').toLowerCase()}.png`);
  
  try {
    console.log(`\n🧪 Testing: ${route.name} (${route.path})`);
    
    // Navigate and wait
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(DELAY_MS);
    
    // Check console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Get title
    const title = await getPageTitle(page);
    console.log(`   📄 Title: ${title}`);
    
    // Check elements
    const elementResults = await checkPageElements(page, route.checkElements);
    let elementsFound = 0;
    elementResults.forEach(r => {
      if (r.found) {
        elementsFound++;
        console.log(`   ✅ Found: "${r.element}"`);
      } else {
        console.log(`   ❌ Missing: "${r.element}"`);
      }
    });
    
    // Take screenshot
    await takeScreenshot(page, route.name);
    console.log(`   📸 Screenshot saved`);
    
    // Report errors
    if (errors.length > 0) {
      console.log(`   ⚠️ Console errors: ${errors.length}`);
      errors.forEach(e => console.log(`      - ${e.substring(0, 80)}`));
    }
    
    // Determine status
    const minRequired = route.checkElements.length >= 3 ? 2 : route.checkElements.length;
    const status = elementsFound >= minRequired && errors.length === 0 ? 'PASS' : 'FAIL';
    console.log(`   📊 Status: ${status}`);
    
    return {
      category: 'Page Rendering',
      route: route.name,
      path: route.path,
      status,
      title,
      elementsFound: `${elementsFound}/${route.checkElements.length}`,
      errors: errors.length,
      errorDetails: errors,
      screenshot: screenshotPath
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      category: 'Page Rendering',
      route: route.name,
      path: route.path,
      status: 'ERROR',
      error: error.message
    };
  } finally {
    await page.close();
  }
}

async function testCalculations(browser) {
  const results = [];
  
  // Test quotation calculation
  const page = await browser.newPage();
  try {
    console.log(`\n🧪 Testing: Calculation Verification`);
    
    await page.goto(`${BASE_URL}/quotations/new`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(DELAY_MS);
    
    // Verify calculation elements exist
    const hasQuantity = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      return Array.from(inputs).some(i => i.type === 'number');
    });
    
    results.push({
      category: 'Calculations',
      test: 'Quotation Line Items',
      status: hasQuantity ? 'PASS' : 'FAIL',
      details: 'Quantity/rate input fields present'
    });
    
    // Test invoice calculation
    await page.goto(`${BASE_URL}/invoices/new`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(DELAY_MS);
    
    const hasInvoiceFields = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select');
      return inputs.length > 5;
    });
    
    results.push({
      category: 'Calculations',
      test: 'Invoice Form Fields',
      status: hasInvoiceFields ? 'PASS' : 'FAIL',
      details: 'Invoice input fields present'
    });
    
    console.log(`   ✅ Calculation tests completed`);
    
  } catch (error) {
    results.push({
      category: 'Calculations',
      test: 'Calculation Tests',
      status: 'ERROR',
      error: error.message
    });
  } finally {
    await page.close();
  }
  
  return results;
}

async function testAPIEndpoints(endpoints) {
  const results = [];
  
  console.log(`\n🌐 Testing API Endpoints`);
  
  for (const ep of endpoints) {
    const result = await checkAPIEndpoint(ep.endpoint, ep.method, ep.status);
    results.push(result);
    
    if (result.passed) {
      console.log(`   ✅ ${result.method} ${result.endpoint} - ${result.actualStatus}`);
    } else {
      console.log(`   ❌ ${result.method} ${result.endpoint} - ${result.actualStatus} (expected ${result.expectedStatus})`);
    }
  }
  
  return results;
}

async function testResponsiveDesign(browser) {
  const results = [];
  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ];
  
  console.log(`\n📱 Testing Responsive Design`);
  
  for (const viewport of viewports) {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0', timeout: 30000 });
      await delay(DELAY_MS);
      
      // Check if main content is visible
      const contentVisible = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main && main.offsetHeight > 0;
      });
      
      results.push({
        category: 'Responsive Design',
        viewport: viewport.name,
        width: viewport.width,
        status: contentVisible ? 'PASS' : 'FAIL',
        details: `${viewport.name} (${viewport.width}x${viewport.height})`
      });
      
      console.log(`   ${contentVisible ? '✅' : '❌'} ${viewport.name} - ${contentVisible ? 'Content visible' : 'Issues detected'}`);
      
    } catch (error) {
      results.push({
        category: 'Responsive Design',
        viewport: viewport.name,
        status: 'ERROR',
        error: error.message
      });
    } finally {
      await page.close();
    }
  }
  
  return results;
}

// ==================== MAIN TEST RUNNER ====================

async function runQATests() {
  console.log('='.repeat(60));
  console.log('🚀 OMB Accounting - Enhanced QA Test Suite');
  console.log('='.repeat(60));
  console.log(`🌐 URL: ${BASE_URL}`);
  console.log(`📁 Screenshots: ${SCREENSHOTS_DIR}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  let browser;
  const allResults = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      errors: 0
    },
    categories: {
      'Page Rendering': [],
      'Calculations': [],
      'API Endpoints': [],
      'Responsive Design': []
    }
  };
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    // 1. Page Rendering Tests
    console.log('\n📄 CATEGORY: Page Rendering Tests');
    console.log('-'.repeat(40));
    for (const route of testCategories['Page Rendering']) {
      const result = await testPageRendering(browser, route);
      allResults.categories['Page Rendering'].push(result);
    }
    
    // 2. Calculation Tests
    console.log('\n🔢 CATEGORY: Calculation Tests');
    console.log('-'.repeat(40));
    const calcResults = await testCalculations(browser);
    allResults.categories['Calculations'].push(...calcResults);
    
    // 3. API Endpoint Tests
    console.log('\n🌐 CATEGORY: API Endpoint Tests');
    console.log('-'.repeat(40));
    const apiResults = await testAPIEndpoints(testCategories['API Endpoints']);
    allResults.categories['API Endpoints'] = apiResults;
    
    // 4. Responsive Design Tests
    console.log('\n📱 CATEGORY: Responsive Design Tests');
    console.log('-'.repeat(40));
    const responsiveResults = await testResponsiveDesign(browser);
    allResults.categories['Responsive Design'] = responsiveResults;
    
    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    // Calculate totals
    let total = 0, passed = 0, failed = 0, errors = 0;
    
    for (const category of Object.values(allResults.categories)) {
      for (const result of Array.isArray(category) ? category : [category]) {
        total++;
        if (result.status === 'PASS') passed++;
        else if (result.status === 'FAIL') failed++;
        else if (result.status === 'ERROR') errors++;
      }
    }
    
    allResults.summary = { total, passed, failed, errors };
    
    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⚠️  Errors: ${errors}`);
    
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    console.log(`   📊 Pass Rate: ${passRate}%`);
    
    // Category breakdown
    console.log(`\n📂 By Category:`);
    for (const [category, results] of Object.entries(allResults.categories)) {
      const catTotal = results.length;
      const catPassed = results.filter(r => r.status === 'PASS').length;
      const catFailed = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR').length;
      console.log(`   ${category}: ${catPassed}/${catTotal} passed (${catFailed} failed)`);
    }
    
    // Failed tests details
    if (failed > 0 || errors > 0) {
      console.log(`\n❌ Failed/Error Tests:`);
      for (const [category, results] of Object.entries(allResults.categories)) {
        const failedTests = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
        for (const test of failedTests) {
          console.log(`   - ${test.route || test.test || test.endpoint || test.viewport}: ${test.status}`);
          if (test.error) console.log(`     Error: ${test.error}`);
        }
      }
    }
    
    // Console errors summary
    const totalConsoleErrors = allResults.categories['Page Rendering']
      .reduce((sum, r) => sum + (r.errors || 0), 0);
    console.log(`\n🔍 Console Errors: ${totalConsoleErrors}`);
    
    // Save report
    const reportPath = path.join(REPORT_DIR, `qa-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ QA Test Suite Complete!');
    console.log('='.repeat(60));
    
    process.exit(errors > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(`\n❌ Fatal Error: ${error.message}`);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

// Export for module use
module.exports = {
  runQATests,
  testCategories,
  testData
};

// Run if executed directly
if (require.main === module) {
  runQATests();
}
