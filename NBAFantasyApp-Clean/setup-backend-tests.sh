#!/bin/bash
# setup-backend-tests.sh

echo "🔧 Setting up backend connection tests..."

# Install required packages if not already installed
if ! command -v axios &> /dev/null; then
  echo "Installing axios..."
  npm install axios
fi

if ! command -v chalk &> /dev/null; then
  echo "Installing chalk..."
  npm install chalk
fi

if ! command -v commander &> /dev/null; then
  echo "Installing commander..."
  npm install commander
fi

# Create necessary directories
mkdir -p scripts
mkdir -p src/services
mkdir -p src/screens
mkdir -p reports

# Copy the test files
echo "Creating test files..."

# Create the main test script
cat > scripts/test-backend-connection.js << 'EOF'
// [paste the CLI script content here]
EOF

# Create the React Native verification service
cat > src/services/backend-verification.js << 'EOF'
// [paste the verification class content here]
EOF

# Create the test screen
cat > src/screens/BackendTestScreen.js << 'EOF'
// [paste the screen content here]
EOF

# Make scripts executable
chmod +x scripts/test-backend-connection.js

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Available commands:"
echo "   npm run test:backend           - Run basic backend tests"
echo "   npm run test:backend:full      - Run all test suites"
echo "   npm run verify:connection      - Run React Native test screen"
echo ""
echo "🔧 To test your backend connection:"
echo "   1. Make sure backend is running at http://localhost:3002"
echo "   2. Run: npm run test:backend"
echo ""
echo "📱 To use in React Native:"
echo "   1. Import BackendTestScreen in your navigation"
echo "   2. Navigate to the test screen to run tests"
