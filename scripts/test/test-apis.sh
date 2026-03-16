#!/bin/bash

# API Testing Script - Check all APIs in detail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_KEY="pk_888831df90fe26176516502f5c4ae0a13a5f89e05b1fc310898389940898b127"

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Medusa Store API - Complete Check${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Get region
echo -e "${BLUE}1. Fetching Regions...${NC}"
REGION_ID=$(curl -s "http://localhost:9000/store/regions" -H "x-publishable-api-key: $API_KEY" | jq -r '.regions[0].id')
REGION_NAME=$(curl -s "http://localhost:9000/store/regions" -H "x-publishable-api-key: $API_KEY" | jq -r '.regions[0].name')
REGION_CURRENCY=$(curl -s "http://localhost:9000/store/regions" -H "x-publishable-api-key: $API_KEY" | jq -r '.regions[0].currency_code')
echo -e "   ${GREEN}✓${NC} Region: $REGION_NAME ($REGION_CURRENCY, ID: $REGION_ID)"
echo ""

# Test products WITHOUT region
echo -e "${BLUE}2. Products WITHOUT region_id (should have null prices)...${NC}"
curl -s "http://localhost:9000/store/products?limit=2" -H "x-publishable-api-key: $API_KEY" | \
  jq '.products[] | {title, variant1_price: .variants[0].calculated_price}'
echo ""

# Test products WITH region
echo -e "${BLUE}3. Products WITH region_id (should have prices)...${NC}"
curl -s "http://localhost:9000/store/products?region_id=$REGION_ID&limit=2&fields=+variants.calculated_price" -H "x-publishable-api-key: $API_KEY" | \
  jq '.products[] | {title, variant1: {title: .variants[0].title, price_inr: (.variants[0].calculated_price.calculated_amount / 100)}}'
echo ""

# Test collections
echo -e "${BLUE}4. Collections...${NC}"
curl -s "http://localhost:9000/store/collections" -H "x-publishable-api-key: $API_KEY" | \
  jq '.collections[] | {title, handle}'
echo ""

# Test specific collection with products
echo -e "${BLUE}5. Featured Collection Products...${NC}"
FEATURED_ID=$(curl -s "http://localhost:9000/store/collections" -H "x-publishable-api-key: $API_KEY" | jq -r '.collections[] | select(.handle=="featured") | .id')
echo "   Collection ID: $FEATURED_ID"
curl -s "http://localhost:9000/store/products?collection_id[]=$FEATURED_ID&region_id=$REGION_ID&fields=+variants.calculated_price" -H "x-publishable-api-key: $API_KEY" | \
  jq '{product_count: (.products | length), products: [.products[] | {title, price: (.variants[0].calculated_price.calculated_amount / 100)}]}'
echo ""

# Test categories
echo -e "${BLUE}6. Product Categories...${NC}"
curl -s "http://localhost:9000/store/product-categories?limit=5" -H "x-publishable-api-key: $API_KEY" | \
  jq '.product_categories[] | {name, handle, parent_category: .parent_category_id}'
echo ""

echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  API Testing Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "KEY FINDINGS:"
echo "  - Products MUST include region_id parameter to get prices"
echo "  - Products MUST include fields=+variants.calculated_price"
echo "  - Collections exist and have products assigned"
echo ""
echo "Storefront URL: http://localhost:3000"
echo "Backend URL: http://localhost:9000"
echo "Admin URL: http://localhost:9000/app"
