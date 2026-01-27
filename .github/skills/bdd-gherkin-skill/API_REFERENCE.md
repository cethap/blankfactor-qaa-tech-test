# Gherkin Syntax - Complete Reference

Complete reference for Gherkin syntax used with Cucumber.

## Table of Contents

- [Keywords](#keywords)
- [Feature](#feature)
- [Rule](#rule)
- [Scenario](#scenario)
- [Scenario Outline](#scenario-outline)
- [Background](#background)
- [Steps](#steps)
- [Data Tables](#data-tables)
- [Doc Strings](#doc-strings)
- [Tags](#tags)
- [Comments](#comments)
- [Cucumber Expressions](#cucumber-expressions)
- [Step Definition API](#step-definition-api)
- [Hooks API](#hooks-api)
- [DataTable API](#datatable-api)

---

## Keywords

Gherkin uses keywords to structure feature files:

| Keyword | Purpose | Aliases |
|---------|---------|---------|
| `Feature` | Describes the feature | `Business Need`, `Ability` |
| `Rule` | Groups scenarios by business rule | - |
| `Background` | Shared setup for all scenarios | - |
| `Scenario` | Individual test case | `Example` |
| `Scenario Outline` | Parameterized scenario | `Scenario Template` |
| `Examples` | Data for Scenario Outline | `Scenarios` |
| `Given` | Precondition/context | `*` |
| `When` | Action/event | `*` |
| `Then` | Expected outcome | `*` |
| `And` | Continues previous step type | `*` |
| `But` | Negative continuation | `*` |

---

## Feature

The top-level container for scenarios.

### Syntax

```gherkin
Feature: Title of the feature
  Optional free-form description.
  Can span multiple lines.
  Ends at the first keyword.
```

### With User Story Format

```gherkin
Feature: Shopping Cart
  As a customer
  I want to add items to my cart
  So that I can purchase them later
```

### With Acceptance Criteria

```gherkin
Feature: User Registration

  Users should be able to create accounts with
  valid email addresses and secure passwords.

  Acceptance Criteria:
  - Email must be unique
  - Password must be 8+ characters
  - Confirmation email sent on success
```

---

## Rule

Groups related scenarios under a business rule (Cucumber 6+).

### Syntax

```gherkin
Feature: Discount System

  Rule: Loyal customers get 10% discount

    Scenario: Customer with 5+ orders gets discount
      Given a customer with 5 previous orders
      When they make a purchase
      Then they receive 10% discount

    Scenario: New customer pays full price
      Given a customer with 0 previous orders
      When they make a purchase
      Then they pay full price

  Rule: Orders over $100 get free shipping

    Scenario: Large order gets free shipping
      Given an order totaling $150
      Then shipping should be free
```

### Rules with Background

```gherkin
Feature: Account Security

  Rule: Failed logins trigger lockout

    Background:
      Given the lockout threshold is 3 attempts

    Scenario: Account locked after 3 failures
      Given I have failed login 2 times
      When I fail login again
      Then my account should be locked

    Scenario: Successful login resets counter
      Given I have failed login 2 times
      When I login successfully
      Then my failure count should be 0
```

---

## Scenario

A single test case with Given-When-Then steps.

### Basic Syntax

```gherkin
Scenario: Descriptive title
  Given precondition
  When action
  Then outcome
```

### Complete Example

```gherkin
Scenario: Customer applies valid coupon code
  Given I am logged in as a customer
  And I have items in my cart totaling $100
  When I apply coupon code "SAVE20"
  Then the discount should be $20
  And the total should be $80
  But the coupon should not be reusable
```

### Using And/But

```gherkin
Scenario: Complete checkout process
  Given I have items in my cart
  And I am on the checkout page
  When I enter shipping information
  And I select payment method
  And I confirm the order
  Then I should see order confirmation
  And I should receive confirmation email
  But my cart should be empty
```

---

## Scenario Outline

Parameterized scenario that runs multiple times with different data.

### Basic Syntax

```gherkin
Scenario Outline: Title with <parameter>
  Given condition with <value1>
  When action with <value2>
  Then result is <expected>

  Examples:
    | value1 | value2 | expected |
    | a      | b      | c        |
    | x      | y      | z        |
```

### Complete Example

```gherkin
Scenario Outline: Password validation
  When I enter password "<password>"
  Then I should see "<message>"
  And the password strength should be "<strength>"

  Examples:
    | password      | message                    | strength |
    | abc           | Password too short         | weak     |
    | abcdefgh      | Password needs numbers     | weak     |
    | abcd1234      | Password needs symbols     | medium   |
    | Abcd1234!     | Password accepted          | strong   |
```

### Named Example Tables

```gherkin
Scenario Outline: User permissions
  Given I am logged in as "<role>"
  When I try to "<action>"
  Then the result should be "<result>"

  @admin-scenarios
  Examples: Admin Permissions
    | role  | action        | result  |
    | admin | delete users  | allowed |
    | admin | view reports  | allowed |
    | admin | edit settings | allowed |

  @user-scenarios
  Examples: Standard User Permissions
    | role | action        | result |
    | user | delete users  | denied |
    | user | view reports  | allowed|
    | user | edit settings | denied |

  @guest-scenarios
  Examples: Guest Permissions
    | role  | action       | result |
    | guest | delete users | denied |
    | guest | view reports | denied |
```

### Scenario Outline with Data Tables

```gherkin
Scenario Outline: Create user with role
  When I create a user with:
    | name   | <name>  |
    | email  | <email> |
    | role   | <role>  |
  Then the user should have "<permissions>"

  Examples:
    | name  | email           | role  | permissions     |
    | John  | john@test.com   | admin | read,write,delete |
    | Jane  | jane@test.com   | user  | read,write      |
```

---

## Background

Shared setup that runs before each scenario.

### Syntax

```gherkin
Feature: Feature with background

  Background:
    Given common setup step 1
    And common setup step 2

  Scenario: First scenario
    When I do something
    Then result

  Scenario: Second scenario
    When I do something else
    Then other result
```

### Background with Data Table

```gherkin
Feature: E-commerce

  Background:
    Given the following products exist:
      | name    | price | stock |
      | Widget  | 10.00 | 100   |
      | Gadget  | 25.00 | 50    |
    And I am logged in as a customer

  Scenario: Add product to cart
    When I add "Widget" to my cart
    Then my cart should have 1 item
```

### Background per Rule

```gherkin
Feature: Order Management

  Rule: Orders can be cancelled within 24 hours

    Background:
      Given I have placed an order

    Scenario: Cancel recent order
      Given the order was placed 1 hour ago
      When I cancel the order
      Then the order should be cancelled

  Rule: Shipped orders cannot be cancelled

    Background:
      Given I have placed an order
      And the order has shipped

    Scenario: Cannot cancel shipped order
      When I try to cancel the order
      Then I should see "Cannot cancel shipped orders"
```

---

## Steps

### Step Keywords

```gherkin
Given   # Precondition, initial context
When    # Action, trigger
Then    # Expected outcome, assertion
And     # Continues previous keyword
But     # Negative continuation
*       # Generic step (avoid in features)
```

### Step Patterns

```gherkin
# Exact match
Given I am on the home page

# With string parameter
Given I am logged in as "admin"

# With numeric parameter
Given I have 5 items in my cart

# With data table
Given the following users exist:
  | name | email |
  | John | j@t.com |

# With doc string
Given the API returns:
  """json
  {"status": "ok"}
  """
```

---

## Data Tables

### Formats

```gherkin
# Key-Value (vertical)
| key   | value  |
| name  | John   |
| email | j@test |

# Records (horizontal)
| name | email   | role  |
| John | j@test  | admin |
| Jane | ja@test | user  |

# Simple list (single column)
| item    |
| Apple   |
| Orange  |

# Raw data (no headers)
| a | b | c |
| 1 | 2 | 3 |
```

### Escaping Special Characters

```gherkin
# Pipe character: use \|
| text           |
| Price \| Total |

# Backslash: use \\
| path            |
| C:\\Users\\John |

# Newline: use \n
| message          |
| Line 1\nLine 2   |
```

---

## Doc Strings

### Basic Syntax

```gherkin
Given some context:
  """
  Multi-line
  text content
  goes here
  """
```

### With Content Type

```gherkin
# JSON
Given the request body:
  """json
  {
    "name": "John",
    "age": 30
  }
  """

# XML
Given the XML response:
  """xml
  <user>
    <name>John</name>
  </user>
  """

# Markdown
Given the documentation:
  """markdown
  # Title

  Some **bold** text.
  """
```

### Alternative Delimiter

```gherkin
# Using backticks (Cucumber 6+)
Given the code:
  ```javascript
  function hello() {
    console.log("Hello");
  }
  ```
```

---

## Tags

### Syntax

```gherkin
@tag1 @tag2
Feature: Tagged feature

  @tag3
  Rule: Tagged rule

    @tag4 @tag5
    Scenario: Tagged scenario
```

### Tag Inheritance

```
@feature-tag
Feature: ...

  @rule-tag
  Rule: ...

    @scenario-tag
    Scenario: ...
    # This scenario has: @feature-tag, @rule-tag, @scenario-tag
```

### Tag Expressions

```bash
# AND
--tags "@smoke and @login"

# OR
--tags "@smoke or @regression"

# NOT
--tags "not @wip"

# Complex
--tags "(@smoke or @critical) and not @flaky"

# Parentheses
--tags "@ui and (@login or @signup)"
```

---

## Comments

```gherkin
# This is a comment
Feature: Example

  # Comment before scenario
  Scenario: Test
    # Comment before step
    Given something
```

**Note:** Comments cannot appear within data tables or doc strings.

---

## Cucumber Expressions

### Built-in Parameter Types

| Expression | Matches | Example |
|------------|---------|---------|
| `{int}` | Integer | `42`, `-5` |
| `{float}` | Decimal | `3.14`, `-2.5` |
| `{word}` | Single word | `hello` |
| `{string}` | Quoted string | `"text"` or `'text'` |
| `{}` or `{*}` | Any text | anything |

### Examples

```typescript
Given('I have {int} cucumbers', (count: number) => { });
Given('I have {float} dollars', (amount: number) => { });
Given('I am a {word} user', (role: string) => { });
Given('the title is {string}', (title: string) => { });
Given('I see {}', (anything: string) => { });
```

### Custom Parameter Types

```typescript
import { defineParameterType } from '@cucumber/cucumber';

// Boolean
defineParameterType({
  name: 'boolean',
  regexp: /true|false/,
  transformer: (s) => s === 'true'
});

// Enum
defineParameterType({
  name: 'color',
  regexp: /red|green|blue/,
  transformer: (s) => s
});

// Date
defineParameterType({
  name: 'date',
  regexp: /\d{4}-\d{2}-\d{2}/,
  transformer: (s) => new Date(s)
});

// Usage
Then('the flag is {boolean}', (flag: boolean) => { });
When('I select {color}', (color: string) => { });
Given('the date is {date}', (date: Date) => { });
```

### Optional Text

```typescript
// Matches: "I have a cat" or "I have a dog"
Given('I have a cat/dog', () => { });

// Matches: "I have 1 cucumber" or "I have 5 cucumbers"
Given('I have {int} cucumber(s)', (count: number) => { });

// Matches: "file" or "files"
Given('I see {int} file(s)', (count: number) => { });
```

---

## Step Definition API

### Basic Steps

```typescript
import { Given, When, Then } from '@cucumber/cucumber';

Given('pattern', async function () { });
When('pattern', async function () { });
Then('pattern', async function () { });
```

### With World Context

```typescript
import { CustomWorld } from '../support/world';

Given('I am logged in', async function (this: CustomWorld) {
  await this.page.goto('/login');
  // this.page, this.context, etc. available
});
```

### With Data Table

```typescript
import { DataTable } from '@cucumber/cucumber';

Given('the users:', async function (dataTable: DataTable) {
  const users = dataTable.hashes();
  // users = [{ name: 'John', email: 'j@t.com' }, ...]
});
```

### With Doc String

```typescript
Given('the JSON:', async function (docString: string) {
  const data = JSON.parse(docString);
});
```

---

## Hooks API

### Before/After

```typescript
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';

BeforeAll(async function () {
  // Run once before all scenarios
});

Before(async function () {
  // Run before each scenario
});

After(async function () {
  // Run after each scenario
});

AfterAll(async function () {
  // Run once after all scenarios
});
```

### With Tags

```typescript
Before({ tags: '@api' }, async function () {
  // Only for @api scenarios
});

After({ tags: 'not @no-cleanup' }, async function () {
  // Skip for @no-cleanup scenarios
});
```

### With Named Hook

```typescript
Before({ name: 'Setup browser' }, async function () {
  // Named for reporting
});
```

### Step Hooks

```typescript
import { BeforeStep, AfterStep } from '@cucumber/cucumber';

BeforeStep(async function () {
  // Run before each step
});

AfterStep(async function ({ result }) {
  if (result.status === 'FAILED') {
    // Take screenshot on failure
  }
});
```

### Hook Order

```typescript
Before({ order: 1 }, async function () { /* runs first */ });
Before({ order: 2 }, async function () { /* runs second */ });
```

---

## DataTable API

### Methods

```typescript
import { DataTable } from '@cucumber/cucumber';

function handleTable(dataTable: DataTable) {
  // Raw 2D array
  dataTable.raw();
  // [['name', 'email'], ['John', 'j@t.com']]

  // Array of objects (first row as headers)
  dataTable.hashes();
  // [{ name: 'John', email: 'j@t.com' }]

  // Object from 2-column table
  dataTable.rowsHash();
  // { name: 'John', email: 'j@t.com' }

  // Array of arrays (no headers)
  dataTable.rows();
  // [['John', 'j@t.com'], ['Jane', 'ja@t.com']]

  // Transpose rows/columns
  dataTable.transpose();
}
```

### Type Transformations

```typescript
Given('the products:', async function (dataTable: DataTable) {
  const products = dataTable.hashes().map(row => ({
    name: row.name,
    price: parseFloat(row.price),
    inStock: row.inStock === 'true',
    quantity: parseInt(row.quantity, 10)
  }));
});
```

---

## World Class

### Custom World

```typescript
import { World, setWorldConstructor } from '@cucumber/cucumber';

class CustomWorld extends World {
  page: Page;
  context: BrowserContext;
  data: Map<string, any> = new Map();

  setData(key: string, value: any) {
    this.data.set(key, value);
  }

  getData<T>(key: string): T | undefined {
    return this.data.get(key) as T;
  }
}

setWorldConstructor(CustomWorld);
```

### Accessing World in Steps

```typescript
Given('I save {string} as {string}', function (this: CustomWorld, value: string, key: string) {
  this.setData(key, value);
});

Then('the saved {string} should be {string}', function (this: CustomWorld, key: string, expected: string) {
  const actual = this.getData<string>(key);
  expect(actual).toBe(expected);
});
```
