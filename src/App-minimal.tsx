// Componente React mínimo sem hooks, context ou dependências externas
export default function App() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#e8f5e8',
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        color: '#2d5d31', 
        fontSize: '2rem',
        marginBottom: '20px'
      }}>
        🚀 ANDROVOX - React Básico
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#333' }}>
        ✅ React carregou com sucesso!
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <strong>Status:</strong> Build de produção funcionando<br/>
        <strong>Hora:</strong> {new Date().toLocaleString()}
      </div>
    </div>
  )
}