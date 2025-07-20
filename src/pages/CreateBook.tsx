import { Navigation } from '@/components/Layout/Navigation';
import { BookForm } from '@/components/Books/BookForm';

const CreateBook = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookForm />
      </main>
    </div>
  );
};

export default CreateBook;