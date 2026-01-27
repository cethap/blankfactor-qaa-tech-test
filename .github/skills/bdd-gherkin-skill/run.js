#!/usr/bin/env node
/**
 * BDD Gherkin Skill - Feature File Validator, Generator, and Reviewer
 *
 * Usage:
 *   node run.js --validate              # Validate all feature files
 *   node run.js --lint                  # Check for anti-patterns
 *   node run.js --review                # Full quality review with scoring
 *   node run.js --generate <name>       # Generate feature template
 *   node run.js --analyze               # Analyze feature coverage
 */

const fs = require('fs');
const path = require('path');

// Get project root (parent of .github/skills/bdd-gherkin-skill)
const skillDir = __dirname;
const projectRoot = path.resolve(skillDir, '../../..');
const featuresDir = path.join(projectRoot, 'features');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    validate: false,
    lint: false,
    review: false,
    generate: null,
    analyze: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--validate':
      case '-v':
        options.validate = true;
        break;
      case '--lint':
      case '-l':
        options.lint = true;
        break;
      case '--review':
      case '-r':
        options.review = true;
        break;
      case '--generate':
      case '-g':
        options.generate = args[++i];
        break;
      case '--analyze':
      case '-a':
        options.analyze = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
BDD Gherkin Skill - Feature File Tools

Usage:
  node run.js [options]

Options:
  --validate, -v         Validate all feature files for syntax
  --lint, -l             Check for BDD anti-patterns
  --review, -r           Full quality review with scoring
  --generate, -g <name>  Generate a feature file template
  --analyze, -a          Analyze feature coverage statistics
  --help, -h             Show this help message

Examples:
  node run.js --validate                # Check all features
  node run.js --lint                    # Find anti-patterns
  node run.js --review                  # Full quality review
  node run.js --generate login          # Create login.feature template
  node run.js --analyze                 # Show coverage stats
`);
}

function findFeatureFiles() {
  if (!fs.existsSync(featuresDir)) {
    return [];
  }

  const files = [];
  const walk = (dir) => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.feature')) {
        files.push(fullPath);
      }
    }
  };

  walk(featuresDir);
  return files;
}

function parseFeatureFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const result = {
    path: filePath,
    name: path.basename(filePath),
    hasFeature: false,
    hasBackground: false,
    scenarios: [],
    scenarioOutlines: [],
    rules: [],
    tags: [],
    steps: { given: 0, when: 0, then: 0, and: 0, but: 0 },
    dataTables: 0,
    docStrings: 0,
    issues: [],
  };

  let inDocString = false;
  let inDataTable = false;
  let currentScenario = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Doc strings
    if (line.startsWith('"""') || line.startsWith('```')) {
      inDocString = !inDocString;
      if (!inDocString) result.docStrings++;
      continue;
    }
    if (inDocString) continue;

    // Data tables
    if (line.startsWith('|')) {
      if (!inDataTable) {
        result.dataTables++;
        inDataTable = true;
      }
      continue;
    } else {
      inDataTable = false;
    }

    // Tags
    if (line.startsWith('@')) {
      const tags = line.match(/@[\w-]+/g) || [];
      result.tags.push(...tags);
      continue;
    }

    // Keywords
    if (line.startsWith('Feature:')) {
      result.hasFeature = true;
    } else if (line.startsWith('Background:')) {
      result.hasBackground = true;
    } else if (line.startsWith('Rule:')) {
      result.rules.push(line.replace('Rule:', '').trim());
    } else if (line.startsWith('Scenario Outline:') || line.startsWith('Scenario Template:')) {
      currentScenario = line.replace(/Scenario (Outline|Template):/, '').trim();
      result.scenarioOutlines.push(currentScenario);
    } else if (line.startsWith('Scenario:') || line.startsWith('Example:')) {
      currentScenario = line.replace(/(Scenario|Example):/, '').trim();
      result.scenarios.push(currentScenario);
    } else if (line.startsWith('Given ')) {
      result.steps.given++;
    } else if (line.startsWith('When ')) {
      result.steps.when++;
    } else if (line.startsWith('Then ')) {
      result.steps.then++;
    } else if (line.startsWith('And ')) {
      result.steps.and++;
    } else if (line.startsWith('But ')) {
      result.steps.but++;
    }
  }

  return result;
}

