#!/bin/bash
echo "=== Diagnostic Build ==="
npm install --legacy-peer-deps
expo export
echo "=== Build output ==="
find . -name "*.html" -o -name "index.html" | head -10
echo "=== dist/ contents ==="
ls -la dist/ 2>/dev/null || echo "No dist folder"
echo "=== web-build/ contents ==="
ls -la web-build/ 2>/dev/null || echo "No web-build folder"
