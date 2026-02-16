const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000/invoices', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.screenshot({
    path: '/home/tcc/.openclaw/media/inbound/invoices-pdf-page.png',
    fullPage: true,
  });
  await browser.close();
  console.log('Screenshot saved');
})();
