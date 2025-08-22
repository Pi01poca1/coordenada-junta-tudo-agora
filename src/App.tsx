import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Suspense } from 'react'

// Imports estáticos (páginas leves)
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

// Lazy imports (páginas pesadas)
import { 
  BookDetails, 
  CreateBook, 
  EditChapter, 
  ChapterDetail, 
  DocsOverview, 
  Profile, 
  Statistics, 
  Admin 
} from '@/components/LazyComponents'

const queryClient = new QueryClient()

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-muted-foreground">Loading...</div>
  </div>
)

const AppRoutes = () => {
  const { user, loading } = useAuth()

  // Lê a lista de admins do .env
  const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || ''
  const adminEmails = adminEmailsEnv.split(',').map(e => e.trim()).filter(Boolean)
  const isAdmin = !!(user?.email && adminEmails.includes(user.email))

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Login → envia para admin ou dashboard se já logado */}
        <Route
          path="/login"
          element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <Login />}
        />

        {/* Raiz → envia para login se não logado, senão para admin ou dashboard */}
        <Route path="/" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <Navigate to="/login" replace />} />

        {/* Admin (somente para emails da lista). Se não for admin, manda para dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              {isAdmin ? <Admin /> : <Navigate to="/dashboard" replace />}
            </ProtectedRoute>
          }
        />

        {/* Rotas do usuário */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/new"
          element={
            <ProtectedRoute>
              <CreateBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/:id"
          element={
            <ProtectedRoute>
              <BookDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/:id/edit"
          element={
            <ProtectedRoute>
              <CreateBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/:bookId/chapters/new"
          element={
            <ProtectedRoute>
              <EditChapter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/:bookId/chapters/:chapterId/edit"
          element={
            <ProtectedRoute>
              <EditChapter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/:bookId/chapters/:chapterId"
          element={
            <ProtectedRoute>
              <ChapterDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/docs/overview"
          element={
            <ProtectedRoute>
              <DocsOverview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App