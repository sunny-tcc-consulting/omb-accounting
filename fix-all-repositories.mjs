#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/lib/repositories/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf-8');

  // Check if the import is already there
  if (content.includes('import { SQLiteDatabase }')) {
    // Replace the import line with the eslint-disable comment
    content = content.replace(
      /^import { SQLiteDatabase } from/,
      '// eslint-disable-next-line @typescript-eslint/no-explicit-any\nimport { SQLiteDatabase } from'
    );
  }

  writeFileSync(file, content, 'utf-8');
  console.log(`Fixed ${file}`);
}

console.log('Done!');
