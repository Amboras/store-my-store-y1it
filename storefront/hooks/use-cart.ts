'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { medusaClient } from '@/lib/medusa-client'

const CART_ID_KEY = 'medusa_cart_id'

function getCartId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_ID_KEY)
}

function setCartId(id: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_ID_KEY, id)
}

function clearCartId() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_ID_KEY)
}

export function useCart() {
  const queryClient = useQueryClient()

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cartId = getCartId()

      if (cartId) {
        try {
          const response = await medusaClient.store.cart.retrieve(cartId)
          return response.cart
        } catch (error) {
          console.log('Cart not found, creating new one')
          clearCartId()
        }
      }

      // Get region to create cart with
      const regionsResponse = await medusaClient.store.region.list()
      const regionId = regionsResponse.regions[0]?.id

      if (!regionId) {
        throw new Error('No region found')
      }

      try {
        // Try creating cart with region_id
        const response = await medusaClient.store.cart.create({
          region_id: regionId,
        })
        const newCart = response.cart
        setCartId(newCart.id)
        return newCart
      } catch (error: any) {
        // If error mentions sales channel, provide helpful message
        if (error?.message?.includes('sales channel')) {
          console.error('Cart creation failed: Multiple sales channels associated with API key')
          console.error('Please configure NEXT_PUBLIC_SALES_CHANNEL_ID in .env.local')
          throw new Error('Cart creation requires sales channel configuration. See console for details.')
        }
        throw error
      }
    },
    staleTime: 0,
  })

  // CORRECT: Use createLineItem (not addLineItem)
  const addItem = useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      if (!cart) throw new Error('No cart available')

      const response = await medusaClient.store.cart.createLineItem(cart.id, {
        variant_id: variantId,
        quantity,
      })
      return response.cart
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart)
    },
    onError: (error) => {
      console.error('Error adding item to cart:', error)
    },
  })

  const updateItem = useMutation({
    mutationFn: async ({ lineId, quantity }: { lineId: string; quantity: number }) => {
      if (!cart) throw new Error('No cart available')

      const response = await medusaClient.store.cart.updateLineItem(cart.id, lineId, {
        quantity,
      })
      return response.cart
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart)
    },
  })

  // CORRECT: deleteLineItem returns cart in 'parent' field
  const removeItem = useMutation({
    mutationFn: async (lineId: string) => {
      if (!cart) throw new Error('No cart available')

      const response = await medusaClient.store.cart.deleteLineItem(cart.id, lineId)
      return response.parent // CORRECT: Use parent, not cart
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart)
    },
  })

  const clearCart = () => {
    clearCartId()
    queryClient.invalidateQueries({ queryKey: ['cart'] })
  }

  const itemCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
  const subtotal = cart?.subtotal || 0
  const total = cart?.total || 0

  return {
    cart,
    isLoading,
    error,
    itemCount,
    subtotal,
    total,
    addItem: addItem.mutate,
    addItemAsync: addItem.mutateAsync,
    updateItem: updateItem.mutate,
    removeItem: removeItem.mutate,
    clearCart,
    isAddingItem: addItem.isPending,
    isUpdatingItem: updateItem.isPending,
    isRemovingItem: removeItem.isPending,
  }
}
