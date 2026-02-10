import type { Page } from 'playwright/test'
import { expect } from 'playwright/test'

export type Theme = 'light' | 'dark'

export async function gotoWithTheme(page: Page, path: string, theme: Theme) {
  // Freeze theme before the app boots to avoid a flash and snapshot drift.
  await page.addInitScript((t) => {
    window.localStorage.setItem('theme', t)
  }, theme)

  // Reduce sources of screenshot flake (transitions, caret, etc).
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const css = `
      *,
      *::before,
      *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        caret-color: transparent !important;
      }
    `
    const inject = () => {
      const style = document.createElement('style')
      style.innerHTML = css
      ;(document.head || document.documentElement).appendChild(style)
    }
    if (document.head) inject()
    else document.addEventListener('DOMContentLoaded', inject, { once: true })
  })

  await page.goto(path, { waitUntil: 'networkidle' })

  const html = page.locator('html')
  if (theme === 'dark') {
    await expect(html).toHaveClass(/dark/)
  } else {
    await expect(html).not.toHaveClass(/dark/)
  }

  // Ensure fonts have settled before screenshot.
  await page.evaluate(async () => {
    // @ts-expect-error - FontFaceSet exists in modern browsers.
    if (document.fonts?.ready) await document.fonts.ready
  })
}
