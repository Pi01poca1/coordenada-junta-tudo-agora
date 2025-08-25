import React, { createContext, useContext, useEffect, useState } from 'react'
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 AuthContext: Inicializando...')
    
    // Handle auth tokens from URL first (email confirmation, password reset)
    const handleAuthFromUrl = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')
      const error = hashParams.get('error')
      
      console.log('🔍 Verificando tokens na URL:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type, error })
      
      // Se há erro na URL, limpar e parar processamento
      if (error) {
        console.log('❌ Erro encontrado na URL:', error)
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
        return
      }
      
      // Processar apenas se temos ambos os tokens e é um tipo válido
      if (accessToken && refreshToken && (type === 'signup' || type === 'recovery')) {
        console.log('🔑 Processando tokens da URL, tipo:', type)
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('❌ Erro ao definir sessão:', error)
          } else {
            console.log('✅ Sessão definida com sucesso')
          }
          
          // Sempre limpar a hash da URL após processar
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
        } catch (error) {
          console.error('❌ Erro inesperado ao processar tokens:', error)
          // Limpar a hash mesmo em caso de erro
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
        }
      } else if (window.location.hash.length > 1) {
        // Se há hash mas não são tokens válidos, limpar
        console.log('🧹 Limpando hash inválida da URL')
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
      }
    }
    
    handleAuthFromUrl()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change:', event, session ? 'Sessão ativa' : 'Sem sessão')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Sessão existente encontrada:', session ? 'Ativa' : 'Inativa')
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      console.log('🧹 Cleanup AuthContext')
      subscription.unsubscribe()
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
    console.log('📝 AuthContext: Iniciando cadastro para:', email, 'com nome:', name)
    
    const redirectUrl = `${window.location.origin}/login`
    console.log('🔄 Redirect URL configurada:', redirectUrl)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: name ? { name: name.trim() } : {}
        },
      })
      
      console.log('📥 Resposta do signUp:', { data, error })
      
      if (error) {
        console.error('❌ Erro no signUp:', error)
        return { error }
      }
      
      // Se o cadastro foi bem-sucedido e temos um nome, tentar salvar no perfil
      if (data.user && name?.trim()) {
        console.log('👤 Tentando salvar perfil para o usuário:', data.user.id)
        try {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name.trim()
          })
          
          if (profileError) {
            console.warn('⚠️ Erro ao salvar perfil (não crítico):', profileError)
          } else {
            console.log('✅ Perfil salvo com sucesso')
          }
        } catch (profileErr) {
          console.warn('⚠️ Erro inesperado ao salvar perfil:', profileErr)
        }
      }
      
      console.log('✅ Cadastro realizado com sucesso')
      return { error: null }
      
    } catch (err: any) {
      console.error('💥 Erro inesperado no signUp:', err)
      return { error: err }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    // Primeiro tenta o método direto com URL correta
    const redirectUrl = `${window.location.origin}/login`
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })
    
    if (error) {
      // Fallback para edge function
      try {
        const { error: fnError } = await supabase.functions.invoke('reset-password', {
          body: { email }
        })
        
        if (fnError) {
          return { error: new Error('Erro ao enviar email de recuperação') }
        }
        
        return { error: null }
      } catch (err: any) {
        return { error: err }
      }
    }
    
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

