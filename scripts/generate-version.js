#!/usr/bin/env node
/**
 * Generate version info at build time
 * This script should be called before next build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get git commit hash
let commitHash = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch (e) {
  console.warn('Could not get git commit hash');
}

// Get build date
const buildDate = new Date().toISOString();

// Get version from package.json
let version = '1.0.0';
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
  version = pkg.version || version;
} catch (e) {
  console.warn('Could not read package.json');
}

// Generate version.ts content
const versionContent = `// Auto-generated at build time - DO NOT EDIT
export const VERSION_INFO = {
  version: "${version}",
  commitHash: "${commitHash}",
  buildDate: "${buildDate}",
  environment: "${process.env.NODE_ENV || 'development'}"
};

export const VERSION = "${version}";
export const COMMIT_HASH = "${commitHash}";
export const BUILD_DATE = "${buildDate}";
`;

const outputPath = path.join(__dirname, '../src/lib/version.ts');
fs.writeFileSync(outputPath, versionContent);

console.log(`✅ Version info generated:`);
console.log(`   Version: ${version}`);
console.log(`   Commit: ${commitHash}`);
console.log(`   Build Date: ${buildDate}`);
console.log(`   Output: ${outputPath}`);
