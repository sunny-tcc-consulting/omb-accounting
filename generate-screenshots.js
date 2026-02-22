/**
 * Phase 4.4 Session Management - Screenshot Generator
 * Generates screenshots of key session management features
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function generateScreenshots() {
  console.log('🚀 Starting Phase 4.4 screenshot generation...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const screenshots = [];

  try {
    // 1. Dashboard Page (shows SessionTimeoutWarning integrated)
    console.log('📸 Capturing Dashboard with Session Management...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check for SessionTimeoutWarning component in layout
    const sessionWarningLocator = page.getByText('Session expiring', { exact: false });
    const sessionWarningExists = await sessionWarningLocator.count() > 0;
    console.log(`  - Session warning visible: ${sessionWarningExists}`);
    
    await page.screenshot({ 
      path: 'public/screenshots/phase-4.4-dashboard.png', 
      fullPage: true 
    });
    screenshots.push('phase-4.4-dashboard.png');
    console.log('  ✅ Dashboard screenshot saved');

    // 2. Login Page
    console.log('📸 Capturing Login Page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'public/screenshots/phase-4.4-login.png', 
      fullPage: true 
    });
    screenshots.push('phase-4.4-login.png');
    console.log('  ✅ Login page screenshot saved');

    // 3. Reports Page (requires login)
    console.log('📸 Capturing Reports Page...');
    await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'public/screenshots/phase-4.4-reports.png', 
      fullPage: true 
    });
    screenshots.push('phase-4.4-reports.png');
    console.log('  ✅ Reports page screenshot saved');

    // 4. Customers Page
    console.log('📸 Capturing Customers Page...');
    await page.goto(`${BASE_URL}/customers`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'public/screenshots/phase-4.4-customers.png', 
      fullPage: true 
    });
    screenshots.push('phase-4.4-customers.png');
    console.log('  ✅ Customers page screenshot saved');

    // 5. Invoices Page
    console.log('📸 Capturing Invoices Page...');
    await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'public/screenshots/phase-4.4-invoices.png', 
      fullPage: true 
    });
    screenshots.push('phase-4.4-invoices.png');
    console.log('  ✅ Invoices page screenshot saved');

    // 6. Quotation Page
    console.log('📸 Capturing Quotation Page...');
    await page.goto(`${BASE_URL}/quotations`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'public/screenshots/phase-4.4-quotations.png', 
      fullPage: true 
    });
    screenshots.push('phase-4.4-quotations.png');
    console.log('  ✅ Quotation page screenshot saved');

    console.log('\n✅ All screenshots generated successfully!');
    console.log(`📁 Location: ${process.cwd()}/public/screenshots/`);
    console.log('📋 Screenshots:', screenshots.join(', '));

  } catch (error) {
    console.error('❌ Error generating screenshots:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

generateScreenshots().catch(console.error);
