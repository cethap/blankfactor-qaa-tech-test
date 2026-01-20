import { Page, Locator } from '@playwright/test';
import BasePage from '../core/basePage';

export class RetirementPage extends BasePage {
  readonly letsGetStartedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.letsGetStartedButton = page.locator('a:has-text("Let\'s get started")').first();
  }

  getSectionHeading(headingText: string): Locator {
    return this.page.locator(`text=${headingText}`).first();
  }

  async scrollToSection(sectionHeading: string) {
    const sectionElement = this.getSectionHeading(sectionHeading);
    await sectionElement.waitFor({ timeout: 10000 });
    await sectionElement.scrollIntoViewIfNeeded();

    console.log(`Scrolled to section: ${sectionHeading}`);
  }

  getTile(tileName: string): Locator {
    return this.page.locator(`text=${tileName}`).first();
  }

  getTileContainer(tileName: string): Locator {
    return this.page.locator(`.card-wrapper:has-text("${tileName}")`).first().locator('.flip-card-inner > .flip-card-back');
  }

  async hoverAndCopyTextFromTile(tileName: string): Promise<string> {
    const tile = this.getTile(tileName);
    await tile.waitFor({ timeout: 10000 });

    await tile.hover();
    console.log(`Hovered over tile: ${tileName}`);

    const tileContainer = this.getTileContainer(tileName);
    const text = await tileContainer.textContent();

    const copiedText = text?.trim() || '';
    console.log('Copied text from tile:');
    this.printHighlight(copiedText);

    return copiedText;
  }

  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  getButton(buttonText: string): Locator {
    return this.page.locator(`a:has-text("${buttonText}")`).first();
  }

  async clickButton(buttonText: string) {
    const button = this.getButton(buttonText);
    await button.waitFor({ timeout: 10000 });
    await button.scrollIntoViewIfNeeded();
    await button.click();

    console.log(`Clicked on button: ${buttonText}`);

    await this.page.waitForLoadState('domcontentloaded');
  }

  async getCurrentUrl(): Promise<string> {
    const currentUrl = this.page.url();

    console.log(`Current Page URL: ${currentUrl}`);

    return currentUrl;
  }

  async getPageTitle(): Promise<string> {
    const title = await this.page.title();

    console.log(`Page Title: ${title}`);

    return title;
  }
}
