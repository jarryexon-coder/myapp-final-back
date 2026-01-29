#!/bin/bash
set -e

echo "🚀 Starting Railway build for Expo app"
echo "=== Using local npx expo ==="

# Install dependencies
npm install --legacy-peer-deps
npm install react-native-worklets@^0.7.2

echo "=== Testing npx expo ==="
npx expo --version

echo "=== Running expo export ==="
npx expo export

echo "=== Build output ==="
if [ -d "dist" ]; then
  echo "✅ SUCCESS: Found dist/ folder"
  echo "Files in dist/:"
  find dist -type f | head -20
  echo "Total files: $(find dist -type f | wc -l)"
else
  echo "❌ ERROR: No dist folder created"
  echo "Creating fallback structure..."
  mkdir -p dist
  cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>NBA Fantasy AI</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏀 NBA Fantasy AI</h1>
    <p>Your Expo app is being built. In the meantime:</p>
    <ul>
      <li><a href="https://pleasing-determination-production.up.railway.app/health" target="_blank">Backend Health Check</a></li>
      <li><a href="https://pleasing-determination-production.up.railway.app/api/nba/games" target="_blank">NBA Games API</a></li>
    </ul>
  </div>
</body>
</html>
EOF
  echo "✅ Created fallback dist/index.html"
fi
