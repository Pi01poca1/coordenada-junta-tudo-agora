import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BookCard } from './BookCard'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Plus, BookOpen, BarChart3 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Book {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
}

export const BookList = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('books').delete().eq('id', id)

      if (error) throw error

      setBooks(books.filter((book) => book.id !== id))
      toast({
        title: 'Sucesso',
        description: 'Livro excluído com sucesso',
      })
    } catch (error) {
      console.error('Error deleting book:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao excluir livro',
        variant: 'destructive',
      })
    }
    setDeleteId(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-muted-foreground">Carregando livros...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Livros</h1>
          <p className="text-muted-foreground">Gerencie seus projetos de escrita</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/statistics">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Estatísticas
            </Button>
          </Link>
          <Link to="/create-book">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Livro
            </Button>
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Nenhum livro ainda</h2>
          <p className="mb-4 text-muted-foreground">
            Comece sua jornada de escrita criando seu primeiro livro
          </p>
          <Link to="/create-book">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Seu Primeiro Livro
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Livro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este livro? Esta ação não pode ser desfeita e também
              excluirá todos os capítulos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Livro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
