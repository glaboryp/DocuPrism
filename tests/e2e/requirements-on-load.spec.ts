import { test, expect, type Page } from '@playwright/test'

// Headless Chromium identifies itself through HeadlessChrome brands, which
// detectAIBrowser() refuses, so both cases pin the browser profile first:
// one Brave (API present, no model ever), one Chrome (model just missing).
const setBrowserProfile = (page: Page, brands: Array<{ brand: string; version: string }>) =>
  page.addInitScript((brandList) => {
    Object.defineProperty(Navigator.prototype, 'userAgentData', {
      get: () => ({ brands: brandList, mobile: false, platform: 'Linux' })
    })
  }, brands)

const braveProfile = async (page: Page) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'brave', { get: () => ({}) })
  })
}

const chromeProfile = (page: Page) =>
  setBrowserProfile(page, [
    { brand: 'Not.A/Brand', version: '8' },
    { brand: 'Google Chrome', version: '156' },
    { brand: 'Chromium', version: '156' }
  ])

const requirementsSheet = (page: Page) =>
  page.getByRole('dialog', { name: /cannot run the model/i })

test('opens the requirements sheet on arrival in a browser without the model', async ({ page }) => {
  await braveProfile(page)
  await page.goto('/')
  await page.waitForSelector('main', { state: 'visible' })

  const sheet = requirementsSheet(page)
  await expect(sheet).toBeVisible()
  await expect(sheet).toContainText('Open this page in desktop Chrome or Edge.')
  await expect(page.getByText('Model unavailable')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()

  // It comes back on the next page load, not on client-side navigation
  await page.click('a[href="/history"]')
  await expect(page).toHaveURL('/history')
  await expect(sheet).toBeHidden()
})

test('leaves a supported browser alone when only the model is missing', async ({ page }) => {
  await chromeProfile(page)
  await page.goto('/')

  // The header settles either way; the sheet must not pop up for these
  await expect(page.getByText(/On-device · Ready|Model unavailable/).first()).toBeVisible()
  await expect(requirementsSheet(page)).toHaveCount(0)
})
