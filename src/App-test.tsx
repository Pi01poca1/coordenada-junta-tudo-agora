function App() {
  console.log('🔍 App component renderizando...')
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>ANDROVOX - Teste Básico</h1>
      <p style={{ color: '#28a745', fontWeight: 'bold' }}>✅ React funcionando!</p>
      <p>Se você vê isso, React está carregando corretamente.</p>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <strong>URL atual:</strong> {window.location.href}
      </div>
    </div>
  )
}

export default App