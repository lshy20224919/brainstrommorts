import { useState } from 'react'
import { Home, Layers, ListChecks, RotateCcw, User } from 'lucide-react'
import { ToastProvider } from './components/Toast'
import HomePage from './pages/HomePage'
import CardLibPage from './pages/CardLibPage'
import SopPage from './pages/SopPage'
import ReviewPage from './pages/ReviewPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

const TABS = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'card', label: '卡片库', icon: Layers },
  { key: 'sop', label: 'SOP', icon: ListChecks },
  { key: 'review', label: '复盘', icon: RotateCcw },
  { key: 'profile', label: '我的', icon: User }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [cardLibInit, setCardLibInit] = useState(null)

  const handleSwitchTab = (tab, params) => {
    if (params) setCardLibInit(params)
    else setCardLibInit(null)
    setActiveTab(tab)
  }

  return (
    <ToastProvider>
    <div className="app">
      <div className="page-content">
        {activeTab === 'home' && <HomePage onSwitchTab={handleSwitchTab} />}
        {activeTab === 'card' && <CardLibPage initParams={cardLibInit} />}
        {activeTab === 'sop' && <SopPage />}
        {activeTab === 'review' && <ReviewPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </div>
      <nav className="tabbar">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              className={`tabbar-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setCardLibInit(null); setActiveTab(tab.key) }}
            >
              <span className="tabbar-icon"><Icon size={22} strokeWidth={2} /></span>
              <span className="tabbar-label">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
    </ToastProvider>
  )
}
