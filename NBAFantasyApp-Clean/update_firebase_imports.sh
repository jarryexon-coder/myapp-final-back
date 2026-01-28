#!/bin/bash
# Update various import patterns

# Find and update imports in non-backup files
find src -name "*.js" -o -name "*.jsx" | grep -v "backups" | grep -v node_modules | while read file; do
  # Skip the files we've already handled
  if [[ "$file" == *"useAnalytics.js"* ]] || [[ "$file" == *"services/firebase.js"* ]]; then
    continue
  fi
  
  # Update dynamic imports that create inline Firebase configs
  if grep -q "firebaseAnalytics.*await import.*firebase/analytics" "$file"; then
    echo "Updating inline Firebase config in: $file"
    
    # Replace inline config with service import (simple approach)
    sed -i '' "/firebaseAnalytics.*await import.*firebase\/analytics/,/}/d" "$file" 2>/dev/null
    sed -i '' "s|import { app, analytics } from '../services/firebase';|import { logAnalyticsEvent, logScreenView } from '../services/firebase';|g" "$file" 2>/dev/null
    
    # Add import if not present
    if ! grep -q "import.*logAnalyticsEvent.*from.*services/firebase" "$file"; then
      sed -i '' "1i\\
import { logAnalyticsEvent, logScreenView } from '../services/firebase';" "$file"
    fi
  fi
  
  # Update direct analytics usage
  sed -i '' "s|analytics\.logEvent|logAnalyticsEvent|g" "$file" 2>/dev/null
done

# Special handling for FantasyScreen-enhanced.js
if [ -f "src/screens/FantasyScreen-enhanced.js" ]; then
  sed -i '' '/const firebaseConfig/,/^[[:space:]]*};/d' src/screens/FantasyScreen-enhanced.js 2>/dev/null
fi
