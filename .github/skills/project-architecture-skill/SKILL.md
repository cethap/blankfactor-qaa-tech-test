---
name: project-architecture
description: Project scaffolding and architecture patterns. Three-layer architecture with orchestration and page objects for UI. Use for understanding project structure, creating new components, or extending the framework.
---

# Project Architecture Skill

This skill documents the project's architecture patterns and scaffolding standards.

## Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  STEP DEFINITIONS (Thin Layer)                              │
│  src/step-definitions/*.steps.ts                            │
│  - Call orchestrators                                       │
│  - Make assertions with expect()                            │
│  - Store/retrieve scenario data                             │
│  - NO business logic here                                   │
├─────────────────────────────────────────────────────────────┤
│  ORCHESTRATION LAYER (Business Logic)                       │
│  src/orchestration/*.ts                                     │
│  - Compose interactions into workflows                      │
│  - Handle business logic and flows                          │
│  - Reusable across step definitions                         │
├─────────────────────────────────────────────────────────────┤
│  PAGE OBJECTS (UI Interactions)                             │
│  src/pages/*.page.ts                                        │
│  - Single-element interactions                              │
│  - No business logic                                        │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── step-definitions/        # THIN - Assertions only
│   └── *.steps.ts
├── orchestration/           # BUSINESS LOGIC
│   ├── baseOrchestrator.ts  # Base class for orchestrators
│   └── *Orchestrator.ts     # Workflow orchestrators
├── pages/                   # UI INTERACTIONS
│   └── *.page.ts            # Page objects
├── core/
│   └── basePage.ts          # Abstract base for pages
└── support/
    ├── world.ts             # CustomWorld with registries
    └── hooks.ts             # Before/After hooks
```

---

## Layer 1: Step Definitions (Thin)

Step definitions should ONLY:
- Call orchestrator methods
- Make assertions
- Store/retrieve scenario data

```typescript
// src/step-definitions/login.steps.ts
import { When, Then, BeforeStep } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { AuthOrchestrator } from '../orchestration/authOrchestrator';

let auth_domain: AuthOrchestrator;

BeforeStep(async function (this: CustomWorld) {
  auth_domain = this.getOrchestrator(AuthOrchestrator);
});

// THIN: Just call orchestrator
When('I login with valid credentials', async function () {
  await auth_domain.loginWithCredentials('user@test.com', 'password123');
});

// THIN: Orchestrator call + assertion
Then('I should see the dashboard', async function () {
  const url = await auth_domain.getCurrentUrl();
  expect(url).toContain('/dashboard');  // Only assertion here
});

// THIN: Store data for later
Then('I should see welcome message for {string}', async function (name: string) {
  const message = await auth_domain.getWelcomeMessage();
  this.setData('welcomeMessage', message);
  expect(message).toContain(name);
});
```

---

## Layer 2: Orchestration (Business Logic)

Orchestrators compose multiple page object interactions into business workflows.

```typescript
// src/orchestration/authOrchestrator.ts
import { Page } from '@playwright/test';
import { BaseOrchestrator } from './baseOrchestrator';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

export class AuthOrchestrator extends BaseOrchestrator {
  private loginPage: LoginPage;
  private dashboardPage: DashboardPage;

  constructor(page: Page) {
    super(page);
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  // Business workflow: combines multiple page interactions
  async loginWithCredentials(email: string, password: string): Promise<void> {
    await this.loginPage.fillEmail(email);
    await this.loginPage.fillPassword(password);
    await this.loginPage.clickSubmit();
    await this.waitForPageReady();
    this.log('Login completed', email);
  }

  // Business workflow: cross-page operation
  async loginAndNavigateToDashboard(email: string, password: string): Promise<void> {
    await this.loginWithCredentials(email, password);
    await this.dashboardPage.waitForDashboardLoaded();
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.dashboardPage.getWelcomeText();
  }
}
```

---

## Layer 3: Page Objects (UI Interactions)

Page objects handle single-element UI interactions.

```typescript
// src/pages/login.page.ts
import { Page } from '@playwright/test';
import BasePage from '../core/basePage';

export class LoginPage extends BasePage {
  // Locators as arrow functions (lazy evaluation)
  private emailInput = () => this.page.getByLabel('Email');
  private passwordInput = () => this.page.getByLabel('Password');
  private submitButton = () => this.page.getByRole('button', { name: 'Sign In' });
  private errorMessage = () => this.page.getByRole('alert');

  constructor(page: Page) {
    super(page);
  }

  // Single-element interactions only
  async fillEmail(email: string): Promise<void> {
    await this.emailInput().fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput().fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton().click();
  }

  async getErrorText(): Promise<string> {
    return await this.errorMessage().textContent() || '';
  }
}
```

---

## CustomWorld Configuration

```typescript
// src/support/world.ts
import { World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  pageRegistry: Map<string, any>;
  orchestratorRegistry: Map<string, any>;
  scenarioData: Map<string, any>;

  getPage<T>(pageClass: new (page: Page) => T): T;
  getOrchestrator<T>(orchestratorClass: new (page: Page) => T): T;
  setData(key: string, value: any): void;
  getData<T>(key: string): T | undefined;
}
```

---

## Creating New Components

### New Page Object

1. Create `src/pages/newpage.page.ts`
2. Extend `BasePage`
3. Define locators as arrow functions
4. Add single-element interaction methods

### New Orchestrator

1. Create `src/orchestration/newOrchestrator.ts`
2. Extend `BaseOrchestrator`
3. Inject page objects in constructor
4. Add business workflow methods

### New Step Definitions

1. Create `src/step-definitions/new.steps.ts`
2. Import orchestrators
3. Initialize in `BeforeStep`
4. Keep steps thin: orchestrator calls + assertions

---

## Best Practices

### DO
- Keep step definitions thin (orchestrator + assertion)
- Put business logic in orchestrators
- Use lazy-loaded locators in page objects
- Use registries for component caching

### DON'T
- Put business logic in step definitions
- Put multi-step workflows in page objects
- Create new page instances per step
