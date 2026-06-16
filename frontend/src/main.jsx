import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 2500,
        style: {
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          padding: '10px 14px',
        },
        success: {
          iconTheme: {
            primary: 'var(--accent)',
            secondary: 'var(--bg)',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: 'var(--bg)',
          },
        },
      }}
    />
  </StrictMode>,
)