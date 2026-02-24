#!/usr/bin/env node

/**
 * Record Playwright Video and Send to Discord
 * 
 * Usage:
 *   node scripts/record-video.js                    # Record and send all videos
 *   node scripts/record-video.js --test dashboard  # Record specific test
 *   node scripts/record-video.js --upload video.webm # Upload existing video
 *   node scripts/record-video.js --list            # List recorded videos
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Configuration
const PROJECT_ROOT = __dirname.replace('/scripts', '');
const VIDEOS_DIR = path.join(PROJECT_ROOT, 'test-results', 'videos');
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1468533957673877526';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const args = process.argv.slice(2);
const isCI = process.env.CI === 'true';

// Ensure videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  console.log(`📁 Created videos directory: ${VIDEOS_DIR}`);
}

console.log(`
╔════════════════════════════════════════════════════╗
║    Playwright Video Recording & Discord Upload     ║
╚════════════════════════════════════════════════════╝
`);

// Check if dev server is running
function checkServerRunning() {
  try {
    execSync('curl -s http://localhost:3000 > /dev/null 2>&1', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// Start dev server if not running
async function ensureDevServer() {
  if (checkServerRunning()) {
    console.log('✅ Dev server already running');
    return;
  }

  console.log('🚀 Starting dev server...');
  
  return new Promise((resolve, reject) => {
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_OPTIONS: '--no-warnings' },
      detached: true
    });

    let ready = false;

    const checkReady = setInterval(() => {
      if (checkServerRunning()) {
        ready = true;
        clearInterval(checkReady);
        console.log('✅ Dev server ready!');
        resolve();
      }
    }, 2000);

    devProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
      if (data.toString().includes('Ready in') || data.toString().includes('compiled')) {
        clearInterval(checkReady);
        if (!ready) {
          ready = true;
          console.log('✅ Dev server ready!');
          resolve();
        }
      }
    });

    devProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!ready) {
        clearInterval(checkReady);
        console.log('⚠️ Server timeout, continuing anyway...');
        resolve();
      }
    }, 60000);
  });
}

// Run Playwright test with video recording
async function runVideoTest(testPattern) {
  return new Promise((resolve, reject) => {
    console.log(`\n🎬 Running video test: ${testPattern || 'all video tests'}`);
    
    const testArgs = [
      'test',
      testPattern ? `**/*${testPattern}*.spec.ts` : 'video.spec.ts',
      '--config=playwright.config.ts',
      '--project=chromium',
      '--reporter=list',
      '--headed=false'
    ];

    if (isCI) {
      testArgs.push('--reporter=list');
    }

    const testProcess = spawn('npx', testArgs, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Video test completed successfully!');
        resolve();
      } else {
        console.log(`\n⚠️ Test completed with exit code ${code}`);
        resolve(); // Still continue to upload
      }
    });

    testProcess.on('error', (error) => {
      console.error('❌ Test error:', error);
      reject(error);
    });
  });
}

// List recorded videos
function listVideos() {
  console.log('\n📹 Recorded Videos:');
  console.log('=' .repeat(50));
  
  if (!fs.existsSync(VIDEOS_DIR)) {
    console.log('No videos directory found.');
    return [];
  }

  const files = fs.readdirSync(VIDEOS_DIR)
    .filter(f => f.endsWith('.webm'))
    .map(f => {
      const stats = fs.statSync(path.join(VIDEOS_DIR, f));
      return {
        name: f,
        size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
        path: path.join(VIDEOS_DIR, f)
      };
    });

  if (files.length === 0) {
    console.log('No video files found.');
    return [];
  }

  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file.name} (${file.size})`);
  });

  console.log('=' .repeat(50));
  return files;
}

// Send video to Discord
async function sendToDiscord(videoPath, caption = 'Playwright Test Recording') {
  if (!fs.existsSync(videoPath)) {
    console.error(`❌ Video file not found: ${videoPath}`);
    return false;
  }

  const fileName = path.basename(videoPath);
  const fileSize = fs.statSync(videoPath).size;

  console.log(`\n📤 Sending to Discord: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

  // Method 1: Discord Webhook (for files up to 8MB)
  if (fileSize < 8 * 1024 * 1024 && DISCORD_WEBHOOK_URL) {
    try {
      const formData = new (require('form-data'))();
      formData.append('file', fs.createReadStream(videoPath), fileName);
      formData.append('content', `🎬 ${caption}\n📁 File: ${fileName}`);

      await axios.post(DISCORD_WEBHOOK_URL, formData, {
        headers: formData.getHeaders()
      });

      console.log('✅ Video sent to Discord via webhook!');
      return true;
    } catch (error) {
      console.error('❌ Webhook upload failed:', error.message);
    }
  }

  // Method 2: Alternative - Just notify (if no webhook or file too large)
  console.log('\n📝 Note: To send videos to Discord, set:');
  console.log('   export DISCORD_WEBHOOK_URL="your-discord-webhook-url"');
  console.log('   Videos over 8MB cannot be sent via webhook.');
  console.log('\n💡 Alternative: Upload to Discord manually');
  console.log(`   Video location: ${videoPath}`);

  return false;
}

// Upload all videos
async function uploadAllVideos(caption) {
  const videos = listVideos();
  
  if (videos.length === 0) {
    console.log('❌ No videos to upload');
    return;
  }

  console.log(`\n📤 Found ${videos.length} video(s) to upload...`);

  for (const video of videos) {
    await sendToDiscord(video.path, caption || `Playwright Test: ${video.name.replace('.webm', '')}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
}

// Cleanup old videos
function cleanupVideos() {
  if (!fs.existsSync(VIDEOS_DIR)) return;

  const files = fs.readdirSync(VIDEOS_DIR)
    .filter(f => f.endsWith('.webm'));

  if (files.length > 0) {
    files.forEach(f => {
      fs.unlinkSync(path.join(VIDEOS_DIR, f));
      console.log(`🗑️  Removed: ${f}`);
    });
    console.log('✅ Cleanup complete');
  } else {
    console.log('No videos to clean up');
  }
}

// Main execution
async function main() {
  try {
    const listMode = args.includes('--list') || args.includes('-l');
    const cleanupMode = args.includes('--cleanup') || args.includes('-c');
    const uploadMode = args.includes('--upload') || args.includes('-u');
    const testPattern = args.find(a => !a.startsWith('-'));

    // List mode
    if (listMode) {
      listVideos();
      return;
    }

    // Cleanup mode
    if (cleanupMode) {
      cleanupVideos();
      return;
    }

    // Upload specific file
    if (uploadMode && args[args.indexOf('--upload') + 1]) {
      const videoFile = args[args.indexOf('--upload') + 1];
      await sendToDiscord(path.join(VIDEOS_DIR, videoFile));
      return;
    }

    // Full workflow: record + upload
    console.log('🎯 Starting video recording workflow...');
    
    // Ensure dev server is running
    await ensureDevServer();
    
    // Wait a bit for server to stabilize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Run video test
    await runVideoTest(testPattern);

    // List and optionally upload
    console.log('\n📹 Recorded videos:');
    const videos = listVideos();

    if (videos.length > 0) {
      const shouldUpload = args.includes('--send') || args.includes('-s');
      
      if (shouldUpload) {
        await uploadAllVideos('Playwright GUI Test Recording');
      } else {
        console.log('\n💡 To send to Discord, run with --send flag:');
        console.log('   node scripts/record-video.js --send');
        console.log('\n📁 Videos saved to:');
        console.log(`   ${VIDEOS_DIR}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Video recording complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runVideoTest, listVideos, sendToDiscord, uploadAllVideos };
