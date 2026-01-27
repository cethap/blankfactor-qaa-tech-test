import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  // Page registry - dynamically add pages as needed
  pageRegistry: Map<string, any>;

  // Orchestrator registry - business logic layer
  orchestratorRegistry: Map<string, any>;

  // Scenario-specific data storage
  scenarioData: Map<string, any>;

  // Helper methods
  getPage<T>(pageClass: new (page: Page) => T): T;
  getOrchestrator<T>(orchestratorClass: new (page: Page) => T): T;
  setData(key: string, value: any): void;
  getData<T>(key: string): T | undefined;
}

export class CustomWorldConstructor extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  pageRegistry: Map<string, any>;
  orchestratorRegistry: Map<string, any>;
  scenarioData: Map<string, any>;

  constructor(options: IWorldOptions) {
    super(options);
    this.pageRegistry = new Map();
    this.orchestratorRegistry = new Map();
    this.scenarioData = new Map();
  }

  /**
   * Get or create a page object (UI interaction layer)
   */
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

  /**
   * Get or create an orchestrator (business logic layer)
   *
   * Orchestrators compose page object interactions into business workflows.
   * Use orchestrators in step definitions to keep steps thin.
   */
  getOrchestrator<T>(orchestratorClass: new (page: Page) => T): T {
    const orchestratorName = orchestratorClass.name;

    if (!this.orchestratorRegistry.has(orchestratorName)) {
      if (!this.page) {
        throw new Error('Page is not initialized');
      }
      this.orchestratorRegistry.set(orchestratorName, new orchestratorClass(this.page));
    }

    return this.orchestratorRegistry.get(orchestratorName);
  }

  /**
   * Store scenario-specific data
   */
  setData(key: string, value: any): void {
    this.scenarioData.set(key, value);
  }

  /**
   * Retrieve scenario-specific data
   */
  getData<T>(key: string): T | undefined {
    return this.scenarioData.get(key);
  }
}

setWorldConstructor(CustomWorldConstructor);
