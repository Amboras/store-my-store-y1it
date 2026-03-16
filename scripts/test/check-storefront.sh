#!/bin/bash

echo "🔍 Checking Storefront Status..."
echo ""

echo "1. Check if Next.js is running:"
ps aux | grep "next dev" | grep -v grep || echo "❌ Next.js NOT running!"
echo ""

echo "2. Test homepage response:"
HOMEPAGE=$(curl -s http://localhost:3000 2>&1)
if echo "$HOMEPAGE" | grep -q "All Products\|ASUS\|MSI"; then
  echo "✅ Products found in HTML"
else
  echo "❌ No products in HTML"
fi
echo ""

echo "3. Test products API directly:"
curl -s http://localhost:3000/api/products 2>&1 | head -20 || echo "No API route"
echo ""

echo "4. Check for errors in page:"
if echo "$HOMEPAGE" | grep -qi "error"; then
  echo "⚠️  Errors found:"
  echo "$HOMEPAGE" | grep -i "error" | head -5
else
  echo "✅ No errors in HTML"
fi
echo ""

echo "5. Visit these URLs in your browser:"
echo "   Homepage: http://localhost:3000"
echo "   Products: http://localhost:3000/products"
echo "   Admin: http://localhost:9000/app"
echo ""

echo "6. Open browser console (F12) and check for JavaScript errors"
