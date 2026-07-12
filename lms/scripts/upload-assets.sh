#!/bin/bash
# Upload generated asset thumbnails + index.json to Cloudflare R2
# Run outside project dir to avoid wrangler.toml binding name conflict
set -e

LMS_DIR="/home/midory/rpl-ai-curriculum/lms"
THUMB_DIR="$LMS_DIR/static/assets/thumbnails"
INDEX_FILE="$LMS_DIR/static/assets/index.json"
ACCOUNT_ID="32b2efbe93d68a826eb2f250e9bb7df6"

cd /tmp

echo "🔃 Uploading thumbnails to R2 bucket 'rpl-ai-lms-assets'..."

for svg in "$THUMB_DIR"/*.svg; do
  [ -f "$svg" ] || continue
  slug="$(basename "$svg" .svg)"
  echo "  Uploading thumbnails/${slug}.svg ..."
  CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID npx wrangler r2 object put \
    "rpl-ai-lms-assets/thumbnails/${slug}.svg" --file="$svg" -y 2>&1 || true
done

echo "🔃 Uploading index.json ..."
CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID npx wrangler r2 object put \
  "rpl-ai-lms-assets/index.json" --file="$INDEX_FILE" -y 2>&1 || true

echo "✅ R2 upload complete!"
