import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { BookOpen, ChevronRight } from 'lucide-react'

interface Book {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
}

export const SimplifiedBookList = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchBooks()
  }, [user])

  const fetchBooks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar livros',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-32 items-center justify-center">
        <div className="text-muted-foreground">Carregando livros...</div>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="py-8 text-center">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Nenhum livro ainda</h3>
        <p className="text-muted-foreground">
          Comece sua jornada criando seu primeiro livro
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {books.map((book) => (
        <Card key={book.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Link to={`/simplified/books/${book.id}/chapters`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{book.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {book.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}