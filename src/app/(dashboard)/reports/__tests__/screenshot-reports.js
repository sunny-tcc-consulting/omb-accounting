const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Navigate to reports page
  await page.goto('http://localhost:3000/reports', {
    waitUntil: 'networkidle0',
  });

  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Wait for page to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  const tabs = [
    { name: 'trial-balance', label: 'Trial Balance' },
    { name: 'balance-sheet', label: 'Balance Sheet' },
    { name: 'profit-loss', label: 'Profit & Loss' },
    { name: 'general-ledger', label: 'General Ledger' },
    { name: 'cash-flow', label: 'Cash Flow' },
  ];

  const screenshots = [];

  for (const tab of tabs) {
    // Click on tab by text content using JavaScript
    await page.evaluate((tabLabel) => {
      const tab = Array.from(document.querySelectorAll('button[role="tab"]'))
        .find(btn => btn.textContent?.includes(tabLabel));
      if (tab) tab.click();
    }, tab.label);

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Take screenshot
    const screenshot = await page.screenshot({
      path: `/home/tcc/.openclaw/workspace/omb-accounting/src/app/(dashboard)/reports/__tests__/screenshots/${tab.name}.png`,
      fullPage: true,
    });

    screenshots.push({
      name: tab.name,
      label: tab.label,
      saved: true,
    });

    console.log(`✓ Screenshot saved: ${tab.name}.png`);
  }

  await browser.close();

  console.log('\n=== Screenshot Summary ===');
  console.log(`Total tabs: ${tabs.length}`);
  console.log(`Screenshots saved: ${screenshots.length}/${tabs.length}`);

  process.exit(0);
})();
