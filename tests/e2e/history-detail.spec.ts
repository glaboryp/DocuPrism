import { test, expect } from '@playwright/test'

const seedAnalysis = () => {
  localStorage.setItem('docuprism-analyses', JSON.stringify([
    {
      id: 'e2e-reading',
      timestamp: Date.now(),
      inputText: 'The quarterly report covers the migration of the billing platform and the cost of the downtime.',
      summary: 'The billing migration finished four weeks late and cost 12% more than budgeted.',
      options: { type: 'tldr', format: 'markdown', length: 'medium' }
    }
  ]))
}

test.describe('History detail', () => {
  test('should open the saved reading above the page chrome', async ({ page }) => {
    await page.addInitScript(seedAnalysis)
    await page.goto('/history')
    await page.waitForSelector('main', { state: 'visible' })

    // Browsers without the model auto-open the requirements sheet on arrival
    const requirements = page.getByRole('dialog', { name: /cannot run the model/i })
    await requirements.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    if (await requirements.isVisible().catch(() => false)) {
      await page.keyboard.press('Escape')
      await expect(requirements).toBeHidden()
    }

    await page.getByRole('button', { name: /billing platform/i }).click()

    const dialog = page.getByRole('dialog', { name: /saved reading/i })
    await expect(dialog).toBeVisible()

    // The header and footer are painted below the sheet, so the dialog owns its own top-left corner
    const topLeftInsideDialog = await page.evaluate(() => {
      const rect = document.querySelector('[role="dialog"]')!.getBoundingClientRect()
      const hit = document.elementFromPoint(rect.left + 12, rect.top + 12)
      return Boolean(hit?.closest('[role="dialog"]'))
    })
    expect(topLeftInsideDialog).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})