function validateFeatures() {
  console.log('🔍 Validating feature files...\n');

  const files = findFeatureFiles();
  if (files.length === 0) {
    console.log('No feature files found in', featuresDir);
    return;
  }

  let totalIssues = 0;

  for (const file of files) {
    const result = parseFeatureFile(file);
    const issues = [];

    // Validation checks
    if (!result.hasFeature) {
      issues.push('Missing Feature keyword');
    }

    if (result.scenarios.length === 0 && result.scenarioOutlines.length === 0) {
      issues.push('No scenarios defined');
    }

    if (result.steps.given === 0) {
      issues.push('No Given steps found');
    }

    if (result.steps.then === 0) {
      issues.push('No Then steps found (no assertions?)');
    }

    const relativePath = path.relative(projectRoot, file);

    if (issues.length > 0) {
      console.log(`❌ ${relativePath}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      totalIssues += issues.length;
    } else {
      console.log(`✅ ${relativePath}`);
    }
  }

  console.log(`\n${files.length} files checked, ${totalIssues} issues found`);
}

function lintFeatures() {
  console.log('🔍 Checking for BDD anti-patterns...\n');

  const files = findFeatureFiles();
  if (files.length === 0) {
    console.log('No feature files found');
    return;
  }

  const antiPatterns = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(projectRoot, file);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // Check for implementation details
      if (/click|button|field|input|element|selector|css|xpath/i.test(line) &&
          (line.startsWith('Given') || line.startsWith('When') || line.startsWith('Then'))) {
        antiPatterns.push({
          file: relativePath,
          line: lineNum,
          issue: 'Possible implementation detail in step',
          text: line,
        });
      }

      // Check for long scenarios (many consecutive And steps)
      if (line.startsWith('And ')) {
        let andCount = 1;
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          if (lines[j].trim().startsWith('And ')) {
            andCount++;
          } else if (lines[j].trim().match(/^(Given|When|Then|Scenario|Feature|Rule|Background)/)) {
            break;
          }
        }
        if (andCount >= 5) {
          antiPatterns.push({
            file: relativePath,
            line: lineNum,
            issue: `Long step chain (${andCount}+ And steps) - consider splitting scenario`,
            text: line,
          });
        }
      }

      // Check for conjunctive steps
      if (/\b(and|then)\b.*\b(and|then)\b/i.test(line) &&
          (line.startsWith('Given') || line.startsWith('When') || line.startsWith('Then'))) {
        antiPatterns.push({
          file: relativePath,
          line: lineNum,
          issue: 'Conjunctive step (multiple actions in one step)',
          text: line,
        });
      }

      // Check for missing Examples in Scenario Outline
      if (line.startsWith('Scenario Outline:')) {
        let hasExamples = false;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim().startsWith('Examples:') || lines[j].trim().startsWith('Scenarios:')) {
            hasExamples = true;
            break;
          }
          if (lines[j].trim().startsWith('Scenario') || lines[j].trim().startsWith('Rule:')) {
            break;
          }
        }
        if (!hasExamples) {
          antiPatterns.push({
            file: relativePath,
            line: lineNum,
            issue: 'Scenario Outline without Examples table',
            text: line,
          });
        }
      }
    }
  }

  if (antiPatterns.length === 0) {
    console.log('✅ No anti-patterns detected');
  } else {
    console.log(`Found ${antiPatterns.length} potential issues:\n`);
    antiPatterns.forEach(({ file, line, issue, text }) => {
      console.log(`⚠️  ${file}:${line}`);
      console.log(`   Issue: ${issue}`);
      console.log(`   Step: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`);
      console.log();
    });
  }
}

function generateFeature(name) {
  const fileName = name.endsWith('.feature') ? name : `${name}.feature`;
  const filePath = path.join(featuresDir, fileName);

  if (fs.existsSync(filePath)) {
    console.log(`❌ Feature file already exists: ${fileName}`);
    return;
  }

  const title = name.replace('.feature', '').replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const template = `@${name.replace('.feature', '')}
Feature: ${title}
  As a [role]
  I want to [action]
  So that [benefit]

  Background:
    Given I am on the application

  @smoke
  Scenario: ${title} - Happy path
    Given [precondition]
    When [action]
    Then [expected outcome]

  @negative
  Scenario: ${title} - Error case
    Given [precondition]
    When [invalid action]
    Then I should see an error message

  @data-driven
  Scenario Outline: ${title} - Multiple inputs
    Given [precondition]
    When I enter "<input>"
    Then I should see "<output>"

    Examples:
      | input   | output  |
      | value1  | result1 |
      | value2  | result2 |
`;

  // Ensure features directory exists
  if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir, { recursive: true });
  }

  fs.writeFileSync(filePath, template);
  console.log(`✅ Created: ${path.relative(projectRoot, filePath)}`);
  console.log('\nTemplate includes:');
  console.log('  - Feature with user story format');
  console.log('  - Background for common setup');
  console.log('  - Basic scenario (happy path)');
  console.log('  - Negative scenario (error case)');
  console.log('  - Scenario Outline with Examples');
}

function reviewFeatures() {
  console.log('📋 BDD Quality Review\n');

  const files = findFeatureFiles();
  if (files.length === 0) {
    console.log('No feature files found');
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(projectRoot, file);
    const result = parseFeatureFile(file);

    const issues = [];
    const suggestions = [];
    const goodPractices = [];

    // Check for issues
    let stepCount = 0;
    let currentScenarioStart = 0;
    let inScenario = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // Track scenario boundaries
      if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
        if (inScenario && stepCount > 8) {
          issues.push({
            type: 'Long Scenario',
            line: currentScenarioStart,
            problem: `Scenario has ${stepCount} steps (recommended max: 8)`,
            fix: 'Split into multiple focused scenarios'
          });
        }
        inScenario = true;
        currentScenarioStart = lineNum;
        stepCount = 0;
      }

      // Count steps
      if (/^(Given|When|Then|And|But)\s/.test(line)) {
        stepCount++;
      }

      // Check for implementation details
      if (/\.(click|fill|type|locator|selector|css|xpath|element|button|field|input)/i.test(line) &&
          /^(Given|When|Then|And|But)\s/.test(line)) {
        issues.push({
          type: 'Implementation Detail',
          line: lineNum,
          problem: `Step contains technical/UI terms: "${line.substring(0, 50)}..."`,
          fix: 'Use business language instead of UI element references'
        });
      }

      // Check for hardcoded values that should be parameterized
      if (/^(When|And)\s.*"[^"]+@[^"]+\.[^"]+"/.test(line) && !line.includes('{string}')) {
        suggestions.push({
          type: 'Parameterize Email',
          line: lineNum,
          current: line,
          better: 'Consider using {string} parameter for reusability'
        });
      }

      // Check for waiting steps
      if (/wait\s*(for)?\s*\d+/i.test(line)) {
        issues.push({
          type: 'Explicit Wait',
          line: lineNum,
          problem: 'Explicit wait times in Gherkin',
          fix: 'Waits should be implicit in step implementation, not in scenarios'
        });
      }

      // Check for conjunctive steps
      if (/^(Given|When|Then)\s.*\band\b.*\band\b/i.test(line)) {
        issues.push({
          type: 'Conjunctive Step',
          line: lineNum,
          problem: 'Multiple actions in one step',
          fix: 'Split into separate steps using And keyword'
        });
      }
    }

    // Check last scenario
    if (inScenario && stepCount > 8) {
      issues.push({
        type: 'Long Scenario',
        line: currentScenarioStart,
        problem: `Scenario has ${stepCount} steps (recommended max: 8)`,
        fix: 'Split into multiple focused scenarios'
      });
    }

    // Check for good practices
    if (result.hasBackground && result.steps.given > 0) {
      goodPractices.push('Uses Background for shared setup');
    }
    if (result.scenarioOutlines.length > 0) {
      goodPractices.push('Uses Scenario Outlines for data-driven tests');
    }
    if (result.tags.length > 0) {
      goodPractices.push(`Uses tags for organization (${[...new Set(result.tags)].slice(0, 3).join(', ')})`);
    }
    if (result.rules.length > 0) {
      goodPractices.push('Uses Rules to group related scenarios');
    }

    // Calculate score
    const totalScenarios = result.scenarios.length + result.scenarioOutlines.length;
    let score = 5;
    score -= Math.min(2, Math.floor(issues.length / 2));
    score -= suggestions.length > 3 ? 1 : 0;
    score = Math.max(1, score);

    const stars = '⭐'.repeat(score) + '☆'.repeat(5 - score);

    // Output review
    console.log('═'.repeat(60));
    console.log(`📄 ${relativePath}`);
    console.log('═'.repeat(60));
    console.log(`Quality Score: ${stars} (${score}/5)`);
    console.log(`Scenarios: ${totalScenarios} | Issues: ${issues.length} | Suggestions: ${suggestions.length}`);
    console.log();

    if (issues.length > 0) {
      console.log('❌ Issues (Must Fix):');
      issues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. [${issue.type}] Line ${issue.line}`);
        console.log(`      Problem: ${issue.problem}`);
        console.log(`      Fix: ${issue.fix}`);
      });
      console.log();
    }

    if (suggestions.length > 0) {
      console.log('💡 Suggestions:');
      suggestions.forEach((sug, idx) => {
        console.log(`   ${idx + 1}. [${sug.type}] Line ${sug.line}`);
        console.log(`      ${sug.better}`);
      });
      console.log();
    }

    if (goodPractices.length > 0) {
      console.log('✅ Good Practices:');
      goodPractices.forEach(practice => {
        console.log(`   • ${practice}`);
      });
      console.log();
    }
  }

  console.log('═'.repeat(60));
  console.log('Review complete. Fix issues marked with ❌ first.');
  console.log('═'.repeat(60));
}

