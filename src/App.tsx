import React, { Suspense } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Simplified imports to isolate the issue
const queryClient = new QueryClient()

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-muted-foreground">Loading...</div>
  </div>
)

// Simple test component to verify React is working
const TestLogin = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="bg-card p-8 rounded-lg shadow-lg border max-w-md w-full mx-4">
      <h1 className="text-2xl font-bold text-center mb-4">Androvox</h1>
      <p className="text-center text-muted-foreground mb-6">Fábrica de livros</p>
      <div className="space-y-4">
        <input 
          type="email" 
          placeholder="Email"
          className="w-full p-3 border rounded-md"
        />
        <input 
          type="password" 
          placeholder="Senha"
          className="w-full p-3 border rounded-md"
        />
        <button className="w-full bg-primary text-primary-foreground p-3 rounded-md hover:bg-primary/90">
          Entrar
        </button>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Sistema funcionando! ✅
      </p>
    </div>
  </div>
)

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/login" element={<TestLogin />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<TestLogin />} />
    </Routes>
  </Suspense>
)

const App = () => {
  console.log('🚀 App iniciando...')
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App