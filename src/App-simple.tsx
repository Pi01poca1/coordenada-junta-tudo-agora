import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'

// Teste com AuthProvider
import Index from '@/pages/Index'
import Login from '@/pages/Login'

const queryClient = new QueryClient()

const AppSimple = () => {
  console.log('🚀 Testando AuthProvider...')
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1 style={{ color: 'blue' }}>🔄 TESTE: AuthProvider + Router</h1>
            <p>Se você vê isso, AuthProvider está OK!</p>
            <p>Hora: {new Date().toLocaleString()}</p>
            
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default AppSimple