#!/usr/bin/env node
/**
 * Fetch speaking data from Sessionize API and save to data/talks/sessionize.json
 * This data will be merged with other sources by merge-speaking-data.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SESSIONIZE_PROFILE_URL = 'https://sessionize.com/api/speaker/json/o0943azdh6'
const OUTPUT_PATH = join(__dirname, '../data/talks/sessionize.json')

async function fetchSessionizeData() {
  try {
    console.log('🔄 Fetching data from Sessionize...\n')
    const response = await fetch(SESSIONIZE_PROFILE_URL)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log(`✅ Fetched ${data.sessions?.length || 0} sessions from Sessionize`)
    console.log(`✅ Found ${data.events?.length || 0} events from Sessionize`)

    // Map Sessionize data to our format
    const talks = []

    // Add all sessions as talk abstracts (available talks)
    if (Array.isArray(data.sessions)) {
      for (const session of data.sessions) {
        const talk = {
          id: `sessionize-${session.id}`,
          title: session.title,
          description: session.description || '',
          type: session.title?.toLowerCase().includes('workshop') ? 'workshop' : 'talk',
          groupName: null,
          events: [], // Will be populated by specific event submissions
          tags: [],
          videoUrl: null,
          slidesUrl: null,
          githubUrl: null,
          conferenceUrl: session.sessionUrl || null,
        }

        talks.push(talk)
      }
    }

    // Add events as actual speaking engagements
    // Note: Sessionize speaker API doesn't link sessions to events,
    // so we'll add events separately and let the merge script handle it
    if (Array.isArray(data.events)) {
      for (const event of data.events) {
        const eventTalk = {
          id: `sessionize-event-${event.id}`,
          title: `Speaking at ${event.name}`,
          description: `Presented at ${event.name}`,
          type: 'talk',
          groupName: null,
          events: [
            {
              eventName: event.name,
              location: event.location || '',
              date: event.eventStartDate ? event.eventStartDate.split('T')[0] : undefined,
              dateEnd:
                event.eventEndDate && event.eventEndDate !== event.eventStartDate
                  ? event.eventEndDate.split('T')[0]
                  : undefined,
              url: event.website || '',
              status: new Date(event.eventStartDate) > new Date() ? 'upcoming' : 'past',
            },
          ],
          tags: [],
          videoUrl: null,
          slidesUrl: null,
          githubUrl: null,
          conferenceUrl: event.website || null,
        }

        talks.push(eventTalk)
      }
    }

    // Create output directory if it doesn't exist
    const outputDir = dirname(OUTPUT_PATH)
    try {
      mkdirSync(outputDir, { recursive: true })
    } catch (err) {
      // Directory already exists
    }

    // Save to sessionize.json
    const output = {
      source: 'Sessionize API',
      fetchedDate: new Date().toISOString(),
      totalTalks: talks.length,
      talks: talks,
    }

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8')

    console.log(`\n✨ Successfully saved ${talks.length} talks`)
    console.log(`📁 Saved to ${OUTPUT_PATH}`)
    console.log('\n💡 Run "npm run speaking:merge" to merge with other sources')
  } catch (error) {
    console.error('⚠️  Error fetching Sessionize data:', error.message)
    console.log('\n💡 Creating empty sessionize.json as fallback')

    // Create empty sessionize.json so merge doesn't fail
    const outputDir = dirname(OUTPUT_PATH)
    try {
      mkdirSync(outputDir, { recursive: true })
    } catch (err) {
      // Directory already exists
    }

    const emptyOutput = {
      source: 'Sessionize API (fetch failed)',
      fetchedDate: new Date().toISOString(),
      totalTalks: 0,
      talks: [],
      error: error.message,
    }

    writeFileSync(OUTPUT_PATH, JSON.stringify(emptyOutput, null, 2), 'utf-8')
    console.log(`📁 Saved empty file to ${OUTPUT_PATH}`)
    console.log('\n✅ Merge will use other sources (MVP + jkdev-legacy)')

    // Don't exit with error - allow pipeline to continue
    process.exit(0)
  }
}

fetchSessionizeData()
