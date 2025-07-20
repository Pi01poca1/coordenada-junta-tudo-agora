import { Navigation } from '@/components/Layout/Navigation';
import { ChapterForm } from '@/components/Chapters/ChapterForm';

const EditChapter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChapterForm />
      </main>
    </div>
  );
};

export default EditChapter;