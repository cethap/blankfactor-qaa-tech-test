import { Given, When, Then, BeforeStep } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { BlankfactorPage } from '../pages/blankfactor.page';


let bfPage: BlankfactorPage;

BeforeStep(async function (this:CustomWorld) {
  bfPage = await this.getPage(BlankfactorPage);
});

Given('I navigate to {string}', async function (this: CustomWorld, url: string) {
  await bfPage.goto(url);
});

When('I hover to Industries section', async function (this: CustomWorld) {
  await bfPage.hoverOnIndustries();
});

When('I open the {string} section', async function (this: CustomWorld, sectionName: string) {
  await bfPage.openSection(sectionName);
});

When('I scroll down to the {string} section', async function (this: CustomWorld, sectionHeading: string) {
  await bfPage.scrollToSection(sectionHeading);
});

Then('I should be able to copy text from tile {string} by hovering', async function (this: CustomWorld, tileName: string) {
  const copiedText = await bfPage.hoverAndCopyTextFromTile(tileName);
  this.setData('copiedText', copiedText);
});

When('I scroll to the bottom of the page', async function (this: CustomWorld) {
  await bfPage.scrollToBottom();
});

When('I click on the {string} button', async function (this: CustomWorld, buttonText: string) {
  await bfPage.clickButton(buttonText);
});

Then('I should verify the page URL', async function (this: CustomWorld) {
  const currentUrl = await bfPage.getCurrentUrl();
  expect(currentUrl).toContain('https://blankfactor.com/contact/');
});

Then('I should verify the page title', async function (this: CustomWorld) {
  const title = await bfPage.getPageTitle();
  this.setData('pageTitle', title);
  expect(title).toBe('Contact | Blankfactor');
});

Then('I should print the title text', async function (this: CustomWorld) {
  console.log('PAGE TITLE:');
  await bfPage.printHighlight(this.getData('pageTitle'));
});
