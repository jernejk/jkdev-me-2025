#!/usr/bin/env node

/**
 * Extract speaking activities from MVP Account Privacy Data
 * and save as distilled mvp-contributions.json
 *
 * This script sanitizes GDPR deletions and extracts only public-safe data
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MVP_DATA_PATH = path.join(__dirname, '../.private-data/MVP Account Privacy Data.json')
const OUTPUT_PATH = path.join(__dirname, '../data/talks/mvp-contributions.json')

console.log('🔄 Extracting MVP speaking contributions...\n')

// Load MVP data
let mvpData = null
try {
  const rawData = fs.readFileSync(MVP_DATA_PATH, 'utf-8')
  mvpData = JSON.parse(rawData)
  console.log('✅ Loaded MVP Account Privacy Data')
} catch (error) {
  console.error('❌ Could not load MVP data:', error.message)
  process.exit(1)
}

// Extract and sanitize speaking activities
function extractSpeakingActivities(mvpData) {
  if (!mvpData?.mostValuableProfessionalProgram?.activities) {
    return []
  }

  const speakingTypes = [
    'Speaker/Presenter at Third-party event',
    'Speaker/Presenter at Microsoft Event',
    'Speaker/Presenter for Event',
    'Workshop/Volunteer/Proctor',
    'Mentorship/Coaching',
  ]

  return mvpData.mostValuableProfessionalProgram.activities
    .filter((activity) => {
      // Filter out GDPR deleted entries
      if (activity.title === '[GDPR Delete]' || activity.description === '[GDPR Delete]') {
        return false
      }
      // Only include speaking-related activities
      return speakingTypes.some((type) => activity.activityTypeName?.includes(type))
    })
    .map((activity) => ({
      title: activity.title || '',
      description: activity.description || '',
      url: activity.url && activity.url.trim() !== '' && activity.url !== ' ' ? activity.url : null,
      dateCreated: activity.dateCreated || null,
      technologyFocusArea: activity.technologyFocusArea || null,
      activityType: activity.activityTypeName || null,
      targetAudience: activity.targetAudience || [],
      isHighImpact: activity.isHighImpact === 'True' || activity.isHighImpact === true,
      annualReach: activity.annualReach || 0,
    }))
    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)) // Sort by date descending
}

// Main execution
try {
  const activities = extractSpeakingActivities(mvpData)

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Save distilled data
  const output = {
    source: 'MVP Account Privacy Data',
    extractedDate: new Date().toISOString(),
    totalActivities: activities.length,
    activities: activities,
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))

  console.log(`\n✨ Successfully extracted ${activities.length} speaking activities`)
  console.log(`📁 Saved to ${OUTPUT_PATH}`)

  // Show summary
  const byType = activities.reduce((acc, a) => {
    acc[a.activityType] = (acc[a.activityType] || 0) + 1
    return acc
  }, {})

  console.log('\n📊 Summary by activity type:')
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`)
  })
} catch (error) {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
}
