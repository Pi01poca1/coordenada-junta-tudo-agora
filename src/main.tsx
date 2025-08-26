import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App-simple.tsx'
import './index.css'

console.log('🔄 main.tsx carregando...')

const rootElement = document.getElementById('root')
console.log('🔍 Root element encontrado:', rootElement)

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('✅ main.tsx executado com sucesso')
} else {
  console.error('❌ Elemento root não encontrado!')
}
