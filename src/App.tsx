import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BookDetails from './pages/BookDetails'
import CreateBook from './pages/CreateBook'
import EditChapter from './pages/EditChapter'
import ChapterDetail from './pages/ChapterDetail'
import DocsOverview from './pages/DocsOverview'
import Profile from './pages/Profile'
import Statistics from './pages/Statistics'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'

const queryClient = new QueryClient()

const AppRoutes = () => {
  const { user, loading } = useAuth()

  // Lê a lista de admins do .env (ex.: VITE_ADMIN_EMAILS=a@a.com,b@b.com)
  const adminEmails =
    (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.split(',').map(e => e.trim()) ??
    []
  const isAdmin = !!(user?.email && adminEmails.includes(user.email))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Login → envia para admin ou dashboard se já logado */}
      <Route
        path="/login"
        element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <Login />}
      />

      {/* Raiz → envia para admin ou dashboard */}
      <Route path="/" element={<Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />} />

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
