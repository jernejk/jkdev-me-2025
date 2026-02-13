# Update Speaking Page

You are helping update the speaking page data for jkdev.me.

## Input

Speaking update request: $ARGUMENTS

## Data Location

- **Speaking data**: `data/speakingData.json`
- **Speaking page**: `app/speaking/page.tsx`
- **Speaking API**: `app/api/speaking/route.ts`
- **Automation scripts**: `scripts/extract-mvp-speaking.mjs`, `scripts/merge-speaking-data-v2.mjs`
- **GitHub Action**: `.github/workflows/update-speaking-data.yml`

## Talk Schema

Each talk in `data/speakingData.json` follows this structure:

```json
{
  "id": "unique-kebab-case-id",
  "title": "Talk Title",
  "description": "Short description of the talk",
  "type": "talk",
  "groupName": null,
  "events": [
    {
      "eventName": "Conference or User Group Name",
      "location": "City, Country",
      "date": "YYYY-MM-DD",
      "dateEnd": "YYYY-MM-DD",
      "url": "https://event-url.com",
      "online": false,
      "status": "upcoming"
    }
  ],
  "tags": ["topic1", "topic2"],
  "videoUrl": null,
  "slidesUrl": null,
  "githubUrl": null,
  "conferenceUrl": null
}
```

### Field Rules

- **id**: Unique kebab-case identifier. Use format `talk-topic-short-name`
- **title**: Full talk title as it appears in the conference program
- **description**: 1-2 sentence summary of the talk content
- **type**: Usually `"talk"` (could be `"workshop"`, `"lightning"`, etc.)
- **groupName**: Set to a string when multiple events share the same talk (e.g., user group tours). Set to `null` for standalone events
- **events**: Array of event appearances. A talk can be given at multiple events
  - **eventName**: Full name of the conference or meetup
  - **location**: `"City, Country"` format (omit for online-only events)
  - **date**: Start date in `YYYY-MM-DD`
  - **dateEnd**: End date (optional, for multi-day events)
  - **url**: Event website or session page URL
  - **online**: `true` if online/hybrid, `false` if in-person only
  - **status**: `"upcoming"` for future events, `"past"` for completed events
- **tags**: Relevant topic tags for the talk
- **videoUrl**: YouTube or recording URL (null if not yet recorded)
- **slidesUrl**: Slides URL (null if not yet available)
- **githubUrl**: Demo repo URL (null if no demo)
- **conferenceUrl**: Main conference website URL

## Workflow

### Adding a New Talk

1. Read `data/speakingData.json`
2. Check if this talk already exists (by title or similar id)
3. If the talk exists, add a new event entry to its `events` array
4. If it's a new talk, create a new talk object at the end of the `talks` array
5. Generate a unique `id` in kebab-case
6. Set `status` based on the event date vs today's date

### Adding an Event to an Existing Talk

1. Find the talk by title or id
2. Add a new event object to its `events` array
3. Keep events sorted by date (newest first)

### Updating Talk Details

1. Find the talk by title or id
2. Update the requested fields
3. Common updates: adding videoUrl after recording, updating status from upcoming to past, adding slidesUrl

### Marking Events as Past

1. Find events with `status: "upcoming"` where `date` is before today
2. Update their status to `"past"`

### Bulk Update via Scripts

If the user wants to sync from external sources:

```bash
# Fetch from Sessionize API
yarn speaking:fetch

# Extract from MVP profile
yarn speaking:extract-mvp

# Merge all sources
yarn speaking:merge

# Full pipeline
yarn speaking:build
```

## Validation

After making changes:

1. Verify the JSON is valid (no trailing commas, proper quoting)
2. Check that all dates are in `YYYY-MM-DD` format
3. Ensure `id` fields are unique across all talks
4. Verify `status` matches the event date (upcoming = future, past = past)
5. Run `yarn build` to confirm the speaking page renders correctly

## Quality Gates

- Valid JSON structure
- All required fields present (id, title, description, type, events, tags)
- Dates in `YYYY-MM-DD` format
- Unique talk IDs
- Event status matches date
- `yarn build` passes

## Important

- Always read the current `speakingData.json` before making changes
- Preserve existing data — never overwrite talks unless explicitly asked
- Keep the JSON formatted consistently (2-space indent)
- When unsure about talk details, ask the user rather than guessing
