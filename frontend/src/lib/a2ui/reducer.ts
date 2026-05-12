import { create } from 'zustand'
import type { A2UIMessage, SurfaceState, A2UIComponent } from '@/types/a2ui'

interface A2UIStore {
  surfaces: Record<string, SurfaceState>
  dispatch: (msg: A2UIMessage) => void
  clearSurface: (surfaceId: string) => void
}

export const useA2UIReducer = create<A2UIStore>((set) => ({
  surfaces: {},

  dispatch(msg: A2UIMessage) {
    set((state) => {
      const surfaces = { ...state.surfaces }

      if (msg.type === 'createSurface') {
        surfaces[msg.surface.id] = {
          surfaceId: msg.surface.id,
          rootId: msg.surface.root,
          components: {},
        }
      }

      if (msg.type === 'updateComponents') {
        for (const surface of Object.values(surfaces)) {
          const updated = { ...surface.components }
          for (const comp of msg.components) {
            updated[comp.id] = comp as A2UIComponent
          }
          surfaces[surface.surfaceId] = { ...surface, components: updated }
        }
      }

      if (msg.type === 'deleteSurface') {
        delete surfaces[msg.surface_id]
      }

      return { surfaces }
    })
  },

  clearSurface(surfaceId) {
    set((state) => {
      const surfaces = { ...state.surfaces }
      delete surfaces[surfaceId]
      return { surfaces }
    })
  },
}))
