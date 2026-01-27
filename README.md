# BDD Test Automation Template

An AI-assisted test automation template using **Playwright + Cucumber.js + TypeScript**. Designed for **vibe coding/testing** where BDD scenarios serve as a central knowledge base that both humans and AI agents can understand and generate.

## Vision

This project enables **AI-powered test automation** where:

- **Gherkin is the source of truth** - Human-readable scenarios document test cases
- **Skills teach AI agents** the framework patterns and best practices
- **Agents generate, heal, and plan** tests using skills as reference
- **Feature files are living documentation** - valuable for humans and AI alike

```
┌─────────────────────────────────────────────────────────────┐
│                    CENTRAL KNOWLEDGE                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           features/*.feature (Gherkin)               │   │
│  │     Human-readable scenarios = Test documentation    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ▲                                  │
│            ┌─────────────┼─────────────┐                   │
│            │             │             │                   │
│     ┌──────┴──────┐ ┌────┴────┐ ┌──────┴──────┐           │
│     │   Skills    │ │  Agents │ │   Humans    │           │
│     │ (Reference) │ │(Generate)│ │  (Review)   │           │
│     └─────────────┘ └─────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Features

- **BDD Framework** - Cucumber.js with Gherkin syntax as central knowledge
- **AI Skills** - Teaching documents for AI agents (BDD patterns, Playwright API)
- **AI Agents** - Generator, Healer, Planner for test automation
- **Page Object Model** - Scalable and maintainable architecture
- **CI/CD** - GitHub Actions with Allure reporting
- **Trace Debugging** - Playwright traces for every scenario

## Project Structure

```
├── features/                    # CENTRAL KNOWLEDGE - Gherkin scenarios
│   └── *.feature                # Human-readable test documentation
├── src/
│   ├── step-definitions/        # THIN - Assertions only
│   ├── orchestration/           # BUSINESS LOGIC - Workflows
│   ├── pages/                   # UI LAYER - Element interactions
│   ├── core/basePage.ts         # Base class for pages
│   └── support/                 # World, hooks, configuration
├── .github/
│   ├── skills/                  # AI LEARNING - Framework patterns
│   │   ├── playwright-skill/    # Playwright + Cucumber patterns
│   │   └── bdd-gherkin-skill/   # BDD best practices & syntax
│   └── agents/                  # AI AUTOMATION
│       ├── playwright-test-generator.agent.md
│       ├── playwright-test-healer.agent.md
│       ├── playwright-test-planner.agent.md
│       └── playwright-test-reviewer.agent.md
└── reports/                     # Test outputs (traces, screenshots)
```

## Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Step Definitions (THIN)                                    │
│  - Call orchestrators                                       │
│  - Make assertions with expect()                            │
│  - Store/retrieve scenario data                             │
├─────────────────────────────────────────────────────────────┤
│  Orchestration Layer (BUSINESS LOGIC)                       │
│  - Compose page interactions into workflows                 │
│  - Handle business logic and flows                          │
│  - Reusable across different step definitions               │
├─────────────────────────────────────────────────────────────┤
│  Page Objects (UI INTERACTIONS)                             │
│  - Define locators                                          │
│  - Single-element interactions (click, fill, etc.)          │
│  - No business logic                                        │
└─────────────────────────────────────────────────────────────┘
```

## Skills (AI Learning Reference)

Skills are teaching documents that help AI agents understand the framework:

| Skill | Purpose |
|-------|---------|
| `playwright-skill` | Playwright + Cucumber patterns, Page Object Model, step definitions |
| `bdd-gherkin-skill` | BDD best practices, Gherkin syntax, Scenario Outlines, Data Tables |

AI agents reference these skills to:
- Generate consistent, well-structured tests
- Follow established patterns and conventions
- Use accessible locators (getByRole, getByLabel)
- Write reusable, parameterized steps

## Agents (AI Automation)

| Agent | Purpose |
|-------|---------|
| `playwright-test-generator` | Creates new feature files, page objects, step definitions |
| `playwright-test-healer` | Fixes broken tests, updates locators, debugs failures |
| `playwright-test-planner` | Explores applications, designs test scenarios, plans coverage |
| `playwright-test-reviewer` | Reviews scenarios for quality, anti-patterns, suggests improvements |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run all tests (headed mode)
npm test

# Run headless (CI mode)
HEADLESS=true npm test

# Run in parallel
npm run test:parallel
```

## BDD Workflow

### 1. Write Feature (or let AI generate)

```gherkin
Feature: User Authentication
  As a user I want to log in to access my account

  Background:
    Given I navigate to the application

  Scenario: Successful login
    When I enter "user@example.com" in the email field
    And I enter "password123" in the password field
    And I click the "Sign In" button
    Then I should see the dashboard
```

### 2. Implement Page Object

```typescript
// src/pages/login.page.ts
export class LoginPage extends BasePage {
  readonly emailInput = () => this.page.getByLabel('Email');
  readonly passwordInput = () => this.page.getByLabel('Password');
  readonly signInButton = () => this.page.getByRole('button', { name: 'Sign In' });

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }
}
```

### 3. Implement Step Definitions

```typescript
// src/step-definitions/login.steps.ts
let loginPage: LoginPage;

BeforeStep(async function (this: CustomWorld) {
  loginPage = await this.getPage(LoginPage);
});

When('I enter {string} in the email field', async function (email: string) {
  await loginPage.emailInput().fill(email);
});
```

## AI-Assisted Development

### Using Skills as Reference

When working with AI coding assistants, point them to the skills:

```
"Reference .github/skills/playwright-skill/SKILL.md for the project patterns"
"Use .github/skills/bdd-gherkin-skill/SKILL.md for Gherkin syntax"
```

### Using Agents

Agents can be invoked to automate test creation:

- **Generator**: "Create a login feature with page object and steps"
- **Healer**: "Fix the failing tests in features/checkout.feature"
- **Planner**: "Explore the /products page and design test scenarios"

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HEADLESS` | Run browser in headless mode | `false` |
| `SLOWMO` | Slow down actions (ms) | `500` (headed) / `0` (headless) |
| `CI` | CI environment flag | `false` |
| `TIMEOUT` | Test timeout (ms) | `60000` |

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:parallel` | Run with 2 parallel workers |
| `npm run test:debug` | Run with fail-fast |
| `npm run test:report` | Generate HTML report |
| `npm run allure:serve` | View Allure report |

## Debugging

### Playwright Traces

All scenarios capture traces automatically:

```bash
# View a trace file
npx playwright show-trace reports/traces/trace-*.zip
```

### Playwright Inspector

Add to any page method:

```typescript
await this.page.pause();  // Opens Playwright Inspector
```

## Contributing

1. Write/update feature files with clear Gherkin scenarios
2. Implement page objects with accessible locators
3. Keep skills updated with new patterns
4. Test with `npm test` before committing

## License

ISC
