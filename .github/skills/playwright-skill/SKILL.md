---
name: playwright
description: Playwright best practices for browser automation. Locator strategies, waits, assertions, debugging, and anti-patterns. Use for writing reliable, maintainable Playwright code.
---

# Playwright Best Practices Skill

This skill covers Playwright-specific best practices for reliable browser automation.

---

## Locator Strategies (Priority Order)

### 1. Role-Based Locators (BEST)

Most resilient to DOM changes. Use accessibility roles.

```typescript
// Buttons
page.getByRole('button', { name: 'Submit' })
page.getByRole('button', { name: /submit/i })  // Case-insensitive

// Links
page.getByRole('link', { name: 'Home' })
page.getByRole('navigation').getByRole('link', { name: 'About' })

// Headings
page.getByRole('heading', { level: 1 })
page.getByRole('heading', { name: 'Welcome' })

// Form elements
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'Accept terms' })
page.getByRole('combobox', { name: 'Country' })
page.getByRole('radio', { name: 'Option A' })

// Tables
page.getByRole('table')
page.getByRole('row', { name: 'John Doe' })
page.getByRole('cell', { name: 'Active' })

// Landmarks
page.getByRole('main')
page.getByRole('navigation')
page.getByRole('banner')
page.getByRole('contentinfo')
```

### 2. Label-Based Locators (GOOD)

For form inputs with proper labels.

```typescript
page.getByLabel('Email address')
page.getByLabel('Password')
page.getByLabel(/email/i)  // Partial match
```

### 3. Placeholder-Based (GOOD)

When labels aren't available.

```typescript
page.getByPlaceholder('Enter your email')
page.getByPlaceholder('Search...')
```

### 4. Text-Based (GOOD)

For unique visible text.

```typescript
page.getByText('Welcome back')
page.getByText(/welcome/i)        // Case-insensitive
page.getByText('Submit', { exact: true })  // Exact match
```

### 5. Test ID (OK)

When semantic locators aren't available.

```typescript
page.getByTestId('submit-button')
page.getByTestId('user-profile')
```

### 6. CSS Selectors (AVOID)

Fragile, breaks with style changes.

```typescript
// AVOID these
page.locator('.btn-primary')
page.locator('#submit')
page.locator('div.container > button')
```

---

## Locator Chaining & Filtering

### Chaining Locators

```typescript
// Within navigation, find the Home link
page.getByRole('navigation').getByRole('link', { name: 'Home' })

// Within a specific section
page.locator('section.products').getByRole('button', { name: 'Buy' })

// Within a list item
page.getByRole('listitem').filter({ hasText: 'Premium' }).getByRole('button')
```

### Filtering Locators

```typescript
// Filter by text
page.getByRole('listitem').filter({ hasText: 'Active' })

// Filter by NOT having text
page.getByRole('listitem').filter({ hasNotText: 'Disabled' })

// Filter by containing another locator
page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Admin' }) })

// Combine filters
page.getByRole('row')
  .filter({ hasText: 'John' })
  .filter({ has: page.getByRole('button', { name: 'Edit' }) })
```

### Nth Element

```typescript
page.getByRole('button').first()
page.getByRole('button').last()
page.getByRole('button').nth(2)  // Third button (0-indexed)
```

---

## Waiting Strategies

### Auto-Waiting (Built-in)

Playwright auto-waits for elements to be actionable:

```typescript
// These auto-wait for element to be visible, enabled, stable
await page.click('button')
await page.fill('input', 'text')
await page.check('input[type="checkbox"]')
```

### Explicit Waits

```typescript
// Wait for element state
await page.getByRole('button').waitFor({ state: 'visible' })
await page.getByRole('spinner').waitFor({ state: 'hidden' })
await page.getByRole('button').waitFor({ state: 'attached' })
await page.getByRole('dialog').waitFor({ state: 'detached' })

// Wait with timeout
await locator.waitFor({ state: 'visible', timeout: 10000 })
```

