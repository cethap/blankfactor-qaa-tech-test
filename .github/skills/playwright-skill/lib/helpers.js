/**
 * BDD Test Helpers
 * Utility functions for Cucumber + Playwright BDD testing
 */

const fs = require('fs');
const path = require('path');

/**
 * Get project root directory (3 levels up from skill directory)
 */
function getProjectRoot() {
  return path.resolve(__dirname, '../../../..');
}

/**
 * Check if a feature file exists
 * @param {string} featureName - Name of the feature (with or without .feature)
 */
function featureExists(featureName) {
  const projectRoot = getProjectRoot();
  const name = featureName.endsWith('.feature') ? featureName : `${featureName}.feature`;
  const featurePath = path.join(projectRoot, 'features', name);
  return fs.existsSync(featurePath);
}

/**
 * Check if a page object exists
 * @param {string} pageName - Name of the page (with or without .page.ts)
 */
function pageObjectExists(pageName) {
  const projectRoot = getProjectRoot();
  const name = pageName.endsWith('.page.ts') ? pageName : `${pageName}.page.ts`;
  const pagePath = path.join(projectRoot, 'src', 'pages', name);
  return fs.existsSync(pagePath);
}

/**
 * Check if step definitions exist for a domain
 * @param {string} stepsName - Name of the steps file (with or without .steps.ts)
 */
function stepDefinitionsExist(stepsName) {
  const projectRoot = getProjectRoot();
  const name = stepsName.endsWith('.steps.ts') ? stepsName : `${stepsName}.steps.ts`;
  const stepsPath = path.join(projectRoot, 'src', 'step-definitions', name);
  return fs.existsSync(stepsPath);
}

/**
 * List all feature files
 */
function listFeatures() {
  const projectRoot = getProjectRoot();
  const featuresDir = path.join(projectRoot, 'features');

  if (!fs.existsSync(featuresDir)) {
    return [];
  }

  return fs
    .readdirSync(featuresDir)
    .filter(f => f.endsWith('.feature'))
    .map(f => f.replace('.feature', ''));
}

/**
 * List all page objects
 */
function listPageObjects() {
  const projectRoot = getProjectRoot();
  const pagesDir = path.join(projectRoot, 'src', 'pages');

  if (!fs.existsSync(pagesDir)) {
    return [];
  }

  return fs
    .readdirSync(pagesDir)
    .filter(f => f.endsWith('.page.ts'))
    .map(f => f.replace('.page.ts', ''));
}

/**
 * List all step definition files
 */
function listStepDefinitions() {
  const projectRoot = getProjectRoot();
  const stepsDir = path.join(projectRoot, 'src', 'step-definitions');

  if (!fs.existsSync(stepsDir)) {
    return [];
  }

  return fs
    .readdirSync(stepsDir)
    .filter(f => f.endsWith('.steps.ts'))
    .map(f => f.replace('.steps.ts', ''));
}

/**
 * Get the latest trace file
 */
function getLatestTrace() {
  const projectRoot = getProjectRoot();
  const tracesDir = path.join(projectRoot, 'reports', 'traces');

  if (!fs.existsSync(tracesDir)) {
    return null;
  }

  const traces = fs
    .readdirSync(tracesDir)
    .filter(f => f.endsWith('.zip'))
    .map(f => ({
      name: f,
      path: path.join(tracesDir, f),
      mtime: fs.statSync(path.join(tracesDir, f)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  return traces.length > 0 ? traces[0] : null;
}

/**
 * Get all failure screenshots
 */
function getFailureScreenshots() {
  const projectRoot = getProjectRoot();
  const screenshotsDir = path.join(projectRoot, 'reports', 'screenshots');

  if (!fs.existsSync(screenshotsDir)) {
    return [];
  }

  return fs
    .readdirSync(screenshotsDir)
    .filter(f => f.endsWith('.png'))
    .map(f => path.join(screenshotsDir, f));
}

/**
 * Generate a page object template
 * @param {string} pageName - Name of the page (e.g., "login")
 */
function generatePageObjectTemplate(pageName) {
  const className = pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page';

  return `import { Page } from '@playwright/test';
import { BasePage } from '../core/basePage';

export class ${className} extends BasePage {
  // Define locators as arrow functions for lazy evaluation
  // Prefer getByRole, getByLabel, getByText over CSS selectors

  // Example locators:
  // private submitButton = () => this.page.getByRole('button', { name: 'Submit' });
  // private emailInput = () => this.page.getByLabel('Email');
  // private heading = () => this.page.getByRole('heading', { level: 1 });

  constructor(page: Page) {
    super(page);
  }

  // Add page methods here
  // Example:
  // async enterEmail(email: string): Promise<void> {
  //   await this.emailInput().fill(email);
  // }
}
`;
}

/**
 * Generate a step definition template
 * @param {string} domain - Domain name (e.g., "login")
 * @param {string} pageClassName - Page class name (e.g., "LoginPage")
 */
function generateStepDefinitionTemplate(domain, pageClassName) {
  const pageName = domain.toLowerCase();

  return `import { Given, When, Then, BeforeStep } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { ${pageClassName} } from '../pages/${pageName}.page';

let ${pageName}Page: ${pageClassName};

// Initialize page object once per step (lazy loading via registry)
BeforeStep(async function (this: CustomWorld) {
  ${pageName}Page = await this.getPage(${pageClassName});
});

// Add step definitions here
// Example:
// Given('I am on the ${domain} page', async function (this: CustomWorld) {
//   await ${pageName}Page.goto('https://example.com/${pageName}');
// });

// When('I click the submit button', async function (this: CustomWorld) {
//   await ${pageName}Page.clickSubmit();
// });

// Then('I should see {string}', async function (this: CustomWorld, text: string) {
//   await expect(this.page.getByText(text)).toBeVisible();
// });
`;
}

/**
 * Generate a feature file template
 * @param {string} featureName - Name of the feature
 */
function generateFeatureTemplate(featureName) {
  const title = featureName.charAt(0).toUpperCase() + featureName.slice(1).replace(/-/g, ' ');

  return `Feature: ${title}
  As a user
  I want to [describe goal]
  So that [describe benefit]

  Background:
    Given I navigate to "https://example.com"

  Scenario: [Describe the scenario]
    Given [initial state]
    When [action]
    Then [expected outcome]
`;
}

module.exports = {
  getProjectRoot,
  featureExists,
  pageObjectExists,
  stepDefinitionsExist,
  listFeatures,
  listPageObjects,
  listStepDefinitions,
  getLatestTrace,
  getFailureScreenshots,
  generatePageObjectTemplate,
  generateStepDefinitionTemplate,
  generateFeatureTemplate,
};
