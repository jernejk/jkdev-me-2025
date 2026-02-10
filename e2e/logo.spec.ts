import { expect, test } from 'playwright/test'

async function gotoWithTheme(page, theme: 'light' | 'dark') {
  await page.addInitScript((t) => {
    window.localStorage.setItem('theme', t)
  }, theme)

  await page.goto('/', { waitUntil: 'networkidle' })

  const html = page.locator('html')
  if (theme === 'dark') {
    await expect(html).toHaveClass(/dark/)
  } else {
    await expect(html).not.toHaveClass(/dark/)
  }
}

test.describe('Brand logo', () => {
  test('light theme screenshot', async ({ page }) => {
    await gotoWithTheme(page, 'light')

    const logo = page.getByTestId('brand-logo')
    await expect(logo).toBeVisible()
    await expect(logo).toHaveScreenshot('brand-logo-light.png')
  })

  test('dark theme screenshot', async ({ page }) => {
    await gotoWithTheme(page, 'dark')

    const logo = page.getByTestId('brand-logo')
    await expect(logo).toBeVisible()
    await expect(logo).toHaveScreenshot('brand-logo-dark.png')
  })
})

