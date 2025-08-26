import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { User, Session } from '@supabase/supabase-js'

const AppTestLogin = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    console.log('🚀 App Test Login carregado')
    
    // Listener simples
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth:', event, session?.user?.email || 'sem user')
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Sessão atual:', session?.user?.email || 'sem user')
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Fazendo login...')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setMessage(`Erro: ${error.message}`)
    } else {
      setMessage('Login OK!')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMessage('Logout feito')
  }

  if (user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1 style={{ color: 'green' }}>✅ LOGADO!</h1>
        <p>Email: {user.email}</p>
        <p>Status: {message}</p>
        <button onClick={handleLogout} style={{ padding: '10px', backgroundColor: 'red', color: 'white' }}>
          Logout
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'blue' }}>🔑 LOGIN TESTE</h1>
      <p>Status: {message}</p>
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px', width: '200px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '8px', width: '200px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px', backgroundColor: 'blue', color: 'white' }}>
          Login
        </button>
      </form>
    </div>
  )
}

export default AppTestLogin