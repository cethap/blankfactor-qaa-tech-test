import { Page } from '@playwright/test';
import { BaseOrchestrator } from './baseOrchestrator';
import { HomePage } from '../pages/homepage.page';
import { RetirementPage } from '../pages/retirement.page';

/**
 * Navigation Orchestrator
 *
 * Handles navigation flows and workflows across the application.
 * Composes page object interactions into business-meaningful actions.
 */
export class NavigationOrchestrator extends BaseOrchestrator {
  private homePage: HomePage;
  private retirementPage: RetirementPage;

  constructor(page: Page) {
    super(page);
    this.homePage = new HomePage(page);
    this.retirementPage = new RetirementPage(page);
  }

  /**
   * Navigate to the application
   */
  async navigateToApp(url: string): Promise<void> {
    await this.homePage.goto(url);
    this.log('Navigated to application', url);
  }

  /**
   * Hover over the Industries menu
   */
  async hoverOnIndustriesMenu(): Promise<void> {
    await this.homePage.hoverOnIndustries();
    this.log('Hovered on Industries menu');
  }

  /**
   * Open a section from the Industries dropdown
   */
  async openIndustrySection(sectionName: string): Promise<void> {
    await this.homePage.openSection(sectionName);
    this.log('Opened industry section', sectionName);
  }

  /**
   * Navigate to a section via the Industries menu
   * Business flow: Hover on Industries → Click section link
   */
  async navigateToIndustrySection(sectionName: string): Promise<void> {
    await this.hoverOnIndustriesMenu();
    await this.openIndustrySection(sectionName);
    this.log('Navigated to industry section', sectionName);
  }

  /**
   * Scroll to a specific section on the page
   */
  async scrollToSection(sectionHeading: string): Promise<void> {
    await this.retirementPage.scrollToSection(sectionHeading);
    this.log('Scrolled to section', sectionHeading);
  }

  /**
   * Scroll to the bottom of the page
   */
  async scrollToBottom(): Promise<void> {
    await this.retirementPage.scrollToBottom();
    this.log('Scrolled to bottom of page');
  }

  /**
   * Click a navigation button/link
   */
  async clickNavigationButton(buttonText: string): Promise<void> {
    await this.retirementPage.clickButton(buttonText);
    await this.waitForPageReady();
    this.log('Clicked navigation button', buttonText);
  }

  /**
   * Complete navigation flow: Industries → Section → Specific area
   * Business flow that combines multiple navigation steps
   */
  async navigateToIndustrySectionArea(
    sectionName: string,
    areaHeading: string
  ): Promise<void> {
    await this.navigateToIndustrySection(sectionName);
    await this.scrollToSection(areaHeading);
    this.log('Completed navigation flow', `${sectionName} → ${areaHeading}`);
  }
}
