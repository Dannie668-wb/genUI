import { useA2UIReducer } from '@/lib/a2ui/reducer'
import { ComponentRenderer } from './ComponentRenderer'

interface Props {
  surfaceId: string
  onAction?: (action: string, payload?: unknown) => void
}

export function SurfaceRenderer({ surfaceId, onAction }: Props) {
  const surface = useA2UIReducer((s) => s.surfaces[surfaceId])
  if (!surface) return null

  const rootComponent = surface.components[surface.rootId]
  if (!rootComponent) return null

  return (
    <div style={{ margin: '8px 0' }}>
      <ComponentRenderer
        component={rootComponent}
        allComponents={surface.components}
        onAction={onAction}
      />
    </div>
  )
}
