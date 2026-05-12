import { useState } from 'react'
import { useOrderStore } from '@/store/orderStore'
import { useNavigate } from 'react-router-dom'
import http from '@/lib/axios'
import type { Order } from '@/types/order'

interface Props {
  order: Order
  onClose: () => void
}

export function PaymentModal({ order, onClose }: Props) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const updateStatus = useOrderStore((s) => s.updateStatus)
  const navigate = useNavigate()

  const handlePay = async () => {
    setStatus('processing')
    try {
      // Mock 支付，Phase 6 替换为真实支付接口
      await new Promise((r) => setTimeout(r, 1500))
      await http.post('/payment/webhook', { order_id: order.order_id, status: 'paid' })
      updateStatus('paid')
      setStatus('success')
      setTimeout(() => {
        onClose()
        navigate('/order')
      }, 1200)
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <div style={{ marginTop: 12, fontWeight: 600 }}>支付成功</div>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 16px' }}>确认支付</h3>
            <div style={{ color: '#555', marginBottom: 8 }}>{order.shop_name}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f60', marginBottom: 20 }}>
              ¥{order.total.toFixed(2)}
            </div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>
              配送至：{order.address}
            </div>
            {status === 'failed' && (
              <div style={{ color: '#e53', marginBottom: 12, fontSize: 14 }}>支付失败，请重试</div>
            )}
            <button
              onClick={handlePay}
              disabled={status === 'processing'}
              style={{
                width: '100%', padding: '14px 0', background: status === 'processing' ? '#ccc' : '#f60',
                color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {status === 'processing' ? '处理中...' : '确认支付'}
            </button>
            <button onClick={onClose} style={cancelBtn}>取消</button>
          </>
        )}
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
}
const modal: React.CSSProperties = {
  background: '#fff', borderRadius: '20px 20px 0 0',
  padding: '28px 24px 40px', width: '100%', maxWidth: 480,
}
const cancelBtn: React.CSSProperties = {
  width: '100%', padding: '12px 0', background: 'none',
  color: '#999', border: 'none', fontSize: 15, cursor: 'pointer', marginTop: 8,
}
