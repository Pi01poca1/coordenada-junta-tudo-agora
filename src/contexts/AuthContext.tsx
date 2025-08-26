import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

let authInitialized = false

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Prevenir múltiplas inicializações
    if (authInitialized) {
      console.log('⚠️ AuthProvider já inicializado, pulando...')
      return
    }
    
    authInitialized = true
    console.log('🚀 AuthProvider inicializado ÚNICA VEZ')
    
    let mounted = true
    
    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      console.log('🔄 Auth evento:', event, session?.user?.email || 'sem user')
      
      // Evitar logout desnecessário durante INITIAL_SESSION
      if (event === 'INITIAL_SESSION' && !session) {
        setLoading(false)
        return
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      console.log('🔍 Sessão inicial:', session?.user?.email || 'sem user')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      authInitialized = false // Reset para permitir nova inicialização se necessário
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    console.log('🚪 Fazendo logout...')
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}