---
name: playwright-bdd
description: BDD test automation with Playwright + Cucumber. Create feature files, step definitions, page objects. Run tests, debug failures, heal broken locators. Use for writing Gherkin scenarios, implementing steps, adding page methods, running test suites, or fixing failing tests.
---

# Playwright BDD Test Automation Skill

This skill helps you work with the Cucumber BDD + Playwright test framework in this project.

## Project Architecture

```
/blankfactor-qaa-tech-test/
├── features/                    # Gherkin feature files
│   └── *.feature
├── src/
│   ├── core/
│   │   └── basePage.ts          # Base class for all page objects
│   ├── pages/                   # Page Object Model classes
│   │   └── *.page.ts
│   ├── step-definitions/        # Cucumber step implementations
│   │   └── *.steps.ts
│   └── support/
│       ├── hooks.ts             # Before/After hooks, browser setup
│       └── world.ts             # CustomWorld with page registry
├── reports/                     # Test output (traces, screenshots)
├── cucumber.js                  # Cucumber configuration
└── package.json                 # NPM scripts
```

## Running Tests

```bash
# Run all tests (default)
npm test

# Run with parallel workers
npm run test:parallel

# Run with fail-fast (stop on first failure)
npm run test:debug

# Generate HTML report
npm run test:report

# Run for CI (JSON output)
npm run test:ci
```

## Creating a New Feature File

Feature files go in `features/` using Gherkin syntax:

```gherkin
# features/login.feature
Feature: User Login

  Background:
    Given I navigate to "https://example.com"

  Scenario: Successful login with valid credentials
    When I enter "user@example.com" in the email field
    And I enter "password123" in the password field
    And I click the login button
    Then I should see the dashboard page
    And the page title should contain "Dashboard"

  Scenario: Failed login with invalid password
    When I enter "user@example.com" in the email field
    And I enter "wrongpassword" in the password field
    And I click the login button
    Then I should see an error message "Invalid credentials"
```

## Creating a Page Object

Page objects go in `src/pages/` and extend `BasePage`:

```typescript
// src/pages/login.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '../core/basePage';

export class LoginPage extends BasePage {
  // Locators - prefer getByRole, getByLabel, getByText
  private emailInput = () => this.page.getByLabel('Email');
  private passwordInput = () => this.page.getByLabel('Password');
  private loginButton = () => this.page.getByRole('button', { name: 'Login' });
  private errorMessage = () => this.page.locator('.error-message');
  private dashboardTitle = () => this.page.getByRole('heading', { level: 1 });

  constructor(page: Page) {
    super(page);
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput().fill(email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput().fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton().click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage().waitFor({ timeout: 5000 });
    return await this.errorMessage().textContent() || '';
  }

  async isDashboardVisible(): Promise<boolean> {
    return await this.dashboardTitle().isVisible();
  }
}
```

## Creating Step Definitions

Step definitions go in `src/step-definitions/` and use the CustomWorld:

```typescript
// src/step-definitions/login.steps.ts
import { Given, When, Then, BeforeStep } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/login.page';

let loginPage: LoginPage;

// Initialize page object once per step (lazy loading via registry)
BeforeStep(async function (this: CustomWorld) {
  loginPage = await this.getPage(LoginPage);
});

When('I enter {string} in the email field', async function (this: CustomWorld, email: string) {
  await loginPage.enterEmail(email);
});

When('I enter {string} in the password field', async function (this: CustomWorld, password: string) {
  await loginPage.enterPassword(password);
});

When('I click the login button', async function (this: CustomWorld) {
  await loginPage.clickLogin();
});

Then('I should see the dashboard page', async function (this: CustomWorld) {
  const isVisible = await loginPage.isDashboardVisible();
  expect(isVisible).toBe(true);
});

Then('I should see an error message {string}', async function (this: CustomWorld, expectedMessage: string) {
  const actualMessage = await loginPage.getErrorMessage();
  expect(actualMessage).toContain(expectedMessage);
});

Then('the page title should contain {string}', async function (this: CustomWorld, expectedTitle: string) {
  const title = await this.page.title();
  expect(title).toContain(expectedTitle);
});
```

## Locator Best Practices

Prefer accessible, semantic locators (most resilient to UI changes):

