const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateScreenshots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const pages = [
    { url: 'http://localhost:3000', name: 'dashboard' },
    { url: 'http://localhost:3000/customers', name: 'customers' },
    { url: 'http://localhost:3000/customers/new', name: 'customers-new' },
    { url: 'http://localhost:3000/invoices', name: 'invoices' },
    { url: 'http://localhost:3000/invoices/new', name: 'invoices-new' },
    { url: 'http://localhost:3000/quotations', name: 'quotations' },
    { url: 'http://localhost:3000/quotations/new', name: 'quotations-new' }
  ];

  const outputDir = '/home/tcc/.openclaw/media/inbound';

  for (const page of pages) {
    try {
      const pageInstance = await browser.newPage();
      await pageInstance.setViewport({ width: 1280, height: 720 });
      await pageInstance.goto(page.url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for content to load
      await pageInstance.waitForTimeout(2000);

      const filePath = path.join(outputDir, `${page.name}.png`);
      await pageInstance.screenshot({ path: filePath, fullPage: false });

      console.log(`✅ Generated: ${filePath}`);
      await pageInstance.close();
    } catch (err) {
      console.error(`❌ Error generating ${page.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('🎉 All screenshots generated!');
}

generateScreenshots();
