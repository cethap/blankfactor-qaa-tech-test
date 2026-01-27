#!/bin/bash
set -e

# Get build number and date
BUILD_NUMBER=$1
BUILD_DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Create reports directory structure
mkdir -p gh-pages-site/reports

# Copy existing reports if gh-pages exists
if [ -d "gh-pages-checkout/reports" ]; then
  cp -r gh-pages-checkout/reports/* gh-pages-site/reports/ || true
fi

# Copy existing index if it exists
if [ -f "gh-pages-checkout/index.html" ]; then
  cp gh-pages-checkout/index.html gh-pages-site/ || true
fi

echo "BUILD_NUMBER=${BUILD_NUMBER}"
echo "BUILD_DATE=${BUILD_DATE}"
