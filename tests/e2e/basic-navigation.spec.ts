import { test, expect, type Page } from '@playwright/test'

// Browsers without the model open the requirements sheet on arrival
const closeRequirements = async (page: Page) => {
  const sheet = page.getByRole('dialog', { name: /cannot run the model/i })
  await sheet.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  if (await sheet.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  }
}

test.describe('Basic Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for page to load
    await page.waitForSelector('main', { state: 'visible' })
    await closeRequirements(page)
  })

  test('should load home page', async ({ page }) => {
    // Verify we're on the home page
    await expect(page).toHaveURL('/')
    
    // The screen names the product and asks the question it answers
    await expect(page.getByRole('link', { name: /DocuPrism home/i }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /what does this document say/i })).toBeVisible()
  })

  test('should have textarea for input', async ({ page }) => {
    // Check for document textarea
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()

    // The reading page and its primary action are part of the first screen
    await expect(page.getByRole('heading', { name: /reading/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /summarize document/i })).toBeVisible()
  })

  test('should navigate to history page', async ({ page }) => {
    // Click history link
    await page.click('a[href="/history"]')
    
    // Verify navigation
    await expect(page).toHaveURL('/history')
    
    // Check for history page heading
    await expect(page.getByRole('heading', { name: /history/i })).toBeVisible()
  })

  test('should navigate back to home from history', async ({ page }) => {
    // Go to history
    await page.click('a[href="/history"]')
    await expect(page).toHaveURL('/history')

    // The requirements modal may re-open on the history page in test browsers
    await closeRequirements(page)

    // Navigate back to home via the logo link
    await page.click('a[href="/"]')
    await expect(page).toHaveURL('/')
  })
})
