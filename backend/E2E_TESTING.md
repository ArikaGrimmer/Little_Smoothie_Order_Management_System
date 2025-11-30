# End-to-End (E2E) Testing Guide

This project uses [Playwright](https://playwright.dev/) for end-to-end testing to ensure the application works correctly across different browsers and devices.

## Setup

### Install Dependencies

```bash
npm install --save-dev @playwright/test
npx playwright install
```

This will install Playwright and the browser binaries needed for testing.

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Recommended for Development)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See all tests
- Run individual tests
- Watch tests execute
- Debug test failures
- View test traces

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Debug Tests

```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can step through tests.

### Run Specific Test File

```bash
npx playwright test e2e/customer-flow.spec.ts
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
```

## Test Structure

The E2E tests are organized into the following files:

### 1. `e2e/auth-flow.spec.ts`
Tests authentication functionality:
- Login page display
- Demo customer login
- Demo operator login
- Session persistence
- Logout functionality
- Protected route access

### 2. `e2e/customer-flow.spec.ts`
Tests the complete customer journey:
- Login as demo customer
- Browse menu and filter by category
- Select menu item and customize order
- Build custom smoothie
- Save draft order
- Submit order
- View order status

### 3. `e2e/operator-flow.spec.ts`
Tests the complete operator journey:
- Login as demo operator
- View orders dashboard
- Process orders (start preparation, mark as ready)
- Access menu management
- View order statistics

### 4. `e2e/navigation.spec.ts`
Tests navigation between pages:
- Home page navigation
- Menu page navigation
- Customer pages navigation
- Operator pages navigation
- Back button functionality
- Session persistence after reload

## Test Configuration

The test configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (or set `PLAYWRIGHT_TEST_BASE_URL` env variable)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Auto-start server**: Tests automatically start the dev server before running
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Taken on failure
- **Traces**: Collected on first retry

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test code here
    await expect(page.locator('h1')).toHaveText('Expected Text');
  });
});
```

### Best Practices

1. **Use descriptive test names**: Test names should clearly describe what is being tested
2. **Use test.step()**: Break complex tests into logical steps
3. **Wait for elements**: Use `waitForSelector` or `waitForURL` instead of fixed timeouts
4. **Use data-testid**: Consider adding `data-testid` attributes to important elements for more reliable selectors
5. **Clean up**: Tests should be independent and not rely on previous test state

### Example Test with Steps

```typescript
test('should complete order flow', async ({ page }) => {
  await test.step('Login', async () => {
    await page.goto('/login');
    await page.getByRole('button', { name: /demo customer/i }).click();
    await page.waitForURL('/');
  });

  await test.step('Select menu item', async () => {
    await page.getByRole('link', { name: /browse menu/i }).click();
    await page.getByRole('button', { name: /order now/i }).first().click();
  });

  await test.step('Submit order', async () => {
    await page.getByRole('button', { name: /submit order/i }).click();
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

## Debugging Failed Tests

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Debug in VS Code

1. Install the [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension
2. Set breakpoints in your test files
3. Use the "Debug Test" option from the test explorer

### View Traces

When a test fails, Playwright generates a trace. View it with:

```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Environment Variables

Set these environment variables if needed:

- `PLAYWRIGHT_TEST_BASE_URL`: Override the base URL (default: `http://localhost:3000`)
- `CI`: Set to `true` in CI environments to enable retries and other CI-specific behavior

## Troubleshooting

### Tests fail with "Navigation timeout"

- Ensure the dev server is running on port 3000
- Check that the database is seeded: `npm run seed`
- Verify MongoDB connection is working

### Tests fail with "Element not found"

- Check that selectors match the actual HTML
- Use `page.pause()` to inspect the page state
- Use Playwright Inspector: `npm run test:e2e:debug`

### Tests are flaky

- Add explicit waits instead of fixed timeouts
- Use `waitForURL` and `waitForSelector` appropriately
- Check for race conditions in the application

## Coverage

Current test coverage includes:

✅ Authentication flows (login, logout, session)  
✅ Customer order flow (browse, select, customize, submit)  
✅ Operator order processing (view, start, complete)  
✅ Navigation between pages  
✅ Menu browsing and filtering  
✅ Custom smoothie building  

## Future Improvements

- [ ] Add tests for menu management (CRUD operations)
- [ ] Add tests for real-time order updates (Socket.IO)
- [ ] Add visual regression tests
- [ ] Add performance tests
- [ ] Add accessibility tests

