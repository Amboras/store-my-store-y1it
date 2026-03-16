#!/bin/bash

# ============================================
# COMPREHENSIVE E-COMMERCE STORE TEST SCRIPT
# ============================================

set -e

API_KEY="pk_888831df90fe26176516502f5c4ae0a13a5f89e05b1fc310898389940898b127"
REGION_ID="reg_01KKSDJ90H3TTEDWVSHNZRV7HH"
BACKEND_URL="http://localhost:9000"
FRONTEND_URL="http://localhost:3000"

echo "============================================"
echo "E-COMMERCE STORE - COMPREHENSIVE TEST SUITE"
echo "============================================"
echo ""

PASS=0
FAIL=0
ISSUES=()

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_field="$3"

    echo -n "Testing: $name... "

    response=$(curl -s -H "x-publishable-api-key: $API_KEY" "$url")

    if echo "$response" | jq -e "$expected_field" > /dev/null 2>&1; then
        echo "✅ PASS"
        ((PASS++))
        return 0
    else
        echo "❌ FAIL"
        ((FAIL++))
        ISSUES+=("$name: Expected field '$expected_field' not found")
        echo "   Response: $(echo "$response" | jq -c '.' | head -c 200)"
        return 1
    fi
}

# ============================================
# 1. BASIC API HEALTH CHECK
# ============================================
echo "1️⃣  BASIC API HEALTH CHECK"
echo "----------------------------------------"

echo -n "Testing: Health endpoint... "
health_response=$(curl -s "$BACKEND_URL/health")
if [ "$health_response" = "OK" ]; then
    echo "✅ PASS"
    ((PASS++))
else
    echo "❌ FAIL (Response: $health_response)"
    ((FAIL++))
    ISSUES+=("Health endpoint: Expected 'OK', got '$health_response'")
fi

echo ""

# ============================================
# 2. REGIONS
# ============================================
echo "2️⃣  REGIONS"
echo "----------------------------------------"

test_endpoint \
    "List regions" \
    "$BACKEND_URL/store/regions" \
    ".regions | length > 0"

test_endpoint \
    "Get specific region" \
    "$BACKEND_URL/store/regions/$REGION_ID" \
    ".region.id"

echo ""

# ============================================
# 3. PRODUCT CATALOG
# ============================================
echo "3️⃣  PRODUCT CATALOG"
echo "----------------------------------------"

test_endpoint \
    "List all products" \
    "$BACKEND_URL/store/products" \
    ".products | length > 0"

test_endpoint \
    "List products with prices" \
    "$BACKEND_URL/store/products?region_id=$REGION_ID&fields=%2Bvariants.calculated_price" \
    ".products | length > 0"

# Get a product handle for testing
PRODUCT_HANDLE=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/products" | jq -r '.products[0].handle')

echo -n "Testing: Get product by handle (via query param)... "
response=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/products?handle=$PRODUCT_HANDLE")
if echo "$response" | jq -e '.products | length == 1' > /dev/null 2>&1; then
    echo "✅ PASS"
    ((PASS++))
else
    echo "❌ FAIL"
    ((FAIL++))
    ISSUES+=("Get product by handle: Failed to retrieve single product")
fi

echo ""

# ============================================
# 4. CATEGORIES
# ============================================
echo "4️⃣  CATEGORIES"
echo "----------------------------------------"

test_endpoint \
    "List all categories" \
    "$BACKEND_URL/store/product-categories" \
    ".product_categories | length > 0"

# Get a category ID for testing
CATEGORY_ID=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/product-categories" | jq -r '.product_categories[0].id')

test_endpoint \
    "Filter products by category" \
    "$BACKEND_URL/store/products?category_id[]=$CATEGORY_ID" \
    ".products"

# Check if products have categories assigned
echo -n "Testing: Products have categories assigned... "
response=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/products?fields=%2Bcategories.*")
if echo "$response" | jq -e '.products[0].categories | length > 0' > /dev/null 2>&1; then
    category_count=$(echo "$response" | jq '.products[0].categories | length')
    category_names=$(echo "$response" | jq -r '[.products[0].categories[].name] | join(", ")')
    echo "✅ PASS ($category_count categories: $category_names)"
    ((PASS++))
else
    echo "❌ FAIL"
    ((FAIL++))
    ISSUES+=("Category Assignment: Products don't have categories - seed script may have failed")
fi

echo ""

# ============================================
# 5. COLLECTIONS
# ============================================
echo "5️⃣  COLLECTIONS"
echo "----------------------------------------"

test_endpoint \
    "List all collections" \
    "$BACKEND_URL/store/collections" \
    ".collections | length > 0"

# Get a collection ID for testing
COLLECTION_ID=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/collections" | jq -r '.collections[0].id')

