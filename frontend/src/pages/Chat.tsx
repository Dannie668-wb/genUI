import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/store/chatStore'
import { useUserStore } from '@/store/userStore'
import { useOrderStore } from '@/store/orderStore'
import { runAGUIStream } from '@/lib/agui/client'
import { buildSubscriber } from '@/lib/agui/eventHandler'
import { MessageList } from '@/components/chat/MessageList'
import { InputBar } from '@/components/chat/InputBar'
import { PaymentModal } from '@/components/chat/PaymentModal'
import type { Order } from '@/types/order'

export function Chat() {
  const running = useChatStore((s) => s.running)
  const addUserMessage = useChatStore((s) => s.addUserMessage)
  const { userId, sessionId } = useUserStore()
  const setOrder = useOrderStore((s) => s.setOrder)
  const currentOrder = useOrderStore((s) => s.currentOrder)
  const navigate = useNavigate()
  const [showPayment, setShowPayment] = useState(false)

  const handleSend = (text: string) => {
    addUserMessage(text)

    const state = useChatStore.getState()
    const storeMessages = state.messages
    const messages = storeMessages
      .filter((m) => m.content)
      .map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content }))

    const shopId = state.pendingShopId
    state.setPendingShopId(null)

    runAGUIStream(
      'http://localhost:8000/chat/stream',
      {
        threadId: sessionId,
        runId: crypto.randomUUID(),
        messages,
        tools: [],
        context: [],
        forwardedProps: { userId, ...(shopId ? { shopId } : {}) },
      } as never,
      buildSubscriber(),
    )
  }

  const handleAction = (action: string, payload?: unknown) => {
    if (action === 'select_address') {
      handleSend(`配送地址已选好：${payload as string}`)
    }
    if (action === 'select_menu_item') {
      const { name } = payload as { name: string; price: number }
      handleSend(`我要一份${name}`)
    }
    if (action === 'select_shop') {
      const { shopId, shopName } = payload as { shopId: string; shopName: string }
      useChatStore.getState().setPendingShopId(shopId)
      handleSend(`我选${shopName}`)
    }
    if (action === 'call_pay') {
      if (payload) setOrder(payload as Order)
      setShowPayment(true)
    }
    if (action === 'open_map') {
      navigate('/settings')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f9f9f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fff', borderBottom: '1px solid #eee' }}>
        <span style={{ fontWeight: 600, fontSize: 17 }}>AI 点餐助手</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => navigate('/order')} style={navBtn}>订单</button>
          <button onClick={() => navigate('/settings')} style={navBtn}>设置</button>
        </div>
      </div>
      <MessageList onAction={handleAction} />
      <InputBar onSend={handleSend} disabled={running} />
      {showPayment && currentOrder && (
        <PaymentModal order={currentOrder} onClose={() => setShowPayment(false)} />
      )}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: '#f60',
  fontSize: 14, cursor: 'pointer', fontWeight: 500,
}
