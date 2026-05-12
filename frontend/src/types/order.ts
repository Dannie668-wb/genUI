export interface OrderItem {
  name: string
  quantity: number
  ice: string
  sugar: string
  price?: number
}

export interface Order {
  order_id: string
  shop_name: string
  items: OrderItem[]
  address: string
  total: number
  status: 'pending' | 'paid' | 'delivering' | 'delivered' | 'failed'
}
