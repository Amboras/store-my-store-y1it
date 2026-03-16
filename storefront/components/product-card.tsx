import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  product: any // Using any for SDK types
}

export default function ProductCard({ product }: ProductCardProps) {
  // Get the first variant's calculated price (Medusa v2)
  const variant = product.variants?.[0]
  const calculatedPrice = variant?.calculated_price

  // Format price
  const formattedPrice = calculatedPrice
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: calculatedPrice.currency_code?.toUpperCase() || 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format((calculatedPrice.calculated_amount || 0) / 100)
    : 'Price not available'

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block"
    >
      <div className="space-y-3">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <svg
                className="h-12 w-12"
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

        {/* Product Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          {product.subtitle && (
            <p className="text-sm text-gray-600 line-clamp-1">{product.subtitle}</p>
          )}

          <p className="font-bold text-gray-900">{formattedPrice}</p>
        </div>
      </div>
    </Link>
  )
}
