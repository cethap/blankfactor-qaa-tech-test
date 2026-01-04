import { Locator, Page } from 'playwright';

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
}