#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/lib/repositories/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf-8');

  // Remove the file-level eslint-disable comment
  content = content.replace(/\/\* eslint-disable @typescript-eslint\/no-explicit-any \*\/\n/g, '');

  // Remove any existing eslint-disable-next-line comments
  content = content.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any\n/g, '');

  // Add eslint-disable-next-line comments to each line that uses this.db
  content = content.replace(/\bthis\.db\.get\(/g, 'this.db.get()\n  // eslint-disable-next-line @typescript-eslint/no-explicit-any');
  content = content.replace(/\bthis\.db\.run\(/g, 'this.db.run()\n  // eslint-disable-next-line @typescript-eslint/no-explicit-any');
  content = content.replace(/\bthis\.db\.query\(/g, 'this.db.query()\n  // eslint-disable-next-line @typescript-eslint/no-explicit-any');

  writeFileSync(file, content, 'utf-8');
  console.log(`Fixed ${file}`);
}

console.log('Done!');
