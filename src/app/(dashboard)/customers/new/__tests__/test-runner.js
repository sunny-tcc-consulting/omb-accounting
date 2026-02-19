const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = '/home/tcc/.openclaw/workspace/omb-accounting/screenshots';

async function testCustomersNewPage() {
  console.log('Starting Puppeteer test for customers/new page...\n');

  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    console.error(`Page Error: ${error.message}`);
  });

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    console.log('Navigating to http://localhost:3000/customers/new...');
    
    await page.goto('http://localhost:3000/customers/new', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check page loaded correctly
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check heading
    const heading = await page.$('h1');
    if (heading) {
      const headingText = await page.evaluate(el => el.textContent, heading);
      console.log(`Heading: ${headingText}`);
    }

    // Check form
    const form = await page.$('form');
    console.log(`Form found: ${form !== null}`);

    // Check input fields
    const nameInput = await page.$('input[name="name"]');
    console.log(`Name input found: ${nameInput !== null}`);

    const emailInput = await page.$('input[name="email"]');
    console.log(`Email input found: ${emailInput !== null}`);

    // Take screenshot
    const timestamp = Date.now();
    const screenshotPath = path.join(screenshotsDir, `customers-new-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\nScreenshot saved: ${screenshotPath}`);

    // Report results
    console.log('\n--- Test Results ---');
    if (consoleErrors.length === 0) {
      console.log('✅ No console errors detected');
      return true;
    } else {
      console.log(`❌ Found ${consoleErrors.length} console error(s):`);
      consoleErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
      return false;
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run test
testCustomersNewPage()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
