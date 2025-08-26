import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

// Teste sem AuthProvider primeiro
import Index from '@/pages/Index'

const queryClient = new QueryClient()

const AppSimple = () => {
  console.log('🚀 App Simple carregando...')
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green' }}>✅ ANDROVOX - App Simple Funcionando!</h1>
      <p>Se você vê isso, o problema foi identificado.</p>
      <p>Hora: {new Date().toLocaleString()}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Próximos passos:</h3>
        <ul>
          <li>Testar AuthProvider</li>
          <li>Testar Router</li>
          <li>Testar componentes lazy</li>
        </ul>
      </div>
    </div>
  )
}

export default AppSimple