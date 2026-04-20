import { expect, test } from 'playwright/test'

const pagesThatMustHydrateCleanly: { name: string; path: string }[] = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'blog', path: '/blog' },
  { name: 'blog post', path: '/blog/angular-to-seq' },
  { name: 'tags', path: '/tags' },
  { name: 'speaking', path: '/speaking' },
]

// MobileNav lives in the layout, so a hydration regression here would hit every
// page. React regenerates the subtree client-side when this fires, which hurts
// LCP/TTI and makes Core Web Vitals unstable.
test.describe('Hydration', () => {
  for (const { name, path } of pagesThatMustHydrateCleanly) {
    test(`${name} (${path}) hydrates without page errors`, async ({ page }) => {
      const pageErrors: string[] = []
      page.on('pageerror', (err) => pageErrors.push(String(err)))

      await page.goto(path, { waitUntil: 'networkidle' })

      const hydrationFailures = pageErrors.filter((err) =>
        /Hydration failed|hydration mismatch|server rendered HTML didn't match/i.test(err)
      )
      expect(
        hydrationFailures,
        `hydration errors on ${path}:\n${hydrationFailures.join('\n\n')}`
      ).toEqual([])
    })
  }
})
