function App() {
  console.log('🟢 App simples carregando...')
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'green' }}>✅ ANDROVOX - Funcionando!</h1>
      <p>Se você vê isso, React está ok.</p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        marginTop: '10px'
      }}>
        <strong>Teste de JavaScript:</strong> {new Date().toLocaleString()}
      </div>
    </div>
  )
}

export default App