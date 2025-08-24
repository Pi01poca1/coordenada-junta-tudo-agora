import { Link } from 'react-router-dom'

const Index = () => {
  console.log('Index component rendering...')
  
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#ffffff',
      color: '#000000'
    }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '32px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{ marginBottom: '16px', fontSize: '36px', fontWeight: 'bold', color: '#000000' }}>
          ✅ App Restaurado!
        </h1>
        <p style={{ fontSize: '20px', color: '#666666', marginBottom: '24px' }}>
          EscritorLivros está funcionando normalmente
        </p>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '8px' }}>📚 Sistema de livros e capítulos</p>
          <p style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '8px' }}>🔐 Autenticação configurada</p>
          <p style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '8px' }}>🎨 Interface restaurada</p>
        </div>
        <div style={{ marginTop: '24px' }}>
          <Link 
            to="/login" 
            style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '4px', 
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background-color 0.2s'
            }}
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Index
