import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

const Index = () => {
  console.log('🚀 Index component renderizando...')
  const [connectionStatus, setConnectionStatus] = useState('testando')
  
  useEffect(() => {
    console.log('📍 Index page carregada - useEffect executado')
    
    const testSupabase = async () => {
      try {
        console.log('🔍 Testando conexão Supabase...')
        const { data, error } = await supabase.from('books').select('count', { count: 'exact', head: true })
        
        if (error) {
          console.error('❌ Erro Supabase:', error)
          setConnectionStatus('erro: ' + error.message)
        } else {
          console.log('✅ Supabase OK')
          setConnectionStatus('conectado')
        }
      } catch (err) {
        console.error('💥 Erro ao testar:', err)
        setConnectionStatus('erro de conexão')
      }
    }
    
    testSupabase()
  }, [])
  
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
      <div className="text-center p-8 rounded-lg shadow-lg" style={{ backgroundColor: 'white' }}>
        <h1 className="mb-4 text-4xl font-bold" style={{ color: '#111827' }}>✅ App Restaurado!</h1>
        <p className="text-xl mb-6" style={{ color: '#4b5563' }}>
          EscritorLivros está funcionando normalmente
        </p>
        <div className="space-y-2">
          <p className="text-sm" style={{ color: '#2563eb' }}>📚 Sistema de livros e capítulos</p>
          <p className="text-sm" style={{ color: '#16a34a' }}>🔐 Autenticação configurada</p>
          <p className="text-sm" style={{ color: '#9333ea' }}>🎨 Interface simplificada disponível</p>
          <p className="text-sm" style={{ color: '#f59e0b' }}>🔌 Supabase: {connectionStatus}</p>
        </div>
        <div className="mt-6">
          <Link 
            to="/login" 
            className="inline-block px-4 py-2 rounded transition-colors"
            style={{ 
              backgroundColor: '#2563eb', 
              color: 'white',
              textDecoration: 'none'
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
