interface Props {
  name: string
  price: number
  count: number
  image?: string
  onCountChange?: (delta: number) => void
}

export function Counter({ name, price, count, image, onCountChange }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      {image && <img src={image} alt={name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{name}</div>
        <div style={{ color: '#f60', fontSize: 14 }}>¥{price}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => onCountChange?.(-1)} style={btnStyle}>−</button>
        <span style={{ minWidth: 20, textAlign: 'center' }}>{count}</span>
        <button onClick={() => onCountChange?.(1)} style={btnStyle}>+</button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd',
  background: '#fff', cursor: 'pointer', fontSize: 16, lineHeight: 1,
}
