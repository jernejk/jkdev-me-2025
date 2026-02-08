#!/bin/bash
#
# Download images from jkdev.me blog and store them in the correct structure
# Usage: ./scripts/download-images.sh
#

set -e

BASE_URL="https://jkdev.me"
PUBLIC_DIR="public"
BLOG_DIR="data/blog"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Temp files for counters (to work around subshell limitations)
TMP_DIR=$(mktemp -d)
DOWNLOADED_FILE="${TMP_DIR}/downloaded"
SKIPPED_FILE="${TMP_DIR}/skipped"
FAILED_FILE="${TMP_DIR}/failed"
echo "0" > "$DOWNLOADED_FILE"
echo "0" > "$SKIPPED_FILE"
echo "0" > "$FAILED_FILE"

echo "🖼️  Downloading images from ${BASE_URL}..."
echo ""

# Extract all image paths from MDX files
# Look for both frontmatter images and markdown image references
find "${BLOG_DIR}" -name "*.mdx" -type f | while IFS= read -r file; do
    echo "📄 Processing: ${file}"
    
    # Extract image paths that start with /content/images/ and end with an image extension
    grep -oE '/content/images/[^")\s]+\.(jpg|jpeg|png|gif|webp|svg)' "$file" | sort -u | while IFS= read -r img_path; do
        # Create the full URL
        full_url="${BASE_URL}${img_path}"
        
        # Create the local path (keep the /content/images structure in public)
        local_path="${PUBLIC_DIR}${img_path}"
        
        # Create directory if it doesn't exist
        local_dir=$(dirname "$local_path")
        mkdir -p "$local_dir"
        
        # Check if file already exists
        if [ -f "$local_path" ]; then
            echo "  ⏭️  ${YELLOW}Skipped (exists):${NC} ${img_path}"
            echo $(($(cat "$SKIPPED_FILE") + 1)) > "$SKIPPED_FILE"
            continue
        fi
        
        # Download the image
        echo "  ⬇️  Downloading: ${img_path}"
        if curl -sf --retry 3 --retry-delay 2 -o "$local_path" "$full_url"; then
            echo "  ✅ ${GREEN}Downloaded:${NC} ${img_path}"
            echo $(($(cat "$DOWNLOADED_FILE") + 1)) > "$DOWNLOADED_FILE"
        else
            echo "  ❌ ${RED}Failed:${NC} ${img_path} (${full_url})"
            echo $(($(cat "$FAILED_FILE") + 1)) > "$FAILED_FILE"
            # Remove failed download attempt
            rm -f "$local_path"
        fi
    done
done

# Read final counts
DOWNLOADED=$(cat "$DOWNLOADED_FILE")
SKIPPED=$(cat "$SKIPPED_FILE")
FAILED=$(cat "$FAILED_FILE")

# Cleanup temp files
rm -rf "$TMP_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   ✅ Downloaded: ${GREEN}${DOWNLOADED}${NC}"
echo "   ⏭️  Skipped:    ${YELLOW}${SKIPPED}${NC}"
if [ $FAILED -gt 0 ]; then
    echo "   ❌ Failed:     ${RED}${FAILED}${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "⚠️  Some images failed to download. They may have been moved or deleted."
    echo "💡 Tip: Check your blog posts for broken image links and fix them manually."
    exit 0
else
    echo "🎉 All images downloaded successfully!"
fi
