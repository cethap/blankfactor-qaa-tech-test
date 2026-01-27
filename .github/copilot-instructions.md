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

### Three-Layer Architecture
```
features/*.feature (Gherkin)          ← CENTRAL KNOWLEDGE
        ↓
src/step-definitions/*.steps.ts       ← THIN: assertions only
        ↓
src/orchestration/*.ts                ← BUSINESS LOGIC: workflows
        ↓
src/pages/*.page.ts                   ← UI: element interactions
```

### Layer Responsibilities

| Layer | Responsibility | Contains |
|-------|---------------|----------|
| **Step Definitions** | Assertions only | `expect()` calls, `setData/getData` |
| **Orchestration** | Business workflows | Multi-page flows, business logic |
| **Page Objects** | UI interactions | Locators, clicks, fills, waits |

### Orchestration Pattern (Recommended)
```typescript
// Orchestrators handle business logic, pages handle UI
let navigation: NavigationOrchestrator;
let content: ContentOrchestrator;

BeforeStep(async function (this: CustomWorld) {
  navigation = this.getOrchestrator(NavigationOrchestrator);
  content = this.getOrchestrator(ContentOrchestrator);
});

// Step definitions are THIN - just orchestrator calls + assertions
When('I navigate to the {string} section', async function (sectionName: string) {
  await navigation.navigateToIndustrySection(sectionName);
});

Then('I should see the welcome message', async function () {
  const message = await content.getWelcomeMessage();
  expect(message).toContain('Welcome');  // Assertion here, not in orchestrator
});
```

### Page Object Pattern (for simple cases)
```typescript
// Direct page access for simple UI interactions
const loginPage = this.getPage(LoginPage);
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
    When I login with valid credentials
    Then I should see the dashboard
```

### 2. Create Page Object (UI interactions)
```typescript
// src/pages/login.page.ts
export class LoginPage extends BasePage {
  readonly emailInput = () => this.page.getByLabel('Email');
  readonly passwordInput = () => this.page.getByLabel('Password');
  readonly signInButton = () => this.page.getByRole('button', { name: 'Sign In' });

  async fillEmail(email: string) { await this.emailInput().fill(email); }
  async fillPassword(password: string) { await this.passwordInput().fill(password); }
  async clickSignIn() { await this.signInButton().click(); }
}
```

### 3. Create Orchestrator (business logic)
```typescript
// src/orchestration/authOrchestrator.ts
export class AuthOrchestrator extends BaseOrchestrator {
  private loginPage: LoginPage;

  async loginWithCredentials(email: string, password: string) {
    await this.loginPage.fillEmail(email);
    await this.loginPage.fillPassword(password);
    await this.loginPage.clickSignIn();
    await this.waitForPageReady();
  }
}
```

### 4. Add Step Definitions (thin - assertions only)
```typescript
// src/step-definitions/login.steps.ts
let auth: AuthOrchestrator;

BeforeStep(async function (this: CustomWorld) {
  auth = this.getOrchestrator(AuthOrchestrator);
});

When('I login with valid credentials', async function () {
  await auth.loginWithCredentials('user@test.com', 'password123');
});

Then('I should see the dashboard', async function () {
  const url = await auth.getCurrentUrl();
  expect(url).toContain('/dashboard');  // Only assertion in step
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
| `src/orchestration/*.ts` | **Business Layer** - Workflows, logic |
| `src/pages/*.page.ts` | **UI Layer** - Element interactions |
| `src/step-definitions/*.steps.ts` | **Thin** - Assertions only |
| `src/core/basePage.ts` | Base class for pages |
| `src/support/world.ts` | CustomWorld, registries |
| `src/support/hooks.ts` | Browser setup, tracing |
| `.github/skills/` | **AI Learning** - Framework patterns |
| `.github/agents/` | **AI Automation** - Test agents |

## Debugging

- **Traces**: `reports/traces/` - Auto-captured for all scenarios
- **Screenshots**: `reports/screenshots/` - Auto-captured on failure
- **Inspector**: `await page.pause()` - Opens Playwright Inspector
