# 🚀 Quick Start Guide

Get your ecommerce starter template running in 5 minutes!

## Prerequisites

Make sure you have these installed:
- ✅ Node.js 20+ (`node --version`)
- ✅ PostgreSQL (`psql --version`)
- ✅ Redis (optional but recommended)

## Step 1: Install Dependencies

```bash
cd /Users/vaibhavagarwal/Documents/amboras/ecom-starter-template

# Install all dependencies
make install
```

## Step 2: Start Database

### Option A: Docker (Easiest)

```bash
cd backend
docker-compose up -d
```

This starts PostgreSQL and Redis in containers.

### Option B: Local PostgreSQL

```bash
# Start PostgreSQL
brew services start postgresql@15  # macOS
# or
sudo systemctl start postgresql  # Linux

# Create database
createdb medusa_store

# Start Redis (optional)
brew services start redis  # macOS
# or
sudo systemctl start redis  # Linux
```

## Step 3: Configure Environment

```bash
# Backend environment
cd backend
cp .env.example .env

# Storefront environment
cd ../storefront-templates/minimal
cp .env.local.example .env.local
```

**Important**: If using Docker, the `.env` is already configured correctly!

## Step 4: Run Database Migrations

```bash
cd backend
npm run migrate
```

This creates all necessary database tables.

## Step 5: Start Everything!

```bash
# From project root
make dev
```

This starts both backend and storefront!

### ✨ First Run Auto-Setup

On your first `make dev`, the system automatically:
1. ✅ **Creates region** (India/INR - customize if needed)
2. ✅ **Creates sales channel** (links products to storefront)
3. ✅ **Generates publishable API key** (for Store API)
4. ✅ **Links everything together** (Medusa v2 required linking)
5. ✅ **Updates storefront config** (auto-configures .env.local)

**This only runs once!** A `.bootstrap-complete` marker file prevents re-running.

## 🎉 You're Done!

Visit these URLs:
- **Storefront**: http://localhost:3000
- **Backend API**: http://localhost:9000
- **Admin Dashboard**: http://localhost:9000/app

## Next Steps

### 1. Create Admin User

```bash
npx medusa user -e admin@test.com -p supersecret123
```

Or visit http://localhost:9000/app and create your admin account.

### 2. Add Demo Data (Optional)

Want to test immediately without manual data entry?

```bash
make seed
```

This creates:
- ✅ **17+ categories** (GPU tiers, price ranges, brands)
- ✅ **5 collections** (Featured, RTX 4090 Beasts, Budget Gaming, etc.)
- ✅ **8 gaming laptops** with variants and proper prices
- ✅ **3 discount codes** (WELCOME10, GAMING20, SAVE500)

After seeding, visit http://localhost:3000 and see a complete store!

**Or add products manually:**

In the admin dashboard:
1. Go to **Products** → **Create**
2. Fill in: Title, Handle, Description
3. Add **Variant**: Title, SKU
4. Set **Price**: Amount in INR (e.g., 99999 for ₹999.99)
5. **Publish** the product
6. ✅ Product appears on storefront immediately!

### 3. Add Collections (Optional)

1. Go to **Products** → **Collections** → **Create**
2. Add title and handle (e.g., "Gaming Laptops", "gaming-laptops")
3. Add products to collection
4. ✅ Collection accessible at `/collections/gaming-laptops`

### 4. Add Categories (Optional)

1. Go to **Products** → **Categories** → **Create**
2. Create hierarchy (e.g., "Electronics" > "Laptops" > "Gaming")
3. Assign products to categories
4. ✅ Categories help organize products

### 5. Test Complete Flow

**Cart Operations:**
```bash
# Test via E2E script
./test-medusa-e2e.sh
```

**Manual Testing:**
- ✅ Visit storefront at http://localhost:3000
- ✅ Browse products (will show after adding in admin)
- ✅ Click product to see details with price
- ✅ Add to cart
- ✅ Update quantity
- ✅ Remove from cart
- ✅ Browse collections
- ✅ Navigate all pages (no 404s!)

## 🔍 Verify Setup

Run the E2E test to verify everything:

```bash
./test-medusa-e2e.sh
```

**Expected output:**
```
✅ PASS: Backend Health
✅ PASS: Products exist
✅ PASS: Variants have prices
✅ PASS: Create cart
✅ PASS: Add item to cart
✅ PASS: Update cart quantity
✅ PASS: Remove item from cart
✅ PASS: All pages accessible

🎉 ALL TESTS PASSED!
```

## Using Claude Commands

Once you're comfortable, try the Claude commands:

```bash
# Create a store plan
/create-store-plan

# Implement a store from plan
/implement-store

# Edit an existing store
/edit-store

# Deploy a store
/deploy-store
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 9000
lsof -i :9000
kill -9 <PID>

# Or change port
PORT=9001 npm run dev
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check connection string in backend/.env
cat backend/.env | grep POSTGRES_URL
```

### Redis Connection Failed

Redis is optional for development. To disable:
1. Comment out Redis modules in `backend/medusa-config.ts`
2. Restart backend

## Common Commands

```bash
# Development
make dev              # Start everything
make dev-backend      # Backend only
make dev-storefront   # Storefront only

# Demo Data
make seed             # Seed categories, products, promotions

# Building
make build            # Build all
make type-check       # Type check all

# Database
make db-up            # Start PostgreSQL + Redis
make db-down          # Stop databases
make db-reset         # Run migrations

# Cleanup
make clean            # Remove node_modules
```

## Need Help?

- 📖 Read [CLAUDE.md](./CLAUDE.md) for detailed documentation
- 🐛 Check [Troubleshooting section](./CLAUDE.md#troubleshooting)
- 💬 Join [Medusa Discord](https://discord.gg/medusajs)

---

Happy building! 🎉
