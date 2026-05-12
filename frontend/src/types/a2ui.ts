export interface A2UIComponent {
  id: string
  type: string
  props: Record<string, unknown>
  children?: string[]
}

export interface CreateSurface {
  type: 'createSurface'
  surface: { id: string; root: string }
}

export interface UpdateComponents {
  type: 'updateComponents'
  components: A2UIComponent[]
}

export interface UpdateDataModel {
  type: 'updateDataModel'
  path: string
  value: unknown
}

export interface DeleteSurface {
  type: 'deleteSurface'
  surface_id: string
}

export type A2UIMessage = CreateSurface | UpdateComponents | UpdateDataModel | DeleteSurface

export interface SurfaceState {
  surfaceId: string
  rootId: string
  components: Record<string, A2UIComponent>
}
