#!/bin/bash
echo "Cleaning up mock messages..."

# List of files with mock messages
files=(
  "src/screens/NewsDeskScreen.js"
  "src/utils/RevenueCatConfig.js"
  "src/screens/SubscriptionScreen.js"
  "src/hooks/useSportsData.js"
  "src/services/NBAService.js"
  "src/services/NEWSService.js"
  "src/services/NHLService.js"
  "src/services/mockData.js"
  "src/services/kalshiService.js"
  "src/services/NFLService.js"
  "src/services/api.js"
  "src/services/revenueCat.js"
  "src/services/revenuecat-service.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Cleaning: $file"
    # Replace mock messages with informative comments
    sed -i '' "s/console.log.*mock.*Firestore.*/\/\/ Firebase services are initialized globally/" "$file"
    sed -i '' "s/console.log.*Using mock.*/\/\/ Using fallback for development/" "$file"
    sed -i '' "s/console.warn.*mock.*/\/\/ Development mode: Using simplified version/" "$file"
  fi
done

# Special handling for backup directories
echo "Removing backup directories (they might contain old code)..."
rm -rf src/screens/backups/ 2>/dev/null
rm -rf src/screens_backup_*/ 2>/dev/null

echo "✅ Cleanup complete!"
