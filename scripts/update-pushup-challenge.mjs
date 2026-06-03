#!/usr/bin/env node
/**
 * Generate data/pushupChallenge.json for the /now page.
 *
 * JK is doing The Push-Up Challenge (thepushupchallenge.com.au) for The Push for
 * Better Foundation, substituting 8kg dumbbell curls (8kg plates + 0.5kg handle =
 * 8.5kg per rep) for push-ups. This script turns the raw curl log into a fun stats
 * blob: total kg lifted, heaviest single set, most active day, progress, and
 * playful "what does that weigh" comparisons.
 *
 * Data sources:
 *   - Per-set granularity (heaviest set, most active day, true total reps) comes
 *     from the LOCAL curl log JSONL. Path via --log or PUSHUP_LOG env, default is
 *     JK's tracker file. Each line: {"ts","date","reps","note"}.
 *   - Fundraising + official progress (raised, goal, banked reps, rep target) come
 *     from the public fundraiser page. Pass them as flags (a scheduled routine
 *     WebFetches the page and passes the numbers); falls back to the previous
 *     JSON's values when a flag is omitted so a missing fetch never wipes data.
 *
 * Usage:
 *   node scripts/update-pushup-challenge.mjs \
 *     --raised 35 --goal 500 --official-reps 50 --target 1654 [--today 2026-06-03]
 *
 * Everything is best-effort: a missing log or missing flags degrades gracefully
 * rather than throwing, so the scheduled routine can always produce a file.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')

const KG_PER_REP = 8.5 // 8kg plates + 0.5kg handle
const CHALLENGE_END = '2026-06-26'
const FUNDRAISER_URL =
  'https://www.thepushupchallenge.com.au/fundraisers/jernejkavka/the-push-up-challenge'
const TEAM_URL = 'https://www.thepushupchallenge.com.au/fundraisers/ssw'
const CHALLENGE_URL = 'https://www.thepushupchallenge.com.au'

const DEFAULT_LOG = path.join(
  os.homedir(),
  'Developer/personal/health/challenges/pushup-challenge-2026/log.jsonl'
)
const OUT = path.join(REPO_ROOT, 'data', 'pushupChallenge.json')

// Ascending ladder of recognisable weights for the "that's about..." gag.
// Kept Aussie-flavoured and family friendly. kg = weight of ONE of the thing.
const WEIGHT_LADDER = [
  { kg: 6, one: 'a bowling ball', emoji: '🎳' },
  { kg: 12, one: 'a car tyre', emoji: '🛞' },
  { kg: 30, one: 'a sack of spuds', emoji: '🥔' },
  { kg: 70, one: 'an average human', emoji: '🧍' },
  { kg: 90, one: 'a big red kangaroo', emoji: '🦘' },
  { kg: 250, one: 'a grand piano', emoji: '🎹' },
  { kg: 450, one: 'a polar bear', emoji: '🐻‍❄️' },
  { kg: 600, one: 'a racehorse', emoji: '🐎' },
  { kg: 1000, one: 'a small car', emoji: '🚗' },
  { kg: 1400, one: 'a Toyota Corolla', emoji: '🚗' },
  { kg: 2300, one: 'a hippo', emoji: '🦛' },
  { kg: 4000, one: 'an African elephant', emoji: '🐘' },
  { kg: 7000, one: 'a T. rex', emoji: '🦖' },
  { kg: 12000, one: 'a double-decker bus', emoji: '🚌' },
  { kg: 30000, one: 'a humpback whale', emoji: '🐋' },
]

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) {
        out[key] = true
      } else {
        out[key] = next
        i++
      }
    }
  }
  return out
}

function num(v) {
  if (v === undefined || v === null || v === true || v === '') return undefined
  const n = Number(String(v).replace(/[, $]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

function readLog(logPath) {
  if (!logPath || !fs.existsSync(logPath)) return []
  const rows = []
  for (const line of fs.readFileSync(logPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t) continue
    try {
      rows.push(JSON.parse(t))
    } catch {
      /* skip malformed line */
    }
  }
  return rows
}

function loadPrev() {
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8'))
  } catch {
    return null
  }
}

function fmtKg(kg) {
  if (kg >= 1000) {
    const t = kg / 1000
    return `${t >= 10 ? Math.round(t) : t.toFixed(t >= 1 ? 2 : 1)} t`
  }
  return `${Math.round(kg)} kg`
}

/** Pick the best ladder comparison for a weight in kg. */
function compare(kg) {
  if (kg <= 0) return null
  // Largest object that fits at least once.
  let pick = WEIGHT_LADDER[0]
  for (const item of WEIGHT_LADDER) {
    if (item.kg <= kg) pick = item
    else break
  }
  const mult = kg / pick.kg
  if (kg < WEIGHT_LADDER[0].kg) {
    return `nearly ${WEIGHT_LADDER[0].one} ${WEIGHT_LADDER[0].emoji}`
  }
  if (mult < 1.6) return `about ${pick.one} ${pick.emoji}`
  return `${Math.round(mult)}× ${pick.one} ${pick.emoji}`
}