### Wait for Load State

```typescript
// Wait for DOM content loaded
await page.waitForLoadState('domcontentloaded')

// Wait for all resources loaded
await page.waitForLoadState('load')

// Wait for network idle (AVOID in most cases)
// await page.waitForLoadState('networkidle')  // Can be flaky
```

### Wait for URL

```typescript
await page.waitForURL('**/dashboard')
await page.waitForURL(/\/dashboard$/)
await page.waitForURL(url => url.pathname === '/dashboard')
```

### Wait for Response

```typescript
// Wait for specific API response
const responsePromise = page.waitForResponse('**/api/users')
await page.click('button')
const response = await responsePromise

// Wait for response with condition
const response = await page.waitForResponse(
  response => response.url().includes('/api/') && response.status() === 200
)
```

### Anti-Pattern: Fixed Timeouts

```typescript
// NEVER do this
await page.waitForTimeout(5000)  // Bad! Flaky and slow

// Instead, wait for specific condition
await page.getByText('Loaded').waitFor()
```

---

## Assertions

### Element Assertions

```typescript
import { expect } from '@playwright/test';

// Visibility
await expect(locator).toBeVisible()
await expect(locator).toBeHidden()
await expect(locator).not.toBeVisible()

// Enabled/Disabled
await expect(locator).toBeEnabled()
await expect(locator).toBeDisabled()

// Checked (checkbox/radio)
await expect(locator).toBeChecked()
await expect(locator).not.toBeChecked()

// Focused
await expect(locator).toBeFocused()

// Editable
await expect(locator).toBeEditable()
```

### Text Assertions

```typescript
// Exact text
await expect(locator).toHaveText('Welcome')

// Contains text
await expect(locator).toContainText('Welcome')

// Regex
await expect(locator).toHaveText(/welcome/i)

// Multiple elements
await expect(locator).toHaveText(['Item 1', 'Item 2', 'Item 3'])
```

### Attribute Assertions

```typescript
await expect(locator).toHaveAttribute('href', '/home')
await expect(locator).toHaveAttribute('href', /home/)
await expect(locator).toHaveClass(/active/)
await expect(locator).toHaveId('main-content')
```

### Value Assertions

```typescript
await expect(locator).toHaveValue('test@example.com')
await expect(locator).toBeEmpty()
```

### Count Assertions

```typescript
await expect(locator).toHaveCount(5)
await expect(locator).toHaveCount(0)  // No elements
```

### Page Assertions

```typescript
await expect(page).toHaveTitle('Dashboard')
await expect(page).toHaveTitle(/Dashboard/)
await expect(page).toHaveURL('https://example.com/dashboard')
await expect(page).toHaveURL(/dashboard/)
```

### CSS Assertions

```typescript
await expect(locator).toHaveCSS('color', 'rgb(255, 0, 0)')
await expect(locator).toHaveCSS('display', 'none')
```

### Soft Assertions

Continue test even if assertion fails:

```typescript
await expect.soft(locator).toHaveText('Expected')
await expect.soft(page).toHaveTitle('Title')
// Test continues, failures reported at end
```

---

## Actions

### Click Actions

```typescript
await locator.click()
await locator.click({ button: 'right' })      // Right-click
await locator.dblclick()                       // Double-click
await locator.click({ force: true })           // Skip actionability checks
await locator.click({ position: { x: 10, y: 10 } })  // Click at position
await locator.click({ modifiers: ['Shift'] })  // Shift+click
```

### Input Actions

```typescript
await locator.fill('text')           // Clear and type
await locator.clear()                // Clear input
await locator.type('text')           // Type character by character
await locator.type('text', { delay: 100 })  // With delay
await locator.press('Enter')         // Press key
await locator.pressSequentially('text')  // Type one char at a time
```

### Select Actions

```typescript
await locator.selectOption('value')              // By value
await locator.selectOption({ label: 'Option' })  // By label
await locator.selectOption({ index: 2 })         // By index
await locator.selectOption(['a', 'b'])           // Multiple
```

