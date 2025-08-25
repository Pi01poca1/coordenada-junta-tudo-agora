import React from 'react'

const App = () => {
  console.log('🔍 App Debug - Componente carregado!')
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>ANDROVOX - Debug Mode</h1>
      <p style={{ color: '#666' }}>Se você vê isso, o React está funcionando!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
        <h2>Status:</h2>
        <ul>
          <li>✅ React carregado</li>
          <li>✅ Componente renderizado</li>
          <li>✅ CSS inline funcionando</li>
        </ul>
      </div>
    </div>
  )
}

export default App