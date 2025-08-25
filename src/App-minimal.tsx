import React from 'react'

const App = () => {
  console.log('🔍 App Minimal carregado - versão mais básica possível!')
  console.log('🔍 Window location:', window.location.href)
  console.log('🔍 Document ready state:', document.readyState)
  console.log('🔍 React version:', React.version)
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#333', fontSize: '32px' }}>ANDROVOX - FUNCIONANDO!</h1>
      <p style={{ color: '#666', fontSize: '18px' }}>Se você vê isso, React está OK</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: 'white',
        border: '2px solid #007bff',
        borderRadius: '8px',
        maxWidth: '500px',
        margin: '20px auto'
      }}>
        <h2 style={{ color: '#007bff' }}>Status do Sistema:</h2>
        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '5px 0' }}>✅ React carregado</li>
          <li style={{ padding: '5px 0' }}>✅ Componente renderizado</li>
          <li style={{ padding: '5px 0' }}>✅ CSS funcionando</li>
          <li style={{ padding: '5px 0' }}>✅ Build de produção OK</li>
        </ul>
      </div>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
        URL atual: {window.location.href}
      </p>
    </div>
  )
}

export default App