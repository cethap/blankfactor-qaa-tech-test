import { Page } from 'playwright';

export default abstract class BasePage {
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(url: string): Promise<void> {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        console.log(`Navigated to: ${url}`);
    }

    printHighlight(message?: string) {
        console.log('='.repeat(50));
        console.log(message);
        console.log('='.repeat(50));
    }

    // for debugging
    async pause() {
        await this.page.pause();
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