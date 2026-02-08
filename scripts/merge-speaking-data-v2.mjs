#!/usr/bin/env node

/**
 * Merge speaking data from multiple sources:
 * 1. data/talks/mvp-contributions.json - MVP activity data
 * 2. data/talks/legacy-talks.json - Historical talks from jkdev.me
 * 3. data/talks/sessionize.json - Live Sessionize data
 * 4. data/talks/manual-talks.json - Manually curated upcoming talks
 *
 * Outputs merged data to data/speakingData.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// File paths
const TALKS_DIR = path.join(__dirname, '../data/talks')
const MVP_PATH = path.join(TALKS_DIR, 'mvp-contributions.json')
const LEGACY_PATH = path.join(TALKS_DIR, 'jkdev-legacy.json')
const SESSIONIZE_PATH = path.join(TALKS_DIR, 'sessionize.json')
const MANUAL_PATH = path.join(TALKS_DIR, 'manual-talks.json')
const OUTPUT_PATH = path.join(__dirname, '../data/speakingData.json')

console.log('🔄 Merging speaking data from multiple sources...\n')

// Load source files
function loadSourceFile(filePath, sourceName) {
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(rawData)
    console.log(
      `✅ Loaded ${sourceName}: ${data.talks?.length || data.activities?.length || data.contributions?.length || 0} items`
    )
    return data
  } catch (error) {
    console.log(`⚠️  Could not load ${sourceName}: ${error.message}`)
    return null
  }
}

const mvpData = loadSourceFile(MVP_PATH, 'MVP contributions')
const legacyData = loadSourceFile(LEGACY_PATH, 'Legacy talks')
const sessionizeData = loadSourceFile(SESSIONIZE_PATH, 'Sessionize data')
const manualData = loadSourceFile(MANUAL_PATH, 'Manual talks')

// Normalize titles for comparison (remove emojis, special chars, lowercase)
function normalizeTitle(title) {
  return title
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim()
}

// Check if two talks are similar enough to merge
function areTalksSimilar(talk1Title, talk2Title) {
  const norm1 = normalizeTitle(talk1Title)
  const norm2 = normalizeTitle(talk2Title)

  // Exact match after normalization
  if (norm1 === norm2) return true

  // Check if one contains the other (for shortened titles)
  if (norm1.length > 20 && norm2.length > 20) {
    const shorter = norm1.length < norm2.length ? norm1 : norm2
    const longer = norm1.length < norm2.length ? norm2 : norm1
    if (longer.includes(shorter) && shorter.length / longer.length > 0.7) {
      return true
    }
  }

  return false
}

// Generate unique ID from title
function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Merge talks with duplicate detection
function mergeTalks() {
  const mergedTalks = []
  const seenTitles = new Map() // Map normalized title to index in mergedTalks

  // Helper to add or merge a talk
  function addOrMergeTalk(talk, source) {
    const normalizedTitle = normalizeTitle(talk.title)

    // Check if we've seen a similar talk
    let existingIndex = -1
    for (const [seenTitle, index] of seenTitles.entries()) {
      if (areTalksSimilar(talk.title, mergedTalks[index].title)) {
        existingIndex = index
        break
      }
    }

    if (existingIndex >= 0) {
      // Merge with existing talk
      const existing = mergedTalks[existingIndex]
      console.log(`  ↔️  Merging "${talk.title}" from ${source}`)

      // Merge events
      if (talk.events) {
        for (const newEvent of talk.events) {
          const hasEvent = existing.events.some(
            (e) => e.eventName === newEvent.eventName && e.date === newEvent.date
          )
          if (!hasEvent) {
            existing.events.push(newEvent)
            console.log(`    ➕ Added event: ${newEvent.eventName}`)
          }
        }
      }

      // Merge fields (prefer non-null values)
      if (talk.description && !existing.description) existing.description = talk.description
      if (talk.videoUrl && !existing.videoUrl) existing.videoUrl = talk.videoUrl
      if (talk.slidesUrl && !existing.slidesUrl) existing.slidesUrl = talk.slidesUrl
      if (talk.githubUrl && !existing.githubUrl) existing.githubUrl = talk.githubUrl
      if (talk.conferenceUrl && !existing.conferenceUrl) existing.conferenceUrl = talk.conferenceUrl

      // Merge tags
      if (talk.tags) {
        existing.tags = [...new Set([...existing.tags, ...talk.tags])]
      }
    } else {
      // Add as new talk
      console.log(`  ➕ Adding new talk "${talk.title}" from ${source}`)
      const newTalk = {
        id: talk.id || generateId(talk.title),
        title: talk.title,
        description: talk.description || '',
        type: talk.type || 'talk',
        groupName: talk.groupName || null,
        events: talk.events || [],
        tags: talk.tags || [],
        videoUrl: talk.videoUrl || null,
        slidesUrl: talk.slidesUrl || null,
        githubUrl: talk.githubUrl || null,
        conferenceUrl: talk.conferenceUrl || null,
      }
      mergedTalks.push(newTalk)
      seenTitles.set(normalizedTitle, mergedTalks.length - 1)
    }
  }

  // Process legacy talks first (most complete data)
  if (legacyData?.talks) {
    console.log('\n📊 Processing legacy talks...')
    for (const talk of legacyData.talks) {
      addOrMergeTalk(talk, 'legacy')
    }
  }

  // Process Sessionize data
  if (sessionizeData?.talks) {
    console.log('\n📊 Processing Sessionize data...')
    for (const talk of sessionizeData.talks) {
      addOrMergeTalk(talk, 'Sessionize')
    }
  }

  // Process MVP activities (convert to talk format)
  if (mvpData?.activities || mvpData?.contributions) {
    console.log('\n📊 Processing MVP contributions...')
    const items = mvpData.contributions || mvpData.activities
    for (const activity of items) {
      if (!activity.title || activity.title === '[GDPR Delete]') continue

      // New format already matches talk structure
      if (activity.events && Array.isArray(activity.events)) {
        addOrMergeTalk(activity, 'MVP')
        continue
      }

      // Old MVP format - convert to talk format
      const talk = {
        title: activity.title,
        description: activity.description,
        events: [], // Old MVP data doesn't have detailed event info
        tags: activity.technologyFocusArea ? [activity.technologyFocusArea] : [],
        videoUrl: activity.url && activity.url.includes('youtube') ? activity.url : null,
        conferenceUrl: activity.url && !activity.url.includes('youtube') ? activity.url : null,
      }

      addOrMergeTalk(talk, 'MVP')
    }
  }

  // Process manually curated talks last (highest priority for local overrides)
  if (manualData?.talks) {
    console.log('\n📊 Processing manual talks...')
    for (const talk of manualData.talks) {
      addOrMergeTalk(talk, 'manual')
    }
  }

  return mergedTalks
}

// Validate and enhance data
function validateAndEnhance(talks) {
  console.log('\n🔍 Validating and enhancing data...')

  for (const talk of talks) {
    // Ensure all required fields exist
    talk.id = talk.id || generateId(talk.title)
    talk.type = talk.type || 'talk'
    talk.tags = talk.tags || []
    talk.events = talk.events || []

    // Ensure all link fields exist
    talk.videoUrl = talk.videoUrl || null
    talk.slidesUrl = talk.slidesUrl || null
    talk.githubUrl = talk.githubUrl || null
    talk.conferenceUrl = talk.conferenceUrl || null

    // Determine groupName if multiple events
    if (talk.events.length > 1 && !talk.groupName) {
      talk.groupName = `${talk.id}-group`
    } else if (talk.events.length <= 1) {
      talk.groupName = null
    }

    // Sort events by date (newest first)
    talk.events.sort((a, b) => new Date(b.date) - new Date(a.date))

    // Update event status based on current date
    const now = new Date()
    for (const event of talk.events) {
      event.status = new Date(event.date) > now ? 'upcoming' : 'past'
    }
  }

  // Sort talks by most recent event date
  talks.sort((a, b) => {
    const aDate = a.events[0]?.date ? new Date(a.events[0].date) : new Date(0)
    const bDate = b.events[0]?.date ? new Date(b.events[0].date) : new Date(0)
    return bDate - aDate
  })

  console.log(`✅ Validated ${talks.length} talks`)
  return talks
}

// Main execution
try {
  const mergedTalks = mergeTalks()
  const validatedTalks = validateAndEnhance(mergedTalks)

  const output = {
    talks: validatedTalks,
  }

  // Write merged data
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))

  console.log(`\n✨ Successfully merged data to ${OUTPUT_PATH}`)
  console.log(`   Total talks: ${validatedTalks.length}`)
  console.log(`   Total events: ${validatedTalks.reduce((sum, t) => sum + t.events.length, 0)}`)

  // Show summary by type
  const byType = validatedTalks.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1
    return acc
  }, {})

  console.log('\n📊 Summary by type:')
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`)
  })
} catch (error) {
  console.error('\n❌ Error:', error.message)
  console.error(error.stack)
  process.exit(1)
}
