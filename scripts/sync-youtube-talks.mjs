#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')

const SPEAKING_PATH = path.join(ROOT, 'data/speakingData.json')
const OUTPUT_PATH = path.join(ROOT, 'data/talks/youtube-match-results.json')

const QUERIES = [
  'ytsearch80:Jernej Kavka talk',
  'ytsearch80:Jernej Kavka NDC',
  'ytsearch80:Jernej JK Kavka',
  'ytsearch80:"Jernej Kavka" "EF Core"',
]

const CHANNEL_UPLOADS_URL = 'https://www.youtube.com/channel/UCige1JIdeIc3sYU2HSaismg/videos'

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'how',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
  'your',
  'using',
  'session',
  'speaking',
  'speaker',
  'talk',
  'conference',
  'presented',
  'event',
  'events',
  'online',
  'recording',
  'track',
  'live',
  'day',
])

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function runYtDlp(queryOrUrl) {
  try {
    const cmd = `yt-dlp --flat-playlist --dump-json ${JSON.stringify(queryOrUrl)}`
    const out = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 1024 * 1024 * 20,
    })

    const lines = out
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    return lines
      .map((line) => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .map((video) => ({
        id: video.id,
        title: video.title || '',
        url: video.url || (video.id ? `https://www.youtube.com/watch?v=${video.id}` : ''),
        uploader: video.uploader || '',
        channel: video.channel || '',
        uploadDate: video.upload_date || null,
        sourceQuery: queryOrUrl,
      }))
  } catch (error) {
    return []
  }
}

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((token) => token.length > 2 && !STOPWORDS.has(token))
}

function overlapScore(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0
  const setA = new Set(aTokens)
  const setB = new Set(bTokens)
  let common = 0
  for (const token of setA) {
    if (setB.has(token)) common++
  }
  return common / Math.max(setA.size, setB.size)
}

function stripYears(tokens) {
  return tokens.filter((token) => !/^20\d\d$/.test(token))
}

function removeTokens(tokens, blacklist) {
  const blocked = new Set(blacklist)
  return tokens.filter((token) => !blocked.has(token))
}

function isGenericConferenceVideoTitle(title) {
  const t = normalize(title)
  return (
    /^ndc [a-z]+ 20\d\d( track \d+)?$/.test(t) ||
    /^ddd [a-z]+ 20\d\d$/.test(t) ||
    /^global ai [a-z ]*20\d\d$/.test(t)
  )
}

function scoreVideoToTalk(video, talk) {
  const videoNorm = normalize(video.title)
  const talkNorm = normalize(talk.title)
  const eventName = talk.events?.[0]?.eventName || ''
  const eventNorm = normalize(eventName)

  const videoTokens = stripYears(tokenize(video.title))
  const talkTokens = stripYears(tokenize(talk.title))
  const eventTokens = stripYears(tokenize(eventName))
  const topicTokens = removeTokens(talkTokens, eventTokens)

  let score = overlapScore(videoTokens, talkTokens) * 0.5
  score += overlapScore(videoTokens, topicTokens) * 0.55

  if (talkNorm && videoNorm.includes(talkNorm)) score += 0.35
  if (eventNorm && videoNorm.includes(eventNorm)) score += 0.2
  score += overlapScore(videoTokens, eventTokens) * 0.1

  const mentionsJernej = /jernej|kavka|\bjk\b/i.test(video.title)
  if (mentionsJernej) score += 0.15

  if (talk.title.toLowerCase().includes('speaking at')) {
    score -= 0.2
  }

  if (isGenericConferenceVideoTitle(video.title)) {
    score -= 0.35
  }

  return { score, topicOverlap: overlapScore(videoTokens, topicTokens) }
}

function seemsLikeTalkVideo(video) {
  const text = `${video.title} ${video.uploader}`.toLowerCase()

  if (/jernej|kavka|\bjk\b/.test(text)) return true
  if (
    /ndc|ddd|bootcamp|user group|conference|talk|session|ef core|ai hack day|global ai/.test(text)
  )
    return true

  return false
}

