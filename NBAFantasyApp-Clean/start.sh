#!/bin/bash
echo "=== Starting NBA Fantasy Frontend ==="

# Create a simple server with proper cache headers
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files with proper cache headers
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.match(/\.(js|css|ttf|woff|woff2|png|jpg|jpeg|gif|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT} with proper cache headers`);
});
EOF

# Check what folder to serve
if [ -d "dist" ]; then
  echo "✅ Serving from dist/"
  node server.js
elif [ -d "web-build" ]; then
  echo "✅ Serving from web-build/"
  # Update the path in server.js
  sed -i 's|dirname, .dist.|dirname, .web-build.|g' server.js
  node server.js
else
  echo "⚠️ No build folder found"
  npx serve . -p $PORT
fi
