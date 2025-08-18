import { Navigation } from '@/components/Layout/Navigation'
import { ChapterForm } from '@/components/Chapters/ChapterForm'

const EditChapter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ChapterForm />
      </main>
    </div>
  )
}

export default EditChapter
