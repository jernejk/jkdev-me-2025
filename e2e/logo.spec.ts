import { expect, test } from 'playwright/test'
import { gotoWithTheme } from './utils'

test.describe('Brand logo', () => {
  test('light theme screenshot', async ({ page }) => {
    await gotoWithTheme(page, '/', 'light')

    const logo = page.getByTestId('brand-logo')
    await expect(logo).toBeVisible()
    await expect(logo).toHaveScreenshot('brand-logo-light.png')
  })

  test('dark theme screenshot', async ({ page }) => {
    await gotoWithTheme(page, '/', 'dark')

    const logo = page.getByTestId('brand-logo')
    await expect(logo).toBeVisible()
    await expect(logo).toHaveScreenshot('brand-logo-dark.png')
  })
})
