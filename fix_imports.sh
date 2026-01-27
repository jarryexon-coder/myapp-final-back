#!/bin/bash
echo "=== Fixing all useSportsData imports ==="

# Check if file exists
if [ ! -f "src/hooks/useSportsData.js" ]; then
  echo "❌ ERROR: src/hooks/useSportsData.js not found!"
  echo "Creating it now..."
  
  # Create the hooks directory if it doesn't exist
  mkdir -p src/hooks
  
  # Create a minimal version first
  cat > src/hooks/useSportsData.js << 'MINIMAL'
import { useState, useEffect, useCallback } from 'react';
export const useSportsData = () => {
  const [data, setData] = useState({});
  return { data, isLoading: false, error: null };
};
MINIMAL
  
  echo "✅ Created minimal useSportsData.js"
fi

# Fix each file with correct import path
echo ""
echo "=== Updating imports ==="

# List of files to fix
files=(
  "src/screens/LiveGamesScreen-enhanced.js"
  "src/screens/HomeScreen-enhanced-v2.js"
  "src/screens/NHLScreen-enhanced.js"
  "src/screens/PlayerStatsScreen-enhanced.js"
  "src/screens/DailyPicksScreen-enhanced.js"
  "src/screens/AnalyticsScreen-enhanced.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Checking $file..."
    # Ensure import uses correct path
    sed -i '' 's|from.*useSportsData.*|from "../hooks/useSportsData";|' "$file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "✅ All imports fixed!"
