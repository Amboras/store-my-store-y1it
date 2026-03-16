import { notFound } from 'next/navigation'
import { medusaClient } from '@/lib/medusa-client'
import Image from 'next/image'
import AddToCart from '@/components/add-to-cart'

async function getProduct(handle: string) {
  try {
    // First get region for price calculation
    const regionsResponse = await medusaClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id

    if (!regionId) {
      throw new Error('No region found')
    }

    // Then fetch product with region for prices
    const response = await medusaClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '+variants.calculated_price',
    })

    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const variant = product.variants?.[0]
  const price = variant?.calculated_price

  const formattedPrice = price && price.calculated_amount != null
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.currency_code?.toUpperCase() || 'USD',
      }).format(price.calculated_amount / 100)
    : 'Price not available'

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <svg
                  className="h-24 w-24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Additional Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image: any, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-md bg-gray-100"
                >
                  <Image
                    src={image.url}
                    alt={`${product.title} ${idx + 2}`}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-lg text-gray-600">{product.subtitle}</p>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            <p className="text-3xl font-bold text-gray-900">{formattedPrice}</p>
            {variant?.inventory_quantity != null && variant.inventory_quantity > 0 && (
              <span className="text-sm text-green-600 font-semibold">In Stock</span>
            )}
          </div>

          {product.description && (
            <div className="border-t border-b py-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Variant Selector (if multiple variants) */}
          {product.variants && product.variants.length > 1 && (
            <div>
              <h3 className="font-semibold mb-3">Options</h3>
              <div className="space-y-2">
                {product.variants.map((v: any) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:border-blue-600 cursor-pointer"
                  >
                    <span>{v.title}</span>
                    <span className="font-semibold">
                      {v.calculated_price && v.calculated_price.calculated_amount != null && new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: v.calculated_price.currency_code?.toUpperCase() || 'USD',
                      }).format(v.calculated_price.calculated_amount / 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          {variant && <AddToCart variant={variant} />}

          {/* Additional Info */}
          <div className="border-t pt-6 space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>30-day return policy</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
