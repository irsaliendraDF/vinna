import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './lib/store'
import App from './App'
import './index.css'

// Build marker: connect to Supabase backend (live auth + database) — rev 2

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
