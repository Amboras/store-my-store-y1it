import { Modules } from "@medusajs/framework/utils"

/**
 * Clear All Demo Data Script
 *
 * Deletes all products, collections, and categories to allow fresh seeding.
 *
 * Run: npx medusa exec ./scripts/clear-demo-data.ts
 */
export default async function ({ container }: any) {
  const logger = container.resolve("logger") as any
  const productModuleService = container.resolve(Modules.PRODUCT) as any

  logger.info("")
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  logger.info("  Clearing All Demo Data")
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  logger.info("")

  try {
    // Delete all products
    logger.info("1️⃣  Deleting products...")
    const products = await productModuleService.listProducts()
    if (products && products.length > 0) {
      const productIds = products.map((p: any) => p.id)
      await productModuleService.deleteProducts(productIds)
      logger.info(`   ✅ Deleted ${products.length} products`)
    } else {
      logger.info(`   ✅ No products to delete`)
    }

    // Delete all collections
    logger.info("2️⃣  Deleting collections...")
    const collections = await productModuleService.listProductCollections()
    if (collections && collections.length > 0) {
      const collectionIds = collections.map((c: any) => c.id)
      await productModuleService.deleteProductCollections(collectionIds)
      logger.info(`   ✅ Deleted ${collections.length} collections`)
    } else {
      logger.info(`   ✅ No collections to delete`)
    }

    // Delete all categories (one by one, leaves first)
    logger.info("3️⃣  Deleting categories...")
    let totalDeleted = 0
    let remainingCategories = await productModuleService.listProductCategories()

    // Keep deleting leaf categories until all are gone
    while (remainingCategories && remainingCategories.length > 0) {
      // Find all categories that have no children (leaf nodes)
      const allCategories = remainingCategories
      const parentIds = new Set(allCategories.map((c: any) => c.parent_category_id).filter(Boolean))
      const leafCategories = allCategories.filter((c: any) => !parentIds.has(c.id))

      if (leafCategories.length === 0) {
        // If no leaf found, break to avoid infinite loop
        logger.warn(`   ⚠️  ${allCategories.length} categories remaining but none are leaves`)
        break
      }

      // Delete leaf categories one by one
      for (const leaf of leafCategories) {
        try {
          await productModuleService.deleteProductCategories(leaf.id)
          totalDeleted++
        } catch (err) {
          // Skip if already deleted or other error
        }
      }

      remainingCategories = await productModuleService.listProductCategories()
    }

    if (totalDeleted > 0) {
      logger.info(`   ✅ Deleted ${totalDeleted} categories`)
    } else {
      logger.info(`   ✅ No categories to delete`)
    }

    logger.info("")
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("  ✅ All Demo Data Cleared!")
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("")
    logger.info("Now run: make seed")
    logger.info("")

  } catch (error: any) {
    logger.error("❌ Cleanup failed:", error.message)
    throw error
  }
}