### Checkbox/Radio

```typescript
await locator.check()
await locator.uncheck()
await locator.setChecked(true)
await locator.setChecked(false)
```

### Hover

```typescript
await locator.hover()
await locator.hover({ force: true })
```

### Scroll

```typescript
await locator.scrollIntoViewIfNeeded()
await page.mouse.wheel(0, 500)  // Scroll down 500px
```

### Drag and Drop

```typescript
await page.dragAndDrop('#source', '#target')
await source.dragTo(target)
```

### File Upload

```typescript
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf')
await page.setInputFiles('input[type="file"]', ['file1.pdf', 'file2.pdf'])
await page.setInputFiles('input[type="file"]', [])  // Clear
```

---

## Debugging

### Pause Execution

```typescript
await page.pause()  // Opens Playwright Inspector
```

### Console Logs

```typescript
page.on('console', msg => console.log('Browser:', msg.text()))
page.on('pageerror', err => console.log('Error:', err.message))
```

### Screenshots

```typescript
await page.screenshot({ path: 'debug.png' })
await page.screenshot({ path: 'full.png', fullPage: true })
await locator.screenshot({ path: 'element.png' })
```

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

### Debug Mode

```bash
PWDEBUG=1 npm test
```

---

## Anti-Patterns to Avoid

### 1. Using networkidle

```typescript
// BAD - Flaky and slow
await page.goto(url, { waitUntil: 'networkidle' })

// GOOD - Wait for specific element
await page.goto(url)
await page.getByRole('heading').waitFor()
```

### 2. Fixed Timeouts

```typescript
// BAD
await page.waitForTimeout(5000)

// GOOD
await page.getByText('Loaded').waitFor()
```

### 3. CSS/XPath Selectors

```typescript
// BAD - Fragile
page.locator('.btn-submit')
page.locator('//button[@class="submit"]')

// GOOD - Semantic
page.getByRole('button', { name: 'Submit' })
```

### 4. Using page.$ or page.$$

```typescript
// BAD - Old API
const element = await page.$('button')

// GOOD - Modern API
const element = page.locator('button')
```

### 5. Checking Visibility Before Action

```typescript
// BAD - Redundant
if (await locator.isVisible()) {
  await locator.click()
}

// GOOD - Auto-waits
await locator.click()
```

### 6. Using evaluate for Simple Tasks

```typescript
// BAD
await page.evaluate(() => document.querySelector('button').click())

// GOOD
await page.getByRole('button').click()
```

---

## Performance Tips

### Parallel Locators

```typescript
// Run checks in parallel
const [title, buttonVisible] = await Promise.all([
  page.title(),
  page.getByRole('button').isVisible(),
])
```

### Reuse Locators

```typescript
// Define once, use multiple times
const submitBtn = page.getByRole('button', { name: 'Submit' })

await submitBtn.waitFor()
await submitBtn.click()
await expect(submitBtn).toBeDisabled()
```

### Use Strict Mode

```typescript
// Fail if multiple elements match
const button = page.getByRole('button', { name: 'Submit' })
await button.click()  // Fails if multiple matches

// Explicitly handle multiple
const buttons = page.getByRole('button')
await buttons.first().click()
```

---

## Quick Reference

| Task | Code |
|------|------|
| Click button | `page.getByRole('button', { name: 'X' }).click()` |
| Fill input | `page.getByLabel('Email').fill('test@test.com')` |
| Select option | `page.getByRole('combobox').selectOption('value')` |
| Check checkbox | `page.getByRole('checkbox').check()` |
| Wait visible | `locator.waitFor({ state: 'visible' })` |
| Assert text | `expect(locator).toHaveText('text')` |
| Assert URL | `expect(page).toHaveURL(/dashboard/)` |
| Screenshot | `page.screenshot({ path: 'shot.png' })` |
| Debug | `page.pause()` |
