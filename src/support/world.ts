import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  // Page registry - dynamically add pages as needed
  pageRegistry: Map<string, any>;

  // Scenario-specific data storage
  scenarioData: Map<string, any>;

  // Helper methods
  getPage<T>(pageClass: new (page: Page) => T): T;
  setData(key: string, value: any): void;
  getData<T>(key: string): T | undefined;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  pageRegistry: Map<string, any>;
  scenarioData: Map<string, any>;

  constructor(options: IWorldOptions) {
    super(options);
    this.pageRegistry = new Map();
    this.scenarioData = new Map();
  }

  // Helper method to get or create a page object
  getPage<T>(pageClass: new (page: Page) => T): T {
    const pageName = pageClass.name;

    if (!this.pageRegistry.has(pageName)) {
      if (!this.page) {
        throw new Error('Page is not initialized');
      }
      this.pageRegistry.set(pageName, new pageClass(this.page));
    }

    return this.pageRegistry.get(pageName);
  }

  // Helper methods for scenario data
  setData(key: string, value: any): void {
    this.scenarioData.set(key, value);
  }

  getData<T>(key: string): T | undefined {
    return this.scenarioData.get(key);
  }
}

setWorldConstructor(CustomWorldConstructor);
