import { create } from 'zustand'
import type { Order } from '@/types/order'

interface OrderStore {
  currentOrder: Order | null
  setOrder: (order: Order) => void
  updateStatus: (status: Order['status']) => void
  clearOrder: () => void
}

export const useOrderStore = create<OrderStore>((set) => ({
  currentOrder: null,

  setOrder(order) {
    set({ currentOrder: order })
  },

  updateStatus(status) {
    set((s) =>
      s.currentOrder ? { currentOrder: { ...s.currentOrder, status } } : {}
    )
  },

  clearOrder() {
    set({ currentOrder: null })
  },
}))
