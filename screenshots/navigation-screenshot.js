const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Navigate to the dashboard
  const url = process.env.APP_URL || 'http://localhost:3000';
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for page to be fully loaded
  await page.waitForSelector('[data-testid="desktop-sidebar"]', { timeout: 10000 });
  
  // Capture screenshot
  const screenshotPath = '/home/tcc/.openclaw/workspace/omb-accounting/screenshots/navigation-ui.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  console.log('Screenshot saved to:', screenshotPath);
  
  await browser.close();
})();
