import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useNavigate } from 'react-router-dom'
import http from '@/lib/axios'

export function Onboarding() {
  const { userId, setPreferences } = useUserStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ default_address: '', flavor: '正常', brand: '' })

  const steps = [
    {
      title: '你常用的地址是？',
      content: (
        <input
          style={inputStyle}
          value={form.default_address}
          onChange={(e) => setForm({ ...form, default_address: e.target.value })}
          placeholder="如：XX科技园 A栋"
          autoFocus
        />
      ),
    },
    {
      title: '你喜欢的冰度？',
      content: (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['正常', '少冰', '去冰', '多冰'].map((v) => (
            <button
              key={v}
              onClick={() => setForm({ ...form, flavor: v })}
              style={{
                ...chipStyle,
                background: form.flavor === v ? '#f60' : '#f5f5f5',
                color: form.flavor === v ? '#fff' : '#333',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: '最常点哪个品牌？（可跳过）',
      content: (
        <input
          style={inputStyle}
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          placeholder="如：瑞幸、喜茶（可不填）"
          autoFocus
        />
      ),
    },
  ]

  const isLast = step === steps.length - 1

  const handleNext = async () => {
    if (isLast) {
      setPreferences(form)
      await http.put('/user/preferences', { user_id: userId, preferences: form })
      localStorage.setItem('onboarded', '1')
      navigate('/chat')
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px' }}>
      <div style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>
        {step + 1} / {steps.length}
      </div>
      <h2 style={{ marginBottom: 24, fontSize: 22 }}>{steps[step].title}</h2>
      {steps[step].content}
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={backBtnStyle}>上一步</button>
        )}
        <button onClick={handleNext} style={nextBtnStyle}>
          {isLast ? '开始使用' : '下一步'}
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box',
}
const chipStyle: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 20, border: 'none',
  fontSize: 15, cursor: 'pointer', transition: 'all 0.15s',
}
const nextBtnStyle: React.CSSProperties = {
  flex: 1, padding: '13px 0', background: '#f60', color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer',
}
const backBtnStyle: React.CSSProperties = {
  padding: '13px 20px', background: '#f5f5f5', color: '#333',
  border: 'none', borderRadius: 10, fontSize: 15, cursor: 'pointer',
}
