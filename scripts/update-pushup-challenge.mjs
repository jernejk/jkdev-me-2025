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
// Positive mechanical work per rep ≈ mass × g × lift-height. JK is doing these
// standing from low hang to face height, so use double the earlier sitting range.
const GRAVITY = 9.81 // m/s²
const LIFT_HEIGHT_M = 0.8 // rough standing curl range of motion
const HUMAN_CONCENTRIC_EFFICIENCY = 0.2 // middle estimate for human muscle efficiency while lifting
const CONTROLLED_LOWERING_COST_RATIO = 0.5 // slow eccentric lowering, high end of the 0.3-0.5 range
const WORKOUT_BURN_ROUNDING_KJ = 50
const KJ_PER_FOOD_CALORIE = 4.184
const J_PER_REP = KG_PER_REP * GRAVITY * LIFT_HEIGHT_M // ≈ 66.7 J
const KJ_PER_CUPPA = 84 // boil a 250 ml cup of tea from room temp (~84 kJ)
const CHALLENGE_END = '2026-06-26'
const CHALLENGE_START = '2026-06-03'

// Each entry is a fn(kjDisplay, kj) → string. Cycled daily by day-of-challenge index.
const WORK_LINE_POOL = [
  (kjDisplay) => `Mechanical lift work: ${kjDisplay} added to the dumbbell on the way up. 📈`,
  (kjDisplay) =>
    `Mechanical lift work: ${kjDisplay}. The downward half gets counted in the human burn. 🧾`,
  (kjDisplay) =>
    `Mechanical lift work: ${kjDisplay}; gravity was consulted and remains unimpressed. ⚖️`,
  (kjDisplay) =>
    `Mechanical lift work: ${kjDisplay}. Science still refuses to rename joules to JKs. 🔬`,
  (kjDisplay) =>
    `Mechanical lift work: ${kjDisplay}; the dumbbell got the clean physics version. 🏋️`,
  (kjDisplay, kj) =>
    `Mechanical lift work: ${kjDisplay}. In more relatable units: ${Math.round(kj)} JK. 🤓`,
  (kjDisplay) => `Mechanical lift work: ${kjDisplay}; thermodynamics filed the paperwork. 🌡️`,
  (kjDisplay) =>
    `Mechanical lift work: ${kjDisplay}, before biology adds lifting and lowering overhead. 🏆`,
  (kjDisplay) => `Mechanical lift work: ${kjDisplay} logged for the upward part of the curl. 🔋`,
  (kjDisplay) =>
    `Mechanical lift work: ${kjDisplay}. The inbox remains non-mechanical and unhelpful. 📧`,
  (kjDisplay) =>
    `Mechanical lift work: ${kjDisplay}; the rest is heat, control, and stubbornness. 😤`,
  (kjDisplay) => `Mechanical lift work: ${kjDisplay}, arm by arm, rep by rep, kJ by JK. 💪`,
]

// Each entry is a fn(tonneDisplay) → string. Only shown when total >= 1 tonne.
const TONNE_LINE_POOL = [
  (t) => `That's ${t} tonnes — officially a tonne of fun. 🎉`,
  (t) => `${t} tonnes lifted — the challenge didn't say they had to be push-ups. 😏`,
  (t) => `${t} tonnes! At this point the dumbbell knows JK by name. 🤝`,
  (t) => `${t} tonnes of iron, one rep at a time. Not bad for a push-up challenge. 💪`,
  (t) => `${t} tonnes — JK's arms now qualify as heavy infrastructure. 🏗️`,
  (t) => `${t} tonnes. That's not fitness anymore, that's geology. 🪨`,
  (t) => `${t} tonnes hoisted — and somehow JK's shirt still fits. 👕`,
  (t) => `${t} tonnes of curl action. The push-up challenge never stood a chance. 🎯`,
  (t) => `${t} tonnes. The gym floor has concerns; the biceps do not. 🏋️`,
  (t) => `${t} tonnes. JK came here to do push-ups and accidentally became a powerlifter. 🦾`,
]
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

function roundTo(n, step) {
  return Math.round(n / step) * step
}

