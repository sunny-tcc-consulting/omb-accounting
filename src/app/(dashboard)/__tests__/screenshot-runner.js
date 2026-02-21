const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Routes to test (excluding dynamic routes that need IDs)
const routes = [
  { path: '/', name: 'dashboard' },
  { path: '/customers', name: 'customers' },
  { path: '/customers/new', name: 'customers-new' },
  { path: '/invoices', name: 'invoices' },
  { path: '/invoices/new', name: 'invoices-new' },
  { path: '/quotations', name: 'quotations' },
  { path: '/quotations/new', name: 'quotations-new' },
  { path: '/reports', name: 'reports' },
];

const screenshotsDir = path.join(__dirname, '..', '..', '..', '..', 'screenshots');

async function generateScreenshots() {
  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Starting Puppeteer screenshot generation...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const consoleErrors = [];

  try {
    for (const route of routes) {
      const url = `http://localhost:3000${route.path}`;
      const screenshotPath = path.join(screenshotsDir, `${route.name}.png`);

      console.log(`Testing: ${route.path}`);

      const page = await browser.newPage();

      // Capture console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push({ route: route.path, error: msg.text() });
        }
      });

      page.on('pageerror', error => {
        consoleErrors.push({ route: route.path, error: error.message });
      });

      try {
        // Navigate to page and wait for network to be idle
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        // Wait for page to be fully loaded
        await page.waitForFunction(() => {
          return document.readyState === 'complete';
        }, { timeout: 30000 });

        // Additional wait for React hydration
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Take screenshot
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        console.log(`  ✅ Screenshot saved: ${screenshotPath}`);
      } catch (error) {
        console.log(`  ❌ Error loading page: ${error.message}`);
      }

      await page.close();
    }

    console.log('\n' + '='.repeat(50));
    console.log('Screenshot Generation Complete!');
    console.log('='.repeat(50));

    // Report console errors
    if (consoleErrors.length > 0) {
      console.log(`\n⚠️  Console Errors Found: ${consoleErrors.length}`);
      consoleErrors.forEach(err => {
        console.log(`  - ${err.route}: ${err.error}`);
      });
    } else {
      console.log('\n✅ No console errors found!');
    }

  } finally {
    await browser.close();
  }
}

generateScreenshots().catch(console.error);
