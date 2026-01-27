#!/bin/bash
set -e

BUILD_NUMBER=$1
BUILD_DATE=$2

# Copy latest report to numbered build directory
mkdir -p gh-pages-site/reports/build-${BUILD_NUMBER}
cp -r allure-history/* gh-pages-site/reports/build-${BUILD_NUMBER}/

# Create symlink to latest
cd gh-pages-site/reports
ln -sfn build-${BUILD_NUMBER} latest
cd ../..

# Keep only last 20 builds
cd gh-pages-site/reports
ls -dt build-* | tail -n +21 | xargs rm -rf || true
cd ../..

# Generate builds.json index
cd gh-pages-site/reports

# Load existing builds.json if it exists to preserve timestamps
if [ -f "builds.json" ]; then
  cp builds.json builds.json.old
fi

echo "[" > builds.json
first=true
for dir in $(ls -dt build-* 2>/dev/null | grep -v latest); do
  buildNum=$(echo $dir | sed 's/build-//')

  # Find index.html - check both locations explicitly
  if [ -f "$dir/$buildNum/index.html" ]; then
    reportUrl="$dir/$buildNum/index.html"
    attachmentDir="$dir/$buildNum/data/attachments/"
  elif [ -f "$dir/index.html" ]; then
    reportUrl="$dir/index.html"
    attachmentDir="$dir/data/attachments/"
  else
    # Skip this build if no index.html found
    echo "Skipping $dir - no index.html found"
    continue
  fi

  # Find first attachment zip file
  firstAttachment=""
  if [ -d "$attachmentDir" ]; then
    firstAttachment=$(find "$attachmentDir" -name "*.zip" -type f | sort | head -n 1 | sed "s|^|reports/|")
  fi

  # Get timestamp - use current date for new build, preserve old for existing
  if [ "$buildNum" = "${BUILD_NUMBER}" ]; then
    timestamp="${BUILD_DATE}"
  else
    # Try to get timestamp from old builds.json
    if [ -f "builds.json.old" ]; then
      timestamp=$(grep -A 3 "\"number\": $buildNum," builds.json.old | grep "timestamp" | cut -d'"' -f4 || echo "${BUILD_DATE}")
    else
      # Use directory modification time as fallback
      timestamp=$(date -r "$dir" +%Y-%m-%d_%H-%M-%S 2>/dev/null || echo "${BUILD_DATE}")
    fi
  fi

  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> builds.json
  fi
  echo "  {" >> builds.json
  echo "    \"number\": $buildNum," >> builds.json
  echo "    \"path\": \"$dir\"," >> builds.json
  echo "    \"url\": \"$reportUrl\"," >> builds.json
  echo "    \"timestamp\": \"$timestamp\"," >> builds.json
  echo "    \"attachment\": \"$firstAttachment\"" >> builds.json
  echo -n "  }" >> builds.json
done
echo "" >> builds.json
echo "]" >> builds.json

# Clean up
rm -f builds.json.old
cd ../..
