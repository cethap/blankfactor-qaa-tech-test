import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import * as fs from 'fs';
import * as path from 'path';

let browser: Browser;

BeforeAll(async function () {
  const isHeadless = process.env.HEADLESS === 'true' || process.env.CI === 'true';
  const slowMo = isHeadless ? 0 : 500;

  browser = await chromium.launch({
    headless: isHeadless,
    slowMo: slowMo,
  });
});

Before(async function (this: CustomWorld) {
  this.context = await browser.newContext({
    // viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
    },
  });

  // Start tracing before creating the page
  await this.context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true
  });

  this.page = await this.context.newPage();

  // Override navigator.webdriver to hide automation
  await this.page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });
});

After(async function (this: CustomWorld, { result, pickle }) {
  const timestamp = Date.now();
  const scenarioName = pickle.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  // Create directories if they don't exist
  const screenshotsDir = path.join('reports', 'screenshots');
  const tracesDir = path.join('reports', 'traces');

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  if (!fs.existsSync(tracesDir)) {
    fs.mkdirSync(tracesDir, { recursive: true });
  }

  // Capture screenshot on failure
  if (result?.status === Status.FAILED) {
    const screenshotPath = path.join(screenshotsDir, `failure-${scenarioName}-${timestamp}.png`);
    const screenshot = await this.page?.screenshot({ path: screenshotPath });
    if (screenshot) {
      this.attach(screenshot, 'image/png');
    }
  }

  // Stop tracing and save trace file (for both pass and fail)
  if (this.context) {
    const tracePath = path.join(tracesDir, `trace-${scenarioName}-${timestamp}.zip`);
    await this.context.tracing.stop({ path: tracePath });

    // Attach trace to report
    if (fs.existsSync(tracePath)) {
      const traceBuffer = fs.readFileSync(tracePath);
      // Use application/zip to ensure proper handling
      this.attach(traceBuffer, 'application/zip');
    }
  }

  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser.close();
});
