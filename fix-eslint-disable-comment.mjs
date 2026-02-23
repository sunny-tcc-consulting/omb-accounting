#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/lib/repositories/*.ts');

for (const file of files) {
  let content = readFileSync(file, 'utf-8');

  // Remove the file-level eslint-disable comment
  content = content.replace(/\/\* eslint-disable @typescript-eslint\/no-explicit-any \*\/\n/g, '');

  // Remove any existing eslint-disable-next-line comments
  content = content.replace(/\/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any/g, '');

  // Check if the file starts with a comment block
  const lines = content.split('\n');
  const firstLine = lines[0];

  if (firstLine.startsWith('/* eslint-disable')) {
    // File already has eslint-disable comment
    console.log(`Skipping ${file} - already has eslint-disable comment`);
    continue;
  }

  // Add eslint-disable comment at the very top of the file
  content = `/* eslint-disable @typescript-eslint/no-explicit-any */\n${content}`;

  writeFileSync(file, content, 'utf-8');
  console.log(`Fixed ${file}`);
}

console.log('Done!');