test_endpoint \
    "Filter products by collection" \
    "$BACKEND_URL/store/products?collection_id[]=$COLLECTION_ID" \
    ".products | length > 0"

echo ""

# ============================================
# 6. PRICING
# ============================================
echo "6️⃣  PRICING"
echo "----------------------------------------"

echo -n "Testing: Products have valid prices... "
response=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/products?region_id=$REGION_ID&fields=%2Bvariants.calculated_price")
price=$(echo "$response" | jq '.products[0].variants[0].calculated_price.calculated_amount')
if [ "$price" != "null" ] && [ -n "$price" ]; then
    echo "✅ PASS (Price: ₹$(echo "scale=2; $price / 100" | bc))"
    ((PASS++))
else
    echo "❌ FAIL"
    ((FAIL++))
    ISSUES+=("Pricing: Products don't have calculated prices")
fi

echo ""

# ============================================
# 7. CART OPERATIONS
# ============================================
echo "7️⃣  CART OPERATIONS"
echo "----------------------------------------"

echo -n "Testing: Create cart... "
# Get first sales channel ID
SALES_CHANNEL_ID=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/products" | jq -r '.products[0].collection.id' | sed 's/pcol/sc/g' || echo "sc_01KKRMB18SJPK1RAA0WJB3WWA7")
# Use a known sales channel ID as fallback
SALES_CHANNEL_ID="sc_01KKRMB18SJPK1RAA0WJB3WWA7"

cart_response=$(curl -s -X POST -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/carts" -H "Content-Type: application/json" -d "{\"region_id\": \"$REGION_ID\", \"sales_channel_id\": \"$SALES_CHANNEL_ID\"}")
CART_ID=$(echo "$cart_response" | jq -r '.cart.id')
if [ "$CART_ID" != "null" ] && [ -n "$CART_ID" ]; then
    echo "✅ PASS (Cart ID: $CART_ID)"
    ((PASS++))
else
    echo "❌ FAIL"
    ((FAIL++))
    ISSUES+=("Cart Creation: Failed to create cart - API Key may be associated with multiple sales channels")
    echo "   Response: $(echo "$cart_response" | jq -c '.' | head -c 300)"
fi

# Add item to cart
if [ "$CART_ID" != "null" ] && [ -n "$CART_ID" ]; then
    VARIANT_ID=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/products" | jq -r '.products[0].variants[0].id')

    echo -n "Testing: Add item to cart... "
    add_item_response=$(curl -s -X POST -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/carts/$CART_ID/line-items" -H "Content-Type: application/json" -d "{\"variant_id\": \"$VARIANT_ID\", \"quantity\": 1}")

    if echo "$add_item_response" | jq -e '.cart.items | length > 0' > /dev/null 2>&1; then
        echo "✅ PASS"
        ((PASS++))
    else
        echo "❌ FAIL"
        ((FAIL++))
        ISSUES+=("Add to Cart: Failed to add item to cart")
        echo "   Response: $(echo "$add_item_response" | jq -c '.' | head -c 200)"
    fi
fi

echo ""

# ============================================
# 8. STOREFRONT PAGES
# ============================================
echo "8️⃣  STOREFRONT PAGES"
echo "----------------------------------------"

test_page() {
    local name="$1"
    local url="$2"

    echo -n "Testing: $name... "

    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$http_code" = "200" ]; then
        echo "✅ PASS (HTTP $http_code)"
        ((PASS++))
    else
        echo "❌ FAIL (HTTP $http_code)"
        ((FAIL++))
        ISSUES+=("$name: Expected HTTP 200, got $http_code")
    fi
}

test_page "Homepage" "$FRONTEND_URL/"
test_page "Products page" "$FRONTEND_URL/products"
test_page "Checkout page" "$FRONTEND_URL/checkout"

# Test collection page
COLLECTION_HANDLE=$(curl -s -H "x-publishable-api-key: $API_KEY" "$BACKEND_URL/store/collections" | jq -r '.collections[0].handle')
test_page "Collection page" "$FRONTEND_URL/collections/$COLLECTION_HANDLE"

echo ""

# ============================================
# SUMMARY
# ============================================
echo "============================================"
echo "TEST SUMMARY"
echo "============================================"
echo "✅ PASSED: $PASS"
echo "❌ FAILED: $FAIL"
echo "TOTAL: $((PASS + FAIL))"
echo ""

if [ ${#ISSUES[@]} -gt 0 ]; then
    echo "🐛 ISSUES FOUND:"
    echo "----------------------------------------"
    for issue in "${ISSUES[@]}"; do
        echo "  • $issue"
    done
    echo ""
fi

echo "============================================"

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    exit 0
else
    echo "⚠️  SOME TESTS FAILED - Review issues above"
    exit 1
fi
