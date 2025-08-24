import { Link } from 'react-router-dom'

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="mb-4 text-4xl font-bold text-foreground">✅ App Restaurado!</h1>
        <p className="text-xl text-muted-foreground mb-6">
          EscritorLivros está funcionando normalmente
        </p>
        <div className="space-y-2">
          <p className="text-sm text-primary">📚 Sistema de livros e capítulos</p>
          <p className="text-sm text-primary">🔐 Autenticação configurada</p>
          <p className="text-sm text-primary">🎨 Interface restaurada</p>
        </div>
        <div className="mt-6">
          <Link 
            to="/login" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 inline-block transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Index
