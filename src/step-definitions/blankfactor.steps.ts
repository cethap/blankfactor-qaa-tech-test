import { Given, When, Then, BeforeStep } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/homepage.page';
import { RetirementPage } from '../pages/retirement.page';
import { ContactPage } from '../pages/contact.page';

let home_page: HomePage;
let retirement_page: RetirementPage;
let contact_page: ContactPage;

BeforeStep(async function (this: CustomWorld) {
  [home_page, retirement_page, contact_page] = await Promise.all([
    this.getPage(HomePage),
    this.getPage(RetirementPage),
    this.getPage(ContactPage),
  ]);
});

Given('I navigate to {string}', async function (this: CustomWorld, url: string) {
  await home_page.goto(url);
});

When('I hover to Industries section', async function (this: CustomWorld) {
  await home_page.hoverOnIndustries();
});

When('I open the {string} section', async function (this: CustomWorld, sectionName: string) {
  await home_page.openSection(sectionName);
});

When('I scroll down to the {string} section', async function (this: CustomWorld, sectionHeading: string) {
  await retirement_page.scrollToSection(sectionHeading);
});

Then('I should be able to copy text from tile {string} by hovering', async function (this: CustomWorld, tileName: string) {
  const copiedText = await retirement_page.hoverAndCopyTextFromTile(tileName);
  this.setData('copiedText', copiedText);
});

Then('I should validate the copied text contains the tile description', async function (this: CustomWorld) {
  const copiedText = this.getData('copiedText');
  expect(copiedText).toContain('Automate your operations and get to market quickly and securely. Leverage predictive data analytics using machine learning to build reliable, yet forward-thinking financial solutions.');
});


When('I scroll to the bottom of the page', async function (this: CustomWorld) {
  await retirement_page.scrollToBottom();
});

When('I click on the {string} button', async function (this: CustomWorld, buttonText: string) {
  await retirement_page.clickButton(buttonText);
});

Then('I should verify the page URL', async function (this: CustomWorld) {
  const currentUrl = await contact_page.getCurrentUrl();
  expect(currentUrl).toContain('/contact/');
});

Then('I should verify the page title', async function (this: CustomWorld) {
  const title = await contact_page.getPageTitle();
  this.setData('pageTitle', title);
  expect(title).toBe('Contact | Blankfactor');
});

Then('I should print the title text', async function (this: CustomWorld) {
  console.log('PAGE TITLE:');
  await contact_page.printHighlight(this.getData('pageTitle'));
});