function fmtKj(kj) {
  if (kj >= 1000) return `${(kj / 1000).toFixed(kj >= 10000 ? 0 : 1)} MJ`
  return `${Math.round(kj).toLocaleString('en-AU')} kJ`
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
  const target = num(args.target) ?? prev.reps?.target ?? 0

  // The curl log is the source of truth for reps actually done — JK might forget to
  // bank them on the challenge website, so we don't trust the site's count. The
  // --official-reps flag (and last run's value) is only a fallback for when the log
  // can't be reached (e.g. Drive read failed on a remote run).
  const fallbackReps = num(args['official-reps']) ?? prev.reps?.officialBanked ?? 0
  const repsDone = totalReps > 0 ? totalReps : fallbackReps
  const totalKg = Math.round(repsDone * KG_PER_REP)
  const maxSetKg = Math.round(maxSet * KG_PER_REP)

  const daysLeft = Math.max(0, daysBetween(today, CHALLENGE_END))
  const daysSince = Math.max(0, daysBetween(CHALLENGE_START, today))
  const repProgress = target > 0 ? Math.min(100, Math.round((repsDone / target) * 100)) : null
  const dollarProgress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null

  const tonnes = totalKg / 1000

  // Positive mechanical work on the dumbbell during the upward half of each curl.
  const totalJ = Math.round(repsDone * J_PER_REP)
  const totalKj = totalJ / 1000
  const kjDisplay = totalKj >= 10 ? fmtKj(totalKj) : `${totalKj.toFixed(1)} kJ`
  const cuppaCount = totalKj / KJ_PER_CUPPA
  const cuppaPct = Math.round(cuppaCount * 100)
  const liftingBurnKjRaw = totalKj / HUMAN_CONCENTRIC_EFFICIENCY
  const loweringBurnKjRaw = liftingBurnKjRaw * CONTROLLED_LOWERING_COST_RATIO
  const liftingBurnKj = roundTo(liftingBurnKjRaw, WORKOUT_BURN_ROUNDING_KJ)
  const loweringBurnKj = roundTo(loweringBurnKjRaw, WORKOUT_BURN_ROUNDING_KJ)
  const workoutBurnKj = liftingBurnKj + loweringBurnKj
  const workoutBurnCalories = Math.round(workoutBurnKj / KJ_PER_FOOD_CALORIE)
  const workoutBurnDisplay = fmtKj(workoutBurnKj)
  const teaLine =
    totalKj >= KJ_PER_CUPPA
      ? `lift work could boil ${cuppaCount.toFixed(1)} mugs of tea; with controlled lowering, body burn is more like ${(
          workoutBurnKj / KJ_PER_CUPPA
        ).toFixed(1)} mugs ☕`
      : `lift work would be ${cuppaPct}% of one mug of tea; with controlled lowering, body burn is more like ${(
          workoutBurnKj / KJ_PER_CUPPA
        ).toFixed(1)} mugs ☕`

  const data = {
    updated: today,
    challenge: {
      name: 'The Push-Up Challenge',
      cause: 'The Push for Better Foundation (mental health)',
      endDate: CHALLENGE_END,
      daysLeft,
      substitution: 'standing 8kg dumbbell curls (8.5kg/rep) instead of push-ups',
    },
    reps: {
      total: repsDone,
      done: repsDone,
      heaviestSet: maxSet,
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
          ? TONNE_LINE_POOL[daysSince % TONNE_LINE_POOL.length](
              tonnes.toFixed(tonnes >= 10 ? 0 : 2)
            )
          : `${fmtKg(1000 - totalKg)} to go before it's literally a tonne of fun.`,
      workLine:
        totalJ > 0 ? WORK_LINE_POOL[daysSince % WORK_LINE_POOL.length](kjDisplay, totalKj) : null,
      burnLine:
        totalJ > 0
          ? `Estimated workout burn: ${workoutBurnDisplay} (~${workoutBurnCalories} kcal): ${fmtKj(liftingBurnKj)} lifting + ${fmtKj(loweringBurnKj)} controlled lowering.`
          : null,
      teaLine: totalJ > 0 ? teaLine : null,
    },
    work: {
      joulesPerRep: Math.round(J_PER_REP * 10) / 10,
      totalJ,
      kj: Math.round(totalKj * 100) / 100,
      kjDisplay,
      liftHeightM: LIFT_HEIGHT_M,
      cuppaPct,
      cuppaCount: Math.round(cuppaCount * 10) / 10,
      note: 'mass × gravity × ~0.8 m upward lift only; controlled descent is counted in workout burn',
    },
    workoutBurn: {
      kj: workoutBurnKj,
      kjDisplay: workoutBurnDisplay,
      kcal: workoutBurnCalories,
      liftingKj: liftingBurnKj,
      loweringKj: loweringBurnKj,
      concentricEfficiency: HUMAN_CONCENTRIC_EFFICIENCY,
      loweringCostRatio: CONTROLLED_LOWERING_COST_RATIO,
      roundingKj: WORKOUT_BURN_ROUNDING_KJ,
      note: 'lifting burn uses ~20% concentric efficiency; controlled lowering adds 50% of lifting burn, rounded to the nearest 50 kJ',
    },
    links: {
      fundraiser: FUNDRAISER_URL,
      team: TEAM_URL,
      challenge: CHALLENGE_URL,
    },
  }

  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n')
  console.log(`Wrote ${path.relative(REPO_ROOT, OUT)}`)
  console.log(`  reps: ${repsDone} done / ${target || '?'} target (log is source of truth)`)
  console.log(`  lifted: ${fmtKg(totalKg)} — ${compare(totalKg)}`)
  console.log(`  lift:   ${kjDisplay} (${cuppaCount.toFixed(1)} cuppas)`)
  console.log(`  burn:   ${workoutBurnDisplay} (~${workoutBurnCalories} kcal estimate)`)
  console.log(`  heaviest set: ${maxSet} reps = ${fmtKg(maxSetKg)}`)
  if (mostActive) console.log(`  most active day: ${mostActive.date} (${mostActive.reps} reps)`)
  console.log(`  raised: $${raised}/$${goal}  •  ${daysLeft} days left`)
  if (rows.length === 0) {
    console.warn(`  (note: no local log found at ${logPath} — used official banked count)`)
  }
}

main()
