const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('Navigating to bank page...');
    await page.goto('http://localhost:3000/bank', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for content to load
    await page.waitForSelector('main', { timeout: 10000 });

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check for critical elements
    const hasAccountSection = await page.$('[class*="bank-account"]');
    const hasImportButton = await page.$('button');
    const hasTransactionsTable = await page.$('table');
    console.log('Has bank account section:', !!hasAccountSection);
    console.log('Has import button:', !!hasImportButton);
    console.log('Has transactions table:', !!hasTransactionsTable);

    // Take screenshot
    const screenshotPath = '/home/tcc/.openclaw/workspace/omb-accounting/screenshots/bank.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved to:', screenshotPath);

    console.log('\n✅ Bank page test PASSED!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
