'use client'

import { useProducts } from '@/hooks/use-products'
import ProductCard from './product-card'

interface ProductGridProps {
  limit?: number
  collectionId?: string
  categoryId?: string
  sortBy?: string
}

// Loading skeleton component
function ProductSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-lg" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  )
}

export default function ProductGrid({
  limit = 8,
  collectionId,
  categoryId,
  sortBy = 'newest',
}: ProductGridProps) {
  const { data: rawProducts, isLoading, error } = useProducts({
    limit,
    collection_id: collectionId,
    category_id: categoryId,
  })

  // Sort products based on sortBy prop
  const products = rawProducts ? [...rawProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        const priceA = a.variants?.[0]?.calculated_price?.calculated_amount || 0
        const priceB = b.variants?.[0]?.calculated_price?.calculated_amount || 0
        return priceA - priceB
      case 'price-high':
        const priceAHigh = a.variants?.[0]?.calculated_price?.calculated_amount || 0
        const priceBHigh = b.variants?.[0]?.calculated_price?.calculated_amount || 0
        return priceBHigh - priceAHigh
      case 'name':
        return (a.title || '').localeCompare(b.title || '')
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  }) : rawProducts

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: limit }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-red-900">
          Error loading products
        </h3>
        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    )
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No products yet
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Add products in the Medusa admin dashboard to see them here.
        </p>
        <a
          href="http://localhost:9000/app"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Open Admin Dashboard
        </a>
      </div>
    )
  }

  // Products grid
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
