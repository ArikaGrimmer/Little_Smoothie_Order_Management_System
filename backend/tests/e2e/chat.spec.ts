import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || process.env.LB_BASE_URL || 'http://127.0.0.1:3000'

async function loginAsDemoCustomer(page: Page) {
  await page.goto(`${BASE_URL}/login`)
  await page.getByRole('button', { name: /Demo Customer/i }).click()
  await page.waitForURL(`${BASE_URL}/`, { waitUntil: 'load' })
}

test('demo customer can submit an order', async ({ page }) => {
  await loginAsDemoCustomer(page)

  await page.goto(`${BASE_URL}/customer`)

  const baseOption = page.locator('.menu-group').nth(0).locator('.menu-item').first()
  const sizeOption = page.locator('.menu-group').nth(1).locator('.menu-item').first()

  await baseOption.click()
  await sizeOption.click()

  await page.getByRole('button', { name: /Submit Order/i }).click()

  await expect(page.locator('.status-panel .status-badge')).toHaveText(/queued|blending/i)

  await page.goto(`${BASE_URL}/customer/orders`)

  const orderCards = page.locator('.orders-list .order-card').first()
  await expect(orderCards).toContainText(/Order #/i)
})
