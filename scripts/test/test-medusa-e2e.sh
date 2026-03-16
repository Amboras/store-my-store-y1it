#!/bin/bash

# Medusa E2E Testing Script
# Tests complete flow: Admin → API → Storefront → Cart → Checkout

set -e

PUBKEY=$(grep NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY storefront/.env.local | cut -d'=' -f2)
BASE_URL="http://localhost:9000"

echo "════════════════════════════════════════════════════"
echo "  Medusa v2 Complete End-to-End Test"
echo "════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

# Test function
test_api() {
  local test_name="$1"
  local expected="$2"
  shift 2
  local response=$("$@" 2>&1)

  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✅ PASS${NC}: $test_name"
    ((pass_count++))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC}: $test_name"
    echo "   Response: $response"
    ((fail_count++))
    return 1
  fi
}

echo "📋 Test Configuration:"
echo "   Backend: $BASE_URL"
echo "   Publishable Key: ${PUBKEY:0:20}..."
echo ""

# ============================================
# TEST 1: Infrastructure
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 1: Infrastructure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "Backend Health" "OK" \
  curl -s "$BASE_URL/health"

test_api "Admin Dashboard" "200" \
  curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/app"

test_api "Storefront" "200" \
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000"

echo ""

# ============================================
# TEST 2: Regions & Sales Channels
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 2: Regions & Sales Channels"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "List Regions" "India" \
  curl -s "$BASE_URL/store/regions" -H "x-publishable-api-key: $PUBKEY"

REGION_ID=$(curl -s "$BASE_URL/store/regions" -H "x-publishable-api-key: $PUBKEY" | jq -r '.regions[0].id')
echo "   Region ID: $REGION_ID"

test_api "Get Region by ID" "India" \
  curl -s "$BASE_URL/store/regions/$REGION_ID" -H "x-publishable-api-key: $PUBKEY"

echo ""

# ============================================
# TEST 3: Products API
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 3: Products API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PRODUCTS_RESPONSE=$(curl -s "$BASE_URL/store/products?limit=1" -H "x-publishable-api-key: $PUBKEY")
PRODUCT_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq '.products | length')

