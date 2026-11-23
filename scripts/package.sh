#!/usr/bin/env bash
# C5 — reproducible release zip. Usage: npm run build (lint + bundle + this).
# Mirrors the exclusions the hand-made 2.1.0 zip used, minus the .DS_Store
# accidents it nearly shipped.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').version")
OUT="dist/promptforge-v${VERSION}.zip"
mkdir -p dist
rm -f "$OUT"

zip -qr "$OUT" . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "dist/*" \
  -x "tests/*" \
  -x "scripts/*" \
  -x ".qwen/*" \
  -x ".claude/*" \
  -x "*.zip" \
  -x ".DS_Store" "*/.DS_Store" \
  -x "package.json" "package-lock.json" \
  -x "eslint.config.js" \
  -x "CLAUDE.md" "V3_PLAN.md" "store-listing.md" \
  -x "content.bundle.entry.js" \
  -x ".gitignore" \
  -x "content.js" "content.shared.js" "content.styles.js" \
  -x "inputBoxHandler.js" "ai-operations.js" \
  -x "qwen-code-export-*" \
  -x "BUILD_REPORT.md" "README.md" "CHANGELOG.md" \
  -x ".ocr-reports/*" ".ocr-reports/" \
  -x "*.txt"

echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
