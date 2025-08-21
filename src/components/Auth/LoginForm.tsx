import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import logo from "../../assets/logo.png"

export const LoginForm = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
        navigate("/dashboard")
      } else {
        await signUp(email, password, name)
        toast({ title: "Conta criada com sucesso!" })
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
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Androvox Logo" className="w-40 h-40 mb-3" />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-1">ANDROVOX</h1>
            <p className="text-lg text-muted-foreground font-medium">Fábrica de livros</p>
          </div>
        </div>
        <CardTitle>{isLogin ? "Entrar" : "Cadastrar"}</CardTitle>
        <CardDescription>
          {isLogin 
            ? "Digite suas credenciais para acessar seus livros" 
            : "Crie sua conta para começar a escrever seus livros"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Como quer ser chamado?</Label>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {isLogin ? "Entrar" : "Cadastrar"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {isLogin ? (
            <div className="space-y-2">
              <p className="text-muted-foreground">Não tem uma conta?</p>
              <Button
                variant="outline"
                onClick={() => setIsLogin(false)}
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Cadastre-se Agora
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
