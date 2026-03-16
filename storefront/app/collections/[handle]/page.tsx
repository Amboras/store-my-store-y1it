import { notFound } from 'next/navigation'
import { medusaClient } from '@/lib/medusa-client'
import ProductGrid from '@/components/product-grid'

async function getCollection(handle: string) {
  try {
    const response = await medusaClient.store.collection.list({
      handle: [handle],
    })
    return response.collections?.[0] || null
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const collection = await getCollection(handle)

  if (!collection) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Collection Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          {collection.title}
        </h1>
        {collection.metadata?.description && (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {collection.metadata.description as string}
          </p>
        )}
      </div>

      {/* Products in Collection */}
      <ProductGrid collectionId={collection.id} limit={100} />
    </div>
  )
}
