interface Props {
  toolName: string
}

export function ToolCallBadge({ toolName }: Props) {
  if (!toolName) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 13, padding: '4px 0' }}>
      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
      正在调用工具：{toolName}
    </div>
  )
}
