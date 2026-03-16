# Test Scripts

This directory contains all testing scripts for the ecommerce starter template.

## Available Test Scripts

### 1. `check-storefront.sh`
**Quick storefront health check**

Tests if the Next.js storefront is running and responding correctly.

```bash
./scripts/test/check-storefront.sh
```

**What it checks:**
- ✅ Next.js process is running
- ✅ Homepage responds
- ✅ Products are rendered in HTML
- ✅ No JavaScript errors

**Use when:** Quick check if storefront is up and working

---

### 2. `test-apis.sh`
**Medusa backend API tests**

Tests all core Medusa store API endpoints.

```bash
./scripts/test/test-apis.sh
```

**What it tests:**
- ✅ Regions API
- ✅ Products API (with prices)
- ✅ Collections API
- ✅ Categories API
- ✅ Cart creation and operations
- ✅ Price calculations

**Use when:** Verifying backend APIs work after seeding or changes

---

### 3. `test-medusa-e2e.sh`
**Comprehensive E2E backend tests**

Full end-to-end test of Medusa backend functionality.

```bash
./scripts/test/test-medusa-e2e.sh
```

**What it tests:**
- ✅ Region creation
- ✅ Product creation with variants
- ✅ Price set linking (Medusa v2)
- ✅ Collection assignment
- ✅ Category assignment
- ✅ Cart operations
- ✅ Checkout flow
- ✅ Promotion codes

**Use when:** Full validation of backend setup

---

### 4. `test-frontend.sh`
**Frontend integration tests**

Tests the Next.js storefront pages and data fetching.

```bash
./scripts/test/test-frontend.sh
```

**What it tests:**
- ✅ Homepage loads
- ✅ Products page shows all products
- ✅ Category filtering works
- ✅ Product detail pages load
- ✅ Collection pages display products
- ✅ Checkout page displays cart items
- ✅ Prices display correctly

**Use when:** Validating storefront functionality

---

### 5. `test-everything.sh`
**Full stack integration tests**

Comprehensive test suite that runs all tests in sequence.

```bash
./scripts/test/test-everything.sh
```

**What it tests:**
- ✅ Backend APIs
- ✅ Frontend pages
- ✅ Data seeding
- ✅ E2E user flows
- ✅ Integration between backend and frontend

**Use when:**
- Before deployment
- After major changes
- CI/CD pipeline

---

## Quick Test Commands (via Makefile)

```bash
# Quick storefront check
make test-storefront

# Test backend APIs
make test-apis

# Full E2E test
make test-e2e

# Test everything
make test-all
```

---

## Test Workflow

### After Fresh Setup
```bash
# 1. Seed demo data
make seed

# 2. Run full tests
./scripts/test/test-everything.sh
```

### During Development
```bash
# Quick check while developing
./scripts/test/check-storefront.sh

# Test specific API changes
./scripts/test/test-apis.sh
```

### Before Deployment
```bash
# Full validation
./scripts/test/test-everything.sh
```

---

## Common Issues

### Test Fails: "Connection refused"
**Problem:** Backend not running

**Solution:**
```bash
make dev-backend
```

### Test Fails: "No products found"
**Problem:** Database not seeded

**Solution:**
```bash
make seed
```

### Test Fails: "Region not found"
**Problem:** Infrastructure not set up

**Solution:**
```bash
cd backend && npx medusa exec ./scripts/setup-infrastructure.ts
```

---

## Writing New Tests

When adding new features, add tests to the appropriate script:

- **New API endpoint?** → Add to `test-apis.sh`
- **New page?** → Add to `test-frontend.sh`
- **New E2E flow?** → Add to `test-medusa-e2e.sh`

Keep tests:
- ✅ Fast (< 30 seconds each)
- ✅ Independent (don't depend on execution order)
- ✅ Clear (descriptive output)
- ✅ Automated (no manual steps)

---

**Last Updated:** 2026-03-16
