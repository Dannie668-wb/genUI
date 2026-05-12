interface Props {
  shop_name: string
  total: number
  children?: React.ReactNode
}

export function OrderCard({ shop_name, total, children }: Props) {
  return (
    <div style={{
      border: '1px solid #eee', borderRadius: 12, padding: 16,
      background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: 280,
    }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{shop_name}</div>
      {children}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee', fontWeight: 600, fontSize: 15 }}>
        合计：<span style={{ color: '#f60' }}>¥{total.toFixed(2)}</span>
      </div>
    </div>
  )
}
