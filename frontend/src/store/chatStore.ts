import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  surfaceId?: string
}

interface ChatStore {
  messages: ChatMessage[]
  running: boolean
  activeToolCall: string
  pendingSurfaceId: string | null
  pendingShopId: string | null

  addUserMessage: (content: string) => void
  startMessage: (id: string) => void
  appendDelta: (id: string, delta: string) => void
  endMessage: (id: string) => void
  setRunning: (v: boolean) => void
  setToolCall: (name: string, status: 'running' | 'idle') => void
  attachSurface: (msgId: string, surfaceId: string) => void
  setPendingSurface: (id: string | null) => void
  setPendingShopId: (id: string | null) => void
  addErrorMessage: (error: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  running: false,
  activeToolCall: '',
  pendingShopId: null,
  pendingSurfaceId: null,

  addUserMessage(content) {
    set((s) => ({
      messages: [...s.messages, { id: crypto.randomUUID(), role: 'user', content }],
    }))
  },

  startMessage(id) {
    set((s) => ({
      messages: [...s.messages, { id, role: 'assistant', content: '', surfaceId: s.pendingSurfaceId ?? undefined }],
      pendingSurfaceId: null,
    }))
  },

  setPendingSurface(id) {
    set({ pendingSurfaceId: id })
  },

  setPendingShopId(id) {
    set({ pendingShopId: id })
  },

  appendDelta(id, delta) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + delta } : m
      ),
    }))
  },

  endMessage(_id) {},

  setRunning(v) {
    set({ running: v })
  },

  setToolCall(name, status) {
    set({ activeToolCall: status === 'running' ? name : '' })
  },

  attachSurface(msgId, surfaceId) {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === msgId ? { ...m, surfaceId } : m
      ),
    }))
  },

  addErrorMessage(error) {
    set((s) => ({
      messages: [...s.messages, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ ${error}`,
      }],
    }))
  },
}))
