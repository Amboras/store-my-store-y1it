import { Modules } from "@medusajs/framework/utils"

/**
 * Create publishable API key and link to sales channel
 */
export default async function ({ container }: any) {
  const logger = container.resolve("logger") as any
  const apiKeyModuleService = container.resolve(Modules.API_KEY) as any
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL) as any
  const remoteLink = container.resolve("remoteLink")

  logger.info("🔑 Creating publishable API key linked to sales channel...")

  try {
    // Get the GameLaptop India Web sales channel
    const salesChannels = await salesChannelModuleService.listSalesChannels({
      name: "GameLaptop India Web",
    })

    let salesChannel
    if (salesChannels && salesChannels.length > 0) {
      salesChannel = salesChannels[0]
      logger.info(`✅ Found sales channel: ${salesChannel.name} (${salesChannel.id})`)
    } else {
      // Fallback: get any sales channel
      const allChannels = await salesChannelModuleService.listSalesChannels({})
      salesChannel = allChannels[0]
      logger.info(`✅ Using sales channel: ${salesChannel.name} (${salesChannel.id})`)
    }

    // Check if publishable key already exists
    const existingKeys = await apiKeyModuleService.listApiKeys({
      type: "publishable",
    })

    let apiKey
    if (existingKeys && existingKeys.length > 0) {
      // Use existing key
      apiKey = existingKeys[0]
      logger.info(`✅ Found existing publishable key: ${apiKey.token}`)
    } else {
      // Create new publishable key
      apiKey = await apiKeyModuleService.createApiKeys({
        title: "Storefront API Key",
        type: "publishable",
        created_by: "system",
      })
      logger.info(`✅ Created new publishable key: ${apiKey.token}`)
    }

    // Link API key to sales channel
    try {
      await remoteLink.create({
        [Modules.API_KEY]: {
          publishable_key_id: apiKey.id,
        },
        [Modules.SALES_CHANNEL]: {
          sales_channel_id: salesChannel.id,
        },
      })
      logger.info(`✅ Linked API key to sales channel`)
    } catch (linkError: any) {
      if (linkError.message?.includes("already exists")) {
        logger.info(`✅ API key already linked to sales channel`)
      } else {
        throw linkError
      }
    }

    logger.info("")
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("🎉 Setup Complete!")
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    logger.info("")
    logger.info(`Publishable API Key: ${apiKey.token}`)
    logger.info(`Sales Channel: ${salesChannel.name}`)
    logger.info("")
    logger.info("Update your storefront/.env.local:")
    logger.info(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${apiKey.token}`)
    logger.info("")

  } catch (error: any) {
    logger.error("❌ Error creating publishable key:", error.message)
    throw error
  }
}
