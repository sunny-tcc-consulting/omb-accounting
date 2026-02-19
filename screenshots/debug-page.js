const { chromium } = require('playwright');
const http = require('http');

const MAX_RETRIES = 10;
const RETRY_DELAY = 1000;

function waitForServer(url, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const tryConnect = (attempt) => {
      const req = http.get(url, (res) => {
        console.log(`Server is responding: ${res.statusCode}`);
        resolve(true);
      });
      
      req.on('error', (err) => {
        if (retries > 0) {
          console.log(`Retry ${attempt}/${MAX_RETRIES}: Server not ready yet`);
          setTimeout(() => tryConnect(attempt + 1), RETRY_DELAY);
        } else {
          reject(new Error('Server not available after max retries'));
        }
      });
      
      req.setTimeout(500, () => {
        req.destroy();
        if (retries > 0) {
          console.log(`Retry ${attempt}/${MAX_RETRIES}: Connection timeout`);
          setTimeout(() => tryConnect(attempt + 1), RETRY_DELAY);
        } else {
          reject(new Error('Connection timeout after max retries'));
        }
      });
    };
    
    tryConnect(1);
  });
}

(async () => {
  try {
    await waitForServer('http://localhost:3000');
  } catch (e) {
    console.log('Server wait failed:', e.message);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });

  try {
    await page.goto('http://localhost:3000/customers/new', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully');
  } catch (e) {
    console.log('Page load failed:', e.message);
  }

  if (errors.length > 0) {
    console.log('\n=== Console Errors ===');
    errors.forEach(e => console.log(e));
  } else {
    console.log('\nNo console errors found');
  }

  await browser.close();
})();
