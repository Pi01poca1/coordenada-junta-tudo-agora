import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Import apenas do Login (que sabemos que funciona)
import Login from './pages/Login'

// Dashboard simples temporário
const SimpleDashboard = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>
    <h1>🏠 Dashboard</h1>
    <p>✅ <strong>SUCESSO! Vercel funcionando!</strong></p>
    <p>🎉 Login, React Router, AuthProvider, Supabase - TUDO OK!</p>
    <p>📋 Próximo passo: Investigar Dashboard.tsx original</p>
    
    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #0066cc' }}>
      <h3>✅ Funcionalidades Confirmadas:</h3>
      <ul style={{ textAlign: 'left', display: 'inline-block' }}>
        <li>✅ Build de produção funciona</li>
        <li>✅ Variáveis de ambiente funcionam</li>
        <li>✅ Supabase conecta corretamente</li>
        <li>✅ React Router funciona</li>
        <li>✅ AuthProvider funciona</li>
        <li>✅ Login.tsx funciona</li>
      </ul>
    </div>
    
    <div style={{ marginTop: '20px' }}>
      <button onClick={() => window.location.href = '/login'}>
        Voltar ao Login
      </button>
    </div>
  </div>
)

const Simple404 = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>
    <h1>❌ 404 - Página não encontrada</h1>
    <a href="/login">Voltar ao Login</a>
  </div>
)

const AppRoutes = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/dashboard"
        element={user ? <SimpleDashboard /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Simple404 />} />
    </Routes>
  )
}

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
)

export default App