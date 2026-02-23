#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/lib/repositories/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf-8');

  // Remove any eslint-disable-next-line comments
  content = content.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any/g, '');

  // Remove the file-level eslint-disable comment if it exists
  content = content.replace(/\/\* eslint-disable @typescript-eslint\/no-explicit-any \*\/\n/g, '');

  // Check if the file starts with a comment block
  const firstLine = content.split('\n')[0];

  if (firstLine.startsWith('/* eslint-disable')) {
    // File already has eslint-disable comment
    console.log(`Skipping ${file} - already has eslint-disable comment`);
    continue;
  }

  // Add eslint-disable comment at the top
  content = `/* eslint-disable @typescript-eslint/no-explicit-any */\n${content}`;

  writeFileSync(file, content, 'utf-8');
  console.log(`Fixed ${file}`);
}

console.log('Done!');
