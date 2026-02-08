#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import process from 'process'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const reportDir = path.resolve(rootDir, '.tmp', 'ui-review')

const port = Number(process.env.UI_REVIEW_PORT || 4010)
const baseUrl = process.env.UI_REVIEW_URL || `http://127.0.0.1:${port}`
const startServer = !process.env.UI_REVIEW_URL

fs.mkdirSync(reportDir, { recursive: true })

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const desktopPath = path.join(reportDir, `homepage-desktop-${timestamp}.png`)
const mobilePath = path.join(reportDir, `homepage-mobile-${timestamp}.png`)
const reportPath = path.join(reportDir, `report-${timestamp}.md`)

let devServer = null

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer(url, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return true
    } catch {
      // Keep trying until timeout
    }
    await sleep(1000)
  }

  return false
}

function startDevServer() {
  devServer = spawn('yarn', ['dev', '--port', String(port)], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })

  devServer.stdout?.on('data', () => {})
  devServer.stderr?.on('data', () => {})
}

function stopDevServer() {
  if (!devServer) return
  devServer.kill('SIGTERM')
}

function renderReport(metrics) {
  const issues = []

  if (metrics.postCardCount < 3) {
    issues.push('- Increase above-the-fold post density (fewer empty vertical gaps).')
  }
  if (!metrics.hasMainLandmark) {
    issues.push('- Add a `<main>` landmark for accessibility and better structure.')
  }
  if (metrics.readMoreLinks === 0) {
    issues.push('- Add explicit post CTA links (read more / view all).')
  }

  if (issues.length === 0) {
    issues.push('- No obvious structural issues detected from this automated pass.')
  }

  return `# UI Review Report

- URL: ${baseUrl}
- Generated: ${new Date().toISOString()}
- Desktop screenshot: \`${desktopPath}\`
- Mobile screenshot: \`${mobilePath}\`

## Metrics

- H1 text: ${metrics.h1Text || '(none)'}
- Post cards on homepage: ${metrics.postCardCount}
- Has \`<main>\` landmark: ${metrics.hasMainLandmark}
- Primary CTA links found: ${metrics.readMoreLinks}

## Suggestions

${issues.join('\n')}
`
}

try {
  if (startServer) {
    console.log(`Starting Next dev server on port ${port}...`)
    startDevServer()
    const ready = await waitForServer(baseUrl)
    if (!ready) {
      throw new Error(`Timed out waiting for ${baseUrl}`)
    }
  }

  const browser = await chromium.launch()

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 2200 } })
  await desktop.goto(baseUrl, { waitUntil: 'networkidle' })
  await desktop.screenshot({ path: desktopPath, fullPage: true })

  const metrics = await desktop.evaluate(() => {
    const postCards = document.querySelectorAll('main article').length
    const readLinks = Array.from(document.querySelectorAll('a')).filter((a) => {
      const text = a.textContent?.toLowerCase() || ''
      return text.includes('read') || text.includes('view all')
    }).length

    return {
      h1Text: document.querySelector('h1')?.textContent?.trim() || '',
      postCardCount: postCards,
      hasMainLandmark: !!document.querySelector('main'),
      readMoreLinks: readLinks,
    }
  })

  const mobile = await browser.newPage({ viewport: { width: 430, height: 2200 } })
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' })
  await mobile.screenshot({ path: mobilePath, fullPage: true })

  await browser.close()

  const report = renderReport(metrics)
  fs.writeFileSync(reportPath, report, 'utf8')

  console.log(`Desktop screenshot: ${desktopPath}`)
  console.log(`Mobile screenshot: ${mobilePath}`)
  console.log(`Report: ${reportPath}`)
} catch (error) {
  console.error(`UI review failed: ${error.message}`)
  process.exitCode = 1
} finally {
  stopDevServer()
}
