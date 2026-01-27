---
name: bdd-gherkin
description: BDD best practices with Gherkin syntax. Write effective feature files using Scenario Outlines, Rules, Data Tables, Doc Strings, tags, and backgrounds. Use for writing clear, maintainable BDD scenarios, organizing features, and following Cucumber best practices.
---

# BDD Gherkin Best Practices Skill

This skill provides guidance on writing effective BDD tests using Gherkin syntax with Cucumber.

## Core Principles

### 1. Write for Readability
- Scenarios should be understandable by non-technical stakeholders
- Use business language, not technical implementation details
- Each scenario tells a story

### 2. One Behavior Per Scenario
- Test one thing at a time
- Avoid long scenarios with multiple assertions
- If you need "And Then... And Then...", consider splitting

### 3. Keep Scenarios Independent
- Each scenario should run in isolation
- Don't rely on other scenarios running first
- Use Background for common setup

---

## Feature File Structure

```gherkin
@feature-tag
Feature: Feature Title
  Optional description that explains
  the business value of this feature.

  Background:
    Given common preconditions for all scenarios

  Rule: Business rule grouping related scenarios

    @scenario-tag
    Scenario: Individual test case
      Given initial context
      When action occurs
      Then expected outcome
```

---

## Scenario Patterns

### Basic Scenario

```gherkin
Scenario: User logs in with valid credentials
  Given I am on the login page
  When I enter valid credentials
  And I click the login button
  Then I should see the dashboard
  And I should see a welcome message
```

### Scenario Outline (Parameterized Tests)

Use when testing the same behavior with different data:

```gherkin
Scenario Outline: Login validation with various credentials
  Given I am on the login page
  When I enter "<username>" as username
  And I enter "<password>" as password
  And I click login
  Then I should see "<message>"

  Examples:
    | username      | password    | message              |
    | valid@test.com| correct123  | Welcome back!        |
    | valid@test.com| wrong       | Invalid password     |
    | invalid       | any         | User not found       |
    | ""            | ""          | Fields required      |
```

### Scenario Outline with Multiple Example Tables

```gherkin
Scenario Outline: Shipping costs by region
  Given I have items totaling $<amount>
  When I select "<region>" shipping
  Then the shipping cost should be $<shipping>

  @domestic
  Examples: Domestic Shipping
    | amount | region     | shipping |
    | 50     | Standard   | 5.99     |
    | 50     | Express    | 12.99    |
    | 100    | Standard   | 0.00     |

  @international
  Examples: International Shipping
    | amount | region     | shipping |
    | 50     | Europe     | 25.00    |
    | 50     | Asia       | 35.00    |
    | 100    | Europe     | 20.00    |
```

---

## Rules (Cucumber 6+)

Rules group related scenarios under a business rule:

```gherkin
Feature: Account Withdrawal

  Rule: Withdrawals require sufficient balance

    Scenario: Successful withdrawal with sufficient funds
      Given my account balance is $100
      When I withdraw $50
      Then my account balance should be $50

    Scenario: Rejected withdrawal with insufficient funds
      Given my account balance is $30
      When I try to withdraw $50
      Then I should see "Insufficient funds"
      And my account balance should be $30

  Rule: Daily withdrawal limits apply

    Scenario: Withdrawal within daily limit
      Given my daily limit is $500
      And I have withdrawn $200 today
      When I withdraw $200
      Then the withdrawal should succeed

    Scenario: Withdrawal exceeds daily limit
      Given my daily limit is $500
      And I have withdrawn $400 today
      When I try to withdraw $200
      Then I should see "Daily limit exceeded"
```

---

## Data Tables

### Vertical Data Table (Key-Value)

```gherkin
Scenario: Create user profile
  When I fill in the registration form:
    | field     | value              |
    | name      | John Doe           |
    | email     | john@example.com   |
    | phone     | 555-1234           |
    | country   | United States      |
  Then the profile should be created
```

**Step Implementation:**
```typescript
When('I fill in the registration form:', async function (dataTable: DataTable) {
  const rows = dataTable.hashes(); // [{field: 'name', value: 'John Doe'}, ...]
  for (const row of rows) {
    await this.page.getByLabel(row.field).fill(row.value);
  }
});
```

### Horizontal Data Table (Multiple Records)

```gherkin
Scenario: Add multiple items to cart
  Given I have the following items in my cart:
    | product     | quantity | price  |
    | Widget A    | 2        | 10.00  |
    | Widget B    | 1        | 25.00  |
    | Widget C    | 3        | 5.00   |
  Then the cart total should be $60.00
```

**Step Implementation:**
```typescript
Given('I have the following items in my cart:', async function (dataTable: DataTable) {
  const items = dataTable.hashes();
  // items = [
  //   { product: 'Widget A', quantity: '2', price: '10.00' },
  //   { product: 'Widget B', quantity: '1', price: '25.00' },
  //   { product: 'Widget C', quantity: '3', price: '5.00' }
  // ]
  for (const item of items) {
    await addToCart(item.product, parseInt(item.quantity));
  }
});
```