function missingCandidateConfidence(video) {
  const t = `${video.title} ${video.uploader}`.toLowerCase()
  let score = 0
  if (/jernej|kavka|\bjk\b/.test(t)) score += 0.55
  if (/ndc|ddd|user group|conference|session|talk/.test(t)) score += 0.25
  if (/ef core|ml\\.net|machine learning|form recognizer|source generator|offline ai/.test(t))
    score += 0.25
  if (/table talk|episode|tech news/.test(t)) score -= 0.15
  return Math.max(0, Math.min(1, score))
}

function makeReport({ videos, talks, appliedMatches, suggestedMatches, missingTalkCandidates }) {
  return {
    generatedAt: new Date().toISOString(),
    source: 'YouTube search and channel scan (yt-dlp)',
    totalVideosScanned: videos.length,
    totalTalks: talks.length,
    appliedMatches,
    suggestedMatches,
    missingTalkCandidates,
  }
}

function main() {
  if (!fs.existsSync(SPEAKING_PATH)) {
    console.error(`Missing ${SPEAKING_PATH}`)
    process.exit(1)
  }

  const speakingData = readJson(SPEAKING_PATH)
  const talks = speakingData.talks || []

  const candidates = []

  for (const q of QUERIES) {
    candidates.push(...runYtDlp(q))
  }
  candidates.push(...runYtDlp(CHANNEL_UPLOADS_URL))

  const dedupedVideos = []
  const seenVideoIds = new Set()
  for (const video of candidates) {
    if (!video.id || seenVideoIds.has(video.id)) continue
    seenVideoIds.add(video.id)
    if (!video.url) video.url = `https://www.youtube.com/watch?v=${video.id}`
    if (!seemsLikeTalkVideo(video)) continue
    dedupedVideos.push(video)
  }

  const appliedMatches = []
  const suggestedMatches = []
  const matchedVideoIds = new Set()

  for (const talk of talks) {
    let best = null

    for (const video of dedupedVideos) {
      const scored = scoreVideoToTalk(video, talk)
      if (!best || scored.score > best.score) {
        best = { video, score: scored.score, topicOverlap: scored.topicOverlap }
      }
    }

    if (!best || best.score < 0.58) continue

    const match = {
      talkId: talk.id,
      talkTitle: talk.title,
      eventName: talk.events?.[0]?.eventName || null,
      score: Number(best.score.toFixed(3)),
      topicOverlap: Number((best.topicOverlap || 0).toFixed(3)),
      videoTitle: best.video.title,
      videoUrl: best.video.url,
      uploader: best.video.uploader,
    }

    const hasSpecificTopic = (best.topicOverlap || 0) >= 0.38
    const isSpeakingAtOnly = /^speaking at\s/i.test(talk.title)
    const isSafeAutoApply = !isSpeakingAtOnly && hasSpecificTopic && best.score >= 0.74

    if (!talk.videoUrl && isSafeAutoApply) {
      talk.videoUrl = best.video.url
      appliedMatches.push(match)
      matchedVideoIds.add(best.video.id)
    } else {
      suggestedMatches.push(match)
      matchedVideoIds.add(best.video.id)
    }
  }

  const missingTalkCandidates = dedupedVideos
    .filter((video) => !matchedVideoIds.has(video.id))
    .map((video) => ({
      videoTitle: video.title,
      videoUrl: video.url,
      uploader: video.uploader,
      sourceQuery: video.sourceQuery,
      referencesJernej: /jernej|kavka|\bjk\b/i.test(`${video.title} ${video.uploader}`),
      confidence: Number(missingCandidateConfidence(video).toFixed(2)),
    }))
    .filter((item) => item.referencesJernej && item.confidence >= 0.6)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 80)

  writeJson(SPEAKING_PATH, speakingData)

  const report = makeReport({
    videos: dedupedVideos,
    talks,
    appliedMatches,
    suggestedMatches: suggestedMatches.slice(0, 120),
    missingTalkCandidates,
  })

  writeJson(OUTPUT_PATH, report)

  console.log(`Scanned ${dedupedVideos.length} candidate YouTube videos`)
  console.log(
    `Applied ${appliedMatches.length} high-confidence video links to data/speakingData.json`
  )
  console.log(`Generated report: ${path.relative(ROOT, OUTPUT_PATH)}`)

  if (missingTalkCandidates.length) {
    console.log(`Potential missing talks to review: ${missingTalkCandidates.length}`)
  }
}

main()
