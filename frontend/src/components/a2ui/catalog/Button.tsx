interface Props {
  text: string
  style?: 'primary' | 'link'
  action?: string
  onAction?: (action: string, payload?: unknown) => void
}

export function Button({ text, style = 'primary', action, onAction }: Props) {
  const isPrimary = style === 'primary'
  return (
    <button
      onClick={() => action && onAction?.(action)}
      style={{
        padding: isPrimary ? '10px 24px' : '6px 0',
        background: isPrimary ? '#f60' : 'transparent',
        color: isPrimary ? '#fff' : '#f60',
        border: isPrimary ? 'none' : 'none',
        borderRadius: isPrimary ? 8 : 0,
        cursor: 'pointer',
        fontSize: 15,
        fontWeight: isPrimary ? 600 : 400,
        textDecoration: style === 'link' ? 'underline' : 'none',
      }}
    >
      {text}
    </button>
  )
}
