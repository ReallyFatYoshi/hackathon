import { test, expect, type Page } from '@playwright/test'

/**
 * E2E tests for the guided tour system.
 *
 * These tests verify that:
 * 1. The tour selector (help button) is present on dashboard pages
 * 2. Tours can be started from the selector panel
 * 3. Tour steps display correctly and can be navigated
 * 4. Tours can be completed or exited
 *
 * NOTE: These tests require a running dev server with a valid user session.
 * If no authenticated session exists, the tests for dashboard tours will
 * be skipped via the login helper.
 */

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123'

async function loginIfNeeded(page: Page) {
  await page.goto('/en/login')
  // If we're already on the dashboard, skip login
  if (page.url().includes('/dashboard')) return true

  // Try to log in
  try {
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 })
    return true
  } catch {
    return false
  }
}

test.describe('Tour System - UI Components', () => {
  test('tour selector help button renders on dashboard', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    // The floating help button should be visible
    const helpBtn = page.locator('[data-tour="help-button"]')
    await expect(helpBtn).toBeVisible({ timeout: 10_000 })
  })

  test('tour selector panel opens when clicking help button', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    const helpBtn = page.locator('[data-tour="help-button"]')
    await expect(helpBtn).toBeVisible({ timeout: 10_000 })
    await helpBtn.click()

    // Panel should appear with "Guided Tours" heading
    const panelHeading = page.getByText(/Guided Tours|Rondleidingen/i)
    await expect(panelHeading).toBeVisible({ timeout: 5_000 })
  })

  test('tour selector shows available tours for the user role', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    await page.locator('[data-tour="help-button"]').click()

    // Should have at least the "Navigate the Dashboard" tour
    const navTour = page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i)
    await expect(navTour).toBeVisible({ timeout: 5_000 })

    // Should have Security tour (available to all roles)
    const secTour = page.getByText(/Security Settings|Beveiligingsinstellingen/i)
    await expect(secTour).toBeVisible()

    // Should have Install App tour
    const installTour = page.getByText(/Install the App|App Installeren/i)
    await expect(installTour).toBeVisible()
  })

  test('tour selector panel closes on overlay click', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    await page.locator('[data-tour="help-button"]').click()
    const panelHeading = page.getByText(/Guided Tours|Rondleidingen/i)
    await expect(panelHeading).toBeVisible({ timeout: 5_000 })

    // Click the overlay backdrop to close
    await page.locator('.fixed.inset-0').click({ force: true })
    await expect(panelHeading).not.toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Tour System - Navigation Tour', () => {
  test('navigation tour can be started and shows first step', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    // Open tour selector
    await page.locator('[data-tour="help-button"]').click()
    await page.waitForTimeout(300)

    // Click "Navigate the Dashboard" tour
    const navTourBtn = page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i)
    await expect(navTourBtn).toBeVisible({ timeout: 5_000 })
    await navTourBtn.click()

    // Tour dialog should appear
    const dialog = page.locator('.tg-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // Should show the first step (Sidebar)
    const stepTitle = page.locator('.tg-dialog-title')
    await expect(stepTitle).toBeVisible()
    await expect(stepTitle).not.toBeEmpty()
  })

  test('navigation tour can advance through steps with Next button', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    // Start the navigation tour
    await page.locator('[data-tour="help-button"]').click()
    await page.waitForTimeout(300)
    await page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i).click()

    const dialog = page.locator('.tg-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // Get initial step title
    const titleEl = page.locator('.tg-dialog-title')
    const firstTitle = await titleEl.textContent()

    // Click Next
    const nextBtn = page.locator('.tg-dialog-btn').last()
    await nextBtn.click()
    await page.waitForTimeout(500)

    // Step should advance (different title)
    const secondTitle = await titleEl.textContent()
    expect(secondTitle).not.toBe(firstTitle)
  })

  test('navigation tour can be exited with close button', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    // Start tour
    await page.locator('[data-tour="help-button"]').click()
    await page.waitForTimeout(300)
    await page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i).click()

    const dialog = page.locator('.tg-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // Click close button (the X/SVG in header)
    const closeBtn = page.locator('.tg-dialog-close-btn')
    await closeBtn.click()

    // Dialog should disappear
    await expect(dialog).not.toBeVisible({ timeout: 3_000 })

    // Help button should be visible again
    await expect(page.locator('[data-tour="help-button"]')).toBeVisible()
  })

  test('navigation tour can be exited with Escape key', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    await page.locator('[data-tour="help-button"]').click()
    await page.waitForTimeout(300)
    await page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i).click()

    const dialog = page.locator('.tg-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // Press Escape
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Tour System - Step Progress', () => {
  test('navigation tour shows step progress indicator', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    await page.locator('[data-tour="help-button"]').click()
    await page.waitForTimeout(300)
    await page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i).click()

    const dialog = page.locator('.tg-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // Should show step dots
    const dots = page.locator('.tg-dot')
    const dotCount = await dots.count()
    expect(dotCount).toBeGreaterThanOrEqual(2)

    // First dot should be active
    const activeDot = page.locator('.tg-dot-active')
    await expect(activeDot).toBeVisible()
  })

  test('navigation tour shows step progress text (e.g., 1/5)', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    await page.locator('[data-tour="help-button"]').click()
    await page.waitForTimeout(300)
    await page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i).click()

    const dialog = page.locator('.tg-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // Step progress (e.g., "1 / 5")
    const progress = page.locator('.tg-step-progress')
    await expect(progress).toBeVisible()
    const text = await progress.textContent()
    expect(text).toMatch(/\d+\s*\/\s*\d+/)
  })
})

