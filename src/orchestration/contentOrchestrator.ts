import { Page } from '@playwright/test';
import { BaseOrchestrator } from './baseOrchestrator';
import { RetirementPage } from '../pages/retirement.page';

/**
 * Content Orchestrator
 *
 * Handles content verification and interaction flows.
 * Retrieves and processes content from the application.
 */
export class ContentOrchestrator extends BaseOrchestrator {
  private retirementPage: RetirementPage;

  constructor(page: Page) {
    super(page);
    this.retirementPage = new RetirementPage(page);
  }

  /**
   * Get text content from a tile by hovering
   * Business flow: Hover on tile → Extract description text
   */
  async getTileContent(tileName: string): Promise<string> {
    const content = await this.retirementPage.hoverAndCopyTextFromTile(tileName);
    this.log('Retrieved tile content', tileName);
    return content;
  }

  /**
   * Get current page information
   * Returns URL and title as a structured object
   */
  async getPageInfo(): Promise<{ url: string; title: string }> {
    const url = await this.getCurrentUrl();
    const title = await this.getPageTitle();
    this.log('Retrieved page info', `${title} (${url})`);
    return { url, title };
  }

  /**
   * Verify page navigation was successful
   * Returns structured verification data
   */
  async verifyPageNavigation(expectedUrlPattern: string): Promise<{
    url: string;
    title: string;
    urlMatches: boolean;
  }> {
    const { url, title } = await this.getPageInfo();
    const urlMatches = url.includes(expectedUrlPattern);

    this.log('Verified page navigation', `URL contains "${expectedUrlPattern}": ${urlMatches}`);

    return {
      url,
      title,
      urlMatches,
    };
  }

  /**
   * Print highlighted content for debugging/display
   */
  printContent(label: string, content: string): void {
    console.log('='.repeat(50));
    console.log(`${label}:`);
    console.log(content);
    console.log('='.repeat(50));
  }
}
