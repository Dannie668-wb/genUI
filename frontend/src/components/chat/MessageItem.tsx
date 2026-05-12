import type { ChatMessage } from '@/store/chatStore'
import { SurfaceRenderer } from '../a2ui/SurfaceRenderer'

interface Props {
  message: ChatMessage
  onAction?: (action: string, payload?: unknown) => void
}

export function MessageItem({ message, onAction }: Props) {
  const isUser = message.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
    }}>
      <div style={{
        maxWidth: '75%',
        padding: isUser ? '10px 14px' : 0,
        background: isUser ? '#f60' : 'transparent',
        color: isUser ? '#fff' : '#222',
        borderRadius: isUser ? '16px 16px 4px 16px' : 0,
        fontSize: 15,
        lineHeight: 1.6,
      }}>
        {message.content && <span>{message.content}</span>}
        {message.surfaceId && (
          <SurfaceRenderer surfaceId={message.surfaceId} onAction={onAction} />
        )}
      </div>
    </div>
  )
}
