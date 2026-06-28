#!/bin/sh
set -e

echo "=== Production Build Script ==="
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "CWD: $(pwd)"
echo "Contents of CWD:"
ls -la

echo ""
echo "=== Step 1: Install dependencies ==="
npm ci --prefer-offline || npm install
echo "node_modules exists: $(test -d node_modules && echo YES || echo NO)"

echo ""
echo "=== Step 2: Build application ==="
node script/build.mjs

echo ""
echo "=== Step 3: Verify output ==="
echo "dist/ contents:"
ls -la dist/
echo ""
echo "dist/index.cjs exists: $(test -f dist/index.cjs && echo YES || echo NO)"
echo "dist/index.mjs exists: $(test -f dist/index.mjs && echo YES || echo NO)"
echo "dist/public exists: $(test -d dist/public && echo YES || echo NO)"

echo ""
echo "=== Build completed successfully ==="
