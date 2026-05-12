import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Chat } from './pages/Chat'
import { Settings } from './pages/Settings'
import { Onboarding } from './pages/Onboarding'
import { OrderStatus } from './pages/OrderStatus'

const isOnboarded = () => localStorage.getItem('onboarded') === '1'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={isOnboarded() ? '/chat' : '/onboarding'} replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/order" element={<OrderStatus />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