### Raw Data Table (Simple Lists)

```gherkin
Scenario: Check required fields
  Then the following fields should be required:
    | Email    |
    | Password |
    | Name     |
```

**Step Implementation:**
```typescript
Then('the following fields should be required:', async function (dataTable: DataTable) {
  const fields = dataTable.raw().flat(); // ['Email', 'Password', 'Name']
  for (const field of fields) {
    await expect(this.page.getByLabel(field)).toHaveAttribute('required');
  }
});
```

### Rows Hash (Two-Column Key-Value)

```gherkin
Scenario: Verify order summary
  Then I should see the order summary:
    | Subtotal  | $45.00 |
    | Tax       | $3.60  |
    | Shipping  | $5.99  |
    | Total     | $54.59 |
```

**Step Implementation:**
```typescript
Then('I should see the order summary:', async function (dataTable: DataTable) {
  const summary = dataTable.rowsHash();
  // summary = { Subtotal: '$45.00', Tax: '$3.60', Shipping: '$5.99', Total: '$54.59' }
  for (const [label, value] of Object.entries(summary)) {
    await expect(this.page.getByText(`${label}: ${value}`)).toBeVisible();
  }
});
```

---

## Doc Strings

Use for multi-line text content:

### JSON Payload

```gherkin
Scenario: Create user via API
  When I send a POST request to "/api/users" with:
    """json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "permissions": ["read", "write", "delete"]
    }
    """
  Then the response status should be 201
```

**Step Implementation:**
```typescript
When('I send a POST request to {string} with:', async function (endpoint: string, docString: string) {
  const payload = JSON.parse(docString);
  const response = await this.request.post(endpoint, { data: payload });
  this.setData('response', response);
});
```

### Long Text Content

```gherkin
Scenario: Submit feedback form
  When I enter the following feedback:
    """
    I really enjoyed using your product!

    The interface is intuitive and the
    performance is excellent.

    Keep up the great work!
    """
  Then the feedback should be submitted successfully
```

### Code or Markup

```gherkin
Scenario: Validate HTML output
  Then the page should contain:
    """html
    <div class="welcome">
      <h1>Welcome, User!</h1>
      <p>You have 3 new messages.</p>
    </div>
    """
```

### Email Template

```gherkin
Scenario: Send welcome email
  When a new user registers
  Then they should receive an email:
    """
    Subject: Welcome to Our Platform!

    Dear {name},

    Thank you for joining us. Your account is now active.

    Best regards,
    The Team
    """
```

---

## Background

Use for common preconditions shared by all scenarios:

```gherkin
Feature: Shopping Cart

  Background:
    Given I am logged in as a customer
    And I have an empty cart
    And the following products exist:
      | name     | price  | stock |
      | Laptop   | 999.00 | 10    |
      | Mouse    | 29.99  | 50    |
      | Keyboard | 79.99  | 25    |

  Scenario: Add single item to cart
    When I add "Laptop" to my cart
    Then my cart should contain 1 item
    And the cart total should be $999.00

  Scenario: Add multiple items to cart
    When I add "Mouse" to my cart
    And I add "Keyboard" to my cart
    Then my cart should contain 2 items
```

### Background Best Practices

**DO:**
- Keep Background short (3-5 steps max)
- Use for true preconditions shared by ALL scenarios
- Make it invisible - scenarios should read naturally without it

**DON'T:**
- Include assertions in Background
- Put scenario-specific setup in Background
- Make Background longer than scenarios

---

## Tags

### Tag Placement

```gherkin
@feature-level
Feature: User Management

  @rule-level
  Rule: Admins can manage users

    @scenario-level @smoke
    Scenario: Admin creates new user
      ...

    @scenario-level @regression
    Scenario: Admin deletes user
      ...
```

### Common Tag Patterns

```gherkin
# Test Type Tags
@smoke           # Quick sanity tests
@regression      # Full regression suite
@e2e             # End-to-end tests
@integration     # Integration tests

# Priority Tags
@critical        # Must-pass tests
@p1 @p2 @p3      # Priority levels

# Environment Tags
@staging-only    # Only run on staging
@prod-safe       # Safe to run on production

# Work Status Tags
@wip             # Work in progress (exclude from CI)
@skip            # Temporarily skip
@flaky           # Known flaky test

# Feature Tags
@login @auth     # Feature area
@payments        # Domain area
@api @ui         # Test layer
```

### Running with Tags

```bash
# Run smoke tests
npm test -- --tags "@smoke"

# Run critical tests excluding WIP
npm test -- --tags "@critical and not @wip"

# Run login OR registration tests
npm test -- --tags "@login or @registration"

# Complex expressions
npm test -- --tags "(@smoke or @critical) and not @flaky"
```

---

