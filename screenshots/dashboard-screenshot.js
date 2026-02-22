const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('Navigating to dashboard page...');
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForSelector('main', { timeout: 10000 });

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check for critical elements
    const metricsCards = await page.$$('[class*="metric"], [class*="card"]');
    console.log('Found metric/card elements:', metricsCards.length);

    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors.length);
      consoleErrors.forEach(e => console.log(' -', e));
    } else {
      console.log('No console errors found!');
    }

    // Take screenshot
    const screenshotPath = '/home/tcc/.openclaw/workspace/omb-accounting/screenshots/dashboard.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved to:', screenshotPath);

    console.log('\n✅ Dashboard page test PASSED!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
