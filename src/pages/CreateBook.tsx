import { Navigation } from '@/components/Layout/Navigation'
import { BookForm } from '@/components/Books/BookForm'

const CreateBook = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BookForm />
      </main>
    </div>
  )
}

export default CreateBook
