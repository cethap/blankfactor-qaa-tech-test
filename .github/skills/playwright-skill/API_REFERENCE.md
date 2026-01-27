# Playwright API Quick Reference

## Locator Methods

### Finding Elements

| Method | Example |
|--------|---------|
| `getByRole` | `page.getByRole('button', { name: 'Submit' })` |
| `getByLabel` | `page.getByLabel('Email')` |
| `getByPlaceholder` | `page.getByPlaceholder('Search...')` |
| `getByText` | `page.getByText('Welcome')` |
| `getByTestId` | `page.getByTestId('submit-btn')` |
| `getByTitle` | `page.getByTitle('Close')` |
| `getByAltText` | `page.getByAltText('Logo')` |
| `locator` | `page.locator('css=button')` |

### Locator Filtering

| Method | Example |
|--------|---------|
| `filter({ hasText })` | `locator.filter({ hasText: 'Active' })` |
| `filter({ hasNotText })` | `locator.filter({ hasNotText: 'Disabled' })` |
| `filter({ has })` | `locator.filter({ has: page.getByRole('button') })` |
| `first()` | `locator.first()` |
| `last()` | `locator.last()` |
| `nth(index)` | `locator.nth(2)` |

### Chaining

```typescript
page
  .getByRole('navigation')
  .getByRole('link', { name: 'Home' })
```

---

## Actions

### Mouse Actions

| Action | Code |
|--------|------|
| Click | `await locator.click()` |
| Double-click | `await locator.dblclick()` |
| Right-click | `await locator.click({ button: 'right' })` |
| Hover | `await locator.hover()` |
| Drag to | `await source.dragTo(target)` |

### Keyboard Actions

| Action | Code |
|--------|------|
| Fill (clear + type) | `await locator.fill('text')` |
| Type (char by char) | `await locator.type('text')` |
| Press key | `await locator.press('Enter')` |
| Clear | `await locator.clear()` |

### Form Actions

| Action | Code |
|--------|------|
| Select option | `await locator.selectOption('value')` |
| Check | `await locator.check()` |
| Uncheck | `await locator.uncheck()` |
| Set checked | `await locator.setChecked(true)` |
| Upload file | `await page.setInputFiles('input', 'file.pdf')` |

### Scroll

| Action | Code |
|--------|------|
| Scroll into view | `await locator.scrollIntoViewIfNeeded()` |
| Scroll by pixels | `await page.mouse.wheel(0, 500)` |

---

## Waiting

### Element Waiting

| Wait For | Code |
|----------|------|
| Visible | `await locator.waitFor({ state: 'visible' })` |
| Hidden | `await locator.waitFor({ state: 'hidden' })` |
| Attached | `await locator.waitFor({ state: 'attached' })` |
| Detached | `await locator.waitFor({ state: 'detached' })` |

### Page Waiting

| Wait For | Code |
|----------|------|
| DOM loaded | `await page.waitForLoadState('domcontentloaded')` |
| Full load | `await page.waitForLoadState('load')` |
| URL | `await page.waitForURL('**/dashboard')` |
| Response | `await page.waitForResponse('**/api/data')` |
| Request | `await page.waitForRequest('**/api/data')` |

---

## Assertions (expect)

### Element Assertions

| Assertion | Code |
|-----------|------|
| Visible | `await expect(locator).toBeVisible()` |
| Hidden | `await expect(locator).toBeHidden()` |
| Enabled | `await expect(locator).toBeEnabled()` |
| Disabled | `await expect(locator).toBeDisabled()` |
| Checked | `await expect(locator).toBeChecked()` |
| Focused | `await expect(locator).toBeFocused()` |
| Editable | `await expect(locator).toBeEditable()` |

### Text/Content Assertions

| Assertion | Code |
|-----------|------|
| Has text | `await expect(locator).toHaveText('text')` |
| Contains text | `await expect(locator).toContainText('text')` |
| Has value | `await expect(locator).toHaveValue('value')` |
| Is empty | `await expect(locator).toBeEmpty()` |

### Attribute Assertions

| Assertion | Code |
|-----------|------|
| Has attribute | `await expect(locator).toHaveAttribute('href', '/home')` |
| Has class | `await expect(locator).toHaveClass(/active/)` |
| Has ID | `await expect(locator).toHaveId('main')` |
| Has CSS | `await expect(locator).toHaveCSS('color', 'red')` |

### Count Assertions

| Assertion | Code |
|-----------|------|
| Count | `await expect(locator).toHaveCount(5)` |

### Page Assertions

| Assertion | Code |
|-----------|------|
| Title | `await expect(page).toHaveTitle('Title')` |
| URL | `await expect(page).toHaveURL(/dashboard/)` |

### Negation

```typescript
await expect(locator).not.toBeVisible()
await expect(locator).not.toHaveText('error')
```

### Soft Assertions

```typescript
await expect.soft(locator).toHaveText('text')
// Test continues even if fails
```

---

## Page Methods

### Navigation

| Method | Code |
|--------|------|
| Go to URL | `await page.goto('https://example.com')` |
| Go back | `await page.goBack()` |
| Go forward | `await page.goForward()` |
| Reload | `await page.reload()` |

### Information

| Method | Code |
|--------|------|
| Get URL | `page.url()` |
| Get title | `await page.title()` |
| Get content | `await page.content()` |

### Screenshots

| Method | Code |
|--------|------|
| Page screenshot | `await page.screenshot({ path: 'shot.png' })` |
| Full page | `await page.screenshot({ fullPage: true })` |
| Element | `await locator.screenshot({ path: 'el.png' })` |

### Dialogs

```typescript
page.on('dialog', async dialog => {
  console.log(dialog.message())
  await dialog.accept()
  // or dialog.dismiss()
})
```

### Frames

```typescript
const frame = page.frameLocator('#iframe')
await frame.getByRole('button').click()
```

### New Pages/Tabs

```typescript
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.click('a[target="_blank"]')
])
await newPage.waitForLoadState()
```

---

## Role Types Reference

| Role | Elements |
|------|----------|
| `button` | `<button>`, `<input type="button">` |
| `link` | `<a href>` |
| `textbox` | `<input type="text">`, `<textarea>` |
| `checkbox` | `<input type="checkbox">` |
| `radio` | `<input type="radio">` |
| `combobox` | `<select>` |
| `heading` | `<h1>` - `<h6>` |
| `list` | `<ul>`, `<ol>` |
| `listitem` | `<li>` |
| `table` | `<table>` |
| `row` | `<tr>` |
| `cell` | `<td>` |
| `navigation` | `<nav>` |
| `main` | `<main>` |
| `banner` | `<header>` |
| `contentinfo` | `<footer>` |
| `dialog` | `<dialog>` |
| `alert` | `role="alert"` |

---

## Debugging

| Tool | Usage |
|------|-------|
| Pause | `await page.pause()` |
| Console log | `page.on('console', msg => console.log(msg.text()))` |
| Trace viewer | `npx playwright show-trace trace.zip` |
| Debug mode | `PWDEBUG=1 npm test` |
| Codegen | `npx playwright codegen https://example.com` |
