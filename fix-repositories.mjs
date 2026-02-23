#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const reposDir = '/home/tcc/.openclaw/workspace/omb-accounting/src/lib/repositories';
const files = fs.readdirSync(reposDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(reposDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Change constructor parameter from SQLiteDatabase to any
  content = content.replace(
    /constructor\(private db: SQLiteDatabase\)/g,
    'constructor(private db: any)'
  );

  // 2. Handle .get<T>("...", [id]) - single line with params
  content = content.replace(
    /\.get<(\w+)>\(\s*"([^"]+)",\s*\[([^\]]+)\]\s*\)/g,
    '.get("$2", [$3]) as $1 | undefined'
  );

  // 3. Handle .all<T>("...") - single line without params
  content = content.replace(
    /\.all<(\w+)>\(\s*"([^"]+)"\s*\)/g,
    '.all("$2") as $1[]'
  );

  // 4. Handle .all<T>("...", [params]) - single line with params
  content = content.replace(
    /\.all<(\w+)>\(\s*"([^"]+)",\s*\[([^\]]+)\]\s*\)/g,
    '.all("$2", [$3]) as $1[]'
  );

  // 5. Handle .query<T>("...") - single line without params
  content = content.replace(
    /\.query<(\w+)>\(\s*"([^"]+)"\s*\)/g,
    '.query("$2") as $1[]'
  );

  // 6. Handle .query<T>("...", [params]) - single line with params
  content = content.replace(
    /\.query<(\w+)>\(\s*"([^"]+)",\s*\[([^\]]+)\]\s*\)/g,
    '.query("$2", [$3]) as $1[]'
  );

  // 7. Handle multi-line patterns with any whitespace before the string (with params)
  content = content.replace(
    /\.get<(\w+)>\(\s*\n\s+("[^"]+"),\s*\n\s+\[([^\]]+)\],?\s*\n\s*\)/gs,
    '.get($2, [$3]) as $1 | undefined'
  );
  content = content.replace(
    /\.all<(\w+)>\(\s*\n\s+("[^"]+"),\s*\n\s+\[([^\]]+)\],?\s*\n\s*\)/gs,
    '.all($2, [$3]) as $1[]'
  );
  content = content.replace(
    /\.query<(\w+)>\(\s*\n\s+("[^"]+"),\s*\n\s+\[([^\]]+)\],?\s*\n\s*\)/gs,
    '.query($2, [$3]) as $1[]'
  );

  // 8. Handle multi-line patterns WITHOUT params
  content = content.replace(
    /\.get<(\w+)>\(\s*\n\s+("[^"]+"),?\s*\n\s*\)/gs,
    '.get($2) as $1 | undefined'
  );
  content = content.replace(
    /\.all<(\w+)>\(\s*\n\s+("[^"]+"),?\s*\n\s*\)/gs,
    '.all($2) as $1[]'
  );
  content = content.replace(
    /\.query<(\w+)>\(\s*\n\s+("[^"]+"),?\s*\n\s*\)/gs,
    '.query($2) as $1[]'
  );

  // 9. Handle complex generic types like .get<Record<string, unknown>> - single line
  content = content.replace(
    /\.get<Record<[^,]+,\s*unknown>>\(\s*"([^"]+)"\)/g,
    '.get("$1") as Record<string, unknown>'
  );
  content = content.replace(
    /\.all<Record<[^,]+,\s*unknown>>\(\s*"([^"]+)"\)/g,
    '.all("$1") as Record<string, unknown>[]'
  );
  content = content.replace(
    /\.query<Record<[^,]+,\s*unknown>>\(\s*"([^"]+)"\)/g,
    '.query("$1") as Record<string, unknown>[]'
  );

  // 10. Handle complex generic types multi-line WITH params
  content = content.replace(
    /\.get<Record<[^,]+,\s*unknown>>\(\s*\n\s+("[^"]+"),\s*\n\s+\[([^\]]+)\],?\s*\n\s*\)/gs,
    '.get($1, [$2]) as Record<string, unknown>'
  );
  content = content.replace(
    /\.all<Record<[^,]+,\s*unknown>>\(\s*\n\s+("[^"]+"),\s*\n\s+\[([^\]]+)\],?\s*\n\s*\)/gs,
    '.all($1, [$2]) as Record<string, unknown>[]'
  );
  content = content.replace(
    /\.query<Record<[^,]+,\s*unknown>>\(\s*\n\s+("[^"]+"),\s*\n\s+\[([^\]]+)\],?\s*\n\s*\)/gs,
    '.query($1, [$2]) as Record<string, unknown>[]'
  );

  // 11. Handle complex generic types multi-line WITHOUT params
  content = content.replace(
    /\.get<Record<[^,]+,\s*unknown>>\(\s*\n\s+("[^"]+"),?\s*\n\s*\)/gs,
    '.get($1) as Record<string, unknown>'
  );
  content = content.replace(
    /\.all<Record<[^,]+,\s*unknown>>\(\s*\n\s+("[^"]+"),?\s*\n\s*\)/gs,
    '.all($1) as Record<string, unknown>[]'
  );
  content = content.replace(
    /\.query<Record<[^,]+,\s*unknown>>\(\s*\n\s+("[^"]+"),?\s*\n\s*\)/gs,
    '.query($1) as Record<string, unknown>[]'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
}

console.log('Done!');
