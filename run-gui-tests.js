#!/usr/bin/env node

/**
 * GUI Test Runner for omb-accounting
 * 
 * This script starts the dev server and runs Playwright GUI tests
 * 
 * Usage:
 *   node run-gui-tests.js           # Run all tests
 *   node run-gui-tests.js --ui      # Open Playwright UI
 *   node run-gui-tests.js --debug   # Debug mode
 *   node run-gui-tests.js --headed  # Run with browser visible
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const isCI = process.env.CI === 'true';
const showUI = args.includes('--ui') || args.includes('-u');
const debugMode = args.includes('--debug') || args.includes('-d');
const headedMode = args.includes('--headed') || args.includes('-h');

const PROJECT_ROOT = __dirname;
const SCREENSHOTS_DIR = path.join(PROJECT_ROOT, 'screenshots');
const TEST_DIR = path.join(PROJECT_ROOT, 'e2e');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  console.log(`📁 Created screenshots directory: ${SCREENSHOTS_DIR}`);
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║           OMB-Accounting GUI Test Runner                   ║
╚════════════════════════════════════════════════════════════╝
`);

// Check if dev server is already running
function checkServerRunning() {
  try {
    execSync('curl -s http://localhost:3000 > /dev/null 2>&1', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// Kill process on port 3000
function killPort3000() {
  try {
    if (process.platform === 'win32') {
      execSync('for /f "tokens=5" %a in (\'netstat -ano ^| findstr :3000\') do taskkill /PID %a /F');
    } else {
      execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true');
    }
    console.log('✅ Killed existing process on port 3000');
  } catch (e) {
    // No process running on port 3000
  }
}

// Start development server
function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting development server...');
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_OPTIONS: '--no-warnings' }
    });

    let serverReady = false;

    devProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
      
      if (output.includes('Ready in') || output.includes('compiled')) {
        serverReady = true;
        console.log('✅ Development server is ready!');
        resolve(devProcess);
      }
    });

    devProcess.stderr.on('data', (data) => {
      const output = data.toString();
      // Suppress some warnings
      if (!output.includes('DeprecationWarning')) {
        process.stderr.write(output);
      }
    });

    devProcess.on('error', (error) => {
      console.error('❌ Failed to start dev server:', error);
      reject(error);
    });

    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      if (!serverReady) {
        console.log('⚠️ Server startup timeout, continuing anyway...');
        resolve(devProcess);
      }
    }, 60000);

    devProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        console.log(`Dev server exited with code ${code}`);
      }
    });
  });
}

// Run Playwright tests
function runPlaywrightTests(devProcess) {
  return new Promise((resolve, reject) => {
    console.log('🧪 Running Playwright GUI tests...');
    
    const playwrightArgs = [
      'test',
      TEST_DIR,
      '--config=playwright.config.ts',
      '--project=chromium',
      debugMode ? '--debug' : '',
      headedMode ? '--headed' : '',
      showUI ? '--ui' : '',
      isCI ? '--reporter=list' : '--reporter=list',
      '--reporter=line',
      isCI ? '' : '--headed=false'
    ].filter(Boolean);

    const testProcess = spawn('npx', playwrightArgs, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('close', (code) => {
      console.log('\n' + '='.repeat(60));
      if (code === 0) {
        console.log('✅ All GUI tests passed!');
      } else {
        console.log(`❌ GUI tests failed with exit code ${code}`);
      }
      console.log('='.repeat(60) + '\n');
      
      // Cleanup: kill dev server
      if (devProcess && !debugMode) {
        console.log('🛑 Stopping development server...');
        devProcess.kill('SIGTERM');
        killPort3000();
      }
      
      resolve(code);
    });

    testProcess.on('error', (error) => {
      console.error('❌ Failed to run tests:', error);
      reject(error);
    });
  });
}

// Main execution
async function main() {
  try {
    // Kill any existing process on port 3000
    if (!checkServerRunning()) {
      killPort3000();
    }

    // Start or use existing dev server
    const devServer = checkServerRunning() 
      ? null 
      : await startDevServer();

    // Wait a bit more if we just started
    if (devServer) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Run tests
    const exitCode = await runPlaywrightTests(devServer);

    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  }
}

main();
