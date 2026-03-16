import { Modules } from "@medusajs/framework/utils"
import { writeFileSync } from "fs"
import { join } from "path"

/**
 * Auto-Setup Infrastructure Script
 *
 * Runs on first `make dev` to ensure:
 * 1. Region exists (India/INR)
 * 2. Sales Channel exists
 * 3. Publishable API Key exists and is linked to sales channel
 * 4. Storefront .env.local is updated with the key
 *
 * This makes the repo "clone and run" ready!
 */
export default async function ({ container }: any) {
  const logger = container.resolve("logger") as any
  const productModuleService = container.resolve(Modules.PRODUCT) as any
  const regionModuleService = container.resolve(Modules.REGION) as any
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL) as any
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION) as any
  const apiKeyModuleService = container.resolve(Modules.API_KEY) as any
  const remoteLink = container.resolve("remoteLink")

  logger.info("")
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  logger.info("  Auto-Setup Infrastructure")
  logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  logger.info("")

  try {
    // ============================================
    // 1. Region Setup
    // ============================================
    logger.info("1️⃣  Setting up region...")

    const existingRegions = await regionModuleService.listRegions({ name: "India" })
    let region

    if (existingRegions && existingRegions.length > 0) {
      region = existingRegions[0]
      logger.info(`   ✅ Region already exists: India (${region.currency_code})`)
    } else {
      region = await regionModuleService.createRegions({
        name: "India",
        currency_code: "inr",
        countries: ["in"],
      })
      logger.info(`   ✅ Created region: India (inr)`)
    }

    // ============================================
    // 2. Stock Location Setup
    // ============================================
    logger.info("2️⃣  Setting up stock location...")

    const existingLocations = await stockLocationModuleService.listStockLocations({
      name: "Main Warehouse",
    })
    let stockLocation

    if (existingLocations && existingLocations.length > 0) {
      stockLocation = existingLocations[0]
      logger.info(`   ✅ Stock location already exists`)
    } else {
      stockLocation = await stockLocationModuleService.createStockLocations({
        name: "Main Warehouse",
        address: {
          city: "Bangalore",
          country_code: "in",
        },
      })
      logger.info(`   ✅ Created stock location: Main Warehouse`)
    }

    // ============================================
    // 3. Sales Channel Setup
    // ============================================
    logger.info("3️⃣  Setting up sales channel...")

    const existingChannels = await salesChannelModuleService.listSalesChannels()
    let salesChannel

    if (existingChannels && existingChannels.length > 0) {
      salesChannel = existingChannels[0]
      logger.info(`   ✅ Sales channel already exists: ${salesChannel.name}`)
    } else {
      salesChannel = await salesChannelModuleService.createSalesChannels({
        name: "Default Sales Channel",
        description: "Main storefront",
        is_disabled: false,
      })
      logger.info(`   ✅ Created sales channel: ${salesChannel.name}`)
    }

    // ============================================
    // 4. Publishable API Key Setup
    // ============================================
    logger.info("4️⃣  Setting up publishable API key...")

    const existingKeys = await apiKeyModuleService.listApiKeys({
      type: "publishable",
    })
    let apiKey

    if (existingKeys && existingKeys.length > 0) {
      apiKey = existingKeys[0]
      logger.info(`   ✅ API key already exists`)
    } else {
      apiKey = await apiKeyModuleService.createApiKeys({
        title: "Storefront API Key",
        type: "publishable",
        created_by: "system",
      })
      logger.info(`   ✅ Created publishable API key`)
    }

    // ============================================
    // 5. Link API Key to Sales Channel
    // ============================================
    logger.info("5️⃣  Linking API key to sales channel...")

    try {
      await remoteLink.create({
        [Modules.API_KEY]: {
          publishable_key_id: apiKey.id,
        },
        [Modules.SALES_CHANNEL]: {
          sales_channel_id: salesChannel.id,
        },
      })
      logger.info(`   ✅ Linked API key to sales channel`)
    } catch (linkError: any) {
      if (linkError.message?.includes("already exists")) {
        logger.info(`   ✅ Already linked`)
      } else {
        throw linkError
      }
    }

    // ============================================
    // 6. Update Storefront .env.local
    // ============================================
    logger.info("6️⃣  Updating storefront configuration...")

    const storefrontEnvPath = join(process.cwd(), "..", "storefront", ".env.local")

    const envContent = `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${apiKey.token}
# Auto-generated on first run - linked to "${salesChannel.name}"
`

    try {
      writeFileSync(storefrontEnvPath, envContent)
      logger.info(`   ✅ Updated storefront/.env.local`)
    } catch (err) {
      logger.warn(`   ⚠️  Could not update .env.local (manual setup needed)`)
    }

    // ============================================
    // Summary
    // ============================================
    logger.info("")
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("  ✅ Infrastructure Setup Complete!")
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("")
    logger.info("📋 Configuration:")
    logger.info(`   Region: ${region.name} (${region.currency_code})`)
    logger.info(`   Sales Channel: ${salesChannel.name}`)
    logger.info(`   Stock Location: ${stockLocation.name}`)
    logger.info(`   Publishable Key: ${apiKey.token.substring(0, 20)}...`)
    logger.info("")
    logger.info("🎯 Ready to use!")
    logger.info("   1. Add products via Admin Dashboard")
    logger.info("   2. Create collections and categories")
    logger.info("   3. Test cart, checkout, and full flow")
    logger.info("")
    logger.info("Admin Dashboard: http://localhost:9000/app")
    logger.info("Storefront: http://localhost:3000")
    logger.info("")

  } catch (error: any) {
    logger.error("❌ Setup failed:", error.message)
    throw error
  }
}
