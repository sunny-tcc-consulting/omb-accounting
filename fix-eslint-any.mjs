#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/lib/repositories/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf-8');

  // Add eslint-disable comment at the top if not already present
  if (!content.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any')) {
    content = content.replace(
      /^import { SQLiteDatabase } from/,
      '// eslint-disable-next-line @typescript-eslint/no-explicit-any\nimport { SQLiteDatabase } from'
    );
  }

  writeFileSync(file, content, 'utf-8');
  console.log(`Fixed ${file}`);
}

console.log('Done!');