function analyzeFeatures() {
  console.log('📊 Feature Coverage Analysis\n');

  const files = findFeatureFiles();
  if (files.length === 0) {
    console.log('No feature files found');
    return;
  }

  const stats = {
    files: files.length,
    scenarios: 0,
    scenarioOutlines: 0,
    rules: 0,
    backgrounds: 0,
    dataTables: 0,
    docStrings: 0,
    tags: new Set(),
    steps: { given: 0, when: 0, then: 0, and: 0, but: 0 },
  };

  for (const file of files) {
    const result = parseFeatureFile(file);
    stats.scenarios += result.scenarios.length;
    stats.scenarioOutlines += result.scenarioOutlines.length;
    stats.rules += result.rules.length;
    if (result.hasBackground) stats.backgrounds++;
    stats.dataTables += result.dataTables;
    stats.docStrings += result.docStrings;
    result.tags.forEach(tag => stats.tags.add(tag));
    Object.keys(stats.steps).forEach(key => {
      stats.steps[key] += result.steps[key];
    });
  }

  const totalScenarios = stats.scenarios + stats.scenarioOutlines;
  const totalSteps = Object.values(stats.steps).reduce((a, b) => a + b, 0);

  console.log('Summary');
  console.log('═'.repeat(40));
  console.log(`Feature files:      ${stats.files}`);
  console.log(`Total scenarios:    ${totalScenarios}`);
  console.log(`  - Regular:        ${stats.scenarios}`);
  console.log(`  - Outlines:       ${stats.scenarioOutlines}`);
  console.log(`Rules:              ${stats.rules}`);
  console.log(`Backgrounds:        ${stats.backgrounds}`);
  console.log();
  console.log('Step Distribution');
  console.log('─'.repeat(40));
  console.log(`Given:  ${stats.steps.given.toString().padStart(4)} (${((stats.steps.given / totalSteps) * 100).toFixed(1)}%)`);
  console.log(`When:   ${stats.steps.when.toString().padStart(4)} (${((stats.steps.when / totalSteps) * 100).toFixed(1)}%)`);
  console.log(`Then:   ${stats.steps.then.toString().padStart(4)} (${((stats.steps.then / totalSteps) * 100).toFixed(1)}%)`);
  console.log(`And:    ${stats.steps.and.toString().padStart(4)} (${((stats.steps.and / totalSteps) * 100).toFixed(1)}%)`);
  console.log(`But:    ${stats.steps.but.toString().padStart(4)} (${((stats.steps.but / totalSteps) * 100).toFixed(1)}%)`);
  console.log(`Total:  ${totalSteps}`);
  console.log();
  console.log('Data Patterns');
  console.log('─'.repeat(40));
  console.log(`Data Tables: ${stats.dataTables}`);
  console.log(`Doc Strings: ${stats.docStrings}`);
  console.log();
  console.log(`Tags Used (${stats.tags.size}):`);
  console.log([...stats.tags].sort().join(', '));
}

// Main
const options = parseArgs();

if (options.help) {
  showHelp();
  process.exit(0);
}

if (options.validate) {
  validateFeatures();
} else if (options.lint) {
  lintFeatures();
} else if (options.review) {
  reviewFeatures();
} else if (options.generate) {
  generateFeature(options.generate);
} else if (options.analyze) {
  analyzeFeatures();
} else {
  showHelp();
}
