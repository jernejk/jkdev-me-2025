#!/bin/bash
# Usage: ./scripts/umami/post-stats.sh /blog/agenteval-dotnet [days_back]
# Get stats for a specific blog post URL
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../.env"

URL=${1:?'Usage: post-stats.sh /blog/slug [days_back]'}
DAYS=${2:-30}
SITE_ID="8ec92ed3-9035-48ba-aa42-0d6d56d824b2"
API="https://api.umami.is/v1/websites/$SITE_ID"
START=$(date -v-${DAYS}d +%s)000
END=$(date +%s)000

echo "=== Stats for $URL (last $DAYS days) ==="
echo ""

# Get pageviews for this specific URL from metrics
VIEWS=$(curl -sS "$API/metrics?startAt=$START&endAt=$END&type=url&limit=500" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq -r --arg url "$URL" '.[] | select(.x == $url) | .y // 0')

echo "Pageviews: ${VIEWS:-0}"
echo ""

# Pageviews over time for this URL
echo "=== Daily trend ==="
curl -sS "$API/pageviews?startAt=$START&endAt=$END&unit=day&timezone=Australia/Brisbane&url=$URL" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq -r '.pageviews[] | select(.y > 0) | "\(.x)\t\(.y)"'
echo ""

# Referrers (note: URL filter may not work on referrer metrics in Cloud API)
echo "=== Top referrers (site-wide) ==="
curl -sS "$API/metrics?startAt=$START&endAt=$END&type=referrer&limit=10" \
  -H "x-umami-api-key: $UMAMI_API_KEY" | jq -r '.[] | "\(.y)\t\(.x)"'
