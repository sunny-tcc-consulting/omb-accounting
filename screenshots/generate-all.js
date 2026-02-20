const puppeteer = require('puppeteer');
const path = require('path');

const PAGES = [
  { url: 'http://localhost:3000', name: 'dashboard' },
  { url: 'http://localhost:3000/customers', name: 'customers' },
  { url: 'http://localhost:3000/customers/new', name: 'customers-new' },
  { url: 'http://localhost:3000/invoices', name: 'invoices' },
  { url: 'http://localhost:3000/invoices/new', name: 'invoices-new' },
  { url: 'http://localhost:3000/quotations', name: 'quotations' },
  { url: 'http://localhost:3000/quotations/new', name: 'quotations-new' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateScreenshots() {
  console.log('🚀 Starting screenshot generation...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const errors = [];
  
  for (const pageInfo of PAGES) {
    console.log(`📸 Capturing: ${pageInfo.name}...`);
    
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore hydration warnings from Next.js
        if (!text.includes('Hydration') && !text.includes('did not match')) {
          errors.push(`${pageInfo.name}: ${text}`);
        }
      }
    });
    
    page.on('pageerror', err => {
      errors.push(`${pageInfo.name}: ${err.message}`);
    });
    
    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle0', timeout: 30000 });
      await delay(2000);
      
      const outputPath = path.join(__dirname, `${pageInfo.name}.png`);
      await page.screenshot({ path: outputPath, fullPage: true });
      console.log(`✅ Saved: ${outputPath}`);
    } catch (err) {
      console.log(`❌ Failed: ${pageInfo.name} - ${err.message}`);
    }
    
    await page.close();
  }
  
  await browser.close();
  
  console.log('\n📊 Summary:');
  console.log(`Errors: ${errors.length}`);
  if (errors.length > 0) {
    errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
  }
}

generateScreenshots().catch(console.error);
