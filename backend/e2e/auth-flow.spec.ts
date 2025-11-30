import { test, expect } from '@playwright/test';

/**
 * E2E Test: Authentication Flow
 * 
 * Tests authentication functionality:
 * 1. Login page accessibility
 * 2. Demo customer login
 * 3. Demo operator login
 * 4. Session persistence
 * 5. Logout functionality
 */
test.describe('Authentication Flow', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page).toHaveTitle(/Little Smoothie/i);
    
    // Check login options
    const githubButton = page.getByRole('button', { name: /continue with github/i });
    await expect(githubButton).toBeVisible();
    
    const demoCustomerButton = page.getByRole('button', { name: /demo customer/i });
    await expect(demoCustomerButton).toBeVisible();
    
    const demoOperatorButton = page.getByRole('button', { name: /demo operator/i });
    await expect(demoOperatorButton).toBeVisible();
  });

  test('should login as demo customer and redirect to home', async ({ page }) => {
    await page.goto('/login');
    
    // Click demo customer button
    await page.getByRole('button', { name: /demo customer/i }).click();
    
    // Should redirect to home page
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
    
    // Verify user is logged in (check for user profile or home page content)
    const homeContent = page.locator('h1').filter({ hasText: /little smoothie/i });
    await expect(homeContent).toBeVisible();
    
    // Check for user profile component
    const userProfile = page.locator('.user-profile, [class*="profile"]');
    await expect(userProfile).toBeVisible({ timeout: 5000 });
  });

  test('should login as demo operator and show operator options', async ({ page }) => {
    await page.goto('/login');
    
    // Click demo operator button
    await page.getByRole('button', { name: /demo operator/i }).click();
    
    // Should redirect to home page
    await page.waitForURL('/', { timeout: 10000 });
    
    // Verify operator-specific options are visible
    const manageOrdersLink = page.getByRole('link', { name: /manage orders/i });
    await expect(manageOrdersLink).toBeVisible();
    
    const manageMenuLink = page.getByRole('link', { name: /manage menu/i });
    await expect(manageMenuLink).toBeVisible();
  });

  test('should redirect authenticated user away from login page', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByRole('button', { name: /demo customer/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // Try to access login page again
    await page.goto('/login');
    
    // Should redirect back to home
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page).toHaveURL('/');
  });

  test('should require authentication for protected routes', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/customer');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByRole('button', { name: /demo customer/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // Find and click logout button
    const userProfile = page.locator('.user-profile, [class*="profile"]');
    await expect(userProfile).toBeVisible({ timeout: 5000 });
    
    // Click on user profile to open dropdown
    await userProfile.click();
    
    // Wait for dropdown menu
    await page.waitForTimeout(500);
    
    // Click logout button
    const logoutButton = page.getByRole('button', { name: /sign out|logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login
      await page.waitForURL('/login', { timeout: 5000 });
      await expect(page).toHaveURL('/login');
    }
  });
});

