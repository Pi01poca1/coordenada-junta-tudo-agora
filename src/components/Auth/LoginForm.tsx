import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import logo from "../../assets/logo.png"

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
      setLoading(true)
      try {
        await resetPassword(email)
        toast({ 
          title: "Email enviado!", 
          description: "Verifique sua caixa de entrada para redefinir sua senha" 
        })
        setIsRecoverPassword(false)
        setIsLogin(true)
      } catch (err: any) {
        toast({ title: "Erro", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
      return
    }
    
    if (!isLogin && password !== confirmPassword) {
      toast({ 
        title: "Erro", 
        description: "As senhas não coincidem", 
        variant: "destructive" 
      })
      return
    }
    
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
        navigate("/dashboard")
      } else {
        await signUp(email, password, name)
        toast({ 
          title: "Conta criada com sucesso!", 
          description: "Verifique seu email para confirmar a conta" 
        })
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex flex-col items-center mb-4">
          <img src={logo} alt="Androvox Logo" className="w-40 h-40 mb-1" />
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
              const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                  emailRedirectTo: "https://e50f4fda-55f8-4d52-aab2-82f9e3b02574.sandbox.lovable.dev/login"
                }
              })
              if (error) {
                toast({ title: "Erro", description: error.message, variant: "destructive" })
              } else {
                toast({ title: "Email reenviado!", description: "Verifique sua caixa de entrada" })
              }
            }}
            className="w-full text-sm text-muted-foreground hover:text-primary"
          >
            Reenviar email de confirmação
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
