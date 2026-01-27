#!/usr/bin/env node
/**
 * BDD Test Runner - Convenience wrapper for Cucumber tests
 *
 * Usage:
 *   node run.js                    # Run all tests
 *   node run.js --parallel         # Run with parallel workers
 *   node run.js --tags "@smoke"    # Run specific tags
 *   node run.js --debug            # Run with fail-fast
 *   node run.js --headed           # Run with visible browser
 */

const { spawn } = require('child_process');
const path = require('path');

// Get project root (parent of .github/skills/playwright-skill)
const skillDir = __dirname;
const projectRoot = path.resolve(skillDir, '../../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    parallel: false,
    tags: null,
    debug: false,
    headed: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--parallel':
      case '-p':
        options.parallel = true;
        break;
      case '--tags':
      case '-t':
        options.tags = args[++i];
        break;
      case '--debug':
      case '-d':
        options.debug = true;
        break;
      case '--headed':
      case '-h':
        if (args[i] !== '-h' || !args[i + 1]?.startsWith('-')) {
          options.headed = true;
        } else {
          options.help = true;
        }
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
BDD Test Runner - Cucumber + Playwright

Usage:
  node run.js [options]

Options:
  --parallel, -p     Run tests with parallel workers
  --tags, -t <expr>  Run only scenarios matching tag expression
  --debug, -d        Stop on first failure (fail-fast)
  --headed           Run with visible browser (HEADLESS=false)
  --help             Show this help message

Examples:
  node run.js                          # Run all tests
  node run.js --parallel               # Run with 2 parallel workers
  node run.js --tags "@smoke"          # Run smoke tests only
  node run.js --tags "not @wip"        # Exclude work-in-progress
  node run.js --headed --debug         # Debug with visible browser

NPM Scripts (run from project root):
  npm test                             # Run all tests
  npm run test:parallel                # Run with parallel workers
  npm run test:debug                   # Run with fail-fast
  npm run test:report                  # Generate HTML report
  npm run allure:serve                 # View Allure report
`);
}

function runTests(options) {
  console.log('🥒 BDD Test Runner - Cucumber + Playwright\n');

  // Build command
  let command = 'npx cucumber-js';
  const args = [];

  if (options.parallel) {
    args.push('--parallel', '2');
    console.log('  ⚡ Parallel mode: 2 workers');
  }

  if (options.tags) {
    args.push('--tags', options.tags);
    console.log(`  🏷️  Tags: ${options.tags}`);
  }

  if (options.debug) {
    args.push('--fail-fast');
    console.log('  🐛 Debug mode: fail-fast enabled');
  }

  // Build environment
  const env = { ...process.env };

  if (options.headed) {
    env.HEADLESS = 'false';
    console.log('  👁️  Headed mode: browser visible');
  }

  console.log(`\n📂 Project: ${projectRoot}\n`);
  console.log('━'.repeat(50));
  console.log(`Running: ${command} ${args.join(' ')}`);
  console.log('━'.repeat(50) + '\n');

  // Run tests
  const testProcess = spawn(command, args, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
    shell: true,
  });

  testProcess.on('close', code => {
    console.log('\n' + '━'.repeat(50));
    if (code === 0) {
      console.log('✅ Tests completed successfully');
    } else {
      console.log(`❌ Tests failed with exit code ${code}`);
    }
    console.log('━'.repeat(50));

    // Show helpful commands
    console.log('\n📊 View Reports:');
    console.log('   npx playwright show-trace reports/traces/*.zip');
    console.log('   npm run allure:serve');

    process.exit(code);
  });
}

// Main
const options = parseArgs();

if (options.help) {
  showHelp();
  process.exit(0);
}

runTests(options);
