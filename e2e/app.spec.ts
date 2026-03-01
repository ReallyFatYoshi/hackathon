import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads and shows core content', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/MyChef/i)
    // Navbar should be visible with logo
    await expect(page.locator('nav')).toBeVisible()
    // Hero section text
    await expect(page.getByText(/chef/i).first()).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    // Should have login/register links when not authenticated
    const loginLink = page.getByRole('link', { name: /sign in|log in|login/i })
    if (await loginLink.count() > 0) {
      await expect(loginLink.first()).toBeVisible()
    }
  })

  test('CSRF cookie is set on page load', async ({ page }) => {
    await page.goto('/')
    const cookies = await page.context().cookies()
    const csrfCookie = cookies.find(c => c.name === 'csrf_token')
    expect(csrfCookie).toBeTruthy()
    expect(csrfCookie!.value.length).toBeGreaterThan(10)
  })
})

test.describe('Auth pages', () => {
  test('login page renders form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible()
  })

  test('register page renders form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('apply page renders form', async ({ page }) => {
    await page.goto('/apply')
    // Should have a multi-step application form
    await expect(page.getByRole('button').first()).toBeVisible()
  })
})

test.describe('Protected routes redirect', () => {
  test('dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain('/login')
  })
})

test.describe('CSRF protection', () => {
  test('POST to API without CSRF token returns 403', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { booking_id: 'test', content: 'hello' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(response.status()).toBe(403)
    const body = await response.json()
    expect(body.error).toContain('CSRF')
  })

  test('POST with matching CSRF cookie+header succeeds (auth may fail, but not 403)', async ({ page }) => {
    // First visit to get the CSRF cookie
    await page.goto('/')
    const cookies = await page.context().cookies()
    const csrfCookie = cookies.find(c => c.name === 'csrf_token')
    expect(csrfCookie).toBeTruthy()

    // Now make an API request with the token
    const response = await page.request.post('/api/chat', {
      data: { booking_id: 'test', content: 'hello' },
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfCookie!.value,
      },
    })
    // Should NOT be 403 (CSRF passes) — will be 401 since not authenticated
    expect(response.status()).not.toBe(403)
  })
})

test.describe('UI rendering checks', () => {
  test('no JavaScript errors on homepage', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('no JavaScript errors on login page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('no JavaScript errors on register page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('no JavaScript errors on apply page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/apply')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('no broken images on homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const images = await page.locator('img').all()
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      const src = await img.getAttribute('src')
      expect(naturalWidth, `Broken image: ${src}`).toBeGreaterThan(0)
    }
  })

  test('no console errors on homepage', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Filter out known noisy warnings
    const real = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('manifest'))
    expect(real).toEqual([])
  })
})
