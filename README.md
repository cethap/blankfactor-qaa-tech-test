# Blankfactor QA Automation

BDD-style automated testing framework using Playwright, Cucumber, and TypeScript with Page Object Model architecture.

## Features

- ✅ **BDD Framework** - Cucumber.js with Gherkin syntax
- ✅ **Page Object Model** - Scalable and maintainable architecture
- ✅ **CI/CD** - GitHub Actions workflow
- ✅ **Multiple Reports** - HTML, JSON, XML formats
- ✅ **Screenshots on Failure** - Automatic capture and upload
- ✅ **Parallel Execution** - Fast test runs
- ✅ **Playwright Trace Viewer** - One-click trace debugging in browser

## Tech Stack

- **TypeScript** - Primary programming language
- **Playwright** - Browser automation framework
- **Cucumber** - BDD framework with Gherkin syntax
- **Docker** - Containerization for consistent environments
- **GitHub Actions** - CI/CD pipeline

## Quick Start

### Prerequisites

- Node.js 24.12.0 or higher
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd blankfactor-qa-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run all tests (default: headed mode for debugging)
npm test

# Run in headless mode (CI)
HEADLESS=true npm test
```

### Docker Execution

```bash
# Run tests in Docker
npm run docker:test
```

## Architecture

### Page Object Model

This project uses a scalable POM pattern with lazy-loaded page registry:

```typescript
let bfPage: BlankfactorPage;
// Helper function for page access
BeforeStep(async function (this:CustomWorld) {
  bfPage = await this.getPage(BlankfactorPage);
});

// Use in steps
Given('I navigate to {string}', async function (this: CustomWorld, url: string) {
  await bfPage.goto(url);
});
```

### Scenario Data Storage

Store test data without polluting the world:

```typescript
// Store data
this.setData('copiedText', text);

// Retrieve data
const text = this.getData<string>('copiedText');
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HEADLESS` | Run in headless mode | `false` |
| `CI` | CI environment flag | `false` |
| `NODE_ENV` | Node environment | `test` |

### Browser Settings

Edit [features/support/hooks.ts](features/support/hooks.ts):

```typescript
browser = await chromium.launch({
  headless: isHeadless,  // Auto-configured from env vars
  slowMo: slowMo,        // 500ms in headed, 0ms in headless
});
```

## CI/CD

### GitHub Actions

The project includes a complete CI/CD pipeline:

- ✅ Runs on push/PR to main/develop
- ✅ Manual trigger support
- ✅ Scheduled daily runs
- ✅ Parallel execution
- ✅ Docker-based testing
- ✅ Artifact uploads
- ✅ Test result publishing

📖 [Read full CI/CD documentation](DOCKER.md)

## NPM Scripts

### Test Execution

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:parallel` | Run tests in parallel (2 workers) |
| `npm run test:report` | Generate HTML report |
| `npm run test:debug` | Run with fail-fast |
| `npm run test:ci` | Run with JSON output for CI |


## Debugging

### Playwright Trace Viewer Integration

All test scenarios automatically capture Playwright traces. When viewing reports on GitHub Pages, clicking on a `trace.zip` attachment automatically opens it in the [Playwright Trace Viewer](https://trace.playwright.dev/).

**How it works:**
1. Every test scenario records a trace with screenshots, snapshots, and network activity
2. Traces are attached to the report
3. Click any trace.zip attachment in the report
4. Automatically redirects to `https://trace.playwright.dev/?trace={GITHUB_PAGES_URL}`
5. Debug the test execution timeline, DOM snapshots, network requests, and console logs

**Local trace viewing:**
```bash
# View a specific trace file directly
npx playwright show-trace reports/traces/trace-*.zip
```

### Using Playwright Inspector

In your page object:

```typescript
async pause() {
  await this.page.pause();
}
```

In step definition with extended timeout:

```typescript
When('I navigate to Industries section', { timeout: 60 * 1000 * 10 }, async function (this: CustomWorld) {
  await bfPage(this).pause();  // Opens Playwright Inspector
  await bfPage(this).hoverOnIndustries();
});
```

### Headed Mode

```bash
# Run with visible browser
HEADLESS=false npm test
```

## Resources

- 📚 [Page Object Model Guide](features/pages/README.md)
- 🐳 [Docker & CI/CD Guide](DOCKER.md)
- 🎭 [Playwright Docs](https://playwright.dev)
- 🥒 [Cucumber Docs](https://cucumber.io/docs/cucumber/)

## License

ISC
