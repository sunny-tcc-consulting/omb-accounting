import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function takeScreenshot() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
  });

  // Navigate to customers page
  await page.goto('http://localhost:3001/customers', {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Wait for the page to fully load
  await page.waitForSelector('h1', { timeout: 10000 });

  // Take the screenshot
  const screenshotPath = join(__dirname, 'customers_english.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });

  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
}

takeScreenshot().catch(console.error);
