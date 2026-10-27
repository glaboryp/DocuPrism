import { test, expect, type Page } from '@playwright/test'

const closeRequirements = async (page: Page) => {
  const sheet = page.getByRole('dialog', { name: /(?:cannot run the model|no puede ejecutar el modelo)/i })
  await sheet.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  if (await sheet.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  }
}

test.describe('Internationalization (i18n)', () => {
  test('displays Spanish by default when browser language is Spanish', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'es-ES'
    })
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForSelector('main', { state: 'visible' })
    await closeRequirements(page)

    // Check html lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('es')

    // Check Spanish content on the main screen
    await expect(page.getByRole('heading', { name: /¿Qué dice este documento\?/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Pegar/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Abrir archivo/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Lectura/i })).toBeVisible()

    await context.close()
  })

  test('falls back to English when browser language is unsupported (e.g. French)', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'fr-FR'
    })
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForSelector('main', { state: 'visible' })
    await closeRequirements(page)

    // Check html lang attribute falls back to en
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('en')

    // Check English content on the main screen
    await expect(page.getByRole('heading', { name: /What does this document say\?/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Paste/i })).toBeVisible()

    await context.close()
  })

  test('allows toggling language manually and persists choice', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('main', { state: 'visible' })
    await closeRequirements(page)

    // Initially in English
    await expect(page.getByRole('heading', { name: /What does this document say\?/i })).toBeVisible()

    // Find language toggle button in desktop nav (displays 'ES')
    const langBtn = page.getByRole('button', { name: /change language|cambiar idioma/i })
    await expect(langBtn).toBeVisible()
    await langBtn.click()

    // After clicking, page should be in Spanish
    await expect(page.getByRole('heading', { name: /¿Qué dice este documento\?/i })).toBeVisible()
    expect(await page.locator('html').getAttribute('lang')).toBe('es')

    // Navigate to history page - should remain in Spanish
    await page.click('a[href="/history"]')
    await expect(page).toHaveURL('/history')
    await expect(page.getByRole('heading', { name: /Historial/i })).toBeVisible()

    // Toggle back to English
    const langBtnHistory = page.getByRole('button', { name: /change language|cambiar idioma/i })
    await langBtnHistory.click()
    await expect(page.getByRole('heading', { name: /History/i })).toBeVisible()
    expect(await page.locator('html').getAttribute('lang')).toBe('en')
  })
})
