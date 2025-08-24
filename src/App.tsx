import React from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

const AppContent = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h2>🔄 Loading...</h2>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎉 APP.TSX FUNCIONANDO!</h1>
      <p><strong>Status:</strong> {user ? 'Logado' : 'Não logado'}</p>
      <p><strong>User:</strong> {user ? user.email : 'Nenhum'}</p>
      <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #0066cc' }}>
        <h3>✅ SUCESSO!</h3>
        <p>App.tsx carregou com AuthProvider funcionando!</p>
        <p>Próximo passo: adicionar React Router...</p>
      </div>
    </div>
  )
}

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)

export default App