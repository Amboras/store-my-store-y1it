import { Modules } from "@medusajs/framework/utils"

export default async function ({ container }: any) {
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const channels = await salesChannelModuleService.listSalesChannels()

  console.log("Sales Channels:")
  channels.forEach((channel: any) => {
    console.log(`  ID: ${channel.id}`)
    console.log(`  Name: ${channel.name}`)
    console.log(`  Description: ${channel.description || 'N/A'}`)
    console.log("")
  })
}
