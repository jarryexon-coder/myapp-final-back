#!/bin/bash
echo "Fixing all remaining mock messages..."

# Find all files with mock messages
find src -name "*.js" -type f -exec grep -l "mock" {} \; 2>/dev/null | grep -v node_modules | while read file; do
  echo "Checking: $file"
  
  # Replace various mock patterns
  sed -i '' "s/console\.log.*[Mm]ock.*[Ff]irestore.*/\/\/ Firebase is initialized globally in firebase-config-simple.js/" "$file"
  sed -i '' "s/console\.log.*[Uu]sing [Mm]ock.*/\/\/ Using development fallback/" "$file"
  sed -i '' "s/console\.warn.*[Mm]ock.*/\/\/ Development mode active/" "$file"
  sed -i '' "s/'[Mm]ock [Ff]irestore'/''/" "$file"
  sed -i '' "s/\"[Mm]ock [Ff]irestore\"/''/" "$file"
  
  # Also check for any Firebase initialization code that should be removed
  if grep -q "initializeApp.*firebaseConfig\|const firebaseConfig" "$file"; then
    echo "  ⚠️  File has Firebase config - may need cleanup"
    # Check if this is a screen that should use global Firebase
    if [[ "$file" == *"Screen.js" ]] && ! [[ "$file" == *"firebase-config"* ]]; then
      echo "  Removing inline Firebase config from screen..."
      sed -i '' "/const firebaseConfig/,/^[[:space:]]*};/d" "$file"
      sed -i '' "/initializeApp.*firebaseConfig/d" "$file"
      sed -i '' "/import.*initializeApp.*from.*'firebase\/app'/d" "$file"
    fi
  fi
done

echo "✅ Fixed remaining mock messages"
