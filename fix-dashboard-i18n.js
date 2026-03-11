const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src/app/(dashboard)/dashboard/page.tsx');

console.log('Reading Dashboard page...');
let content = fs.readFileSync(dashboardPath, 'utf8');

console.log('Fixing hardcoded English strings...');
content = content.replace(/setError\(data\.error \|\| "Failed to load metrics"\)/g, 'setError(data.error || t("dashboard.failedToLoadMetrics"))');
content = content.replace(/setError\("Failed to connect to server"\)/g, 'setError(t("dashboard.failedToConnect"))');
content = content.replace(/Start creating invoices and transactions to see your dashboard metrics\./g, 't("dashboard.startCreating")');

console.log('Writing fixed content...');
fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('✅ Dashboard i18n fix complete!');