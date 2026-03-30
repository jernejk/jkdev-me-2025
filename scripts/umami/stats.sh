#!/bin/bash
# Usage: ./scripts/umami/stats.sh [days_back]
# Default: last 30 days
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../.env"

DAYS=${1:-30}
SITE_ID="8ec92ed3-9035-48ba-aa42-0d6d56d824b2"
API="https://api.umami.is/v1/websites/$SITE_ID"
START=$(date -v-${DAYS}d +%s)000
END=$(date +%s)000

echo "=== jkdev.me Stats (last $DAYS days) ==="
echo ""

# Stats summary
STATS=$(curl -sS "$API/stats?startAt=$START&endAt=$END" -H "x-umami-api-key: $UMAMI_API_KEY")
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

echo "Pageviews:   $PAGEVIEWS"
echo "Visitors:    $VISITORS"
echo "Visits:      $VISITS"
echo "Bounce rate: ${BOUNCE_RATE}%"
echo "Avg time:    ${AVG_TIME}s"
echo ""

# Top pages
echo "=== Top 10 Pages ==="
curl -sS "$API/metrics?startAt=$START&endAt=$END&type=url&limit=10" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq -r '.[] | "\(.y)\t\(.x)"'
echo ""

# Top referrers
echo "=== Top 5 Referrers ==="
curl -sS "$API/metrics?startAt=$START&endAt=$END&type=referrer&limit=5" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq -r '.[] | "\(.y)\t\(.x)"'
echo ""

# Top countries
echo "=== Top 5 Countries ==="
curl -sS "$API/metrics?startAt=$START&endAt=$END&type=country&limit=5" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq -r '.[] | "\(.y)\t\(.x)"'
