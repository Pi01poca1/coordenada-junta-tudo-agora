import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProtectedAdmin } from '@/components/ProtectedAdmin'
import { Toaster } from '@/components/ui/sonner'

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

// Direct imports 
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import NotFound from '@/pages/NotFound'
import CreateChapter from '@/pages/CreateChapter'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/create-book" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
                    <CreateBook />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              <Route path="/books/:id/chapters/new" element={
                <ProtectedRoute>
                  <CreateChapter />
                </ProtectedRoute>
              } />
              
              <Route path="/books/:id/chapters/:chapterId" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
                    <ChapterDetail />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              <Route path="/books/:id/chapters/:chapterId/edit" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
                    <EditChapter />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              <Route path="/books/:id" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
                    <BookDetails />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
                    <Profile />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedAdmin>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
                    <Admin />
                  </Suspense>
                </ProtectedAdmin>
              } />
              
              {/* 404 route */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App