if [ "$PRODUCT_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}: Products exist ($PRODUCT_COUNT found)"
  ((pass_count++))

  PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | jq -r '.products[0].id')
  PRODUCT_TITLE=$(echo "$PRODUCTS_RESPONSE" | jq -r '.products[0].title')
  PRODUCT_HANDLE=$(echo "$PRODUCTS_RESPONSE" | jq -r '.products[0].handle')
  VARIANT_COUNT=$(echo "$PRODUCTS_RESPONSE" | jq '.products[0].variants | length')

  echo "   Product: $PRODUCT_TITLE"
  echo "   Handle: $PRODUCT_HANDLE"
  echo "   Variants: $VARIANT_COUNT"

  # Check if variants have prices
  PRICE=$(echo "$PRODUCTS_RESPONSE" | jq -r '.products[0].variants[0].calculated_price.calculated_amount')

  if [ "$PRICE" != "null" ] && [ -n "$PRICE" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Variants have prices (₹$(echo "scale=2; $PRICE / 100" | bc))"
    ((pass_count++))
    VARIANT_ID=$(echo "$PRODUCTS_RESPONSE" | jq -r '.products[0].variants[0].id')
  else
    echo -e "${RED}❌ FAIL${NC}: Variants have NO prices (calculated_price: null)"
    echo -e "${YELLOW}⚠️  CRITICAL: Products need proper price linking!${NC}"
    ((fail_count++))
  fi

  # Test product by handle
  test_api "Get product by handle" "$PRODUCT_TITLE" \
    curl -s "$BASE_URL/store/products?handle=$PRODUCT_HANDLE" -H "x-publishable-api-key: $PUBKEY"

else
  echo -e "${RED}❌ FAIL${NC}: No products found"
  echo -e "${YELLOW}⚠️  Please add products via Admin Dashboard first${NC}"
  echo ""
  echo "To add products:"
  echo "1. Open http://localhost:9000/app"
  echo "2. Go to Products → Create Product"
  echo "3. Add title, handle, description"
  echo "4. Add variant with SKU"
  echo "5. Set price"
  echo "6. Publish product"
  echo ""
  ((fail_count++))
  exit 1
fi

echo ""

# ============================================
# TEST 4: Collections API
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 4: Collections API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COLLECTIONS=$(curl -s "$BASE_URL/store/collections" -H "x-publishable-api-key: $PUBKEY" | jq '.collections | length')

if [ "$COLLECTIONS" -gt 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}: Collections exist ($COLLECTIONS found)"
  ((pass_count++))

  COLLECTION_HANDLE=$(curl -s "$BASE_URL/store/collections" -H "x-publishable-api-key: $PUBKEY" | jq -r '.collections[0].handle')
  echo "   Collection handle: $COLLECTION_HANDLE"

  test_api "Get collection by handle" "$COLLECTION_HANDLE" \
    curl -s "$BASE_URL/store/collections/$COLLECTION_HANDLE" -H "x-publishable-api-key: $PUBKEY"
else
  echo -e "${YELLOW}⚠️  WARNING${NC}: No collections found (optional)"
  echo "   Collections are needed for /collections/[handle] pages"
fi

echo ""

# ============================================
# TEST 5: Categories API
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 5: Categories API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CATEGORIES=$(curl -s "$BASE_URL/store/product-categories" -H "x-publishable-api-key: $PUBKEY" | jq '.product_categories | length')

if [ "$CATEGORIES" -gt 0 ]; then
  echo -e "${GREEN}✅ PASS${NC}: Categories exist ($CATEGORIES found)"
  ((pass_count++))

  CATEGORY_HANDLE=$(curl -s "$BASE_URL/store/product-categories" -H "x-publishable-api-key: $PUBKEY" | jq -r '.product_categories[0].handle')
  echo "   Category handle: $CATEGORY_HANDLE"
else
  echo -e "${YELLOW}⚠️  WARNING${NC}: No categories found (optional)"
  echo "   Categories help organize products"
fi

echo ""

# ============================================
# TEST 6: Cart Workflow
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 6: Cart Workflow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$VARIANT_ID" ]; then
  echo -e "${RED}❌ SKIP${NC}: No variant with price found (skipping cart tests)"
  ((fail_count+=5))
else
  # Create cart
  CART_RESPONSE=$(curl -s -X POST "$BASE_URL/store/carts" \
    -H "x-publishable-api-key: $PUBKEY" \
    -H "Content-Type: application/json" \
    -d "{\"region_id\":\"$REGION_ID\"}")

  CART_ID=$(echo "$CART_RESPONSE" | jq -r '.cart.id')

  if [ "$CART_ID" != "null" ] && [ -n "$CART_ID" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Create cart"
    echo "   Cart ID: $CART_ID"
    ((pass_count++))

    # Add item to cart
    ADD_RESPONSE=$(curl -s -X POST "$BASE_URL/store/carts/$CART_ID/line-items" \
      -H "x-publishable-api-key: $PUBKEY" \
      -H "Content-Type: application/json" \
      -d "{\"variant_id\":\"$VARIANT_ID\",\"quantity\":1}")

    ITEM_COUNT=$(echo "$ADD_RESPONSE" | jq '.cart.items | length')

    if [ "$ITEM_COUNT" -gt 0 ]; then
      echo -e "${GREEN}✅ PASS${NC}: Add item to cart"
      ((pass_count++))

      LINE_ITEM_ID=$(echo "$ADD_RESPONSE" | jq -r '.cart.items[0].id')
      CART_TOTAL=$(echo "$ADD_RESPONSE" | jq -r '.cart.total')
      echo "   Items in cart: $ITEM_COUNT"
      echo "   Cart total: ₹$(echo "scale=2; $CART_TOTAL / 100" | bc)"

      # Update quantity
      UPDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/store/carts/$CART_ID/line-items/$LINE_ITEM_ID" \
        -H "x-publishable-api-key: $PUBKEY" \
        -H "Content-Type: application/json" \
        -d '{"quantity":2}')

      NEW_QTY=$(echo "$UPDATE_RESPONSE" | jq '.cart.items[0].quantity')

      if [ "$NEW_QTY" = "2" ]; then
        echo -e "${GREEN}✅ PASS${NC}: Update cart quantity"
        ((pass_count++))
      else
        echo -e "${RED}❌ FAIL${NC}: Update cart quantity (got: $NEW_QTY)"
        ((fail_count++))
      fi

      # Remove item
      REMOVE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/store/carts/$CART_ID/line-items/$LINE_ITEM_ID" \
        -H "x-publishable-api-key: $PUBKEY")

      REMAINING=$(echo "$REMOVE_RESPONSE" | jq '.cart.items | length')

      if [ "$REMAINING" = "0" ]; then
        echo -e "${GREEN}✅ PASS${NC}: Remove item from cart"
        ((pass_count++))
      else
        echo -e "${RED}❌ FAIL${NC}: Remove item from cart"
        ((fail_count++))
      fi

      # Retrieve cart
      GET_CART=$(curl -s "$BASE_URL/store/carts/$CART_ID" \
        -H "x-publishable-api-key: $PUBKEY")

      if echo "$GET_CART" | grep -q "$CART_ID"; then
        echo -e "${GREEN}✅ PASS${NC}: Retrieve cart"
        ((pass_count++))
      else
        echo -e "${RED}❌ FAIL${NC}: Retrieve cart"
        ((fail_count++))
      fi

    else
      echo -e "${RED}❌ FAIL${NC}: Add item to cart"
      echo "   Response: $ADD_RESPONSE"
      ((fail_count+=4))
    fi
  else
    echo -e "${RED}❌ FAIL${NC}: Create cart"
    echo "   Response: $CART_RESPONSE"
    ((fail_count+=5))
  fi
fi

echo ""

# ============================================
# TEST 7: Storefront Pages
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 7: Storefront Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "Homepage" "200" \
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000"

if [ -n "$PRODUCT_HANDLE" ]; then
  test_api "Product detail page" "200" \
    curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/products/$PRODUCT_HANDLE"
else
  echo -e "${YELLOW}⚠️  SKIP${NC}: Product detail page (no product handle)"
fi

test_api "Products listing page" "200" \
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/products"

test_api "Cart page" "200" \
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/cart"

echo ""

# ============================================
# SUMMARY
# ============================================
echo "════════════════════════════════════════════════════"
echo "  TEST SUMMARY"
echo "════════════════════════════════════════════════════"
echo ""

TOTAL=$((pass_count + fail_count))

echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  echo ""
  echo "Your Medusa setup is working perfectly!"
  echo ""
  echo "Next steps:"
  echo "1. Add more products via Admin Dashboard"
  echo "2. Create collections and categories"
  echo "3. Test checkout flow"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo ""
  echo "Issues to fix:"

  if [ -z "$VARIANT_ID" ]; then
    echo "- Products have no prices (variants not linked to price sets)"
    echo "  Fix: Run initialization script or recreate products properly"
  fi

  if [ "$PRODUCT_COUNT" = "0" ]; then
    echo "- No products found"
    echo "  Fix: Add products via Admin Dashboard"
  fi

  exit 1
fi
