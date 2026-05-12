import { useState } from 'react'

interface Props {
  shop_id: string
  name: string
  rating: number
  distance: string
  onAction?: (action: string, payload?: unknown) => void
}

export function ShopItem({ shop_id, name, rating, distance, onAction }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => onAction?.('select_shop', { shopId: shop_id, shopName: name })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '10px 0', borderBottom: '1px solid #f5f5f5',
        background: hovered ? '#fff7f0' : 'transparent',
        border: 'none', borderBottom: '1px solid #f5f5f5',
        cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.15s',
      }}
    >
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, color: '#222' }}>{name}</div>
        <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>{distance}</div>
      </div>
      <div style={{ color: '#f60', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>★ {rating}</div>
    </button>
  )
}

interface ListProps {
  children?: React.ReactNode
}

export function ShopList({ children }: ListProps) {
  return (
    <div style={{
      border: '1px solid #eee', borderRadius: 12, padding: '4px 16px 8px',
      background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: 260,
    }}>
      <div style={{ fontSize: 13, color: '#999', padding: '8px 0 4px' }}>附近店铺</div>
      {children}
    </div>
  )
}
