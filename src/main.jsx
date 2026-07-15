import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { initMonitoring } from '@/lib/monitoring'
import '@/index.css'

// Starts Sentry only if VITE_SENTRY_DSN is set; otherwise a no-op.
initMonitoring()

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
