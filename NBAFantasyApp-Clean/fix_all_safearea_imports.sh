#!/bin/bash
echo "Fixing SafeAreaView imports in all files..."

# Find all files that use SafeAreaView but don't import it correctly
find src -name "*.js" -o -name "*.jsx" | grep -v node_modules | while read file; do
  # Check if file uses SafeAreaView
  if grep -q "SafeAreaView" "$file"; then
    # Check if it imports from react-native-safe-area-context
    if grep -q "import.*SafeAreaView.*from.*'react-native-safe-area-context'" "$file"; then
      echo "✅ $file - Already has correct import"
      continue
    fi
    
    # Check if it imports from react-native (wrong)
    if grep -q "import.*SafeAreaView.*from.*'react-native'" "$file"; then
      echo "🔄 $file - Has wrong import, fixing..."
      # Remove from react-native import
      sed -i '' "s/import {\(.*\)SafeAreaView\(.*\)} from 'react-native';/import {\1\2} from 'react-native';/" "$file"
      sed -i '' "s/import { SafeAreaView, /import { /" "$file"
      sed -i '' "s/, SafeAreaView }/}/" "$file"
    else
      echo "➕ $file - No SafeAreaView import found, adding..."
    fi
    
    # Add correct import after react-native import
    if grep -q "import.*from 'react-native'" "$file"; then
      # Add import after react-native import line
      sed -i '' "/import.*from 'react-native'/a\\
import { SafeAreaView } from 'react-native-safe-area-context';" "$file"
    else
      # Add at the beginning of imports section
      sed -i '' "1s/^/import { SafeAreaView } from 'react-native-safe-area-context';\\
/" "$file"
    fi
    
    echo "  Fixed: $file"
  fi
done

echo "✅ Done fixing all SafeAreaView imports!"
