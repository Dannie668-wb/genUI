import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store/chatStore'
import { MessageItem } from './MessageItem'
import { ToolCallBadge } from './ToolCallBadge'

interface Props {
  onAction?: (action: string, payload?: unknown) => void
}

export function MessageList({ onAction }: Props) {
  const messages = useChatStore((s) => s.messages)
  const activeToolCall = useChatStore((s) => s.activeToolCall)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeToolCall])

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} onAction={onAction} />
      ))}
      {activeToolCall && <ToolCallBadge toolName={activeToolCall} />}
      <div ref={bottomRef} />
    </div>
  )
}
