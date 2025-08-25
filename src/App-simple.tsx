import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Componente super simples para testar
const SimpleHome = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>ANDROVOX Fábrica de Livros</h1>
    <p>Sistema funcionando normalmente!</p>
    <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
      Ir para Login
    </a>
  </div>
)

const SimpleLogin = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>Login</h1>
    <p>Página de login funcionando!</p>
    <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
      Voltar para Home
    </a>
  </div>
)

const App = () => {
  console.log('🔍 App Simple carregado!')
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="/login" element={<SimpleLogin />} />
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </Router>
  )
}

export default App