#!/bin/bash
echo "Fixing SafeAreaView imports in all files..."

# List of files to fix
files=(
  src/navigation/HomeScreen-working.js
  src/screens/LiveGamesScreen.js
  src/screens/BackendTestScreen.js
  src/screens/SportsWireScreen.js
  src/screens/ParlayBuilder/PredictionsScreen.js
  src/screens/NHLScreen-simple.js
  src/screens/LiveGamesScreen-enhanced-v2.js
  src/screens/PrivacyPolicyScreen.js
  src/screens/TestRevenueCatGate.js
  src/screens/NFLScreen-simple.js
  src/screens/SearchScreen.js
  src/screens/TeamSelectionScreen.js
  src/screens/DebugScreen.js
  src/screens/SecretPhraseScreen.js
  src/screens/SimpleHomeScreen.js
  src/screens/MatchAnalyticsScreen.js
  src/screens/PrizePicksScreen.js
  src/screens/HomeScreen-fixed.js
  src/screens/StatsDashboard.js
  src/screens/HomeScreen.js
  src/screens/PlayerStatsScreen.js
  src/screens/SettingsScreen.js
  src/screens/DiagnosticScreen.js
  src/screens/WrappedHomeScreen.js
  src/screens/NHLTrendsScreen.js
  src/screens/RevenueCatTestScreen.js
  src/screens/LoginScreen.js
  src/screens/AdvancedAnalyticsScreen.js
  src/screens/FantasyScreen-enhanced.js
  src/screens/LoginScreen-enhanced.js
  src/screens/WrappedHomeScreen-enhanced.js
  src/screens/SubscriptionScreen.js
  src/screens/BettingScreen-enhanced.js
  src/screens/FantasyHubScreen.js
  src/screens/HomeScreen-minimal.js
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing: $file"
    
    # Fix: Remove SafeAreaView from react-native import
    sed -i '' "s/import {\(.*\)SafeAreaView\(.*\)} from 'react-native';/import {\1\2} from 'react-native';/g" "$file"
    sed -i '' "s/import { SafeAreaView, /import { /g" "$file"
    sed -i '' "s/, SafeAreaView }/}/g" "$file"
    sed -i '' "s/import { SafeAreaView } from 'react-native';//g" "$file"
    
    # Add correct import if SafeAreaView is used in the file
    if grep -q "<SafeAreaView\|SafeAreaView\|'SafeAreaView'" "$file"; then
      # Check if import already exists
      if ! grep -q "import { SafeAreaView } from 'react-native-safe-area-context'" "$file"; then
        # Add import after the react-native import
        sed -i '' "/import.*from 'react-native'/a\\
import { SafeAreaView } from 'react-native-safe-area-context';" "$file"
      fi
    fi
  else
    echo "File not found: $file"
  fi
done

echo "✅ Done fixing SafeAreaView imports!"
