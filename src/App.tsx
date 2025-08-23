import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProtectedAdmin } from '@/components/ProtectedAdmin'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

// Lazy loaded components
import {
  BookDetails,
  ChapterDetail,
  EditChapter,
  CreateBook,
  Admin,
  Profile,
  Statistics,
  DocsOverview
} from '@/components/LazyComponents'

// Regular imports for essential components
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-muted-foreground">Carregando...</div>
  </div>
)

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/docs" element={<DocsOverview />} />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-book"
                  element={
                    <ProtectedRoute>
                      <CreateBook />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/book/:id"
                  element={
                    <ProtectedRoute>
                      <BookDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/book/:bookId/chapter/:chapterId"
                  element={
                    <ProtectedRoute>
                      <ChapterDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/book/:bookId/chapter/:chapterId/edit"
                  element={
                    <ProtectedRoute>
                      <EditChapter />
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

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdmin>
                      <Admin />
                    </ProtectedAdmin>
                  }
                />

                {/* 404 and redirects */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
            
            <Toaster />
            <SonnerToaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App