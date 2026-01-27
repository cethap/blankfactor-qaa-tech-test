import { Page } from '@playwright/test';

/**
 * Base Orchestrator
 *
 * Orchestrators contain business logic and workflows that compose
 * multiple page object interactions. They sit between step definitions
 * and page objects.
 *
 * Architecture:
 *   Step Definitions (thin - assertions only)
 *         ↓
 *   Orchestration Layer (business flows)
 *         ↓
 *   Page Objects (UI interactions)
 */
export abstract class BaseOrchestrator {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Log action for debugging
   */
  protected log(action: string, details?: string): void {
    const message = details ? `${action}: ${details}` : action;
    console.log(`[Orchestrator] ${message}`);
  }
}
