import { Given, When, Then, BeforeStep } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { HomePage } from '../pages/homepage.page';
import { RetirementPage } from '../pages/retirement.page';
import { ContactPage } from '../pages/contact.page';

let hpPage: HomePage;
let rpPage: RetirementPage;
let ctPage: ContactPage;

BeforeStep(async function (this: CustomWorld) {
  [hpPage, rpPage, ctPage] = await Promise.all([
    this.getPage(HomePage),
    this.getPage(RetirementPage),
    this.getPage(ContactPage),
  ]);
});

Given('I navigate to {string}', async function (this: CustomWorld, url: string) {
  await hpPage.goto(url);
});

When('I hover to Industries section', async function (this: CustomWorld) {
  await hpPage.hoverOnIndustries();
});

When('I open the {string} section', async function (this: CustomWorld, sectionName: string) {
  await hpPage.openSection(sectionName);
});

When('I scroll down to the {string} section', async function (this: CustomWorld, sectionHeading: string) {
  await rpPage.scrollToSection(sectionHeading);
});

Then('I should be able to copy text from tile {string} by hovering', async function (this: CustomWorld, tileName: string) {
  const copiedText = await rpPage.hoverAndCopyTextFromTile(tileName);
  this.setData('copiedText', copiedText);
});

Then('I should validate the copied text contains the tile description', async function (this: CustomWorld) {
  const copiedText = this.getData('copiedText');
  expect(copiedText).toContain('Automate your operations and get to market quickly and securely. Leverage predictive data analytics using machine learning to build reliable, yet forward-thinking financial solutions.');
});


When('I scroll to the bottom of the page', async function (this: CustomWorld) {
  await rpPage.scrollToBottom();
});

When('I click on the {string} button', async function (this: CustomWorld, buttonText: string) {
  await rpPage.clickButton(buttonText);
});

Then('I should verify the page URL', async function (this: CustomWorld) {
  const currentUrl = await ctPage.getCurrentUrl();
  expect(currentUrl).toContain('https://blankfactor.com/contact/');
});

Then('I should verify the page title', async function (this: CustomWorld) {
  const title = await ctPage.getPageTitle();
  this.setData('pageTitle', title);
  expect(title).toBe('Contact | Blankfactor');
});

Then('I should print the title text', async function (this: CustomWorld) {
  console.log('PAGE TITLE:');
  await ctPage.printHighlight(this.getData('pageTitle'));
});
