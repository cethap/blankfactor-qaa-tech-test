# AI-Assisted BDD Test Automation

## Project Vision

This is a **vibe coding/testing** template where **BDD scenarios are the central knowledge base**. Gherkin feature files serve as:
- **Living documentation** - Human-readable test cases
- **AI reference** - Structured scenarios that AI agents can understand and generate
- **Source of truth** - Single place for test knowledge

## Skills Reference

Before generating or modifying tests, review the relevant skills:

| Skill | When to Use |
|-------|-------------|
| `.github/skills/playwright-skill/SKILL.md` | Creating page objects, step definitions, running tests |
| `.github/skills/bdd-gherkin-skill/SKILL.md` | Writing Gherkin scenarios, using Outlines, Data Tables, Rules |

## Architecture

### Central Knowledge Flow
```
features/*.feature (Gherkin)     ← CENTRAL KNOWLEDGE
        ↓
src/step-definitions/*.steps.ts  ← Step implementations
        ↓
src/pages/*.page.ts              ← Page abstractions
        ↓
src/core/basePage.ts             ← Base class
```

### Page Object Model with Lazy Registry
```typescript
// Pages cached in registry, not created per-step
const loginPage = await this.getPage(LoginPage);
```

### Step Definition Pattern
```typescript
let homePage: HomePage;
let loginPage: LoginPage;

BeforeStep(async function (this: CustomWorld) {
  [homePage, loginPage] = await Promise.all([
    this.getPage(HomePage),
    this.getPage(LoginPage),
  ]);
});

When('I click the {string} button', async function (buttonName: string) {
  await homePage.clickButton(buttonName);
});
```

### Scenario Data Storage
```typescript
this.setData('userEmail', email);              // Store
const email = this.getData<string>('userEmail'); // Retrieve
```

## Key Conventions

### Locators - Always Use Accessible Selectors
```typescript
// BEST - Resilient to DOM changes
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByText('Welcome')

// AVOID - Fragile
page.locator('.btn-submit')
page.locator('#email-input')
```

### Feature Files - Parameterize Steps
```gherkin
# GOOD - Reusable
When I click the {string} button
Then I should see {string} message

# AVOID - Hardcoded
When I click the Submit button
Then I should see Success message
```

### Assertions - Use Playwright's expect()
```typescript
import { expect } from '@playwright/test';

await expect(page.getByText('Success')).toBeVisible();
await expect(page).toHaveURL(/dashboard/);
```

## Commands

| Task | Command |
|------|---------|
| Run tests | `npm test` |
| Run headless | `HEADLESS=true npm test` |
| Run parallel | `npm run test:parallel` |
| View report | `npm run allure:serve` |
| View trace | `npx playwright show-trace reports/traces/*.zip` |

## Adding New Tests

### 1. Create Feature File
```gherkin
# features/login.feature
Feature: User Login
  Background:
    Given I navigate to the application

  Scenario: Successful login
    When I enter "user@test.com" in the email field
    And I click the "Sign In" button
    Then I should see the dashboard
```

### 2. Create Page Object (if needed)
```typescript
// src/pages/login.page.ts
export class LoginPage extends BasePage {
  readonly emailInput = () => this.page.getByLabel('Email');
  readonly signInButton = () => this.page.getByRole('button', { name: 'Sign In' });
}
```

### 3. Add Step Definitions
```typescript
// src/step-definitions/login.steps.ts
When('I enter {string} in the email field', async function (email: string) {
  await loginPage.emailInput().fill(email);
});
```

## AI Agents

| Agent | When to Use |
|-------|-------------|
| `playwright-test-generator` | Create new tests from requirements |
| `playwright-test-planner` | Explore app and design test scenarios |
| `playwright-test-healer` | Fix broken or failing tests |
| `playwright-test-reviewer` | Review test quality before merging |

### Recommended Workflow
```
1. Planner    → Design scenarios
2. Generator  → Implement tests
3. Reviewer   → Quality check
4. Healer     → Fix any issues
```

## File Reference

| Path | Purpose |
|------|---------|
| `features/*.feature` | **Central Knowledge** - Gherkin scenarios |
| `src/pages/*.page.ts` | Page objects with locators |
| `src/step-definitions/*.steps.ts` | Step implementations |
| `src/core/basePage.ts` | Base class for pages |
| `src/support/world.ts` | CustomWorld, page registry |
| `src/support/hooks.ts` | Browser setup, tracing |
| `.github/skills/` | **AI Learning** - Framework patterns |
| `.github/agents/` | **AI Automation** - Test agents |

## Debugging

- **Traces**: `reports/traces/` - Auto-captured for all scenarios
- **Screenshots**: `reports/screenshots/` - Auto-captured on failure
- **Inspector**: `await page.pause()` - Opens Playwright Inspector
