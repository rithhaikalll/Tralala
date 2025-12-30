import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App.tsx'
import './index.css' // Tailwind styles
import './App.css'   // Global Theme Variables

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* The Router must wrap the App so navigation hooks work */}
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)