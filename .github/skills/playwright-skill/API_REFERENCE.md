# BDD Test Framework - API Reference

This reference documents the project's core classes and patterns for Cucumber BDD testing with Playwright.

## Table of Contents

- [BasePage Class](#basepage-class)
- [CustomWorld Class](#customworld-class)
- [Hooks](#hooks)
- [Step Definition Patterns](#step-definition-patterns)
- [Playwright Locator API](#playwright-locator-api)
- [Assertions](#assertions)
- [Gherkin Syntax](#gherkin-syntax)

---

## BasePage Class

**Location:** `src/core/basePage.ts`

Abstract base class that all page objects must extend.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `page` | `Page` | Playwright Page instance |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `goto(url: string)` | `Promise<void>` | Navigate to URL |
| `getCurrentUrl()` | `Promise<string>` | Get current page URL |
| `getPageTitle()` | `Promise<string>` | Get page title |
| `pause()` | `Promise<void>` | Open Playwright Inspector for debugging |
| `printHighlight(message: string)` | `void` | Print formatted console output |

### Example Page Object

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../core/basePage';

export class MyPage extends BasePage {
  // Define locators as arrow functions (lazy evaluation)
  private myButton = () => this.page.getByRole('button', { name: 'Click Me' });
  private myInput = () => this.page.getByLabel('Username');

  constructor(page: Page) {
    super(page);
  }

  async clickMyButton(): Promise<void> {
    await this.myButton().click();
  }

  async enterUsername(username: string): Promise<void> {
    await this.myInput().fill(username);
  }
}
```

---

## CustomWorld Class

**Location:** `src/support/world.ts`

Extends Cucumber's World class with Playwright integration and shared state.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `browser` | `Browser` | Playwright Browser instance |
| `context` | `BrowserContext` | Browser context with settings |
| `page` | `Page` | Current page instance |
| `pageRegistry` | `Map<string, any>` | Cached page object instances |
| `scenarioData` | `Map<string, any>` | Test data storage |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getPage<T>(PageClass)` | `Promise<T>` | Get or create page object instance |
| `setData(key, value)` | `void` | Store data for current scenario |
| `getData<T>(key)` | `T \| undefined` | Retrieve stored data |

### Usage in Steps

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/login.page';

When('I login', async function (this: CustomWorld) {
  // Get page object (lazy loaded, cached)
  const loginPage = await this.getPage(LoginPage);
  await loginPage.login('user', 'pass');

  // Store data for later steps
  this.setData('loggedInUser', 'user');
});

Then('I am logged in as the user', async function (this: CustomWorld) {
  // Retrieve stored data
  const user = this.getData<string>('loggedInUser');
  // ... assertions
});
```

---

## Hooks

**Location:** `src/support/hooks.ts`

### BeforeAll

Launches browser once per test run.

```typescript
BeforeAll(async function () {
  // Browser is launched with headless/headed mode based on env
});
```

### Before (per scenario)

Sets up browser context with:
- User-Agent override
- Locale and timezone
- Extra HTTP headers (anti-bot)
- Playwright tracing

### After (per scenario)

- Captures screenshot on failure
- Saves trace file
- Closes page and context

### AfterAll

Closes browser instance.

---

## Step Definition Patterns

### Basic Structure

```typescript
import { Given, When, Then, BeforeStep } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { MyPage } from '../pages/my.page';

// Module-level page reference
let myPage: MyPage;

// Initialize once per step
BeforeStep(async function (this: CustomWorld) {
  myPage = await this.getPage(MyPage);
});

// Step implementations
Given('I am on the home page', async function (this: CustomWorld) {
  await myPage.goto('https://example.com');
});

When('I click the {string} button', async function (this: CustomWorld, buttonName: string) {
  await myPage.clickButton(buttonName);
});

Then('I should see {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.getByText(text)).toBeVisible();
});
```

### Cucumber Expressions

| Expression | Matches | Example |
|------------|---------|---------|
| `{string}` | Quoted string | `"hello"` |
| `{int}` | Integer | `42` |
| `{float}` | Decimal | `3.14` |
| `{word}` | Single word | `foo` |
| `{}` | Any text | anything |

```typescript
Given('I have {int} items in my cart', async function (count: number) {
  // count is parsed as integer
});

When('I search for {string}', async function (query: string) {
  // query is the text inside quotes
});
```

### Data Tables

```gherkin
When I fill in the form:
  | field    | value          |
  | name     | John Doe       |
  | email    | john@test.com  |
```

```typescript
When('I fill in the form:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.hashes();
  for (const row of rows) {
    await this.page.getByLabel(row.field).fill(row.value);
  }
});
```

---

## Playwright Locator API

### Preferred Locators (Most Resilient)

```typescript
// By role (BEST - semantic, accessible)
page.getByRole('button', { name: 'Submit' });
page.getByRole('link', { name: 'Home' });
page.getByRole('heading', { level: 1 });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('checkbox', { name: 'Accept terms' });
page.getByRole('navigation');
page.getByRole('main');

// By label (forms)
page.getByLabel('Email address');
page.getByPlaceholder('Enter email');

// By text
page.getByText('Welcome');
page.getByText(/welcome/i);  // case-insensitive
```

### Secondary Locators

```typescript
// By test ID
page.getByTestId('submit-button');

// CSS selector
page.locator('.my-class');
page.locator('#my-id');
page.locator('[data-testid="foo"]');

// Combining locators
page.locator('div').filter({ hasText: 'Hello' });
page.locator('tr').filter({ has: page.locator('td', { hasText: 'Active' }) });
```

### Locator Actions

```typescript
// Click
await locator.click();
await locator.click({ button: 'right' });
await locator.dblclick();

// Fill input
await locator.fill('text');
await locator.clear();
await locator.type('text', { delay: 100 });

// Select
await locator.selectOption('value');
await locator.selectOption({ label: 'Option Text' });

// Checkbox
await locator.check();
await locator.uncheck();

// Hover
await locator.hover();

// Scroll
await locator.scrollIntoViewIfNeeded();

// Wait
await locator.waitFor({ state: 'visible' });
await locator.waitFor({ state: 'hidden', timeout: 5000 });

// Get text/attributes
const text = await locator.textContent();
const innerText = await locator.innerText();
const value = await locator.inputValue();
const attr = await locator.getAttribute('href');
```

---

## Assertions

### Playwright Expect API

```typescript
import { expect } from '@playwright/test';

// Page assertions
await expect(page).toHaveTitle('My App');
await expect(page).toHaveURL(/.*dashboard/);

// Element visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();

// Text assertions
await expect(locator).toHaveText('Exact text');
await expect(locator).toContainText('partial');
await expect(locator).toHaveText(/regex/i);

// Input values
await expect(locator).toHaveValue('input value');
await expect(locator).toBeEmpty();

// Attributes/CSS
await expect(locator).toHaveAttribute('href', '/home');
await expect(locator).toHaveClass(/active/);
await expect(locator).toHaveCSS('color', 'rgb(0, 0, 0)');

// Count
await expect(locator).toHaveCount(5);

// Checkbox state
await expect(locator).toBeChecked();
```

### Soft Assertions (Non-Blocking)

```typescript
await expect.soft(locator).toHaveText('text');
// Test continues even if this fails
```

---

## Gherkin Syntax

### Feature File Structure

```gherkin
@tag1 @tag2
Feature: Feature Name
  As a <role>
  I want <feature>
  So that <benefit>

  Background:
    Given common setup steps
    And more setup

  @smoke
  Scenario: Scenario name
    Given initial state
    When action happens
    Then expected outcome
    And another outcome

  Scenario Outline: Parameterized scenario
    Given I have <count> items
    When I add <more> items
    Then I should have <total> items

    Examples:
      | count | more | total |
      | 1     | 2    | 3     |
      | 5     | 5    | 10    |
```

### Running Tagged Scenarios

```bash
# Run only @smoke tagged scenarios
npm test -- --tags "@smoke"

# Run excluding @wip
npm test -- --tags "not @wip"

# Combine tags
npm test -- --tags "@smoke and @login"
```

---

## Common Patterns

### Wait for Network Idle

```typescript
await page.waitForLoadState('networkidle');
```

### Wait for Navigation

```typescript
await Promise.all([
  page.waitForNavigation(),
  button.click(),
]);
```

### Handle Dialogs

```typescript
page.on('dialog', async dialog => {
  await dialog.accept();
  // or dialog.dismiss()
});
```

### File Upload

```typescript
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');
```

### iFrame Interaction

```typescript
const frame = page.frameLocator('#iframe-id');
await frame.locator('button').click();
```

### Multiple Windows/Tabs

```typescript
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.click('a[target="_blank"]'),
]);
await newPage.waitForLoadState();
```

---

## Debugging

### Pause and Inspect

```typescript
await page.pause();  // Opens Playwright Inspector
```

### Console Logs

```typescript
page.on('console', msg => console.log('Browser:', msg.text()));
page.on('pageerror', err => console.log('Page Error:', err));
```

### Screenshot on Demand

```typescript
await page.screenshot({ path: 'debug.png', fullPage: true });
```

### Trace Viewer

```bash
npx playwright show-trace reports/traces/trace-*.zip
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HEADLESS` | `true` | Run browser in headless mode |
| `SLOWMO` | `0` | Slow down actions by N ms |
| `CI` | `false` | CI environment (forces headless) |
| `TIMEOUT` | `60000` | Test timeout in ms |
| `PARALLEL_WORKERS` | `2` | Number of parallel workers |
