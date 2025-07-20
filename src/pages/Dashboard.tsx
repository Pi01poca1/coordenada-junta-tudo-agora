import { Navigation } from '@/components/Layout/Navigation';
import { BookList } from '@/components/Books/BookList';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookList />
      </main>
    </div>
  );
};

export default Dashboard;