test.describe('Tour System - Complete Tour Flow', () => {
  test('navigation tour can be completed by clicking through all steps', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    await page.locator('[data-tour="help-button"]').click()
    await page.waitForTimeout(300)
    await page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i).click()

    const dialog = page.locator('.tg-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // Click through all steps (max 10 to avoid infinite loops)
    for (let i = 0; i < 10; i++) {
      // Check if dialog is still visible
      if (!await dialog.isVisible()) break

      // Find the next/finish button (last button in footer)
      const buttons = page.locator('.tg-dialog-footer button.tg-dialog-btn')
      const btnCount = await buttons.count()
      if (btnCount === 0) break

      // Click the last button (Next or Finish)
      await buttons.last().click()
      await page.waitForTimeout(500)
    }

    // After finishing, dialog should be hidden
    await expect(dialog).not.toBeVisible({ timeout: 5_000 })

    // Help button should reappear
    await expect(page.locator('[data-tour="help-button"]')).toBeVisible()
  })
})

test.describe('Tour System - Data Attributes', () => {
  test('dashboard has required data-tour attributes for sidebar', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    // Sidebar elements
    await expect(page.locator('[data-tour="sidebar"]')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('[data-tour="sidebar-logo"]')).toBeVisible()
    await expect(page.locator('[data-tour="sidebar-nav"]')).toBeVisible()
    await expect(page.locator('[data-tour="sidebar-user"]')).toBeVisible()
    await expect(page.locator('[data-tour="main-content"]')).toBeVisible()
  })

  test('dashboard has nav item data-tour attributes', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    // At least some nav items should have data-tour
    const navItems = page.locator('[data-tour^="nav-"]')
    const count = await navItems.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })
})

test.describe('Tour System - Backdrop', () => {
  test('tour shows backdrop overlay when active', async ({ page }) => {
    const loggedIn = await loginIfNeeded(page)
    test.skip(!loggedIn, 'No authenticated session available')

    await page.locator('[data-tour="help-button"]').click()
    await page.waitForTimeout(300)
    await page.getByText(/Navigate the Dashboard|Dashboard Navigatie/i).click()

    // Backdrop should be visible
    const backdrop = page.locator('.tg-backdrop')
    await expect(backdrop).toBeVisible({ timeout: 5_000 })
  })
})