```typescript
// BEST: Role-based selectors
this.page.getByRole('button', { name: 'Submit' });
this.page.getByRole('link', { name: 'Industries' });
this.page.getByRole('heading', { level: 1 });
this.page.getByRole('textbox', { name: 'Email' });

// GOOD: Label-based (for form inputs)
this.page.getByLabel('Email');
this.page.getByPlaceholder('Enter your email');

// GOOD: Text-based (for unique text)
this.page.getByText('Welcome back');
this.page.getByText(/sign in/i);  // Case-insensitive regex

// OK: Data attributes (when semantic selectors unavailable)
this.page.locator('[data-testid="submit-btn"]');

// AVOID: CSS classes and IDs (fragile)
this.page.locator('.btn-primary');  // Classes change often
this.page.locator('#submit');       // IDs can be unstable
```

## Sharing Data Between Steps

Use the CustomWorld's `scenarioData` Map:

```typescript
// Store data
When('I copy the text from {string}', async function (this: CustomWorld, element: string) {
  const text = await this.page.locator(element).textContent();
  this.setData('copiedText', text);
});

// Retrieve data
Then('the copied text should contain {string}', async function (this: CustomWorld, expected: string) {
  const copiedText = this.getData<string>('copiedText');
  expect(copiedText).toContain(expected);
});
```

## Debugging Failed Tests

### View Playwright Traces

After a test failure, traces are saved to `reports/traces/`:

```bash
# View a trace file in Playwright Trace Viewer
npx playwright show-trace reports/traces/trace-*.zip
```

### View Screenshots

Failure screenshots are saved to `reports/screenshots/`.

### Run in Headed Mode

Set `HEADLESS=false` in `.env` or:

```bash
HEADLESS=false npm test
```

### Pause Execution for Debugging

Add to any page object method:

```typescript
async debugPause(): Promise<void> {
  await this.pause();  // Opens Playwright Inspector
}
```

## Common Patterns

### Scrolling to Elements

```typescript
async scrollToSection(sectionName: string): Promise<void> {
  const section = this.page.getByRole('heading', { name: sectionName });
  await section.scrollIntoViewIfNeeded();
  await section.waitFor({ state: 'visible', timeout: 10000 });
}
```

### Hover Actions

```typescript
async hoverOverMenu(menuName: string): Promise<void> {
  const menu = this.page.getByRole('link', { name: menuName });
  await menu.hover();
  await this.page.waitForTimeout(300);  // Wait for dropdown
}
```

### Wait for Navigation

```typescript
async clickAndWaitForNavigation(locator: Locator): Promise<void> {
  await Promise.all([
    this.page.waitForLoadState('domcontentloaded'),
    locator.click(),
  ]);
}
```

### Extract Text from Element

```typescript
async getTileDescription(tileName: string): Promise<string> {
  const tile = this.page.locator(`[data-tile="${tileName}"]`);
  await tile.hover();
  const description = tile.locator('.description');
  await description.waitFor({ state: 'visible' });
  return await description.textContent() || '';
}
```

## Healing Broken Locators

When a test fails due to changed UI:

1. **Check the trace** - View the screenshot/DOM at failure point
2. **Update the locator** - Prefer getByRole/getByLabel over CSS
3. **Test the locator** - Run the specific scenario to verify

Example fix:
```typescript
// BEFORE (broken - class changed)
private submitBtn = () => this.page.locator('.btn-submit');

// AFTER (resilient - uses role + text)
private submitBtn = () => this.page.getByRole('button', { name: 'Submit' });
```

## Adding New Test Scenarios

1. **Add scenario to feature file** in `features/`
2. **Run test to see undefined steps**: `npm test`
3. **Copy snippet suggestions** from output
4. **Implement steps** in `src/step-definitions/`
5. **Add page methods** if needed in `src/pages/`
6. **Run test** to verify: `npm test`

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
HEADLESS=false          # Show browser window
SLOWMO=500              # Slow down actions (ms)
CI=false                # CI mode (headless, no slowmo)
TIMEOUT=60000           # Test timeout (ms)
PARALLEL_WORKERS=2      # Parallel execution
```

## Allure Reports

```bash
# Generate Allure report
npm run allure:generate

# Serve report locally
npm run allure:serve
```

## Quick Reference

| Task | Command/Location |
|------|-----------------|
| Run all tests | `npm test` |
| Run in parallel | `npm run test:parallel` |
| Add feature | `features/*.feature` |
| Add steps | `src/step-definitions/*.steps.ts` |
| Add page object | `src/pages/*.page.ts` |
| View traces | `npx playwright show-trace reports/traces/*.zip` |
| View report | `npm run allure:serve` |
