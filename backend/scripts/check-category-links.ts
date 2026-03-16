import { Modules } from "@medusajs/framework/utils"

export default async function ({ container }: any) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const remoteLink = container.resolve("remoteLink")

  console.log("Checking product-category relationships...")
  console.log("")

  const products = await productModuleService.listProducts({}, { relations: ["categories"] })

  for (const product of products.slice(0, 3)) {
    console.log(`Product: ${product.title}`)
    console.log(`  ID: ${product.id}`)
    console.log(`  Handle: ${product.handle}`)
    console.log(`  Categories:`, product.categories || "null/undefined")
    console.log(`  Category IDs:`, product.category_ids || "null/undefined")
    console.log("")
  }

  console.log("Checking via remoteLink...")
  console.log("")

  // Try to query links directly
  try {
    const links = await remoteLink.list({
      [Modules.PRODUCT]: { product_id: products[0].id },
    })
    console.log("Links for first product:", JSON.stringify(links, null, 2))
  } catch (e: any) {
    console.log("Error querying links:", e.message)
  }
}
