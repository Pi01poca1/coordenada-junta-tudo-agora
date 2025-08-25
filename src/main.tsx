import React from 'react'
import { createRoot } from 'react-dom/client'

console.log('🔄 main.tsx carregando (bypass build)...')

// Componente inline para evitar imports problemáticos
function App() {
  console.log('🟢 App inline carregando...')
  return React.createElement('div', {
    style: { 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#e8f5e8',
      minHeight: '100vh',
      textAlign: 'center'
    }
  }, [
    React.createElement('h1', { 
      key: 'title',
      style: { 
        color: '#2d5d31', 
        fontSize: '2rem',
        marginBottom: '20px'
      }
    }, '🚀 ANDROVOX - Build Bypass'),
    React.createElement('p', { 
      key: 'status',
      style: { fontSize: '1.2rem', color: '#333' }
    }, '✅ React funcionando sem vendor bundle!'),
    React.createElement('div', { 
      key: 'info',
      style: { 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }
    }, `Status: Build bypassed - ${new Date().toLocaleString()}`)
  ])
}

const rootElement = document.getElementById('root')
if (rootElement) {
  try {
    console.log('🚀 Criando root com React direto...')
    const root = createRoot(rootElement)
    console.log('📦 Renderizando com createElement...')
    root.render(React.createElement(App))
    console.log('✅ Success! Build bypass funcionou!')
  } catch (error) {
    console.error('❌ Erro:', error)
    rootElement.innerHTML = `<div style="padding:20px;color:red;font-family:Arial;"><h1>❌ Erro: ${error.message}</h1></div>`
  }
} else {
  console.error('❌ Root não encontrado!')
}
