# E-commerce Store - API Reference

**Backend:** http://localhost:9000
**API Key:** `pk_888831df90fe26176516502f5c4ae0a13a5f89e05b1fc310898389940898b127`
**Region ID:** `reg_01KKSDJ90H3TTEDWVSHNZRV7HH` (India, INR)

---

## Quick Start

All store API requests require the publishable API key header:

```bash
curl -H "x-publishable-api-key: pk_888831df90fe26176516502f5c4ae0a13a5f89e05b1fc310898389940898b127" \
  "http://localhost:9000/store/products"
```

---

## Products

### List All Products

```bash
GET /store/products
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/products"
```

**Response:**
```json
{
  "products": [
    {
      "id": "prod_01KKV2XZCXKD2GHWAQXJHB6W55",
      "title": "ASUS ROG Strix G16 (2024)",
      "handle": "asus-rog-strix-g16-2024",
      "description": "High-performance gaming laptop...",
      "thumbnail": "https://images.unsplash.com/...",
      "collection_id": "pcol_01KKV2XZCS1MPNEXQKZ102PES4"
    }
  ],
  "count": 8,
  "offset": 0,
  "limit": 50
}
```

---

### List Products with Prices

```bash
GET /store/products?region_id={region_id}&fields=+variants.calculated_price
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/products?region_id=reg_01KKSDJ90H3TTEDWVSHNZRV7HH&fields=%2Bvariants.calculated_price"
```

**Response:**
```json
{
  "products": [
    {
      "id": "prod_xxx",
      "title": "ASUS ROG Strix G16 (2024)",
      "variants": [
        {
          "id": "variant_xxx",
          "title": "Standard (16GB RAM)",
          "calculated_price": {
            "calculated_amount": 14999900,
            "currency_code": "inr"
          }
        }
      ]
    }
  ]
}
```

**Price Conversion:**
- API returns prices in smallest currency unit (paise for INR)
- ₹149,999 = 14999900 paise
- Display: `amount / 100` = ₹149,999.00

---

### Get Product by Handle

```bash
GET /store/products?handle={handle}
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/products?handle=asus-rog-strix-g16-2024"
```

**Note:** Use query parameter `?handle=xxx`, NOT path parameter `/store/products/{handle}`

---

### List Products with Categories

```bash
GET /store/products?fields=+categories.*
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/products?fields=%2Bcategories.*"
```

**Response:**
```json
{
  "products": [
    {
      "id": "prod_xxx",
      "title": "ASUS ROG Strix G16 (2024)",
      "categories": [
        {
          "id": "pcat_01KKV2XZAZ7VRCXT36Z7ZEBR1Y",
          "name": "RTX 4060",
          "handle": "rtx-4060"
        },
        {
          "id": "pcat_01KKV2XZC0ZPHZSZ1P83HAXEK3",
          "name": "ASUS ROG",
          "handle": "asus-rog"
        },
        {
          "id": "pcat_01KKV2XZBMKAM6JF637FD867AC",
          "name": "Mid-Range (₹80k-₹1.5L)",
          "handle": "mid-range"
        }
      ]
    }
  ]
}
```

**Important:** Use `fields=%2Bcategories.*` (URL-encoded `+categories.*`) to expand nested objects.

---

### Filter Products by Category

```bash
GET /store/products?category_id[]={category_id}
```

**Example:**
```bash
# Get all RTX 4060 laptops
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/products?category_id[]=pcat_01KKV2XZAZ7VRCXT36Z7ZEBR1Y"
```

**Response:**
```json
{
  "products": [
    {
      "id": "prod_xxx",
      "title": "ASUS ROG Strix G16 (2024)"
    },
    {
      "id": "prod_xxx",
      "title": "Acer Predator Helios 300"
    }
  ],
  "count": 2
}
```

---

### Filter Products by Collection

```bash
GET /store/products?collection_id[]={collection_id}
```

**Example:**
```bash
# Get Best Sellers
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/products?collection_id[]=pcol_01KKV2XZCS1MPNEXQKZ102PES4"
```

**Response:**
```json
{
  "products": [ /* 5 best-selling products */ ],
  "count": 5
}
```

---

### Combine Filters

You can combine multiple query parameters:

```bash
# RTX 4060 laptops in Best Sellers collection, with prices and categories
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/products?category_id[]=pcat_01KKV2XZAZ7VRCXT36Z7ZEBR1Y&collection_id[]=pcol_01KKV2XZCS1MPNEXQKZ102PES4&region_id=reg_01KKSDJ90H3TTEDWVSHNZRV7HH&fields=%2Bvariants.calculated_price,%2Bcategories.*"
```

---

## Categories

### List All Categories

```bash
GET /store/product-categories
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/product-categories"
```

**Response:**
```json
{
  "product_categories": [
    {
      "id": "pcat_01KKV2XZAJFVK3QN2SVRSWDMG9",
      "name": "Gaming Laptops",
      "handle": "gaming-laptops"
    },
    {
      "id": "pcat_01KKV2XZAZ7VRCXT36Z7ZEBR1Y",
      "name": "RTX 4060",
      "handle": "rtx-4060",
      "parent_category_id": "pcat_01KKV2XZAJFVK3QN2SVRSWDMG9"
    }
  ],
  "count": 16
}
```

