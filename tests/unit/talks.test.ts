import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findNextUpcomingTalk } from '../../lib/talks'

type Talk = Parameters<typeof findNextUpcomingTalk>[0][number]

const mk = (overrides: Partial<Talk['events'][number]> = {}): Talk => ({
  id: 't',
  title: 'Test talk',
  description: '',
  type: 'talk',
  groupName: null,
  tags: [],
  videoUrl: null,
  slidesUrl: null,
  githubUrl: null,
  conferenceUrl: null,
  events: [
    {
      eventName: 'Test event',
      date: '2099-01-01',
      status: 'upcoming',
      ...overrides,
    },
  ],
})

// Today's Brisbane date — computed the same way lib/talks.ts computes it.
const todayBrisbane = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Australia/Brisbane',
})
const yesterdayBrisbane = (() => {
  const d = new Date(todayBrisbane)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
})()
const tomorrowBrisbane = (() => {
  const d = new Date(todayBrisbane)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

test('findNextUpcomingTalk excludes events with status=past even if status says upcoming-ish', () => {
  const talk = mk({ date: tomorrowBrisbane, status: 'past' })
  assert.equal(findNextUpcomingTalk([talk]), null)
})

test('findNextUpcomingTalk excludes events whose date is yesterday in Brisbane', () => {
  const talk = mk({ date: yesterdayBrisbane, status: 'upcoming' })
  assert.equal(findNextUpcomingTalk([talk]), null)
})

test('findNextUpcomingTalk includes events dated today in Brisbane', () => {
  const talk = mk({ date: todayBrisbane, status: 'upcoming' })
  const result = findNextUpcomingTalk([talk])
  assert.ok(result, 'expected today-in-Brisbane event to be upcoming')
  assert.equal(result!.event.date, todayBrisbane)
})

test('findNextUpcomingTalk includes events dated tomorrow', () => {
  const talk = mk({ date: tomorrowBrisbane })
  const result = findNextUpcomingTalk([talk])
  assert.ok(result)
  assert.equal(result!.event.date, tomorrowBrisbane)
})

test('findNextUpcomingTalk respects dateEnd for multi-day events (still upcoming on last day)', () => {
  const talk = mk({
    date: yesterdayBrisbane,
    dateEnd: todayBrisbane,
    status: 'upcoming',
  })
  const result = findNextUpcomingTalk([talk])
  assert.ok(result, 'multi-day event ending today should still count')
})

test('findNextUpcomingTalk returns the earliest upcoming event when multiple candidates', () => {
  const farFuture = mk({ ...mk().events[0], date: '2099-06-01' })
  const nearFuture: Talk = {
    ...farFuture,
    id: 'near',
    events: [{ eventName: 'Near', date: tomorrowBrisbane, status: 'upcoming' }],
  }
  const result = findNextUpcomingTalk([farFuture, nearFuture])
  assert.ok(result)
  assert.equal(result!.event.date, tomorrowBrisbane)
})

test('findNextUpcomingTalk returns null when no events have dates', () => {
  const talk: Talk = {
    ...mk(),
    events: [{ eventName: 'no date' }],
  }
  assert.equal(findNextUpcomingTalk([talk]), null)
})
