import { Page, Locator } from '@playwright/test';
import BasePage from '../core/basePage';

export class ContactPage extends BasePage {

  constructor(page: Page) {
    super(page);
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
