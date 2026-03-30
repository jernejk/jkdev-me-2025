#!/bin/bash
# Usage: ./scripts/umami/pageviews.sh [days_back] [unit]
# Default: last 7 days, daily
# unit: hour, day, week, month, year
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/../../.env"

DAYS=${1:-7}
UNIT=${2:-day}
SITE_ID="8ec92ed3-9035-48ba-aa42-0d6d56d824b2"
API="https://api.umami.is/v1/websites/$SITE_ID"
START=$(date -v-${DAYS}d +%s)000
END=$(date +%s)000

echo "=== Pageviews (last $DAYS days, by $UNIT) ==="
echo ""
echo "Date                    Views   Sessions"
echo "----                    -----   --------"

# Fetch and merge pageviews + sessions
RESULT=$(curl -sS "$API/pageviews?startAt=$START&endAt=$END&unit=$UNIT&timezone=Australia/Brisbane" \
  -H "x-umami-api-key: $UMAMI_API_KEY")

echo "$RESULT" | jq -r '
  [.pageviews, .sessions] | transpose[] |
  "\(.[0].x)\t\(.[0].y)\t\(.[1].y)"
'
