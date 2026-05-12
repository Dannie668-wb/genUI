import { useState } from 'react'

interface Props {
  suggestions?: string[]
  onAction?: (action: string, payload?: unknown) => void
}

export function AddressPicker({ suggestions = [], onAction }: Props) {
  const [input, setInput] = useState('')

  const confirm = () => {
    const addr = input.trim()
    if (addr) onAction?.('select_address', addr)
  }

  return (
    <div style={{
      border: '1px solid #eee', borderRadius: 12, padding: 16,
      background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: 280,
    }}>
      <div style={{ fontSize: 13, color: '#999', marginBottom: 10 }}>选择配送地址</div>

      {/* 快捷区域 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setInput(s)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: input === s ? '1.5px solid #f60' : '1px solid #e0e0e0',
              background: input === s ? '#fff7f0' : '#fafafa',
              color: input === s ? '#f60' : '#555',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: input === s ? 600 : 400,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 详细地址输入 */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入详细地址，如：南山科技园"
        onKeyDown={(e) => e.key === 'Enter' && confirm()}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '9px 12px', borderRadius: 8,
          border: '1px solid #e0e0e0', fontSize: 14,
          outline: 'none', marginBottom: 10,
        }}
      />

      <button
        onClick={confirm}
        disabled={!input.trim()}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 8,
          background: input.trim() ? '#f60' : '#eee',
          color: input.trim() ? '#fff' : '#999',
          border: 'none', fontSize: 15, fontWeight: 600,
          cursor: input.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        确认选择
      </button>
    </div>
  )
}
