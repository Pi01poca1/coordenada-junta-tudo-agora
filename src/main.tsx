import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Starting app...')

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  
  console.log('✅ Root element found, rendering app...')
  createRoot(rootElement).render(<App />)
} catch (error) {
  console.error('❌ Error starting app:', error)
}
