import { test, expect } from '@playwright/test';

/**
 * E2E Test: Navigation Flow
 * 
 * Tests navigation between pages:
 * 1. Home page navigation
 * 2. Menu page navigation
 * 3. Customer pages navigation
 * 4. Operator pages navigation
 * 5. Back button functionality
 */
test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer for most tests
    await page.goto('/login');
    await page.getByRole('button', { name: /demo customer/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('should navigate between home page sections', async ({ page }) => {
    // Verify home page
    await expect(page).toHaveURL('/');
    
    // Navigate to Browse Menu
    await page.getByRole('link', { name: /browse menu/i }).click();
    await expect(page).toHaveURL('/menu');
    
    // Go back to home
    await page.goto('/');
    
    // Navigate to Quick Order
    await page.getByRole('link', { name: /quick order/i }).click();
    await expect(page).toHaveURL(/\/customer/);
    
    // Go back to home
    await page.goto('/');
    
    // Navigate to View Orders
    await page.getByRole('link', { name: /view current order/i }).click();
    await expect(page).toHaveURL('/customer/orders');
  });

  test('should navigate from menu to order page', async ({ page }) => {
    // Go to menu
    await page.goto('/menu');
    
    // Click on a menu item's "Order Now" button
    const orderNowButton = page.getByRole('button', { name: /order now/i }).first();
    if (await orderNowButton.isVisible()) {
      await orderNowButton.click();
      
      // Should navigate to customer order page with item selected
      await page.waitForURL(/\/customer/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/customer/);
    }
  });

  test('should use back button on menu page', async ({ page }) => {
    // Go to menu
    await page.goto('/menu');
    
    // Click back button
    const backButton = page.getByRole('link', { name: /← back|back/i });
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Should return to home
    await expect(page).toHaveURL('/');
  });

  test('should use back button on customer order page', async ({ page }) => {
    // Go to customer order page
    await page.goto('/customer');
    
    // Click back button
    const backButton = page.getByRole('link', { name: /← back|back/i });
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Should return to home
    await expect(page).toHaveURL('/');
  });

  test('should navigate operator pages', async ({ page }) => {
    // Logout and login as operator
    await page.goto('/login');
    await page.getByRole('button', { name: /demo operator/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // Navigate to Manage Orders
    await page.getByRole('link', { name: /manage orders/i }).click();
    await expect(page).toHaveURL('/operator');
    
    // Navigate to Manage Menu
    await page.goto('/');
    await page.getByRole('link', { name: /manage menu/i }).click();
    await expect(page).toHaveURL('/operator/menu');
    
    // Use back button
    const backButton = page.getByRole('link', { name: /← back|back/i });
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Should return to home
    await expect(page).toHaveURL('/');
  });

  test('should maintain navigation state after page reload', async ({ page }) => {
    // Navigate to menu
    await page.goto('/menu');
    await expect(page).toHaveURL('/menu');
    
    // Reload page
    await page.reload();
    
    // Should still be on menu page
    await expect(page).toHaveURL('/menu');
    
    // User should still be logged in
    const userProfile = page.locator('.user-profile, [class*="profile"]');
    await expect(userProfile).toBeVisible({ timeout: 5000 });
  });
});

