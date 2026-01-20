Feature: Blankfactor Website Automation
  As a QA Engineer
  I want to automate navigation and interaction with the Blankfactor website
  So that I can verify key functionality and content

  Background:
    Given I navigate to "http://blankfactor.com"
    And I hover to Industries section
    And I open the "Retirement and Wealth" section
    And I scroll down to the "Powering innovation in retirement services" section


  Scenario: Navigate through Blankfactor website and verify AI tile
    Then I should be able to copy text from tile "AI & Machine learning" by hovering
    And I should validate the copied text contains the tile description


  Scenario: Navigate through Blankfactor website and verify contact information
    When I scroll to the bottom of the page
    And I click on the "Let's get started" button
    Then I should verify the page URL
    And I should verify the page title
    And I should print the title text
