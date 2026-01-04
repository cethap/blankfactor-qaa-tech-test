import { Page, Locator } from '@playwright/test';
import BasePage from '../core/basePage';

export class HomePage extends BasePage {
  readonly industriesLink: Locator;
  readonly retirementAndWealthLink: Locator;

  constructor(page: Page) {
    super(page);
    this.industriesLink = page.getByRole('navigation').getByRole('link', { name: 'Industries' });
    this.retirementAndWealthLink = page.getByRole('link', { name: 'Retirement and Wealth' });
  }

  async hoverOnIndustries() {
    await this.industriesLink.waitFor({ timeout: 10000 });
    await this.industriesLink.hover();

    // Animation wait
    await this.page.waitForTimeout(1000);
    console.log('Hovered over Industries section');
  }

  getSectionLink(sectionName: string): Locator {
    return this.page.getByRole('link', { name: sectionName });
  }

  async openSection(sectionName: string) {
    const sectionLink = this.getSectionLink(sectionName);
    await sectionLink.waitFor({ timeout: 10000 });
    await sectionLink.click();

    console.log(`Opened ${sectionName} section`);

    await this.page.waitForLoadState('domcontentloaded');
    // Animation wait
    await this.page.waitForTimeout(1000);
  }
}
