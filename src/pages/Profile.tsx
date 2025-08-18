import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Layout/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  bio: string | null
  avatar_url: string | null
}

const Profile = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    id: '',
    first_name: '',
    last_name: '',
    bio: '',
    avatar_url: '',
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProfile(data)
      } else {
        setProfile((prev) => ({ ...prev, id: user.id }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do perfil',
        variant: 'destructive',
      })
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        bio: profile.bio || null,
        avatar_url: profile.avatar_url || null,
      })

      if (error) throw error

      toast({
        title: 'Salvo!',
        description: 'Perfil atualizado com sucesso',
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao salvar perfil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Faça login para acessar seu perfil
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {(profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">
                  {profile.first_name} {profile.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nome</Label>
                <Input
                  id="first_name"
                  value={profile.first_name || ''}
                  onChange={(e) => setProfile((prev) => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Digite seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input
                  id="last_name"
                  value={profile.last_name || ''}
                  onChange={(e) => setProfile((prev) => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Digite seu sobrenome"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">URL do Avatar</Label>
              <Input
                id="avatar_url"
                value={profile.avatar_url || ''}
                onChange={(e) => setProfile((prev) => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte-nos sobre você..."
                rows={4}
              />
            </div>

            <Button onClick={saveProfile} disabled={loading} className="w-full">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default Profile
