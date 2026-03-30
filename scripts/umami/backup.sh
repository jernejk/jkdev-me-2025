#!/bin/bash
# Usage:
#   ./scripts/umami/backup.sh                    # previous month (default)
#   ./scripts/umami/backup.sh previous-month      # same as default
#   ./scripts/umami/backup.sh current-month       # current month so far
#   ./scripts/umami/backup.sh 2026-03             # specific month
#
# Monthly backup of all telemetry data.
# Output: .backup/umami/YYYY-MM/ with raw JSON + processed summary.md
# Designed to run on the 1st of each month via cron/automation.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."
source "$PROJECT_ROOT/.env"

SITE_ID="8ec92ed3-9035-48ba-aa42-0d6d56d824b2"
API="https://api.umami.is/v1/websites/$SITE_ID"

# Determine month and date range
ARG="${1:-previous-month}"

case "$ARG" in
  previous-month)
    MONTH=$(date -v-1m +%Y-%m)
    ;;
  current-month)
    MONTH=$(date +%Y-%m)
    ;;
  [0-9][0-9][0-9][0-9]-[0-9][0-9])
    MONTH="$ARG"
    ;;
  *)
    echo "Usage: backup.sh [previous-month|current-month|YYYY-MM]"
    exit 1
    ;;
esac

YEAR=$(echo "$MONTH" | cut -d- -f1)
MON=$(echo "$MONTH" | cut -d- -f2)

# Start: first day of month
START=$(date -j -f "%Y-%m-%d" "${MONTH}-01" +%s)000

# End: first day of next month, or now if current month
if [ "$ARG" = "current-month" ]; then
  END=$(date +%s)000
else
  if [ "$MON" = "12" ]; then
    NEXT_YEAR=$((YEAR + 1))
    END=$(date -j -f "%Y-%m-%d" "${NEXT_YEAR}-01-01" +%s)000
  else
    NEXT_MON=$(printf "%02d" $((10#$MON + 1)))
    END=$(date -j -f "%Y-%m-%d" "${YEAR}-${NEXT_MON}-01" +%s)000
  fi
fi

BACKUP_DIR="$PROJECT_ROOT/.backup/umami/$MONTH"
RAW_DIR="$BACKUP_DIR/raw"
mkdir -p "$RAW_DIR"

echo "=== Backing up Umami data for $MONTH ==="
echo "Output: $BACKUP_DIR"
echo ""

# --- Raw dumps ---

echo "Fetching stats..."
curl -sS "$API/stats?startAt=$START&endAt=$END" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq . > "$RAW_DIR/stats.json"

echo "Fetching daily pageviews..."
curl -sS "$API/pageviews?startAt=$START&endAt=$END&unit=day&timezone=Australia/Brisbane" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq . > "$RAW_DIR/pageviews-daily.json"

echo "Fetching hourly pageviews..."
curl -sS "$API/pageviews?startAt=$START&endAt=$END&unit=hour&timezone=Australia/Brisbane" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq . > "$RAW_DIR/pageviews-hourly.json"

METRIC_TYPES=("url" "referrer" "browser" "os" "device" "country" "city" "language" "title")
for TYPE in "${METRIC_TYPES[@]}"; do
  echo "Fetching metrics: $TYPE..."
  curl -sS "$API/metrics?startAt=$START&endAt=$END&type=$TYPE&limit=500" \
    -H "x-umami-api-key: $UMAMI_API_KEY" | jq . > "$RAW_DIR/metrics-${TYPE}.json"
done

# --- Processed summary ---

echo ""
echo "Generating summary..."

STATS=$(cat "$RAW_DIR/stats.json")
PAGEVIEWS=$(echo "$STATS" | jq '.pageviews')
VISITORS=$(echo "$STATS" | jq '.visitors')
VISITS=$(echo "$STATS" | jq '.visits')
BOUNCES=$(echo "$STATS" | jq '.bounces')
TOTALTIME=$(echo "$STATS" | jq '.totaltime')

if [ "$VISITS" -gt 0 ]; then
  BOUNCE_RATE=$(echo "scale=1; $BOUNCES * 100 / $VISITS" | bc)
  AVG_TIME=$(echo "scale=0; $TOTALTIME / $VISITS" | bc)
else
  BOUNCE_RATE="0"
  AVG_TIME="0"
fi

cat > "$BACKUP_DIR/summary.md" << SUMMARY
# jkdev.me Analytics — $MONTH

## Overview

| Metric | Value |
|--------|-------|
| Pageviews | $PAGEVIEWS |
| Unique visitors | $VISITORS |
| Visits | $VISITS |
| Bounce rate | ${BOUNCE_RATE}% |
| Avg time on site | ${AVG_TIME}s |

## Top pages

| Views | Page |
|-------|------|
$(jq -r '.[:20][] | "| \(.y) | \(.x) |"' "$RAW_DIR/metrics-url.json")

## Top referrers

| Visits | Source |
|--------|--------|
$(jq -r '.[:10][] | "| \(.y) | \(.x) |"' "$RAW_DIR/metrics-referrer.json")

## Top countries

| Visits | Country |
|--------|---------|
$(jq -r '.[:10][] | "| \(.y) | \(.x) |"' "$RAW_DIR/metrics-country.json")

## Browsers

| Visits | Browser |
|--------|---------|
$(jq -r '.[:10][] | "| \(.y) | \(.x) |"' "$RAW_DIR/metrics-browser.json")

## Devices

| Visits | Device |
|--------|--------|
$(jq -r '.[] | "| \(.y) | \(.x) |"' "$RAW_DIR/metrics-device.json")

## Daily pageviews

| Date | Views | Sessions |
|------|-------|----------|
$(jq -r '[.pageviews, .sessions] | transpose[] | "| \(.[0].x) | \(.[0].y) | \(.[1].y) |"' "$RAW_DIR/pageviews-daily.json")

---
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
SUMMARY

echo ""
echo "Done! Files:"
echo "  Raw:     $RAW_DIR/ ($(ls "$RAW_DIR" | wc -l | tr -d ' ') files)"
echo "  Summary: $BACKUP_DIR/summary.md"