function daysBetween(a, b) {
  const ms = new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()
  return Math.round(ms / 86400000)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const prev = loadPrev() || {}
  const today = typeof args.today === 'string' ? args.today : new Date().toISOString().slice(0, 10)
  const logPath = typeof args.log === 'string' ? args.log : process.env.PUSHUP_LOG || DEFAULT_LOG

  const rows = readLog(logPath)

  // Aggregate per-set log into totals.
  let totalReps = 0
  let maxSet = 0
  const byDay = {}
  for (const r of rows) {
    const reps = Number(r.reps) || 0
    totalReps += reps
    if (reps > maxSet) maxSet = reps
    if (r.date) byDay[r.date] = (byDay[r.date] || 0) + reps
  }

  // Most active day (ties → most recent).
  let mostActive = null
  for (const [date, reps] of Object.entries(byDay)) {
    if (
      !mostActive ||
      reps > mostActive.reps ||
      (reps === mostActive.reps && date > mostActive.date)
    ) {
      mostActive = { date, reps }
    }
  }

  // Public-page numbers: use flags, else keep previous run's values.
  const raised = num(args.raised) ?? prev.fundraising?.raised ?? 0
  const goal = num(args.goal) ?? prev.fundraising?.goal ?? 500
  const officialReps = num(args['official-reps']) ?? prev.reps?.officialBanked ?? 0
  const target = num(args.target) ?? prev.reps?.target ?? 0

  // Lifting stats are driven by the local log (what JK actually did); fall back to
  // the official banked count if the log isn't reachable (e.g. fresh checkout).
  const repsForKg = totalReps > 0 ? totalReps : officialReps
  const totalKg = Math.round(repsForKg * KG_PER_REP)
  const maxSetKg = Math.round(maxSet * KG_PER_REP)

  const daysLeft = Math.max(0, daysBetween(today, CHALLENGE_END))
  const repProgress = target > 0 ? Math.min(100, Math.round((officialReps / target) * 100)) : null
  const dollarProgress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null

  const tonnes = totalKg / 1000
  const data = {
    updated: today,
    challenge: {
      name: 'The Push-Up Challenge',
      cause: 'The Push for Better Foundation (mental health)',
      endDate: CHALLENGE_END,
      daysLeft,
      substitution: '8kg dumbbell curls (8.5kg/rep) instead of push-ups',
    },
    reps: {
      total: totalReps,
      heaviestSet: maxSet,
      officialBanked: officialReps,
      target,
      progressPct: repProgress,
    },
    kg: {
      perRep: KG_PER_REP,
      total: totalKg,
      display: fmtKg(totalKg),
      heaviestSet: maxSetKg,
      heaviestSetDisplay: fmtKg(maxSetKg),
    },
    mostActiveDay: mostActive
      ? {
          date: mostActive.date,
          reps: mostActive.reps,
          kg: Math.round(mostActive.reps * KG_PER_REP),
          kgDisplay: fmtKg(Math.round(mostActive.reps * KG_PER_REP)),
        }
      : null,
    fundraising: {
      raised,
      goal,
      currency: 'AUD',
      progressPct: dollarProgress,
    },
    fun: {
      totalLine:
        totalKg > 0
          ? `${fmtKg(totalKg)} hoisted so far — ${compare(totalKg)}`
          : 'no reps banked yet — the dumbbell is lonely',
      heaviestLine:
        maxSet > 0 ? `${maxSet} reps in one go = ${fmtKg(maxSetKg)} (${compare(maxSetKg)})` : null,
      tonneOfFun: tonnes >= 1,
      tonneLine:
        tonnes >= 1
          ? `That's ${tonnes.toFixed(tonnes >= 10 ? 0 : 2)} tonnes — officially a tonne of fun. 🎉`
          : `${fmtKg(1000 - totalKg)} to go before it's literally a tonne of fun.`,
    },
    links: {
      fundraiser: FUNDRAISER_URL,
      team: TEAM_URL,
      challenge: CHALLENGE_URL,
    },
  }

  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n')
  console.log(`Wrote ${path.relative(REPO_ROOT, OUT)}`)
  console.log(`  reps: ${totalReps} (official banked ${officialReps}/${target || '?'})`)
  console.log(`  lifted: ${fmtKg(totalKg)} — ${compare(totalKg)}`)
  console.log(`  heaviest set: ${maxSet} reps = ${fmtKg(maxSetKg)}`)
  if (mostActive) console.log(`  most active day: ${mostActive.date} (${mostActive.reps} reps)`)
  console.log(`  raised: $${raised}/$${goal}  •  ${daysLeft} days left`)
  if (rows.length === 0) {
    console.warn(`  (note: no local log found at ${logPath} — used official banked count)`)
  }
}

main()
