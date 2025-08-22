import React from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Imports estáticos básicos para teste
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient()

const TestPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold text-foreground">Sistema Funcionando! ✅</h1>
      <p className="text-muted-foreground">A aplicação está carregando corretamente</p>
      <div className="flex gap-4 justify-center">
        <a 
          href="/login" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Ir para Login
        </a>
        <a 
          href="/dashboard" 
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
        >
          Ir para Dashboard
        </a>
      </div>
    </div>
  </div>
)

const App = () => {
  console.log('🔄 App component rendering...')
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<TestPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App