'use client'

import { useState } from 'react'
import ProductGrid from '@/components/product-grid'
import { useQuery } from '@tanstack/react-query'
import { medusaClient } from '@/lib/medusa-client'

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')

  // Fetch ALL categories dynamically - NO HARDCODING
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await medusaClient.store.category.list({
        limit: 100,
      })
      return response.product_categories
    },
  })

  // Show all categories (don't filter by parent)
  const allCategories = categories || []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">All Products</h1>
        <p className="mt-2 text-gray-600">
          Browse our complete collection
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Dynamic Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Categories Filter */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Categories</h3>
              {loadingCategories ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">All Products</span>
                  </label>

                  {/* Render all categories dynamically */}
                  {allCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                        className="mr-2"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Clear Filters */}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md text-sm font-semibold transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid
            limit={100}
            categoryId={selectedCategory || undefined}
            sortBy={sortBy}
          />
        </div>
      </div>
    </div>
  )
}
