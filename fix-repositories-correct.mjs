#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/lib/repositories/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf-8');

  // Remove any existing malformed eslint-disable comments that are outside JSDoc
  content = content.replace(/\/\*\s*\n\s*\n\s*\* eslint-disable-next-line.*?\n\s*\*\//g, '');

  // Replace this.db.get(...) with (this.db as any).get(...)
  content = content.replace(
    /\bthis\.db\.get\(/g,
    '(this.db as any).get('
  );

  // Replace this.db.run(...) with (this.db as any).run(...)
  content = content.replace(
    /\bthis\.db\.run\(/g,
    '(this.db as any).run('
  );

  // Replace this.db.query(...) with (this.db as any).query(...)
  content = content.replace(
    /\bthis\.db\.query\(/g,
    '(this.db as any).query('
  );

  writeFileSync(file, content, 'utf-8');
  console.log(`Fixed ${file}`);
}

console.log('Done!');
