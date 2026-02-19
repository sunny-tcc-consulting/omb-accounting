const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const pages = [
  { url: 'http://localhost:3000', name: 'dashboard' },
  { url: 'http://localhost:3000/customers', name: 'customers' },
  { url: 'http://localhost:3000/customers/new', name: 'customers-new' },
  { url: 'http://localhost:3000/invoices', name: 'invoices' },
  { url: 'http://localhost:3000/invoices/new', name: 'invoices-new' },
  { url: 'http://localhost:3000/quotations', name: 'quotations' },
  { url: 'http://localhost:3000/quotations/new', name: 'quotations-new' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshots() {
  const outputDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log('Browser started, taking screenshots...\n');

  for (const pageInfo of pages) {
    try {
      console.log(`Taking screenshot of ${pageInfo.name}...`);
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(2000); // Wait for dynamic content
      const filePath = path.join(outputDir, `${pageInfo.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  Saved: ${filePath}`);
      await page.close();
    } catch (error) {
      console.error(`  Error taking screenshot of ${pageInfo.name}:`, error.message);
    }
  }

  await browser.close();
  console.log('\nAll screenshots completed!');
}

takeScreenshots().catch(console.error);
