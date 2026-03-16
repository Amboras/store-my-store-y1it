'use client'

import { useQuery } from '@tanstack/react-query'
import { medusaClient } from '@/lib/medusa-client'

interface UseProductsOptions {
  limit?: number
  offset?: number
  collection_id?: string
  category_id?: string
}

export function useProducts(options: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      try {
        // First get region
        const regionsResponse = await medusaClient.store.region.list()
        const regionId = regionsResponse.regions[0]?.id

        if (!regionId) {
          throw new Error('No region found')
        }

        // Then fetch products with region for price calculation
        const response = await medusaClient.store.product.list({
          limit: options.limit || 100,
          offset: options.offset || 0,
          collection_id: options.collection_id ? [options.collection_id] : undefined,
          category_id: options.category_id ? [options.category_id] : undefined,
          region_id: regionId,
          fields: '+variants.calculated_price',
        })

        return response.products
      } catch (error) {
        console.error('Error fetching products:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
