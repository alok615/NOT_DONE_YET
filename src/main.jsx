// ============================================
// !doneyet — App Entry Point
// ============================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import useAppStore from './store/appStore'

// Import design system styles
import './styles/variables.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/responsive.css'

// Import question data
import DiffChecker from './components/common/DiffChecker.js'
import ultimateData from './components/common/ultimateData.js'

// ── Initialize question data ──
let appData = localStorage.getItem('doneyet_data')
appData = appData === null ? ultimateData : JSON.parse(appData)
appData = DiffChecker(ultimateData, appData)

// ── Initialize theme ──
const savedTheme = JSON.parse(localStorage.getItem('doneyet-ui-store') || '{}')
const theme = savedTheme?.state?.theme || 'dark'
document.documentElement.setAttribute('data-theme', theme)

// ── Initialize store with data ──
useAppStore.getState().setData(appData)

// ── Toast styling ──
const toastOptions = {
  style: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-secondary)',
    borderRadius: 'var(--radius-lg)',
    fontSize: 'var(--text-sm)',
    boxShadow: 'var(--shadow-lg)',
  },
  success: {
    iconTheme: {
      primary: 'var(--color-success)',
      secondary: 'white',
    },
  },
  error: {
    iconTheme: {
      primary: 'var(--color-danger)',
      secondary: 'white',
    },
  },
  duration: 3000,
}

// ── Render App ──
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={toastOptions}
          containerStyle={{ top: 80 }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
