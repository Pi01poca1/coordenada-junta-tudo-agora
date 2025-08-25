import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import logo from "/lovable-uploads/31e2a8d7-b979-4013-8ea3-90c8ccc92055.png"

export const LoginForm = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isRecoverPassword, setIsRecoverPassword] = useState(false)

  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isRecoverPassword) {
      if (!email.trim()) {
        toast({ 
          title: "Email necessário", 
          description: "Digite seu email para recuperar a senha", 
          variant: "destructive" 
        })
        return
      }
      
      setLoading(true)
      try {
        console.log('🔑 Tentando recuperar senha para:', email)
        const { error } = await resetPassword(email)
        
        if (error) {
          console.error('❌ Erro de recuperação:', error)
          
          // Tratamento específico para rate limiting
          if (error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('too many')) {
            toast({ 
              title: "Muitas tentativas", 
              description: "Aguarde alguns minutos antes de tentar novamente", 
              variant: "destructive" 
            })
          } else {
            toast({ 
              title: "Erro ao recuperar senha", 
              description: error.message || "Não foi possível enviar o email de recuperação", 
              variant: "destructive" 
            })
          }
          return
        }
        
        console.log('✅ Email de recuperação enviado')
        toast({ 
          title: "✅ Email enviado!", 
          description: "Verifique sua caixa de entrada e pasta de spam para redefinir sua senha" 
        })
        setIsRecoverPassword(false)
        setIsLogin(true)
      } catch (err: any) {
        console.error('💥 Erro inesperado na recuperação:', err)
        toast({ 
          title: "Erro", 
          description: "Erro inesperado. Tente novamente em alguns minutos.", 
          variant: "destructive" 
        })
      } finally {
        setLoading(false)
      }
      return
    }
    
    // Validações básicas
    if (!email.trim()) {
      toast({ 
        title: "Email necessário", 
        description: "Digite um email válido", 
        variant: "destructive" 
      })
      return
    }
    
    if (!isLogin && !name.trim()) {
      toast({ 
        title: "Nome necessário", 
        description: "Digite seu nome de autor", 
        variant: "destructive" 
      })
      return
    }
    
    if (!password.trim()) {
      toast({ 
        title: "Senha necessária", 
        description: "Digite uma senha", 
        variant: "destructive" 
      })
      return
    }
    
    if (!isLogin && password !== confirmPassword) {
      toast({ 
        title: "Senhas não coincidem", 
        description: "As senhas digitadas são diferentes", 
        variant: "destructive" 
      })
      return
    }
    
    if (!isLogin && password.length < 6) {
      toast({ 
        title: "Senha muito curta", 
        description: "A senha deve ter pelo menos 6 caracteres", 
        variant: "destructive" 
      })
      return
    }
    
    setLoading(true)
    try {
      if (isLogin) {
        console.log('🔑 Tentando fazer login com:', email)
        toast({ 
          title: "Fazendo login...", 
          description: "Verificando suas credenciais" 
        })
        
        const { error } = await signIn(email, password)
        
        if (error) {
          console.error('❌ Erro de login:', error)
          
          // Tratamento específico de erros de login
          if (error.message?.includes('Invalid login credentials')) {
            toast({ 
              title: "Credenciais inválidas", 
              description: "Email ou senha incorretos", 
              variant: "destructive" 
            })
          } else if (error.message?.includes('Email not confirmed')) {
            toast({ 
              title: "Email não confirmado", 
              description: "Verifique seu email e clique no link de confirmação, ou use 'Reenviar email de confirmação'", 
              variant: "destructive" 
            })
          } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
            toast({ 
              title: "Muitas tentativas", 
              description: "Aguarde alguns minutos antes de tentar novamente", 
              variant: "destructive" 
            })
          } else {
            toast({ 
              title: "Erro de Login", 
              description: error.message || "Não foi possível fazer login", 
              variant: "destructive" 
            })
          }
          return
        }
        
        console.log('✅ Login realizado com sucesso')
        toast({ 
          title: "✅ Login realizado!", 
          description: "Bem-vindo de volta!" 
        })
        navigate("/dashboard")
      } else {
        console.log('📝 Tentando criar conta para:', email, 'com nome:', name)
        toast({ 
          title: "Criando conta...", 
          description: "Configurando sua nova conta" 
        })
        
        const { error } = await signUp(email, password, name)
        
        if (error) {
          console.error('❌ Erro de cadastro:', error)
          
          // Tratamento específico de erros de cadastro
          if (error.message?.includes('User already registered')) {
            toast({ 
              title: "Conta já existe", 
              description: "Este email já está cadastrado. Tente fazer login ou recuperar a senha.", 
              variant: "destructive" 
            })
          } else if (error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('too many')) {
            toast({ 
              title: "Muitas tentativas", 
              description: "Aguarde alguns minutos antes de tentar criar uma conta novamente", 
              variant: "destructive" 
            })
          } else if (error.message?.includes('Password')) {
            toast({ 
              title: "Senha inválida", 
              description: "A senha deve ter pelo menos 6 caracteres", 
              variant: "destructive" 
            })
          } else if (error.message?.includes('Email')) {
            toast({ 
              title: "Email inválido", 
              description: "Digite um email válido", 
              variant: "destructive" 
            })
          } else {
            toast({ 
              title: "Erro de Cadastro", 
              description: error.message || "Não foi possível criar a conta", 
              variant: "destructive" 
            })
          }
          return
        }
        
        console.log('✅ Conta criada com sucesso')
        toast({ 
          title: "✅ Conta criada com sucesso!", 
          description: "Verifique seu email para confirmar sua conta e começar a usar o sistema" 
        })
        
        // Mudar para o modo login após cadastro bem-sucedido
        setIsLogin(true)
        setPassword("")
        setConfirmPassword("")
      }
    } catch (err: any) {
      console.error('💥 Erro inesperado:', err)
      toast({ 
        title: "Erro inesperado", 
        description: "Ocorreu um erro. Tente novamente em alguns minutos.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex flex-col items-center mb-4">
          <img src={logo} alt="Androvox Logo" className="w-40 h-40 mb-1 object-contain" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-semibold tracking-wide">Fábrica de livros</p>
          </div>
        </div>
        <CardTitle>
          {isRecoverPassword ? "Recuperar Senha" : isLogin ? "Entrar" : "Cadastrar"}
        </CardTitle>
        <CardDescription>
          {isRecoverPassword
            ? "Digite seu email para receber as instruções de recuperação"
            : isLogin 
              ? "Digite suas credenciais para acessar seus livros" 
              : "Crie sua conta para começar a escrever seus livros"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isRecoverPassword && (
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Qual nome deseja ser chamado?</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome de autor"
                required
                className="bg-background border-primary/20 focus:border-primary focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">Este nome aparecerá no sistema identificando você como autor</p>
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>
          {!isRecoverPassword && (
            <>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>
              )}
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {isRecoverPassword ? "Enviar Email" : isLogin ? "Entrar" : "Cadastrar"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {isRecoverPassword ? (
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsRecoverPassword(false)
                  setIsLogin(true)
                }}
                className="w-full text-primary hover:bg-primary/10"
              >
                Voltar ao Login
              </Button>
            </div>
          ) : isLogin ? (
            <div className="space-y-2">
              <p className="text-muted-foreground">Não tem uma conta?</p>
              <Button
                variant="outline"
                onClick={() => setIsLogin(false)}
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Cadastre-se Agora
              </Button>
          <Button
            variant="ghost"
            onClick={() => setIsRecoverPassword(true)}
            className="w-full text-sm text-muted-foreground hover:text-primary"
          >
            Esqueci minha senha
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              console.log("🔄 Botão reenviar clicado, email:", email)
              
              if (!email.trim()) {
                console.log("❌ Email vazio, mostrando erro")
                toast({ 
                  title: "Email necessário", 
                  description: "Digite seu email no campo acima antes de reenviar a confirmação", 
                  variant: "destructive" 
                })
                return
              }
              
              console.log("📧 Tentando reenviar confirmação para:", email.trim())
              
              try {
                setLoading(true)
                toast({ 
                  title: "📧 Enviando email...", 
                  description: "Reenviando confirmação, aguarde..." 
                })
                
                const { data, error } = await supabase.functions.invoke('resend-confirmation', {
                  body: { email: email.trim() }
                })
                
                console.log("📥 Resposta da função:", { data, error })
                
                if (error) {
                  console.error("❌ Erro na função:", error)
                  
                  // Tratamento específico para rate limiting
                  if (error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('too many')) {
                    toast({ 
                      title: "Muitas tentativas", 
                      description: "Aguarde alguns minutos antes de reenviar novamente", 
                      variant: "destructive" 
                    })
                  } else if (error.message?.includes('User not found') || error.message?.includes('not found')) {
                    toast({ 
                      title: "Email não encontrado", 
                      description: "Este email não está cadastrado no sistema", 
                      variant: "destructive" 
                    })
                  } else {
                    toast({ 
                      title: "Erro no reenvio", 
                      description: error.message || "Não foi possível reenviar o email", 
                      variant: "destructive" 
                    })
                  }
                } else {
                  console.log("✅ Email reenviado com sucesso")
                  toast({ 
                    title: "✅ Email reenviado!", 
                    description: "Verifique sua caixa de entrada e pasta de spam. O link é válido por 24 horas." 
                  })
                }
              } catch (err: any) {
                console.error("💥 Erro na requisição:", err)
                toast({ 
                  title: "Erro de conexão", 
                  description: "Verifique sua conexão e tente novamente em alguns minutos.", 
                  variant: "destructive" 
                })
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="w-full text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            {loading ? "📧 Enviando..." : "🔄 Reenviar email de confirmação"}
          </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">Já tem uma conta?</p>
              <Button
                variant="ghost"
                onClick={() => setIsLogin(true)}
                className="w-full text-primary hover:bg-primary/10"
              >
                Fazer Login
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
