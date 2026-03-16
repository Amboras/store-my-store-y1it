import { Modules } from "@medusajs/framework/utils"

/**
 * Complete Demo Data Seed Script
 *
 * Creates everything needed for E2E testing:
 * - Categories (hierarchical)
 * - Collections (featured, GPU tiers, price ranges)
 * - Products (8 gaming laptops with variants)
 * - Prices (properly linked in Medusa v2 way)
 * - Promotions (discount codes)
 *
 * Run: npx medusa exec ./scripts/seed-demo-data.ts
 * Or: make seed
 */
export default async function ({ container }: any) {
  const logger = container.resolve("logger") as any
  const productModuleService = container.resolve(Modules.PRODUCT) as any
  const pricingModuleService = container.resolve(Modules.PRICING) as any
  const regionModuleService = container.resolve(Modules.REGION) as any
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL) as any
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION) as any
  const promotionModuleService = container.resolve(Modules.PROMOTION) as any
  const remoteLink = container.resolve("remoteLink")

  logger.info("")
  logger.info("════════════════════════════════════════════════════")
  logger.info("  Seeding Complete Demo Data for E2E Testing")
  logger.info("════════════════════════════════════════════════════")
  logger.info("")

  try {
    // Get infrastructure (should exist from bootstrap)
    const regions = await regionModuleService.listRegions({ name: "India" })
    const region = regions[0]

    const channels = await salesChannelModuleService.listSalesChannels()
    const salesChannel = channels[0]

    const locations = await stockLocationModuleService.listStockLocations()
    const stockLocation = locations[0]

    logger.info(`✅ Using region: ${region.name} (${region.currency_code})`)
    logger.info(`✅ Using sales channel: ${salesChannel.name}`)
    logger.info(`✅ Using stock location: ${stockLocation.name}`)
    logger.info("")

    // ============================================
    // 1. CREATE CATEGORIES
    // ============================================
    logger.info("1️⃣  Creating categories...")

    // Check if already seeded - check for both categories AND products with proper prices
    const existingProducts = await productModuleService.listProducts({ handle: "asus-rog-strix-g16-2024" })
    if (existingProducts && existingProducts.length > 0) {
      logger.info("   ⚠️  Demo data already exists (found seeded products)")
      logger.info("   💡 To re-seed, delete all products/categories via Admin Dashboard first")
      logger.info("")
      return
    }

    const gamingLaptopsCategory = await productModuleService.createProductCategories({
      name: "Gaming Laptops",
      handle: "gaming-laptops",
      is_active: true,
      metadata: { display_in_menu: true },
    })
    logger.info(`   ✅ Created: Gaming Laptops`)

    // GPU-based categories
    const gpuCategories = ["RTX 4050", "RTX 4060", "RTX 4070", "RTX 4080", "RTX 4090"]
    const gpuCategoryIds: Record<string, string> = {}

    for (const gpu of gpuCategories) {
      const cat = await productModuleService.createProductCategories({
        name: gpu,
        handle: gpu.toLowerCase().replace(/\s+/g, "-"),
        parent_category_id: gamingLaptopsCategory.id,
        is_active: true,
      })
      gpuCategoryIds[gpu] = cat.id
    }
    logger.info(`   ✅ Created ${gpuCategories.length} GPU categories`)

    // Price range categories
    const priceRanges = [
      { name: "Budget (Under ₹80k)", handle: "budget", min: 0, max: 8000000 },
      { name: "Mid-Range (₹80k-₹1.5L)", handle: "mid-range", min: 8000000, max: 15000000 },
      { name: "Premium (₹1.5L-₹2.5L)", handle: "premium", min: 15000000, max: 25000000 },
      { name: "Flagship (₹2.5L+)", handle: "flagship", min: 25000000, max: 99999900 },
    ]

    const priceCategoryIds: Record<string, string> = {}
    for (const range of priceRanges) {
      const cat = await productModuleService.createProductCategories({
        name: range.name,
        handle: range.handle,
        parent_category_id: gamingLaptopsCategory.id,
        is_active: true,
        metadata: { min_price: range.min, max_price: range.max },
      })
      priceCategoryIds[range.handle] = cat.id
    }
    logger.info(`   ✅ Created ${priceRanges.length} price range categories`)

    // Brand categories
    const brands = ["ASUS ROG", "MSI", "Lenovo Legion", "HP Omen", "Acer", "Dell"]
    const brandCategoryIds: Record<string, string> = {}

    for (const brand of brands) {
      const cat = await productModuleService.createProductCategories({
        name: brand,
        handle: brand.toLowerCase().replace(/\s+/g, "-"),
        parent_category_id: gamingLaptopsCategory.id,
        is_active: true,
      })
      brandCategoryIds[brand] = cat.id
    }
    logger.info(`   ✅ Created ${brands.length} brand categories`)
    logger.info("")

    // ============================================
    // 2. CREATE COLLECTIONS
    // ============================================
    logger.info("2️⃣  Creating collections...")

    const collections = [
      { title: "Featured Products", handle: "featured", description: "Our top picks" },
      { title: "RTX 4090 Beasts", handle: "rtx-4090", description: "Ultimate gaming power" },
      { title: "Budget Gaming", handle: "budget-gaming", description: "Great value laptops" },
      { title: "Best Sellers", handle: "best-sellers", description: "Customer favorites" },
      { title: "New Arrivals", handle: "new-arrivals", description: "Latest additions" },
    ]

    const collectionMap: Record<string, any> = {}

    for (const col of collections) {
      const collection = await productModuleService.createProductCollections({
        title: col.title,
        handle: col.handle,
        metadata: { description: col.description },
      })
      collectionMap[col.handle] = collection
      logger.info(`   ✅ Created collection: ${col.title}`)
    }
    logger.info("")

    // ============================================
    // 3. CREATE PRODUCTS WITH VARIANTS & PRICES
    // ============================================
    logger.info("3️⃣  Creating products...")

    const products = [
      {
        title: "ASUS ROG Strix G16 (2024)",
        handle: "asus-rog-strix-g16-2024",
        description: "High-performance gaming laptop with Intel Core i7-13650HX and RTX 4060.",
        thumbnail: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
        brand: "ASUS ROG",
        gpu: "RTX 4060",
        variants: [
          { title: "Standard (16GB RAM)", sku: "ROG-STRIX-G16-STD", price: 14999900 },
          { title: "Pro (32GB RAM)", sku: "ROG-STRIX-G16-PRO", price: 17999900 },
        ],
      },
      {
        title: "MSI Raider GE78 HX 14V",
        handle: "msi-raider-ge78-hx-14v",
        description: "Flagship gaming beast with RTX 4090 and Mini LED display.",
        thumbnail: "https://images.unsplash.com/photo-1625232302473-7000e5a6f88d?w=800",
        brand: "MSI",
        gpu: "RTX 4090",
        variants: [
          { title: "Standard (32GB RAM)", sku: "MSI-RAIDER-GE78-STD", price: 32999900 },
          { title: "Ultimate (64GB RAM)", sku: "MSI-RAIDER-GE78-ULT", price: 37999900 },
        ],
      },
      {
        title: "Lenovo Legion Pro 7i Gen 9",
        handle: "lenovo-legion-pro-7i-gen-9",
        description: "Premium gaming laptop with RTX 4080 and stunning display.",
        thumbnail: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
        brand: "Lenovo Legion",
        gpu: "RTX 4080",
        variants: [
          { title: "Standard", sku: "LEGION-PRO-7I-STD", price: 24999900 },
        ],
      },
      {
        title: "HP Omen 16 (2024)",
        handle: "hp-omen-16-2024",
        description: "Balanced gaming laptop with RTX 4070 for AAA gaming.",
        thumbnail: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
        brand: "HP Omen",
        gpu: "RTX 4070",
        variants: [
          { title: "16GB RAM / 512GB SSD", sku: "HP-OMEN-16-16-512", price: 13999900 },
          { title: "32GB RAM / 1TB SSD", sku: "HP-OMEN-16-32-1TB", price: 15999900 },
        ],
      },
      {
        title: "Acer Predator Helios 300",
        handle: "acer-predator-helios-300",
        description: "Mid-range powerhouse with RTX 4060 for competitive gaming.",
        thumbnail: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800",
        brand: "Acer",
        gpu: "RTX 4060",
        variants: [
          { title: "Standard", sku: "PREDATOR-300-STD", price: 11999900 },
        ],
      },
      {
        title: "MSI Katana 15 B13V",
        handle: "msi-katana-15-b13v",
        description: "Budget-friendly gaming laptop with RTX 4050.",
        thumbnail: "https://images.unsplash.com/photo-1625232305707-d78e2a89e0da?w=800",
        brand: "MSI",
        gpu: "RTX 4050",
        variants: [
          { title: "Standard", sku: "MSI-KATANA-15-STD", price: 7999900 },
        ],
      },
      {
        title: "ASUS TUF Gaming A15",
        handle: "asus-tuf-gaming-a15",
        description: "Durable budget gaming laptop with military-grade build.",
        thumbnail: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
        brand: "ASUS ROG",
        gpu: "RTX 4050",
        variants: [
          { title: "Standard", sku: "TUF-A15-STD", price: 6999900 },
        ],
      },
      {
        title: "Lenovo LOQ 15IRH9",
        handle: "lenovo-loq-15irh9",
        description: "Entry-level gaming laptop with great value.",
        thumbnail: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
        brand: "Lenovo Legion",
        gpu: "RTX 4050",
        variants: [
          { title: "Standard", sku: "LOQ-15-STD", price: 7499900 },
        ],
      },
    ]

    const createdProducts = []

    for (const productData of products) {
      // Create product with variants (NO prices!)
      const product = await productModuleService.createProducts({
        title: productData.title,
        handle: productData.handle,
        description: productData.description,
        status: "published",
        thumbnail: productData.thumbnail,
        metadata: {
          brand: productData.brand,
          gpu: productData.gpu,
        },
        variants: productData.variants.map((v) => ({
          title: v.title,
          sku: v.sku,
          manage_inventory: false,
          allow_backorder: false,
        })),
      })

      // Create price sets and link to variants (Medusa v2 pattern)
      for (let i = 0; i < product.variants.length; i++) {
        const variant = product.variants[i]
        const priceAmount = productData.variants[i].price

        // Create price set
        const priceSet = await pricingModuleService.createPriceSets({
          prices: [
            {
              amount: priceAmount,
              currency_code: "inr",
            },
          ],
        })

        // CRITICAL: Link variant to price set
        await remoteLink.create({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.PRICING]: { price_set_id: priceSet.id },
        })
      }

      // Link product to sales channel
      await remoteLink.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
      })

      // Assign to categories
      const categoryIds = []

      // Brand category
      if (brandCategoryIds[productData.brand]) {
        categoryIds.push(brandCategoryIds[productData.brand])
      }

      // GPU category
      if (gpuCategoryIds[productData.gpu]) {
        categoryIds.push(gpuCategoryIds[productData.gpu])
      }

      // Price category
      const firstPrice = productData.variants[0].price
      for (const range of priceRanges) {
        if (firstPrice >= range.min && firstPrice <= range.max) {
          categoryIds.push(priceCategoryIds[range.handle])
          break
        }
      }

      if (categoryIds.length > 0) {
        await productModuleService.updateProducts(product.id, {
          category_ids: categoryIds,
        })
      }

      createdProducts.push(product)
      logger.info(`   ✅ ${product.title} (${product.variants.length} variants)`)
    }

    logger.info("")
    logger.info(`   Created ${createdProducts.length} products with prices!`)
    logger.info("")

    // ============================================
    // 4. ASSIGN PRODUCTS TO COLLECTIONS
    // ============================================
    logger.info("4️⃣  Assigning products to collections...")

    // NOTE: In Medusa v2, a product can only belong to ONE collection
    // We need to make these assignments mutually exclusive

    const assignedProductIds = new Set<string>()

    // Featured: First 2 products
    const featuredProducts = createdProducts.slice(0, 2)
    if (featuredProducts.length > 0) {
      for (const product of featuredProducts) {
        await productModuleService.updateProducts(product.id, {
          collection_id: collectionMap["featured"].id,
        })
        assignedProductIds.add(product.id)
      }
      logger.info(`   ✅ Featured: ${featuredProducts.length} products`)
    }

    // Best sellers: Next 3 products
    const bestSellerProducts = createdProducts.slice(2, 5)
    if (bestSellerProducts.length > 0) {
      for (const product of bestSellerProducts) {
        await productModuleService.updateProducts(product.id, {
          collection_id: collectionMap["best-sellers"].id,
        })
        assignedProductIds.add(product.id)
      }
      logger.info(`   ✅ Best Sellers: ${bestSellerProducts.length} products`)
    }

    // New arrivals: Last 3 products
    const newArrivalProducts = createdProducts.slice(-3)
    if (newArrivalProducts.length > 0) {
      for (const product of newArrivalProducts) {
        await productModuleService.updateProducts(product.id, {
          collection_id: collectionMap["new-arrivals"].id,
        })
        assignedProductIds.add(product.id)
      }
      logger.info(`   ✅ New Arrivals: ${newArrivalProducts.length} products`)
    }

    // RTX 4090: Any remaining RTX 4090 products
    const rtx4090Products = createdProducts.filter(
      p => p.metadata?.gpu === "RTX 4090" && !assignedProductIds.has(p.id)
    )
    if (rtx4090Products.length > 0) {
      for (const product of rtx4090Products) {
        await productModuleService.updateProducts(product.id, {
          collection_id: collectionMap["rtx-4090"].id,
        })
        assignedProductIds.add(product.id)
      }
      logger.info(`   ✅ RTX 4090: ${rtx4090Products.length} products`)
    }

    // Budget: Any remaining products under ₹1L
    const budgetProducts = createdProducts.filter(p => {
      if (assignedProductIds.has(p.id)) return false
      const firstVariantPrice = products.find(pd => pd.handle === p.handle)?.variants[0]?.price || 0
      return firstVariantPrice < 10000000
    })
    if (budgetProducts.length > 0) {
      for (const product of budgetProducts) {
        await productModuleService.updateProducts(product.id, {
          collection_id: collectionMap["budget-gaming"].id,
        })
        assignedProductIds.add(product.id)
      }
      logger.info(`   ✅ Budget Gaming: ${budgetProducts.length} products`)
    }

    logger.info(`   ✅ Products assigned to collections`)
    logger.info("")

    // ============================================
    // 5. CREATE PROMOTIONS / DISCOUNT CODES
    // ============================================
    logger.info("5️⃣  Creating promotions...")

    const promotions = [
      {
        code: "WELCOME10",
        description: "10% off for new customers",
        type: "percentage",
        value: 10,
      },
      {
        code: "GAMING20",
        description: "₹2000 off on gaming laptops",
        type: "fixed",
        value: 200000, // ₹2000 in paise
      },
      {
        code: "SAVE500",
        description: "Flat ₹500 off",
        type: "fixed",
        value: 50000, // ₹500 in paise
      },
    ]

    for (const promo of promotions) {
      try {
        const campaign = await promotionModuleService.createCampaigns({
          name: promo.description,
          campaign_identifier: promo.code,
          starts_at: new Date(),
          ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        })

        await promotionModuleService.createPromotions({
          code: promo.code,
          type: promo.type === "percentage" ? "percentage" : "fixed",
          campaign_id: campaign.id,
          application_method: {
            type: "fixed",
            target_type: "order",
            allocation: "each",
            value: promo.value,
            currency_code: "inr",
          },
        })

        logger.info(`   ✅ Created promotion: ${promo.code} (${promo.description})`)
      } catch (promoError: any) {
        logger.warn(`   ⚠️  Could not create ${promo.code}: ${promoError.message}`)
      }
    }

    logger.info("")

    // ============================================
    // SUMMARY
    // ============================================
    logger.info("════════════════════════════════════════════════════")
    logger.info("  ✅ Demo Data Seeding Complete!")
    logger.info("════════════════════════════════════════════════════")
    logger.info("")
    logger.info("📊 What was created:")
    logger.info(`   ✅ Categories: ${gpuCategories.length + priceRanges.length + brands.length + 1}`)
    logger.info(`   ✅ Collections: ${collections.length}`)
    logger.info(`   ✅ Products: ${createdProducts.length}`)
    logger.info(`   ✅ Variants: ${createdProducts.reduce((sum, p) => sum + p.variants.length, 0)}`)
    logger.info(`   ✅ Promotions: ${promotions.length}`)
    logger.info(`   ✅ All prices properly linked (Medusa v2)`)
    logger.info("")
    logger.info("🎯 Ready for E2E testing!")
    logger.info("")
    logger.info("💰 Discount codes to test:")
    logger.info("  - WELCOME10 (10% off)")
    logger.info("  - GAMING20 (₹2000 off)")
    logger.info("  - SAVE500 (₹500 off)")
    logger.info("")
    logger.info("Visit:")
    logger.info("  - Admin: http://localhost:9000/app")
    logger.info("  - Storefront: http://localhost:3000")
    logger.info("")
    logger.info("Test:")
    logger.info("  ./test-medusa-e2e.sh")
    logger.info("")

  } catch (error: any) {
    logger.error("❌ Seeding failed:", error.message)
    logger.error(error.stack)
    throw error
  }
}
