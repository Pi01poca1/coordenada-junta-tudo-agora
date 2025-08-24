import { Link } from 'react-router-dom'

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">✅ App Restaurado!</h1>
        <p className="text-xl text-gray-600 mb-6">
          EscritorLivros está funcionando normalmente
        </p>
        <div className="space-y-2">
          <p className="text-sm text-blue-600">📚 Sistema de livros e capítulos</p>
          <p className="text-sm text-green-600">🔐 Autenticação configurada</p>
          <p className="text-sm text-purple-600">🎨 Interface restaurada</p>
        </div>
        <div className="mt-6">
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Index
