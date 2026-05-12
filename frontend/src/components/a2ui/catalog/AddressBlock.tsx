interface Props {
  address: string
}

export function AddressBlock({ address }: Props) {
  return (
    <div style={{ padding: '8px 0', color: '#555', fontSize: 14 }}>
      <span style={{ marginRight: 6 }}>📍</span>
      {address || '暂无地址'}
    </div>
  )
}
