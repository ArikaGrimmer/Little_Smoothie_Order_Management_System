import { test, expect } from '@playwright/test';

/**
 * E2E Test: Customer User Flow
 * 
 * Tests the complete customer journey:
 * 1. Login as demo customer
 * 2. Browse menu
 * 3. Select a menu item and customize order
 * 4. Submit order
 * 5. View order status
 */
test.describe('Customer Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Little Smoothie/i);
  });

  test('should complete full customer order flow', async ({ page }) => {
    // Step 1: Login as Demo Customer
    await test.step('Login as demo customer', async () => {
      const demoCustomerButton = page.getByRole('button', { name: /demo customer/i });
      await expect(demoCustomerButton).toBeVisible();
      await demoCustomerButton.click();
      
      // Wait for redirect to home page
      await page.waitForURL('/', { timeout: 10000 });
      await expect(page).toHaveURL('/');
    });

    // Step 2: Navigate to Menu
    await test.step('Browse menu', async () => {
      const browseMenuLink = page.getByRole('link', { name: /browse menu/i });
      await expect(browseMenuLink).toBeVisible();
      await browseMenuLink.click();
      
      await page.waitForURL('/menu');
      await expect(page).toHaveURL('/menu');
      
      // Check that menu items are displayed
      const menuItems = page.locator('.menu-item-card');
      await expect(menuItems.first()).toBeVisible({ timeout: 5000 });
    });

    // Step 3: Select a menu item
    await test.step('Select menu item and customize order', async () => {
      // Click "Order Now" on first available item
      const orderNowButton = page.getByRole('button', { name: /order now/i }).first();
      await expect(orderNowButton).toBeVisible();
      await orderNowButton.click();
      
      // Should navigate to customer order page
      await page.waitForURL(/\/customer/, { timeout: 5000 });
      
      // Wait for menu to load
      await page.waitForSelector('.menu-group', { timeout: 5000 });
      
      // Select a base
      const baseOption = page.locator('.menu-item').filter({ hasText: /almond milk|oat milk|coconut water/i }).first();
      await expect(baseOption).toBeVisible();
      await baseOption.click();
      
      // Select a size
      const sizeOption = page.locator('.menu-item').filter({ hasText: /medium|large|small/i }).first();
      await expect(sizeOption).toBeVisible();
      await sizeOption.click();
      
      // Optionally add fruits (if available)
      const fruitOptions = page.locator('.menu-item').filter({ hasText: /strawberry|banana|blueberry/i });
      const fruitCount = await fruitOptions.count();
      if (fruitCount > 0) {
        await fruitOptions.first().click();
      }
      
      // Adjust sweetness slider
      const sweetnessSlider = page.locator('input[type="range"]').first();
      await expect(sweetnessSlider).toBeVisible();
      await sweetnessSlider.fill('75');
      
      // Adjust ice level slider
      const iceSlider = page.locator('input[type="range"]').nth(1);
      await expect(iceSlider).toBeVisible();
      await iceSlider.fill('50');
    });

    // Step 4: Save draft order
    await test.step('Save draft order', async () => {
      const saveDraftButton = page.getByRole('button', { name: /save draft/i });
      await expect(saveDraftButton).toBeVisible();
      await expect(saveDraftButton).toBeEnabled();
      await saveDraftButton.click();
      
      // Wait for success message or confirmation
      await page.waitForTimeout(1000);
    });

    // Step 5: Submit order
    await test.step('Submit order', async () => {
      const submitButton = page.getByRole('button', { name: /submit order/i });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
      
      // Wait for order submission
      await page.waitForTimeout(2000);
    });

    // Step 6: View order status
    await test.step('View order status', async () => {
      // Navigate to orders page
      const viewOrdersLink = page.getByRole('link', { name: /view current order|my orders/i });
      if (await viewOrdersLink.isVisible()) {
        await viewOrdersLink.click();
      } else {
        // Navigate directly
        await page.goto('/customer/orders');
      }
      
      await page.waitForURL(/\/customer\/orders/, { timeout: 5000 });
      
      // Check that order is displayed
      const orderCard = page.locator('.order-card').first();
      await expect(orderCard).toBeVisible({ timeout: 5000 });
      
      // Verify order status
      const statusMessage = page.locator('.status-message, .order-status-info');
      await expect(statusMessage.first()).toBeVisible();
    });
  });

  test('should browse menu and filter by category', async ({ page }) => {
    // Login
    await page.getByRole('button', { name: /demo customer/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // Navigate to menu
    await page.getByRole('link', { name: /browse menu/i }).click();
    await page.waitForURL('/menu');
    
    // Check category filters
    const allButton = page.getByRole('button', { name: /^all$/i });
    await expect(allButton).toBeVisible();
    
    // Click on a category filter
    const categoryButton = page.getByRole('button', { name: /fruity|berry|green|protein/i }).first();
    await expect(categoryButton).toBeVisible();
    await categoryButton.click();
    
    // Verify filter is active
    await expect(categoryButton).toHaveClass(/active/);
    
    // Verify menu items are still visible
    const menuItems = page.locator('.menu-item-card');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should build custom smoothie without menu item', async ({ page }) => {
    // Login
    await page.getByRole('button', { name: /demo customer/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // Navigate to quick order
    await page.getByRole('link', { name: /quick order/i }).click();
    await page.waitForURL(/\/customer/);
    
    // Wait for menu to load
    await page.waitForSelector('.menu-group', { timeout: 5000 });
    
    // Select base
    const baseOption = page.locator('.menu-item').filter({ hasText: /almond milk|oat milk/i }).first();
    await expect(baseOption).toBeVisible();
    await baseOption.click();
    
    // Select size
    const sizeOption = page.locator('.menu-item').filter({ hasText: /medium|large/i }).first();
    await expect(sizeOption).toBeVisible();
    await sizeOption.click();
    
    // Verify price is calculated
    const priceDisplay = page.locator('.calculated-price, .price-value');
    await expect(priceDisplay.first()).toBeVisible();
    
    // Verify submit button is enabled
    const submitButton = page.getByRole('button', { name: /submit order/i });
    await expect(submitButton).toBeEnabled();
  });
});

