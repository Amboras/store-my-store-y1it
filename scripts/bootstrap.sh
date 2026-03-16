#!/bin/bash

# Bootstrap script - Auto-setup Medusa infrastructure
# Runs on first `make dev` to ensure everything is configured

set -e

BACKEND_DIR="backend"
STOREFRONT_DIR="storefront"
BOOTSTRAP_MARKER=".bootstrap-complete"

echo "🚀 Checking if bootstrap is needed..."

# Check if bootstrap already completed
if [ -f "$BOOTSTRAP_MARKER" ]; then
  echo "✅ Bootstrap already completed (found $BOOTSTRAP_MARKER)"
  exit 0
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "  First-Time Setup - Auto Bootstrap"
echo "════════════════════════════════════════════════════"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:9000/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Backend failed to start after 30 seconds"
    exit 1
  fi
  sleep 1
done

echo ""
echo "🔧 Running auto-setup..."

# Run the setup script via Medusa exec
npx medusa exec ./scripts/setup-infrastructure.ts

# Mark bootstrap as complete
touch "$BOOTSTRAP_MARKER"

echo ""
echo "════════════════════════════════════════════════════"
echo "  ✅ Bootstrap Complete!"
echo "════════════════════════════════════════════════════"
echo ""
echo "Your Medusa store is ready!"
echo ""
echo "📋 What's configured:"
echo "  ✅ Region: India (INR)"
echo "  ✅ Sales Channel: Default"
echo "  ✅ Publishable API Key (auto-configured in storefront)"
echo "  ✅ Everything linked and ready"
echo ""
echo "🎯 Next Steps:"
echo "  1. Open Admin: http://localhost:9000/app"
echo "  2. Create admin user: npx medusa user -e admin@test.com -p supersecret123"
echo "  3. Add products, collections, categories"
echo "  4. Visit storefront: http://localhost:3000"
echo ""
