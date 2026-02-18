import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pages = [
  { url: '/', name: 'dashboard' },
  { url: '/quotations', name: 'quotations' },
  { url: '/quotations/new', name: 'quotations-new' },
  { url: '/customers', name: 'customers' },
  { url: '/customers/new', name: 'customers-new' },
  { url: '/invoices', name: 'invoices' },
  { url: '/invoices/new', name: 'invoices-new' },
];

async function takeAllScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
  });

  for (const { url, name } of pages) {
    console.log(`Navigating to ${url}...`);
    await page.goto(`http://localhost:3000${url}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for page to load
    await page.waitForSelector('h1, button, input, select', { timeout: 10000 });

    const screenshotPath = join(__dirname, `${name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });

    console.log(`✅ Screenshot saved: ${screenshotPath}`);
  }

  await browser.close();
  console.log('All screenshots generated successfully!');
}

takeAllScreenshots().catch(console.error);
