import React from 'react'

const App = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          🚀 App Funcionando!
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          marginBottom: '24px' 
        }}>
          EscritorLivros carregado com sucesso
        </p>
        <a 
          href="/login" 
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px'
          }}
        >
          Ir para Login
        </a>
      </div>
    </div>
  )
}

export default App