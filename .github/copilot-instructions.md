# Blankfactor QA Automation - AI Agent Instructions

## Project Overview
BDD UI automation framework: **Playwright + Cucumber.js + TypeScript** with Page Object Model. Tests run against [blankfactor.com](https://blankfactor.com) with Allure/Cucumber reporting.

## Architecture

### Page Object Model with Lazy Registry
```
src/core/basePage.ts      → Abstract base class (goto, pause, getCurrentUrl, getPageTitle)
src/pages/*.page.ts       → Concrete pages extend BasePage, declare Locator properties
src/support/world.ts      → CustomWorld with pageRegistry Map + scenarioData Map
```

**Pattern**: Pages instantiated via `this.getPage(PageClass)` - cached in `pageRegistry`, not created per-step.

### Step Definition Pattern ([blankfactor.steps.ts](src/step-definitions/blankfactor.steps.ts))
```typescript
// Declare page variables at module scope
let hpPage: HomePage;
let rpPage: RetirementPage;

// Initialize ALL pages once in BeforeStep (not per-step)
BeforeStep(async function (this: CustomWorld) {
  [hpPage, rpPage] = await Promise.all([
    this.getPage(HomePage),
    this.getPage(RetirementPage),
  ]);
});
```

### Scenario Data Storage
Use `setData()`/`getData()` instead of attaching properties to `this`:
```typescript
this.setData('copiedText', text);           // Store
const text = this.getData<string>('copiedText'); // Retrieve
```

## Key Conventions

### Locators - Use Accessible Selectors
```typescript
// ✅ Preferred - resilient to DOM changes
page.getByRole('navigation').getByRole('link', { name: 'Industries' })
page.getByRole('link', { name: 'Retirement and Wealth' })

// ❌ Avoid CSS/XPath unless necessary
page.locator('nav a.menu-item')
```

### Feature Files ([blankfactor.feature](features/blankfactor.feature))
- Use **Background** blocks for shared setup steps
- Parametrize with `{string}` placeholders: `When I click on the {string} button`
- Assertions use Playwright's `expect()`, not Cucumber assertions

### Anti-Bot Headers ([hooks.ts](src/support/hooks.ts))
Browser context includes userAgent, locale, timezone, and `navigator.webdriver` override. **Don't modify** - essential for production site testing.

## Commands

| Task | Command |
|------|---------|
| Run tests (headed) | `npm test` |
| Run headless | `HEADLESS=true npm test` |
| Parallel (2 workers) | `npm run test:parallel` |
| Debug mode | `npm run test:debug` |
| Allure report | `npm run allure:generate && npm run allure:serve` |
| Docker test | `npm run docker:test` |

## File Reference

| Path | Purpose |
|------|---------|
| `src/core/basePage.ts` | Base class for all page objects |
| `src/support/world.ts` | CustomWorld, page registry, scenario data |
| `src/support/hooks.ts` | Browser setup, tracing, screenshots on failure |
| `src/step-definitions/` | Gherkin step implementations |
| `src/pages/*.page.ts` | Page objects (HomePage, RetirementPage, ContactPage) |
| `cucumber.js` | Cucumber paths, reporters, ts-node config |

## Adding New Features

### New Page Object
1. Create `src/pages/newpage.page.ts` extending `BasePage`
2. Declare `Locator` properties in constructor using accessible selectors
3. Add interaction methods that await locators

### New Step Definition
1. Import page class in `blankfactor.steps.ts`
2. Add to module-scope variable and `BeforeStep` Promise.all
3. Implement step using `Given`/`When`/`Then` from `@cucumber/cucumber`

## Debugging
- **Traces**: Auto-captured to `reports/traces/` for all scenarios
- **Screenshots**: Auto-captured to `reports/screenshots/` on failure
- **Inspector**: Add `await page.pause()` to drop into Playwright Inspector
- **Live report**: https://cethap.github.io/blankfactor-qaa-tech-test/
