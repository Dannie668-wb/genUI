import { useState } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export function InputBar({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  const send = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  return (
    <div style={{
      display: 'flex', gap: 8, padding: '12px 20px',
      borderTop: '1px solid #eee', background: '#fff',
    }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
        placeholder="帮我点两杯少冰拿铁..."
        disabled={disabled}
        style={{
          flex: 1, padding: '10px 14px', borderRadius: 24,
          border: '1px solid #ddd', fontSize: 15, outline: 'none',
        }}
      />
      <button
        onClick={send}
        disabled={disabled}
        style={{
          padding: '10px 20px', background: disabled ? '#ccc' : '#f60',
          color: '#fff', border: 'none', borderRadius: 24,
          cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600,
        }}
      >
        发送
      </button>
    </div>
  )
}