**Available Categories:**
- **GPU Tiers:** RTX 4050, RTX 4060, RTX 4070, RTX 4080, RTX 4090
- **Price Ranges:** Budget (<₹80k), Mid-Range (₹80k-₹1.5L), Premium (₹1.5L-₹2.5L), Flagship (₹2.5L+)
- **Brands:** ASUS ROG, MSI, Lenovo Legion, HP Omen, Acer, Dell

---

## Collections

### List All Collections

```bash
GET /store/collections
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/collections"
```

**Response:**
```json
{
  "collections": [
    {
      "id": "pcol_01KKV2XZCS1MPNEXQKZ102PES4",
      "title": "Best Sellers",
      "handle": "best-sellers"
    },
    {
      "id": "pcol_01KKV2XZCVWRP8F4F3XHT39S36",
      "title": "New Arrivals",
      "handle": "new-arrivals"
    }
  ],
  "count": 5
}
```

**Available Collections:**
- **Best Sellers** (`best-sellers`) - 5 products
- **New Arrivals** (`new-arrivals`) - 3 products
- **Budget Gaming** (`budget-gaming`) - Products under ₹1L
- **RTX 4090 Beasts** (`rtx-4090`) - RTX 4090 laptops
- **Featured Products** (`featured`) - First 4 products

---

## Regions

### List All Regions

```bash
GET /store/regions
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/regions"
```

**Response:**
```json
{
  "regions": [
    {
      "id": "reg_01KKSDJ90H3TTEDWVSHNZRV7HH",
      "name": "India",
      "currency_code": "inr"
    }
  ],
  "count": 1
}
```

---

### Get Region by ID

```bash
GET /store/regions/{region_id}
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/regions/reg_01KKSDJ90H3TTEDWVSHNZRV7HH"
```

---

## Cart Operations

### Create Cart

```bash
POST /store/carts
```

**Request Body:**
```json
{
  "region_id": "reg_01KKSDJ90H3TTEDWVSHNZRV7HH",
  "sales_channel_id": "sc_01KKRMB18SJPK1RAA0WJB3WWA7"
}
```

**Example:**
```bash
curl -X POST -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/carts" \
  -H "Content-Type: application/json" \
  -d '{
    "region_id": "reg_01KKSDJ90H3TTEDWVSHNZRV7HH",
    "sales_channel_id": "sc_01KKRMB18SJPK1RAA0WJB3WWA7"
  }'
```

**Response:**
```json
{
  "cart": {
    "id": "cart_01KKV4C2J5P76X3T72RZ021XQK",
    "region_id": "reg_01KKSDJ90H3TTEDWVSHNZRV7HH",
    "items": [],
    "total": 0
  }
}
```

**Note:** `sales_channel_id` is required when API key is associated with multiple channels.

---

### Add Item to Cart

```bash
POST /store/carts/{cart_id}/line-items
```

**Request Body:**
```json
{
  "variant_id": "variant_01KKV2XZCXJTMCG9Y2W4P9CCPV",
  "quantity": 1
}
```

**Example:**
```bash
curl -X POST -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/carts/cart_01KKV4C2J5P76X3T72RZ021XQK/line-items" \
  -H "Content-Type: application/json" \
  -d '{
    "variant_id": "variant_01KKV2XZCXJTMCG9Y2W4P9CCPV",
    "quantity": 1
  }'
```

**Response:**
```json
{
  "cart": {
    "id": "cart_01KKV4C2J5P76X3T72RZ021XQK",
    "items": [
      {
        "id": "item_xxx",
        "title": "ASUS ROG Strix G16 (2024)",
        "variant_id": "variant_01KKV2XZCXJTMCG9Y2W4P9CCPV",
        "quantity": 1,
        "unit_price": 14999900,
        "total": 14999900
      }
    ],
    "subtotal": 14999900,
    "total": 14999900
  }
}
```

---

### Get Cart

```bash
GET /store/carts/{cart_id}
```

**Example:**
```bash
curl -H "x-publishable-api-key: YOUR_KEY" \
  "http://localhost:9000/store/carts/cart_01KKV4C2J5P76X3T72RZ021XQK"
```

---

## Field Expansion Syntax

Medusa v2 uses field expansion to load related data:

### Basic Expansion
```bash
# Add single field
?fields=+collection

# Add multiple fields
?fields=+collection,+variants
```

### Nested Expansion
```bash
# Expand nested object properties
?fields=+categories.*

# Expand specific nested fields
?fields=+variants.calculated_price
```

### URL Encoding
Remember to URL-encode `+` as `%2B`:
```bash
# In code
fields=+categories.*

# In URL
fields=%2Bcategories.*
```

---

## Common Use Cases

### Product Listing Page
```bash
GET /store/products?region_id=reg_01KKSDJ90H3TTEDWVSHNZRV7HH&fields=%2Bvariants.calculated_price,%2Bcategories.*
```

Returns products with:
- Calculated prices for the region
- Full category information
- Collection data

---

