import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Book {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface BookCardProps {
  book: Book;
  onDelete: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{book.title}</CardTitle>
            <CardDescription className="mt-1">
              Created {formatDistanceToNow(new Date(book.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge className={statusColors[book.status as keyof typeof statusColors] || statusColors.draft}>
            {book.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Link to={`/books/${book.id}`}>
            <Button size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              View Book
            </Button>
          </Link>
          <Link to={`/books/${book.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(book.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};