import { create } from 'zustand'

interface UserPreferences {
  default_address: string
  flavor: string
  brand: string
}

interface UserStore {
  userId: string
  sessionId: string
  preferences: UserPreferences
  setUser: (userId: string, sessionId: string) => void
  setPreferences: (prefs: Partial<UserPreferences>) => void
}

export const useUserStore = create<UserStore>((set) => ({
  userId: 'user_demo',
  sessionId: crypto.randomUUID(),
  preferences: { default_address: '', flavor: '正常', brand: '' },

  setUser(userId, sessionId) {
    set({ userId, sessionId })
  },

  setPreferences(prefs) {
    set((s) => ({ preferences: { ...s.preferences, ...prefs } }))
  },
}))
