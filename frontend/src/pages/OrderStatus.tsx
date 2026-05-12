import { useEffect, useRef } from 'react'
import { useOrderStore } from '@/store/orderStore'
import { useUserStore } from '@/store/userStore'
import { useNavigate } from 'react-router-dom'

const STATUS_STEPS = [
  { key: 'pending', label: '待接单' },
  { key: 'paid', label: '已支付' },
  { key: 'delivering', label: '配送中' },
  { key: 'delivered', label: '已送达' },
]

export function OrderStatus() {
  const order = useOrderStore((s) => s.currentOrder)
  const updateStatus = useOrderStore((s) => s.updateStatus)
  const sessionId = useUserStore((s) => s.sessionId)
  const navigate = useNavigate()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!order) return
    const ws = new WebSocket(`ws://localhost:8000/payment/ws/${sessionId}`)
    wsRef.current = ws
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'order_status' && msg.order_id === order.order_id) {
          updateStatus(msg.status)
        }
      } catch {
        // ignore
      }
    }
    return () => ws.close()
  }, [order?.order_id, sessionId])

  if (!order) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80, color: '#999' }}>
        暂无订单
        <br />
        <button onClick={() => navigate('/chat')} style={backBtn}>返回点餐</button>
      </div>
    )
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/chat')} style={iconBtn}>←</button>
        <h2 style={{ margin: 0 }}>订单详情</h2>
      </div>

      {/* 进度条 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentIdx
          const isActive = i === currentIdx
          return (
            <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: done ? '#f60' : '#eee' }} />}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: done ? '#f60' : '#eee',
                  border: isActive ? '3px solid #f60' : 'none',
                  boxSizing: 'border-box',
                }} />
                {i < STATUS_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: done && !isActive ? '#f60' : '#eee' }} />}
              </div>
              <span style={{ fontSize: 11, color: done ? '#f60' : '#aaa', marginTop: 6 }}>{step.label}</span>
            </div>
          )
        })}
      </div>

      {/* 订单信息 */}
      <div style={card}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{order.shop_name}</div>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 }}>
            <span>{item.name} × {item.quantity}</span>
            <span style={{ color: '#999' }}>{item.ice} {item.sugar}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 600 }}>
          <span>合计</span>
          <span style={{ color: '#f60' }}>¥{order.total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ ...card, marginTop: 12, fontSize: 14, color: '#555' }}>
        <span style={{ marginRight: 8 }}>📍</span>{order.address}
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}
const backBtn: React.CSSProperties = {
  marginTop: 16, padding: '10px 24px', background: '#f60',
  color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
}
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4,
}
