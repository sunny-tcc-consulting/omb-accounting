const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', '..', '..', '..', 'screenshots');

describe('Customer New Page E2E', () => {
  let browser;

  beforeAll(async () => {
    // Ensure screenshots directory exists
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('should render customers/new page without runtime errors', async () => {
    const page = await browser.newPage();
    
    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the page
    await page.goto('http://localhost:3000/customers/new', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check page loaded correctly
    const title = await page.title();
    expect(title).toContain('omb-accounting');

    // Check heading is visible
    const heading = await page.$('h1');
    expect(heading).not.toBeNull();
    
    const headingText = await page.evaluate(el => el.textContent, heading);
    expect(headingText).toContain('創建新客戶');

    // Check form fields are present
    const form = await page.$('form');
    expect(form).not.toBeNull();

    // Check input fields exist
    const nameInput = await page.$('input[name="name"]');
    expect(nameInput).not.toBeNull();

    const emailInput = await page.$('input[name="email"]');
    expect(emailInput).not.toBeNull();

    // Check buttons
    const submitButton = await page.$('button[type="submit"]');
    expect(submitButton).not.toBeNull();

    const cancelButton = await page.$('button[type="button"]');
    expect(cancelButton).not.toBeNull();

    // Take screenshot
    const timestamp = Date.now();
    const screenshotPath = path.join(screenshotsDir, `customers-new-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    // Report any console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors found:', consoleErrors);
    }
    expect(consoleErrors).toHaveLength(0);
  }, 60000);
});
