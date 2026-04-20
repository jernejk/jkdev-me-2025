import { expect, test } from 'playwright/test'

test.describe('Middleware behaviour', () => {
  test('/about-me-test returns 410 Gone with noindex', async ({ request }) => {
    const resp = await request.get('/about-me-test', { maxRedirects: 0 })
    expect(resp.status()).toBe(410)
    expect(resp.headers()['x-robots-tag']).toContain('noindex')
  })

  test('/about-me-test/anything returns 410 Gone', async ({ request }) => {
    const resp = await request.get('/about-me-test/deep/path', { maxRedirects: 0 })
    expect(resp.status()).toBe(410)
  })

  test('Trailing slash on content path redirects 308 to no-slash', async ({ request }) => {
    const resp = await request.get('/blog/', { maxRedirects: 0 })
    expect(resp.status()).toBe(308)
    expect(resp.headers()['location']).toMatch(/\/blog(\?|$)/)
  })

  test('Root path is not redirected', async ({ request }) => {
    const resp = await request.get('/', { maxRedirects: 0 })
    expect(resp.status()).toBe(200)
  })

  test('.well-known path keeps trailing slash (not redirected)', async ({ request }) => {
    // This path may 404 (no handler) but should not redirect away from trailing slash.
    const resp = await request.get('/.well-known/security.txt/', { maxRedirects: 0 })
    expect(resp.status()).not.toBe(308)
  })
})

test.describe('Blog listing (/blog)', () => {
  test('renders posts and pagination', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { name: 'All Posts' })).toBeVisible()
    // At least one post link should be present.
    const links = page.locator('article a[href^="/blog/"]')
    await expect(links.first()).toBeVisible()
  })

  test('/blog/page/2 shows a different slice than /blog', async ({ page }) => {
    await page.goto('/blog')
    const firstTitleOnPage1 = await page.locator('article h2, article h3').first().textContent()

    await page.goto('/blog/page/2')
    const firstTitleOnPage2 = await page.locator('article h2, article h3').first().textContent()

    expect(firstTitleOnPage1).toBeTruthy()
    expect(firstTitleOnPage2).toBeTruthy()
    expect(firstTitleOnPage1).not.toEqual(firstTitleOnPage2)
  })
})

test.describe('Blog markdown mirror (/blog-md/<slug>)', () => {
  test('returns markdown content for a real post', async ({ request }) => {
    const resp = await request.get('/blog-md/angular-to-seq')
    expect(resp.status()).toBe(200)
    expect(resp.headers()['content-type']).toContain('text/markdown')
    const body = await resp.text()
    expect(body).toMatch(/^# /m) // starts with a markdown heading
    expect(body).toMatch(/URL: https?:\/\//) // includes URL line
  })

  test('returns 404 for unknown slug', async ({ request }) => {
    const resp = await request.get('/blog-md/not-a-real-post-xyz')
    expect(resp.status()).toBe(404)
  })
})
