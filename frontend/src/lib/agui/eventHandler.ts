import type { AgentSubscriber } from '@ag-ui/client'
import type { A2UIMessage } from '@/types/a2ui'
import { useChatStore } from '@/store/chatStore'
import { useA2UIReducer } from '@/lib/a2ui/reducer'

export function buildSubscriber(): AgentSubscriber {
  const chat = useChatStore.getState()
  const a2ui = useA2UIReducer.getState()

  return {
    onRunStartedEvent() {
      chat.setRunning(true)
    },

    onRunFinishedEvent() {
      chat.setRunning(false)
    },

    onRunErrorEvent({ event }: { event: { message?: string } }) {
      chat.setRunning(false)
      chat.addErrorMessage(event.message || '请求失败，请重试')
    },

    onTextMessageStartEvent({ event }: { event: { messageId: string } }) {
      chat.startMessage(event.messageId)
    },

    onTextMessageContentEvent({ event }: { event: { messageId: string; delta: string } }) {
      chat.appendDelta(event.messageId, event.delta)
    },

    onTextMessageEndEvent({ event }: { event: { messageId: string } }) {
      chat.endMessage(event.messageId)
    },

    onToolCallStartEvent({ event }: { event: { toolCallName: string } }) {
      chat.setToolCall(event.toolCallName, 'running')
    },

    onToolCallEndEvent() {
      chat.setToolCall('', 'idle')
    },

    onCustomEvent({ event }: { event: { name: string; value: unknown } }) {
      if (event.name === 'a2ui') {
        const msg = event.value as A2UIMessage
        a2ui.dispatch(msg as never)
        if (msg.type === 'createSurface') {
          chat.setPendingSurface(msg.surface.id)
        }
      }
    },
  }
}
