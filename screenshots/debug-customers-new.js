const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function takeScreenshotWithErrors(page, name) {
  const outputDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || type === 'warning') {
      consoleMessages.push({ type, text, location: msg.location() });
    }
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  // Take screenshot
  const filePath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });

  return { filePath, consoleMessages, pageErrors };
}

async function testCustomersNewPage() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Listen for console errors before navigation
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      consoleMessages.push({ type, text, location: msg.location() });
      console.error(`Console ${type}: ${text}`);
    }
  });

  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });

  console.log('Navigating to /customers/new...');
  await page.goto('http://localhost:3000/customers/new', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });

  // Wait for page to fully load
  await page.waitForTimeout(3000);

  // Check for critical elements
  try {
    const heading = await page.$x("//h1[contains(text(),'創建新客戶')]");
    if (heading.length > 0) {
      console.log('✅ Page heading found');
    } else {
      console.error('❌ Page heading not found');
    }
  } catch (e) {
    console.error('Error checking heading:', e.message);
  }

  // Take screenshot
  const screenshotPath = path.join(__dirname, 'screenshots', 'customers-new-debug.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  // Report any console errors
  if (consoleMessages.length > 0) {
    console.error('\n=== Console Errors Detected ===');
    consoleMessages.forEach(msg => {
      console.error(`[${msg.type}] ${msg.text}`);
      if (msg.location) {
        console.error(`  at ${msg.location.url}:${msg.location.lineNumber}:${msg.location.columnNumber}`);
      }
    });
  }

  await browser.close();
  return { consoleMessages, screenshotPath };
}

testCustomersNewPage()
  .then(result => {
    if (result.consoleMessages.length === 0) {
      console.log('\n✅ No console errors detected');
    } else {
      console.log(`\n❌ Found ${result.consoleMessages.length} console errors`);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
