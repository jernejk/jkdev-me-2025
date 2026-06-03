#!/usr/bin/env node
/**
 * Scrape live fundraising numbers for the Push-Up Challenge /now card and write
 * them to fundraising.json in Google Drive, where the remote routine reads them.
 *
 * Why a headless browser: the fundraiser site (Funraisin) 403s plain HTTP clients
 * like WebFetch (bot protection), but renders fine in a real browser. Run this
 * LOCALLY — a residential IP + a real Chromium gets through; datacenter IPs tend
 * to get challenged.
 *
 * Safe by design: if it can't parse the raised amount it leaves fundraising.json
 * untouched (keeps the last good values) rather than writing garbage. Any single
 * field it can't read falls back to the previous file's value.
 *
 * Usage:  node scripts/scrape-fundraising.mjs
 * Output: $PUSHUP_GDRIVE_DIR/fundraising.json  (default: the Drive pushup-challenge folder)
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const URL = 'https://www.thepushupchallenge.com.au/fundraisers/jernejkavka/the-push-up-challenge'
const GDRIVE_DIR =
  process.env.PUSHUP_GDRIVE_DIR ||
  path.join(
    os.homedir(),
    'Library/CloudStorage/GoogleDrive-zen.portal@gmail.com/My Drive/pushup-challenge'
  )
const OUT = path.join(GDRIVE_DIR, 'fundraising.json')

const toNum = (s) => (s ? Number(String(s).replace(/,/g, '')) : undefined)

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500) // let Funraisin render the totals

  const txt = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ')

  // Page renders: "... Raised $35 Goal $500 ... 1654 reps ..."
  const raised = toNum(
    (txt.match(/Raised\s+\$([\d,]+)\s+Goal/i) || txt.match(/\bRaised\s+\$([\d,]+)/i) || [])[1]
  )
  const goal = toNum((txt.match(/Goal\s+\$([\d,]+)/i) || [])[1])
  const target = toNum((txt.match(/([\d,]+)\s*reps/i) || [])[1])

  if (raised === undefined) {
    console.error('Could not parse raised amount — leaving fundraising.json untouched.')
    process.exit(1)
  }

  let prev = {}
  try {
    prev = JSON.parse(fs.readFileSync(OUT, 'utf8'))
  } catch {
    /* first run */
  }

  const data = {
    raised,
    goal: goal ?? prev.goal ?? 500,
    target: target ?? prev.target ?? 1654,
    _note: 'auto-scraped from the fundraiser page; reps come from log.jsonl, not here',
    _scrapedAt: new Date().toISOString(),
  }

  fs.mkdirSync(GDRIVE_DIR, { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n')
  console.log(`Wrote ${OUT}`)
  console.log(`  raised $${data.raised} / goal $${data.goal} / target ${data.target}`)
} finally {
  await browser.close()
}