### Product Detail Page
```bash
GET /store/products?handle=asus-rog-strix-g16-2024&region_id=reg_01KKSDJ90H3TTEDWVSHNZRV7HH&fields=%2Bvariants.calculated_price,%2Bcategories.*
```

Returns single product with:
- All variants and their prices
- Categories
- Full product details

---

### Category Filter Page
```bash
GET /store/products?category_id[]=pcat_01KKV2XZAZ7VRCXT36Z7ZEBR1Y&region_id=reg_01KKSDJ90H3TTEDWVSHNZRV7HH&fields=%2Bvariants.calculated_price
```

Returns all RTX 4060 laptops with prices

---

### Collection Page
```bash
GET /store/products?collection_id[]=pcol_01KKV2XZCS1MPNEXQKZ102PES4&region_id=reg_01KKSDJ90H3TTEDWVSHNZRV7HH&fields=%2Bvariants.calculated_price
```

Returns all products in "Best Sellers" collection

---

## Resource IDs

### Region
- `reg_01KKSDJ90H3TTEDWVSHNZRV7HH` - India (INR)

### Sales Channels
- `sc_01KKRMB18SJPK1RAA0WJB3WWA7` - Default Sales Channel
- `sc_01KKTC0AKG2QDE42RPFVM49Z0M` - GamerZone Store
- `sc_01KKTH3EPJAZEWGTGQE7GWGNA2` - GameLaptop India Web

### Category IDs

**GPU Tiers:**
- `pcat_01KKV2XZATH14MRP45J70FJ6E2` - RTX 4050
- `pcat_01KKV2XZAZ7VRCXT36Z7ZEBR1Y` - RTX 4060
- `pcat_01KKV2XZB4BVA1K4JZYP5MDKRS` - RTX 4070
- `pcat_01KKV2XZB9N594DYBQJRVDFM66` - RTX 4080
- `pcat_01KKV2XZBC67MEKRDZX2RJ6TE7` - RTX 4090

**Price Ranges:**
- `pcat_01KKV2XZBG1BRH4B0BF1G1ZG8N` - Budget (Under ₹80k)
- `pcat_01KKV2XZBMKAM6JF637FD867AC` - Mid-Range (₹80k-₹1.5L)
- `pcat_01KKV2XZBRJ67MD5YC6EM7KN9B` - Premium (₹1.5L-₹2.5L)
- `pcat_01KKV2XZBVDDTNXPXVMNF3YNS6` - Flagship (₹2.5L+)

**Brands:**
- `pcat_01KKV2XZC0ZPHZSZ1P83HAXEK3` - ASUS ROG
- `pcat_01KKV2XZC328A04NNEA31EBHN4` - MSI
- `pcat_01KKV2XZC6NRE166Z5YY267M2Y` - Lenovo Legion
- `pcat_01KKV2XZC82NBA9644BJJQW3M2` - HP Omen
- `pcat_01KKV2XZCCRBXG5FX0R1ARX4JE` - Acer
- `pcat_01KKV2XZCFME8CN756FXPGC6H6` - Dell

**Main Category:**
- `pcat_01KKV2XZAJFVK3QN2SVRSWDMG9` - Gaming Laptops (parent)

### Collection IDs
- `pcol_01KKV2XZCS1MPNEXQKZ102PES4` - Best Sellers
- `pcol_01KKV2XZCVWRP8F4F3XHT39S36` - New Arrivals
- `pcol_01KKV2XZCQMWPW828MSSQ70MCR` - Budget Gaming
- `pcol_01KKV2XZCNNACA2RW4ES409EHW` - RTX 4090 Beasts
- `pcol_01KKV2XZCJEXB199BEW7DT718M` - Featured Products

---

## Testing

Run the comprehensive test suite:

```bash
cd backend
./test-everything.sh
```

**Expected Output:** ✅ 18/18 tests pass

---

## Error Handling

### Common Errors

**1. Missing API Key**
```json
{
  "type": "not_allowed",
  "message": "Publishable API key required in the request header: x-publishable-api-key"
}
```
**Solution:** Add header `-H "x-publishable-api-key: YOUR_KEY"`

---

**2. Multiple Sales Channels**
```json
{
  "errors": ["Cannot assign sales channel to cart. The Publishable API Key has multiple associated sales channels."]
}
```
**Solution:** Include `sales_channel_id` in cart creation body

---

**3. Product Not Found**
```json
{
  "type": "not_found",
  "message": "Product with id: xxx was not found"
}
```
**Solution:** Use query param `?handle=xxx` instead of path `/products/{handle}`

---

**4. Categories Return Null**
```json
{
  "products": [{
    "categories": null
  }]
}
```
**Solution:** Use proper field expansion: `fields=%2Bcategories.*`

---

## Next Steps

1. **Storefront Integration:** Use these endpoints in your Next.js frontend
2. **Add Authentication:** Implement customer login/registration
3. **Payment Integration:** Configure Stripe for checkout
4. **Deploy:** Use Railway/Vercel for production deployment

---

**Last Updated:** 2026-03-16
**Store Status:** ✅ 100% Functional (18/18 tests pass)
