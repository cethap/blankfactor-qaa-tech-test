import { Page, Locator } from '@playwright/test';
import BasePage from '../core/basePage';

export class ContactPage extends BasePage {

  constructor(page: Page) {
    super(page);
  }
}
