import { Given, When, Then, BeforeStep } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { NavigationOrchestrator } from '../orchestration/navigationOrchestrator';
import { ContentOrchestrator } from '../orchestration/contentOrchestrator';

/**
 * Step Definitions
 *
 * Step definitions should be THIN:
 * - Call orchestrators for business logic
 * - Make assertions
 * - Store/retrieve scenario data
 *
 * Architecture:
 *   Step Definitions (this file) - assertions only
 *         ↓
 *   Orchestration Layer - business flows
 *         ↓
 *   Page Objects - UI interactions
 */

let navigation_domain: NavigationOrchestrator;
let content_domain: ContentOrchestrator;

BeforeStep(async function (this: CustomWorld) {
  [navigation_domain, content_domain] = [
    this.getOrchestrator(NavigationOrchestrator),
    this.getOrchestrator(ContentOrchestrator),
  ];
});

// ============================================================
// Navigation Steps
// ============================================================

Given('I navigate to {string}', async function (this: CustomWorld, url: string) {
  await navigation_domain.navigateToApp(url);
});

When('I hover to Industries section', async function (this: CustomWorld) {
  await navigation_domain.hoverOnIndustriesMenu();
});

When('I open the {string} section', async function (this: CustomWorld, sectionName: string) {
  await navigation_domain.openIndustrySection(sectionName);
});

When('I scroll down to the {string} section', async function (this: CustomWorld, sectionHeading: string) {
  await navigation_domain.scrollToSection(sectionHeading);
});

When('I scroll to the bottom of the page', async function (this: CustomWorld) {
  await navigation_domain.scrollToBottom();
});

When('I click on the {string} button', async function (this: CustomWorld, buttonText: string) {
  await navigation_domain.clickNavigationButton(buttonText);
});

// ============================================================
// Content Verification Steps
// ============================================================

Then('I should be able to copy text from tile {string} by hovering', async function (this: CustomWorld, tileName: string) {
  const copiedText = await content_domain.getTileContent(tileName);
  this.setData('copiedText', copiedText);
});

Then('I should validate the copied text contains the tile description', async function (this: CustomWorld) {
  const copiedText = this.getData<string>('copiedText');

  // Assertion - the only logic in step definitions
  expect(copiedText).toContain(
    'Automate your operations and get to market quickly and securely. Leverage predictive data analytics using machine learning to build reliable, yet forward-thinking financial solutions.'
  );
});

Then('I should verify the page URL', async function (this: CustomWorld) {
  const { url } = await content_domain.getPageInfo();

  // Assertion
  expect(url).toContain('/contact/');
});

Then('I should verify the page title', async function (this: CustomWorld) {
  const { title } = await content_domain.getPageInfo();
  this.setData('pageTitle', title);

  // Assertion
  expect(title).toBe('Contact | Blankfactor');
});

Then('I should print the title text', async function (this: CustomWorld) {
  const pageTitle = this.getData<string>('pageTitle');
  content_domain.printContent('PAGE TITLE', pageTitle || '');
});
