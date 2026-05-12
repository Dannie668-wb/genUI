import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import http from '@/lib/axios'

export function Settings() {
  const { userId, preferences, setPreferences } = useUserStore()
  const [form, setForm] = useState({ ...preferences })
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setPreferences(form)
    await http.put('/user/preferences', { user_id: userId, preferences: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: 24 }}>偏好设置</h2>

      <label style={labelStyle}>默认地址</label>
      <input
        style={inputStyle}
        value={form.default_address}
        onChange={(e) => setForm({ ...form, default_address: e.target.value })}
        placeholder="如：XX科技园 A栋"
      />

      <label style={labelStyle}>口味偏好（冰度）</label>
      <select
        style={inputStyle}
        value={form.flavor}
        onChange={(e) => setForm({ ...form, flavor: e.target.value })}
      >
        {['正常', '少冰', '去冰', '多冰'].map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>

      <label style={labelStyle}>常点品牌</label>
      <input
        style={inputStyle}
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
        placeholder="如：瑞幸、喜茶"
      />

      <button onClick={handleSave} style={btnStyle}>
        {saved ? '已保存 ✓' : '保存'}
      </button>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, color: '#666', marginBottom: 6, marginTop: 16,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box',
}
const btnStyle: React.CSSProperties = {
  marginTop: 28, width: '100%', padding: '12px 0',
  background: '#f60', color: '#fff', border: 'none',
  borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer',
}
