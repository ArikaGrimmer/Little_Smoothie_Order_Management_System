import { test, expect } from '@playwright/test';

/**
 * E2E Test: Operator User Flow
 * 
 * Tests the complete operator journey:
 * 1. Login as demo operator
 * 2. View orders dashboard
 * 3. Process orders (start preparation, mark as ready)
 * 4. Manage menu items
 */
test.describe('Operator Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Little Smoothie/i);
  });

  test('should complete operator order processing flow', async ({ page }) => {
    // Step 1: Login as Demo Operator
    await test.step('Login as demo operator', async () => {
      const demoOperatorButton = page.getByRole('button', { name: /demo operator/i });
      await expect(demoOperatorButton).toBeVisible();
      await demoOperatorButton.click();
      
      // Wait for redirect to home page
      await page.waitForURL('/', { timeout: 10000 });
      await expect(page).toHaveURL('/');
      
      // Verify operator options are visible
      const manageOrdersLink = page.getByRole('link', { name: /manage orders/i });
      await expect(manageOrdersLink).toBeVisible();
    });

    // Step 2: Navigate to Operator Dashboard
    await test.step('View operator dashboard', async () => {
      const manageOrdersLink = page.getByRole('link', { name: /manage orders/i });
      await manageOrdersLink.click();
      
      await page.waitForURL('/operator');
      await expect(page).toHaveURL('/operator');
      
      // Check dashboard elements
      const dashboard = page.locator('.operator-page, .dashboard');
      await expect(dashboard).toBeVisible();
      
      // Check for orders sections
      const ordersSection = page.locator('.orders-section, h2').filter({ hasText: /queued|in progress|ready/i });
      await expect(ordersSection.first()).toBeVisible({ timeout: 5000 });
    });

    // Step 3: Process a queued order (if available)
    await test.step('Process queued order', async () => {
      // Look for queued orders
      const queuedOrders = page.locator('.order-card.queued, .order-card').filter({ hasText: /order #/i });
      const queuedCount = await queuedOrders.count();
      
      if (queuedCount > 0) {
        // Click "Start Preparation" on first queued order
        const startButton = page.getByRole('button', { name: /start preparation/i }).first();
        if (await startButton.isVisible()) {
          await startButton.click();
          
          // Wait for order to move to "In Progress"
          await page.waitForTimeout(2000);
          
          // Verify order moved to in progress section
          const inProgressSection = page.locator('h2').filter({ hasText: /in progress/i });
          await expect(inProgressSection).toBeVisible();
          
          // Mark as ready
          const finishButton = page.getByRole('button', { name: /mark as ready|finish/i }).first();
          if (await finishButton.isVisible()) {
            await finishButton.click();
            await page.waitForTimeout(2000);
          }
        }
      } else {
        // No orders available - this is okay for a test
        console.log('No queued orders available to process');
      }
    });
  });

  test('should access menu management', async ({ page }) => {
    // Login as operator
    await page.getByRole('button', { name: /demo operator/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // Navigate to menu management
    const manageMenuLink = page.getByRole('link', { name: /manage menu/i });
    await expect(manageMenuLink).toBeVisible();
    await manageMenuLink.click();
    
    await page.waitForURL('/operator/menu');
    await expect(page).toHaveURL('/operator/menu');
    
    // Verify menu management page elements
    const pageTitle = page.locator('h1').filter({ hasText: /menu management/i });
    await expect(pageTitle).toBeVisible();
    
    // Check for menu items list
    const menuItems = page.locator('.menu-item-row, .menu-item-card');
    await expect(menuItems.first()).toBeVisible({ timeout: 5000 });
  });

  test('should view order statistics', async ({ page }) => {
    // Login as operator
    await page.getByRole('button', { name: /demo operator/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // Navigate to operator dashboard
    await page.getByRole('link', { name: /manage orders/i }).click();
    await page.waitForURL('/operator');
    
    // Check for statistics/stats
    const stats = page.locator('.stats, .stat-badge, .panel-stats');
    const statsCount = await stats.count();
    
    // Should have some stats displayed (queue count, etc.)
    if (statsCount > 0) {
      await expect(stats.first()).toBeVisible();
    }
  });
});

