import type { A2UIComponent } from '@/types/a2ui'
import { Counter } from './catalog/Counter'
import { Button } from './catalog/Button'
import { AddressBlock } from './catalog/AddressBlock'
import { OrderCard } from './catalog/OrderCard'
import { ShopItem, ShopList } from './catalog/ShopItem'
import { MenuList } from './catalog/MenuItem'
import { AddressPicker } from './catalog/AddressPicker'

interface Props {
  component: A2UIComponent
  allComponents: Record<string, A2UIComponent>
  onAction?: (action: string, payload?: unknown) => void
}

export function ComponentRenderer({ component, allComponents, onAction }: Props) {
  const children = (component.children ?? []).map((childId) => {
    const child = allComponents[childId]
    return child ? (
      <ComponentRenderer
        key={childId}
        component={child}
        allComponents={allComponents}
        onAction={onAction}
      />
    ) : null
  })

  const p = component.props as Record<string, never>

  switch (component.type) {
    case 'order_card':
      return <OrderCard shop_name={p.shop_name} total={p.total}>{children}</OrderCard>

    case 'counter':
      return <Counter name={p.name} price={p.price} count={p.count} image={p.image} />

    case 'button':
      return <Button text={p.text} style={p.style} action={p.action} onAction={onAction} />

    case 'address_block':
      return <AddressBlock address={p.address} />

    case 'shop_list':
      return <ShopList>{children}</ShopList>

    case 'shop_item':
      return <ShopItem shop_id={p.shop_id} name={p.name} rating={p.rating} distance={p.distance} onAction={onAction} />

    case 'menu_list':
      return <MenuList childIds={component.children ?? []} allComponents={allComponents} onAction={onAction} />

    case 'address_picker':
      return <AddressPicker suggestions={p.suggestions as string[]} onAction={onAction} />

    default:
      return null
  }
}
