import { useState } from 'react'
import HomePage from './pages/HomePage'
import CardLibPage from './pages/CardLibPage'
import SopPage from './pages/SopPage'
import ReviewPage from './pages/ReviewPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

const TABS = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'card', label: '卡片库', icon: '📋' },
  { key: 'sop', label: 'SOP', icon: '📌' },
  { key: 'review', label: '复盘', icon: '🔄' },
  { key: 'profile', label: '我的', icon: '👤' }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="app">
      <div className="page-content">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'card' && <CardLibPage />}
        {activeTab === 'sop' && <SopPage />}
        {activeTab === 'review' && <ReviewPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </div>
      <nav className="tabbar">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tabbar-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="tabbar-icon">{tab.icon}</span>
            <span className="tabbar-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
