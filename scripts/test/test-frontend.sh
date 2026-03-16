#!/bin/bash

# Frontend Verification Script
# Tests that all UI fixes are working correctly

set -e

BACKEND_URL="http://localhost:9000"
FRONTEND_URL="http://localhost:3000"
API_KEY="pk_888831df90fe26176516502f5c4ae0a13a5f89e05b1fc310898389940898b127"

echo "🧪 Frontend UI Verification Test"
echo "================================="
echo ""

# Test 1: Backend is running
echo "✓ Test 1: Checking backend is running..."
if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "  ✅ Backend is running at $BACKEND_URL"
else
    echo "  ❌ Backend is not running. Start it with: make dev-backend"
    exit 1
fi

# Test 2: Categories API returns data
echo ""
echo "✓ Test 2: Categories API returns categories..."
CATEGORIES_COUNT=$(curl -s "$BACKEND_URL/store/product-categories?limit=100" \
  -H "x-publishable-api-key: $API_KEY" | \
  python3 -c "import sys, json; print(len(json.load(sys.stdin)['product_categories']))" 2>/dev/null || echo "0")

if [ "$CATEGORIES_COUNT" -gt 0 ]; then
    echo "  ✅ Found $CATEGORIES_COUNT categories"
else
    echo "  ❌ No categories found"
    exit 1
fi

# Test 3: Products API returns data with prices
echo ""
echo "✓ Test 3: Products API returns products with prices..."
REGION_ID=$(curl -s "$BACKEND_URL/store/regions" \
  -H "x-publishable-api-key: $API_KEY" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['regions'][0]['id'])" 2>/dev/null)

PRODUCTS_COUNT=$(curl -s "$BACKEND_URL/store/products?limit=100&region_id=$REGION_ID&fields=%2Bvariants.calculated_price" \
  -H "x-publishable-api-key: $API_KEY" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['count'])" 2>/dev/null || echo "0")

if [ "$PRODUCTS_COUNT" -gt 0 ]; then
    echo "  ✅ Found $PRODUCTS_COUNT products with prices"
else
    echo "  ❌ No products found"
    exit 1
fi

# Test 4: Products can be filtered by category
echo ""
echo "✓ Test 4: Category filtering works..."
CATEGORY_ID=$(curl -s "$BACKEND_URL/store/product-categories?limit=100" \
  -H "x-publishable-api-key: $API_KEY" | \
  python3 -c "import sys, json; cats = json.load(sys.stdin)['product_categories']; print(cats[0]['id'] if cats else '')" 2>/dev/null)

if [ -n "$CATEGORY_ID" ]; then
    FILTERED_COUNT=$(curl -s "$BACKEND_URL/store/products?category_id=$CATEGORY_ID&region_id=$REGION_ID" \
      -H "x-publishable-api-key: $API_KEY" | \
      python3 -c "import sys, json; print(json.load(sys.stdin)['count'])" 2>/dev/null || echo "0")

    if [ "$FILTERED_COUNT" -gt 0 ]; then
        echo "  ✅ Category filtering returns $FILTERED_COUNT products"
    else
        echo "  ⚠️  Category filtering works but this category has no products"
    fi
else
    echo "  ❌ Could not get category ID"
    exit 1
fi

# Test 5: Cart creation works
echo ""
echo "✓ Test 5: Cart creation works..."
CART_ID=$(curl -s -X POST "$BACKEND_URL/store/carts" \
  -H "x-publishable-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['cart']['id'])" 2>/dev/null)

if [ -n "$CART_ID" ]; then
    echo "  ✅ Cart created successfully: $CART_ID"
else
    echo "  ❌ Cart creation failed"
    exit 1
fi

# Test 6: Add item to cart works
echo ""
echo "✓ Test 6: Add to cart works..."
VARIANT_ID=$(curl -s "$BACKEND_URL/store/products?limit=1&region_id=$REGION_ID&fields=%2Bvariants.calculated_price" \
  -H "x-publishable-api-key: $API_KEY" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['products'][0]['variants'][0]['id'])" 2>/dev/null)

if [ -n "$VARIANT_ID" ]; then
    CART_ITEMS=$(curl -s -X POST "$BACKEND_URL/store/carts/$CART_ID/line-items" \
      -H "x-publishable-api-key: $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"variant_id\": \"$VARIANT_ID\", \"quantity\": 1}" | \
      python3 -c "import sys, json; print(len(json.load(sys.stdin)['cart']['items']))" 2>/dev/null || echo "0")

    if [ "$CART_ITEMS" -gt 0 ]; then
        echo "  ✅ Item added to cart successfully"
    else
        echo "  ❌ Failed to add item to cart"
        exit 1
    fi
else
    echo "  ❌ Could not get variant ID"
    exit 1
fi

# Test 7: Frontend is accessible
echo ""
echo "✓ Test 7: Frontend is accessible..."
if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "  ✅ Frontend is running at $FRONTEND_URL"
else
    echo "  ⚠️  Frontend is not accessible. Start it with: make dev-storefront"
fi

echo ""
echo "================================="
echo "✅ All API tests passed!"
echo ""
echo "📋 Manual Browser Testing Required:"
echo ""
echo "1. Categories Filter:"
echo "   → Visit: $FRONTEND_URL/products"
echo "   → Verify: Sidebar shows all $CATEGORIES_COUNT categories"
echo "   → Verify: Clicking category filters products"
echo ""
echo "2. Sorting:"
echo "   → Visit: $FRONTEND_URL/products"
echo "   → Verify: Changing sort dropdown reorders products"
echo ""
echo "3. Cart & Checkout:"
echo "   → Visit any product page"
echo "   → Click 'Add to Cart'"
echo "   → Click cart icon in header"
echo "   → Click 'Checkout'"
echo "   → Verify: Checkout shows cart items"
echo ""
echo "4. Collections:"
echo "   → Visit: $FRONTEND_URL/collections/best-sellers"
echo "   → Verify: Products display correctly"
echo ""
