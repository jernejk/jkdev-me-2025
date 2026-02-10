import { expect, test } from 'playwright/test'
import { gotoWithTheme, Theme } from './utils'

const majorPages: { name: string; path: string; fullPage?: boolean }[] = [
  { name: 'home', path: '/', fullPage: true },
  { name: 'about', path: '/about', fullPage: true },
  { name: 'blog', path: '/blog', fullPage: true },
  // Representative post.
  { name: 'post-angular-to-seq', path: '/blog/angular-to-seq', fullPage: true },
  { name: 'tags', path: '/tags', fullPage: true },
  { name: 'tag-ai', path: '/tags/ai', fullPage: true },
  // Speaking can be extremely long; capture the top plus key sections.
  { name: 'speaking', path: '/speaking', fullPage: false },
  { name: 'projects', path: '/projects', fullPage: true },
  { name: 'community', path: '/community', fullPage: true },
  { name: 'now', path: '/now', fullPage: true },
]

const themes: Theme[] = ['light', 'dark']

function screenshotName(testName: string, theme: Theme) {
  return `${testName.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()}-${theme}.png`
}

test.describe('Capture major pages', () => {
  for (const theme of themes) {
    test.describe(theme, () => {
      for (const { name, path, fullPage = true } of majorPages) {
        test(`${name} ${path}`, async ({ page }, testInfo) => {
          const consoleErrors: string[] = []
          const pageErrors: string[] = []
          const sameOrigin404s: string[] = []

          const baseURL =
            (testInfo.project.use as { baseURL?: string } | undefined)?.baseURL ||
            (testInfo.config.use as { baseURL?: string } | undefined)?.baseURL ||
            'http://localhost'
          const origin = new URL(baseURL).origin

          page.on('console', (msg) => {
            if (msg.type() !== 'error') return
            const text = msg.text()
            // Chromium sometimes emits a generic console error for external 404s (e.g. favicons).
            if (text.startsWith('Failed to load resource: the server responded with a status of 404')) {
              return
            }
            consoleErrors.push(text)
          })
          page.on('pageerror', (err) => pageErrors.push(String(err)))
          page.on('response', (resp) => {
            if (resp.status() !== 404) return
            const url = resp.url()
            if (url.startsWith(origin)) sameOrigin404s.push(url)
          })

          await gotoWithTheme(page, path, theme)

          await expect(page.locator('main')).toBeVisible()

          // Catch layout regressions that push content wider than the viewport.
          const hasHorizontalOverflow = await page.evaluate(() => {
            const doc = document.documentElement
            return doc.scrollWidth > doc.clientWidth + 2
          })
          expect(hasHorizontalOverflow, 'horizontal overflow detected').toBeFalsy()

          // Ensure directory exists by writing the screenshot first.
          const mainShotPath = testInfo.outputPath('screenshots', screenshotName(name, theme))
          await page.screenshot({
            path: mainShotPath,
            fullPage,
          })
          await testInfo.attach(`screenshot-${name}-${theme}`, {
            path: mainShotPath,
            contentType: 'image/png',
          })

          // Extra speaking section captures (top only screenshot is not enough).
          if (name === 'speaking') {
            const upcoming = page.getByRole('heading', { name: /Upcoming Talks/i })
            if (await upcoming.count()) {
              await upcoming.scrollIntoViewIfNeeded()
              await page.waitForTimeout(250)
              const p = testInfo.outputPath('screenshots', screenshotName('speaking-upcoming', theme))
              await page.screenshot({
                path: p,
                fullPage: false,
              })
              await testInfo.attach(`screenshot-speaking-upcoming-${theme}`, {
                path: p,
                contentType: 'image/png',
              })
            }

            const past = page.getByRole('heading', { name: /Past Talks/i })
            if (await past.count()) {
              await past.scrollIntoViewIfNeeded()
              await page.waitForTimeout(250)
              const p = testInfo.outputPath('screenshots', screenshotName('speaking-past', theme))
              await page.screenshot({
                path: p,
                fullPage: false,
              })
              await testInfo.attach(`screenshot-speaking-past-${theme}`, {
                path: p,
                contentType: 'image/png',
              })
            }
          }

          // Keep these last so you still get screenshots even if something fails.
          expect(pageErrors, `page errors on ${path}`).toEqual([])
          expect(sameOrigin404s, `same-origin 404s on ${path}`).toEqual([])
          expect(consoleErrors, `console errors on ${path}`).toEqual([])
        })
      }
    })
  }
})