## Hooks with Tags

```typescript
import { Before, After } from '@cucumber/cucumber';

// Run only for @api tagged scenarios
Before({ tags: '@api' }, async function () {
  this.apiClient = createApiClient();
});

// Run for scenarios NOT tagged @no-cleanup
After({ tags: 'not @no-cleanup' }, async function () {
  await cleanupTestData();
});

// Multiple tag conditions
Before({ tags: '@smoke and @login' }, async function () {
  await setupQuickLogin();
});
```

---

## Writing Effective Steps

### Good Step Patterns

```gherkin
# Declarative (GOOD) - What, not How
Given I am logged in as an admin
When I create a new product
Then the product should appear in the catalog

# Imperative (AVOID) - Too detailed
Given I go to the login page
And I enter "admin@test.com" in the email field
And I enter "password123" in the password field
And I click the login button
And I wait for the dashboard to load
When I click the "Products" menu
And I click "Add New Product"
...
```

### Parameterized Steps

```gherkin
# String parameters
Given I am logged in as "admin"
When I search for "laptop"

# Number parameters
Given I have 5 items in my cart
When I wait for 3 seconds

# Optional parameters (regex)
Then the error message should (not )?be visible

# Choice parameters
When I sort by "price|name|date"
```

### Step Definition with Cucumber Expressions

```typescript
// {string} - quoted string
Given('I am logged in as {string}', async function (role: string) { });

// {int} - integer
Given('I have {int} items', async function (count: number) { });

// {float} - decimal
When('I enter {float} as the amount', async function (amount: number) { });

// {word} - single word without quotes
When('I click the {word} button', async function (button: string) { });

// Custom parameter type
import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
  name: 'boolean',
  regexp: /true|false/,
  transformer: s => s === 'true'
});

Then('the checkbox should be {boolean}', async function (checked: boolean) { });
```

---

## Anti-Patterns to Avoid

### 1. Scenario as Script

```gherkin
# BAD - Too procedural
Scenario: Login
  Given I open browser
  And I navigate to "http://example.com"
  And I wait for page to load
  And I find element by id "email"
  And I type "user@test.com"
  ...

# GOOD - Declarative
Scenario: Successful login
  Given I am on the login page
  When I login with valid credentials
  Then I should see the dashboard
```

### 2. Incidental Details

```gherkin
# BAD - Includes implementation details
Scenario: Add to cart
  Given I am on page "/products/widget-x-123"
  When I click button with class "btn-add-cart"
  Then element "#cart-count" should show "1"

# GOOD - Business language
Scenario: Add product to cart
  Given I am viewing the Widget X product
  When I add it to my cart
  Then my cart should show 1 item
```

### 3. Conjunctive Steps (And-And-And)

```gherkin
# BAD - Step does too much
When I login and navigate to products and add item and checkout

# GOOD - Separate steps
When I login
And I navigate to products
And I add an item to cart
And I proceed to checkout
```

### 4. Testing Multiple Things

```gherkin
# BAD - Multiple behaviors
Scenario: User management
  When I create a user
  Then the user should exist
  When I update the user
  Then the changes should be saved
  When I delete the user
  Then the user should not exist

# GOOD - One behavior per scenario
Scenario: Create user
  When I create a user
  Then the user should exist

Scenario: Update user
  Given a user exists
  When I update the user
  Then the changes should be saved
```

---

## File Organization

```
features/
├── authentication/
│   ├── login.feature
│   ├── logout.feature
│   └── password-reset.feature
├── shopping/
│   ├── cart.feature
│   ├── checkout.feature
│   └── products.feature
├── user-management/
│   ├── profile.feature
│   └── settings.feature
└── support/
    └── common.feature  # Shared scenarios (if any)
```

### Feature File Naming

- Use lowercase with hyphens: `user-login.feature`
- Name after the feature, not the page: `authentication.feature` not `login-page.feature`
- One feature per file (usually)

---

## Quick Reference

| Element | Purpose | Example |
|---------|---------|---------|
| Feature | Group related scenarios | `Feature: User Login` |
| Rule | Group scenarios by business rule | `Rule: Passwords must be 8+ chars` |
| Background | Shared preconditions | `Background: Given logged in` |
| Scenario | Single test case | `Scenario: Valid login` |
| Scenario Outline | Parameterized test | With `Examples:` table |
| Data Table | Structured data | Rows and columns |
| Doc String | Multi-line text | Triple quotes `"""` |
| Tags | Categorize/filter | `@smoke @login` |

---

## Checklist for Feature Files

- [ ] Feature has clear business description
- [ ] Scenarios are independent
- [ ] Scenarios test one behavior each
- [ ] Steps are declarative (what, not how)
- [ ] No implementation details in Gherkin
- [ ] Background is short and necessary
- [ ] Tags are meaningful and consistent
- [ ] Scenario Outlines have meaningful example names
- [ ] Data tables are readable and aligned
