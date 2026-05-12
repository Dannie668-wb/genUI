import { useState } from 'react'
import type { A2UIComponent } from '@/types/a2ui'

interface ItemData {
  name: string
  price: number
  description?: string
}

function MenuItemRow({ name, price, description, onSelect }: ItemData & { onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #f5f5f5',
        cursor: 'pointer',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{name}</div>
        {description && (
          <div style={{ fontSize: 12, color: '#bbb', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
        <span style={{ color: '#f60', fontSize: 14, fontWeight: 600 }}>¥{price.toFixed(2)}</span>
        <span style={{ color: '#ccc', fontSize: 16, lineHeight: 1 }}>›</span>
      </div>
    </div>
  )
}

function MenuDetail({
  name,
  price,
  description,
  onBack,
  onSelect,
}: ItemData & { onBack: () => void; onSelect: () => void }) {
  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#f60',
          fontSize: 13,
          cursor: 'pointer',
          padding: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        ‹ 返回菜单
      </button>
      <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{name}</div>
      {description && (
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>{description}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#f60', fontSize: 22, fontWeight: 700 }}>¥{price.toFixed(2)}</span>
        <button
          onClick={onSelect}
          style={{
            background: '#f60',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            padding: '8px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          点这个
        </button>
      </div>
    </div>
  )
}

interface ListProps {
  childIds: string[]
  allComponents: Record<string, A2UIComponent>
  onAction?: (action: string, payload?: unknown) => void
}

export function MenuList({ childIds, allComponents, onAction }: ListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const containerStyle: React.CSSProperties = {
    border: '1px solid #eee',
    borderRadius: 12,
    padding: '4px 16px 12px',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    minWidth: 260,
  }

  if (selectedId) {
    const item = allComponents[selectedId]
    const p = item?.props as Record<string, unknown>
    return (
      <div style={containerStyle}>
        <MenuDetail
          name={p.name as string}
          price={p.price as number}
          description={p.description as string}
          onBack={() => setSelectedId(null)}
          onSelect={() => {
            onAction?.('select_menu_item', { name: p.name, price: p.price })
            setSelectedId(null)
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ ...containerStyle, maxHeight: 320, overflowY: 'auto' }}>
      <div style={{ fontSize: 13, color: '#999', padding: '8px 0 4px', position: 'sticky', top: 0, background: '#fff' }}>菜单</div>
      {childIds.map((id) => {
        const item = allComponents[id]
        if (!item) return null
        const p = item.props as Record<string, unknown>
        return (
          <MenuItemRow
            key={id}
            name={p.name as string}
            price={p.price as number}
            description={p.description as string}
            onSelect={() => setSelectedId(id)}
          />
        )
      })}
    </div>
  )
}
