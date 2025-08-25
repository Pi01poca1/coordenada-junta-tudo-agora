import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App-minimal.tsx'

console.log('🔄 main.tsx carregando (versão mínima)...')

const rootElement = document.getElementById('root')
console.log('🔍 Root element:', rootElement)

if (rootElement) {
  try {
    console.log('🚀 Criando root...')
    const root = createRoot(rootElement)
    console.log('📦 Renderizando App...')
    root.render(<App />)
    console.log('✅ App renderizado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao renderizar:', error)
    rootElement.innerHTML = `<div style="padding:20px;color:red;font-family:Arial;"><h1>❌ Erro React</h1><p>${error.message}</p></div>`
  }
} else {
  console.error('❌ Root element não encontrado!')
}
